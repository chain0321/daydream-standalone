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
          INSERT INTO events (project_id, visitor_id, session_id, event_type, page_path, device, os, browser, screen, duration, operation, api_status, api_duration, model, country, language, referrer, prompt_tokens, completion_tokens, total_tokens)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          body.project || 'daydream',
          body.visitorId || '',
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
          body.referrer || '',
          body.promptTokens || 0,
          body.completionTokens || 0,
          body.totalTokens || 0
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
        const since = `-${days} days`;

        // 总览：PV, UV（visitor_id）, 访问次数（session_id）, 平均停留, 独立页面数
        const total = await env.DB.prepare(`
          SELECT COUNT(*) as pv,
            COUNT(DISTINCT visitor_id) as uv,
            COUNT(DISTINCT session_id) as visits,
            AVG(duration) as avg_duration,
            COUNT(DISTINCT page_path) as unique_pages
          FROM events WHERE project_id = ? AND created_at >= datetime('now', ?)
        `).bind(project, since).first();

        // 平均页面访问 = 独立页面数 / UV
        const uv = total?.uv || 1;
        const avgPagesPerVisitor = total?.unique_pages ? (total.unique_pages / uv).toFixed(1) : '0';

        // 按日期
        const byDate = await env.DB.prepare(`
          SELECT date(created_at) as date, COUNT(*) as pv,
            COUNT(DISTINCT visitor_id) as uv,
            COUNT(DISTINCT session_id) as visits
          FROM events WHERE project_id = ? AND created_at >= datetime('now', ?)
          GROUP BY date(created_at) ORDER BY date
        `).bind(project, since).all();

        // 设备分布 — 按 UV（visitor_id 去重）
        const byDevice = await env.DB.prepare(`
          SELECT device, COUNT(DISTINCT visitor_id) as count
          FROM events WHERE project_id = ? AND created_at >= datetime('now', ?) AND device != ''
          GROUP BY device
        `).bind(project, since).all();

        // 页面排行
        const byPage = await env.DB.prepare(`
          SELECT page_path, COUNT(*) as count
          FROM events WHERE project_id = ? AND created_at >= datetime('now', ?)
            AND event_type = '页面访问' AND page_path != ''
          GROUP BY page_path ORDER BY count DESC LIMIT 10
        `).bind(project, since).all();

        // API 调用统计（含 token）
        const apiStats = await env.DB.prepare(`
          SELECT COUNT(*) as total_calls,
            SUM(CASE WHEN api_status = 'success' THEN 1 ELSE 0 END) as success,
            SUM(CASE WHEN api_status = 'error' THEN 1 ELSE 0 END) as error,
            AVG(api_duration) as avg_ms,
            COALESCE(SUM(total_tokens), 0) as total_tokens,
            COALESCE(SUM(prompt_tokens), 0) as total_prompt_tokens,
            COALESCE(SUM(completion_tokens), 0) as total_completion_tokens,
            CASE WHEN COUNT(*) > 0 THEN COALESCE(AVG(total_tokens), 0) ELSE 0 END as avg_tokens_per_call
          FROM events WHERE project_id = ? AND event_type = 'API调用'
            AND created_at >= datetime('now', ?)
        `).bind(project, since).first();

        return json({
          project,
          total: {
            pv: total?.pv || 0,
            uv: total?.uv || 0,
            visits: total?.visits || 0,
            avg_duration: total?.avg_duration || 0,
            avg_pages_per_visitor: parseFloat(avgPagesPerVisitor) || 0,
          },
          byDate: byDate.results || [],
          byDevice: byDevice.results || [],
          byPage: byPage.results || [],
          apiStats: {
            total_calls: apiStats?.total_calls || 0,
            success: apiStats?.success || 0,
            error: apiStats?.error || 0,
            avg_ms: apiStats?.avg_ms || 0,
            total_tokens: apiStats?.total_tokens || 0,
            total_prompt_tokens: apiStats?.total_prompt_tokens || 0,
            total_completion_tokens: apiStats?.total_completion_tokens || 0,
            avg_tokens_per_call: apiStats?.avg_tokens_per_call || 0,
          },
        });
      } catch (err) {
        return json({ error: err.message }, 500);
      }
    }

    // ====== GET /api/events — 原始事件列表（分页） ======
    if (path === '/api/events') {
      try {
        const project = url.searchParams.get('project') || 'daydream';
        const days = parseInt(url.searchParams.get('days') || '7');
        const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
        const offset = (page - 1) * limit;

        // 总数
        const countResult = await env.DB.prepare(`
          SELECT COUNT(*) as total
          FROM events WHERE project_id = ? AND created_at >= datetime('now', ?)
        `).bind(project, `-${days} days`).first();

        // 分页数据
        const { results } = await env.DB.prepare(`
          SELECT id, project_id, session_id, event_type, page_path, device, os, browser,
            screen, duration, operation, api_status, api_duration, model,
            prompt_tokens, completion_tokens, total_tokens,
            country, language, referrer, created_at
          FROM events WHERE project_id = ? AND created_at >= datetime('now', ?)
          ORDER BY created_at DESC
          LIMIT ? OFFSET ?
        `).bind(project, `-${days} days`, limit, offset).all();

        return json({
          events: results || [],
          total: countResult?.total || 0,
          page,
          limit,
        });
      } catch (err) {
        return json({ error: err.message }, 500);
      }
    }

    // ====== GET /api/sessions — 会话聚合列表（分页） ======
    if (path === '/api/sessions') {
      try {
        const project = url.searchParams.get('project') || 'daydream';
        const days = parseInt(url.searchParams.get('days') || '7');
        const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
        const offset = (page - 1) * limit;
        const since = `-${days} days`;

        // 总数
        const countResult = await env.DB.prepare(`
          SELECT COUNT(DISTINCT session_id) as total
          FROM events WHERE project_id = ? AND created_at >= datetime('now', ?)
        `).bind(project, since).first();

        // 会话聚合 + 最常/最少访问页面（子查询）
        const { results } = await env.DB.prepare(`
          SELECT
            e.session_id,
            MIN(e.created_at) as first_seen,
            MAX(e.created_at) as last_seen,
            MAX(e.device) as device,
            MAX(e.os) as os,
            MAX(e.browser) as browser,
            COUNT(DISTINCT CASE WHEN e.event_type = '页面访问' AND e.page_path != '' THEN e.page_path END) as pages_visited,
            COUNT(CASE WHEN e.event_type = 'API调用' THEN 1 END) as api_calls,
            COALESCE(SUM(CASE WHEN e.event_type = 'API调用' THEN e.total_tokens END), 0) as total_tokens,
            COALESCE(SUM(CASE WHEN e.event_type = 'API调用' THEN e.prompt_tokens END), 0) as prompt_tokens,
            COALESCE(SUM(CASE WHEN e.event_type = 'API调用' THEN e.completion_tokens END), 0) as completion_tokens,
            COALESCE(MAX(CASE WHEN e.event_type = '页面离开' THEN e.duration END), 0) as duration,
            (SELECT e2.page_path FROM events e2
             WHERE e2.session_id = e.session_id AND e2.event_type = '页面访问' AND e2.page_path != ''
             GROUP BY e2.page_path ORDER BY COUNT(*) DESC LIMIT 1) as top_page,
            (SELECT e2.page_path FROM events e2
             WHERE e2.session_id = e.session_id AND e2.event_type = '页面访问' AND e2.page_path != ''
             GROUP BY e2.page_path ORDER BY COUNT(*) ASC LIMIT 1) as least_page
          FROM events e
          WHERE e.project_id = ? AND e.created_at >= datetime('now', ?)
            AND e.session_id != ''
          GROUP BY e.session_id
          ORDER BY first_seen DESC
          LIMIT ? OFFSET ?
        `).bind(project, since, limit, offset).all();

        return json({
          sessions: results || [],
          total: countResult?.total || 0,
          page,
          limit,
        });
      } catch (err) {
        return json({ error: err.message }, 500);
      }
    }

    // ====== GET / — ======
    return new Response('Daydream Analytics API — /track /api/stats /api/projects /api/events /api/sessions', {
      headers: { ...CORS, 'Content-Type': 'text/plain; charset=utf-8' },
    });
  },
};
