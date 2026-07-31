/**
 * Daydream Analytics Worker
 * 收集前端分析事件 → D1 数据库 → 提供看板查询 API
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function getDevice(ua) {
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) return 'mobile';
  if (/ipad|tablet|playbook|silk/i.test(ua)) return 'tablet';
  return 'desktop';
}

function getOS(ua) {
  if (/windows/i.test(ua)) return 'Windows';
  if (/mac os/i.test(ua)) return 'macOS';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/android/i.test(ua)) return 'Android';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Other';
}

function getBrowser(ua) {
  if (/edg/i.test(ua)) return 'Edge';
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) return 'Chrome';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  if (/firefox/i.test(ua)) return 'Firefox';
  return 'Other';
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // ====== POST /track — 接收分析事件 ======
    if (path === '/track' && request.method === 'POST') {
      try {
        const body = await request.json();
        const ua = (body.userAgent || request.headers.get('User-Agent') || '').toLowerCase();

        await env.DB.prepare(`
          INSERT INTO events (project_id, session_id, event_type, page_path, device, os, browser, screen, duration, operation, api_status, api_duration, model, country, language, referrer)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          body.project || 'daydream',
          body.sessionId || '',
          body.eventType || '页面访问',
          body.pagePath || '',
          body.device || getDevice(ua),
          body.os || getOS(ua),
          body.browser || getBrowser(ua),
          body.screen || '',
          body.duration || null,
          body.operation || '',
          body.apiStatus || '',
          body.apiDuration || null,
          body.model || '',
          body.country || '',
          body.language || '',
          body.referrer || ''
        ).run();

        return json({ ok: true });
      } catch (err) {
        return json({ ok: false, error: err.message }, 500);
      }
    }

    // ====== GET /api/projects — 列出所有项目 ======
    if (path === '/api/projects') {
      try {
        const { results } = await env.DB.prepare(`
          SELECT project_id, COUNT(*) as total,
            MAX(created_at) as last_seen
          FROM events GROUP BY project_id ORDER BY last_seen DESC
        `).all();
        return json(results);
      } catch (err) {
        return json({ error: err.message }, 500);
      }
    }

    // ====== GET /api/stats — 统计数据 ======
    if (path === '/api/stats') {
      try {
        const project = url.searchParams.get('project') || 'daydream';
        const days = parseInt(url.searchParams.get('days') || '7');

        // 总览
        const total = await env.DB.prepare(`
          SELECT COUNT(*) as pv, COUNT(DISTINCT session_id) as uv,
            AVG(duration) as avg_duration
          FROM events WHERE project_id = ? AND created_at >= datetime('now', ?)
        `).bind(project, `-${days} days`).first();

        // 按日期
        const byDate = await env.DB.prepare(`
          SELECT date(created_at) as date, COUNT(*) as pv,
            COUNT(DISTINCT session_id) as uv
          FROM events WHERE project_id = ? AND created_at >= datetime('now', ?)
          GROUP BY date(created_at) ORDER BY date
        `).bind(project, `-${days} days`).all();

        // 设备分布
        const byDevice = await env.DB.prepare(`
          SELECT device, COUNT(*) as count
          FROM events WHERE project_id = ? AND created_at >= datetime('now', ?) AND device != ''
          GROUP BY device
        `).bind(project, `-${days} days`).all();

        // 页面排行
        const byPage = await env.DB.prepare(`
          SELECT page_path, COUNT(*) as count
          FROM events WHERE project_id = ? AND created_at >= datetime('now', ?)
            AND event_type = '页面访问' AND page_path != ''
          GROUP BY page_path ORDER BY count DESC LIMIT 10
        `).bind(project, `-${days} days`).all();

        // API 调用统计
        const apiStats = await env.DB.prepare(`
          SELECT COUNT(*) as total_calls,
            SUM(CASE WHEN api_status = 'success' THEN 1 ELSE 0 END) as success,
            SUM(CASE WHEN api_status = 'error' THEN 1 ELSE 0 END) as error,
            AVG(api_duration) as avg_ms
          FROM events WHERE project_id = ? AND event_type = 'API调用'
            AND created_at >= datetime('now', ?)
        `).bind(project, `-${days} days`).first();

        // 最近事件
        const recent = await env.DB.prepare(`
          SELECT * FROM events WHERE project_id = ?
          ORDER BY created_at DESC LIMIT 20
        `).bind(project).all();

        return json({
          project,
          total: total || {},
          byDate: byDate.results || [],
          byDevice: byDevice.results || [],
          byPage: byPage.results || [],
          apiStats: apiStats || {},
          recent: recent.results || [],
        });
      } catch (err) {
        return json({ error: err.message }, 500);
      }
    }

    // ====== GET / — 重定向到看板 ======
    return new Response('Daydream Analytics API — /track /api/stats /api/projects', {
      headers: { ...CORS, 'Content-Type': 'text/plain; charset=utf-8' },
    });
  },
};
