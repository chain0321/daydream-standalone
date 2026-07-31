/**
 * Daydream 分析埋点
 * 收集页面访问、API 调用、停留时长 → 飞书多维表格
 * 所有采集静默进行，失败不影响主功能
 */
(function () {
  'use strict';

  // ---- 配置 ----
  var WORKER_URL = '__ANALYTICS_WORKER_URL__';
  var PROJECT_ID = '__ANALYTICS_PROJECT_ID__';
  var SESSION_KEY = 'daydream-analytics-sid';
  var VISIT_START_KEY = 'daydream-analytics-start';

  // ---- 会话管理 ----
  function getSessionId() {
    var sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  }

  function getVisitStart() {
    var t = sessionStorage.getItem(VISIT_START_KEY);
    if (!t) {
      t = Date.now().toString();
      sessionStorage.setItem(VISIT_START_KEY, t);
    }
    return parseInt(t, 10);
  }

  // ---- 设备检测 ----
  function deviceInfo() {
    var ua = navigator.userAgent;
    var d = 'desktop';
    if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) d = 'mobile';
    else if (/ipad|tablet|playbook|silk/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua))) d = 'tablet';

    var os = 'Other';
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/mac os/i.test(ua)) os = 'macOS';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/linux/i.test(ua)) os = 'Linux';

    var browser = 'Other';
    if (/edg/i.test(ua)) browser = 'Edge';
    else if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = 'Chrome';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/firefox/i.test(ua)) browser = 'Firefox';

    return {
      device: d,
      os: os,
      browser: browser,
      screen: window.screen.width + 'x' + window.screen.height,
      language: (navigator.language || navigator.userLanguage || ''),
      referrer: document.referrer || '',
      pagePath: location.pathname + location.search
    };
  }

  // ---- 发送事件 ----
  function send(payload) {
    if (!WORKER_URL || WORKER_URL.indexOf('__') === 0) return;
    try {
      var data = JSON.parse(JSON.stringify(payload));
      data.sessionId = getSessionId();
      data.project = PROJECT_ID || 'daydream';
      // 使用 sendBeacon 或 fetch，不阻塞页面
      var body = JSON.stringify(data);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(WORKER_URL + '/track', body);
      } else {
        fetch(WORKER_URL + '/track', { method: 'POST', body: body, keepalive: true }).catch(function () {});
      }
    } catch (ignore) { /* 分析失败不影响主功能 */ }
  }

  // ---- 暴露到全局 ----
  var api = {
    /** 页面访问 */
    pageview: function () {
      var info = deviceInfo();
      send({
        eventType: '页面访问',
        device: info.device,
        os: info.os,
        browser: info.browser,
        screen: info.screen,
        language: info.language,
        referrer: info.referrer,
        pagePath: info.pagePath
      });
    },
    /** API 调用 */
    apiCall: function (operation, status, durationMs, model) {
      send({
        eventType: 'API调用',
        operation: operation,
        apiStatus: status,
        apiDuration: Math.round(durationMs) || 0,
        model: model || '',
        pagePath: location.pathname,
        device: deviceInfo().device
      });
    },
    /** 页面离开（记录停留时长） */
    pageLeave: function () {
      var duration = Math.round((Date.now() - getVisitStart()) / 1000);
      send({
        eventType: '页面离开',
        duration: duration,
        pagePath: location.pathname,
        device: deviceInfo().device
      });
    }
  };

  // ---- 自动采集 ----
  // 页面加载时
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', api.pageview);
  } else {
    api.pageview();
  }

  // 页面离开时
  window.addEventListener('beforeunload', api.pageLeave);
  // visibilitychange 作为备用（移动端切后台）
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) api.pageLeave();
  });

  // 暴露给 ai-service.js 使用
  window._daydreamAnalytics = api;

})();
