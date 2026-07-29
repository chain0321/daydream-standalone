(function () {
  const STORAGE_KEY = "daydream-tarot-world-v2";
  const ARCHIVE_KEY = "daydream-tarot-world-archives";
  const app = document.querySelector("#app");
  const toast = document.querySelector("#toast");

  const DEFAULT_STATE = {
    version: 3,
    phase: "tone",
    tone: "",
    domain: "",
    material: "",
    selectedMaterialPreview: "",
    materialFlipOpen: false,
    base: "",
    primaryThemes: [],
    selectedPrimaryTheme: "",
    selectedPrimaryThemeId: "",
    selectedSpreadPosition: { key: "", label: "", meaning: "" },
    themeRefreshUsed: false,
    userExpression: "",
    secondaryThemes: [],
    selectedSecondaryTheme: "",
    worldSeed: { title: "", body: "", bodyExpanded: "", hints: [], quests: [] },
    worldSeeds: [],
    activeSeedIndex: -1,
    subconsciousWords: [],
    worldState: { axioms: [], rules: [], entities: [], events: [], relationships: [], locations: [] },
    interactionLog: [],
    lastEchoIndex: 0,
    echoes: [],
    archiveQueries: { settings: [], timeline: [], characters: [], locations: [] },
    activeView: "story",
    showFullLog: false,
    storyStartedAt: "",
    restored: false,
    revealedGuideCount: 0,
    guideInteractionCounter: 0
  };

  const PHASES = ["tone", "domain", "base", "primary", "expression", "secondary", "seed"];
  const GUIDE_UNLOCK_INTERVAL = 3;
  const MATERIALS = {
    history:    { name: "历史",     mark: "史", desc: "进入一个被偏移过的真实时代",       hints: ["正史","方志","笔记"] },
    myth:       { name: "神话志怪", mark: "怪", desc: "进入一个信仰即为法则的世界",         hints: ["山海经","百鬼夜行","民间信仰"] },
    literature: { name: "文学影视", mark: "文", desc: "进入一个已存在的虚构世界",           hints: ["经典","电影","戏剧"] },
    anime:      { name: "二次元",   mark: "界", desc: "进入一个按ACGN逻辑运转的世界",       hints: ["转生","异世界","日常"] },
    martial:    { name: "武侠",     mark: "武", desc: "进入一个以武为道、以名为命的江湖",    hints: ["门派","内力","兵器谱"] },
    mystery:    { name: "悬疑",     mark: "谜", desc: "进入一个真相被分层隐藏的谜题",       hints: ["线索","反转","不可靠"] },
    scene:      { name: "现场",     mark: "场", desc: "进入一个尚在发生的事件裂缝",         hints: ["报道","目击","未定论"] },
    person:     { name: "人物",     mark: "人", desc: "进入一个人的感知世界",              hints: ["书信","日记","作品"] }
  };
  const BASES = {
    reality: { name: "现实世界", mark: "现", description: "日常秩序里的微小裂缝", hints: ["人情", "制度", "选择"] },
    scifi: { name: "科幻世界", mark: "寂", description: "技术边界之外的未知", hints: ["星际", "机械", "意识"] },
    fantasy: { name: "幻想世界", mark: "幻", description: "誓言与异象共同生长", hints: ["魔法", "传说", "法则"] },
    psyche: { name: "心灵世界", mark: "心", description: "内在感受化为真实空间", hints: ["梦境", "回声", "象征"] }
  };
  const BASE_TAROT_ART = {
    reality: "素材/figma-tarot/reality-card.png",
    scifi: "素材/figma-tarot/scifi-card.png",
    fantasy: "素材/figma-tarot/fantasy-card.png",
    psyche: "素材/figma-tarot/psyche-card.png"
  };
  const PRIMARY_SPREADS = {
    reality: {
      name: "因果牌阵",
      layout: "timeline",
      question: "事情如何发生，又将造成什么后果？",
      positions: [
        { key: "established-fact", label: "既成事实", meaning: "已经发生、无法被忽略的现实条件" },
        { key: "origin", label: "事件起因", meaning: "推动当前局面的直接成因" },
        { key: "conflict", label: "当前矛盾", meaning: "此刻最需要面对的现实冲突" },
        { key: "choice", label: "主动选择", meaning: "人物能够真正采取的行动方向" },
        { key: "consequence", label: "现实后果", meaning: "沿着当前选择继续发展时可能出现的结果" }
      ]
    },
    scifi: {
      name: "系统罗盘阵",
      layout: "system",
      question: "哪些系统、变量与异常正在共同运转？",
      positions: [
        { key: "system-core", label: "系统核心", meaning: "维持整个世界运行的核心机制" },
        { key: "control-protocol", label: "控制协议", meaning: "试图规范、限制或引导系统的显性规则" },
        { key: "hidden-variable", label: "黑箱变量", meaning: "系统无法解释，却持续改变结果的隐藏因素" },
        { key: "external-input", label: "外部输入", meaning: "来自人类、环境或未知来源的干预" },
        { key: "emergent-result", label: "演化结果", meaning: "多个变量共同作用后正在形成的新状态" }
      ]
    },
    fantasy: {
      name: "命运五芒阵",
      layout: "pentagram",
      question: "谁在召唤你，你将经历怎样的命运？",
      positions: [
        { key: "calling", label: "命运召唤", meaning: "迫使人物踏入故事的召唤或征兆" },
        { key: "gift", label: "神赐之物", meaning: "被给予、继承或意外获得的力量与凭证" },
        { key: "guardian", label: "守护者", meaning: "保护、引导或考验人物的存在" },
        { key: "trial", label: "试炼诅咒", meaning: "必须付出代价才能穿越的阻碍" },
        { key: "destiny", label: "最终命运", meaning: "所有誓言与选择正在指向的终点" }
      ]
    },
    psyche: {
      name: "内在镜像阵",
      layout: "mirror",
      question: "你看见的自己，与隐藏的自己有何冲突？",
      positions: [
        { key: "persona", label: "表层自我", meaning: "自己愿意承认并展示给世界的那一面" },
        { key: "deep-memory", label: "深层记忆", meaning: "被时间覆盖，却仍影响当下的经验" },
        { key: "hidden-desire", label: "隐秘渴望", meaning: "尚未被自己清楚承认的需要" },
        { key: "shadow", label: "阴影自我", meaning: "被压抑、拒绝或投射出去的那部分自己" },
        { key: "integration", label: "最终整合", meaning: "冲突的内在部分可能共同形成的新自我" }
      ]
    }
  };
  const VIEWS = {
    story: { name: "羽毛书", icon: "⌁" },
    settings: { name: "设定", icon: "◇" },
    timeline: { name: "时间线", icon: "╱" },
    characters: { name: "人物", icon: "♙" },
    locations: { name: "空间", icon: "⌖" }
  };

  /* ====== Falling Words Pool (120 subconscious words) ====== */
  var FALLING_WORDS_POOL = [
    // 情绪质感 20
    "渴望","恐惧","温暖","孤独","愧疚","释怀","愤怒","犹豫","悲伤","狂喜",
    "厌倦","嫉妒","羞耻","骄傲","怀念","焦虑","平静","悸动","茫然","窒息",
    // 身体感受 20
    "坠落","飞翔","漂浮","下沉","灼烧","冰冷","刺痛","麻木","颤抖","膨胀",
    "收缩","轻盈","沉重","眩晕","清醒","融化","凝固","溃散","奔涌","战栗",
    // 梦境意象 20
    "深渊","光芒","回声","裂痕","牢笼","钥匙","种子","火焰","镜子","门扉",
    "潮汐","灰烬","水纹","根系","迷宫","钟声","倒影","薄雾","残月","暗涌",
    // 自然现象 20
    "暴雨","闪电","极光","裂隙","飓风","漩涡","雷声","霜降","海啸","日蚀",
    "流星","极夜","晨曦","暗礁","星火","迷雾","冰封","余震","潮涌","风眼",
    // 抽象概念 20
    "自由","代价","遗忘","选择","真实","虚假","牺牲","救赎","宿命","因果",
    "边界","循环","对称","悖论","证词","秘密","空白","痕迹","尽头","谎言",
    // 具象符号 20
    "刀刃","锁链","羽毛","指纹","尘埃","余烬","锈迹","书信","钟表","阶梯",
    "岛屿","藤蔓","蝴蝶","雪花","灯塔","暗室","风筝","荆棘","琴弦","墨迹"
  ];

  let state = load();
  let busy = false;
  let isRecording = false;
  let transitionCooldownUntil = 0;   // 交互游戏结束后短暂屏蔽点击，防止误触
  let seedExtractionRun = 0;
  let activeSeedExtractionKey = "";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.version === 3) {
        return {
          ...clone(DEFAULT_STATE),
          ...saved,
          archiveQueries: { ...clone(DEFAULT_STATE.archiveQueries), ...(saved.archiveQueries || {}) },
          worldState: { ...clone(DEFAULT_STATE.worldState), ...(saved.worldState || {}) },
          restored: saved.phase !== "tone"
        };
      }
    } catch (error) {
      console.warn("Session restore failed", error);
    }
    return clone(DEFAULT_STATE);
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, restored: false }));
    } catch (error) {
      showToast("本次内容暂时无法保存");
    }
  }

  function loadArchives() {
    try {
      var raw = JSON.parse(localStorage.getItem(ARCHIVE_KEY)) || [];
      // Deduplicate: keep only the most recent entry per title
      var seen = {};
      var deduped = [];
      for (var i = 0; i < raw.length; i++) {
        var a = raw[i];
        var key = a.title || "";
        if (!key) { deduped.push(a); continue; }
        if (seen[key]) continue; // Already kept a newer one (earlier in array = more recent)
        seen[key] = true;
        deduped.push(a);
      }
      if (deduped.length !== raw.length) {
        localStorage.setItem(ARCHIVE_KEY, JSON.stringify(deduped));
      }
      return deduped;
    } catch (e) {
      return [];
    }
  }

  function saveArchives(archives) {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archives));
  }

  function setState(patch, shouldRender = true) {
    state = { ...state, ...patch };
    persist();
    if (shouldRender) render();
  }

  function highlightTerms(text) {
    // Only highlight user-chosen themes + key proper nouns; capped at 4 per block
    var terms = [];
    if (state.selectedPrimaryTheme && state.selectedPrimaryTheme.length >= 3) terms.push({ word: state.selectedPrimaryTheme, prio: 1 });
    if (state.selectedSecondaryTheme && state.selectedSecondaryTheme.length >= 3) terms.push({ word: state.selectedSecondaryTheme, prio: 2 });
    // Entity names: only proper nouns (3+ chars), lower priority
    if (state.worldState && state.worldState.entities) {
      for (var i = 0; i < state.worldState.entities.length; i++) {
        var name = state.worldState.entities[i].name;
        if (name && name.length >= 3) terms.push({ word: name, prio: 3 });
      }
    }
    // Deduplicate, keep highest priority
    var unique = [];
    var seen = {};
    for (var t = 0; t < terms.length; t++) {
      var w = terms[t].word;
      if (!seen[w] || terms[t].prio < seen[w]) {
        if (!seen[w]) unique.push(terms[t]);
        seen[w] = terms[t].prio;
      }
    }
    unique.sort(function (a, b) { return b.word.length - a.word.length; });
    // Wrap only first occurrence of each term, max 4 total
    var result = text;
    var count = 0;
    for (var u = 0; u < unique.length && count < 4; u++) {
      var term = unique[u].word;
      var escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var idx = result.search(escaped);
      if (idx >= 0) {
        result = result.slice(0, idx) + '<span class="key-term">' + result.slice(idx, idx + term.length) + '</span>' + result.slice(idx + term.length);
        count++;
      }
    }
    return result;
  }

  function esc(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () { toast.classList.remove("show"); }, 2200);
  }

  window.addEventListener("tarot-ai-error", function (event) {
    var detail = event.detail || {};
    var operation = detail.operation || "AI 调用";
    var message = detail.message || "未知错误";
    showToast(operation + "失败，已使用本地回退：" + message.slice(0, 72));
  });

  function stepIndex() {
    return Math.max(0, PHASES.indexOf(state.phase));
  }

  function progress() {
    var current = stepIndex();
    var dots = "";
    for (var i = 0; i < PHASES.length; i++) {
      dots += '<span class="' + (i <= current ? "active" : "") + '" aria-hidden="true"></span>';
    }
    return '<div class="progress" aria-label="入界进度，第 ' + (current + 1) + ' 步，共 7 步">' + dots + '</div>';
  }

  function onboardingShell(content, options) {
    options = options || {};
    var backButton = stepIndex() > 0
      ? '<button class="icon-button back-button" data-action="back" aria-label="返回上一步">‹</button>'
      : '<span class="header-spacer"></span>';
    return '<section class="onboarding ' +
      (state.tone ? "tone-" + state.tone : "") +
      (options.shellClass ? " " + options.shellClass : "") + '">' +
      '<div class="ink-figure" aria-hidden="true"></div>' +
      '<header class="onboarding-header">' +
        backButton +
        '<button class="brand" data-action="back-to-home" aria-label="回到首页"><span>白日幻想</span><small>DAYDREAM</small></button>' +
        '<button class="icon-button" data-action="open-session-menu" aria-label="会话选项">•••</button>' +
      '</header>' +
      progress() +
      '<div class="onboarding-content' +
        (options.wide ? " wide" : "") +
        (options.contentClass ? " " + options.contentClass : "") + '">' +
        (state.restored ? '<button class="restore-note" data-action="dismiss-restore">已恢复上次进度 <span>继续</span></button>' : "") +
        content +
      '</div>' +
      '<div class="safe-area" aria-hidden="true"></div>' +
    '</section>';
  }

  /* ====== Phase Renderers ====== */

  function renderTone() {
    var archives = loadArchives();
    var tone = state.tone === "dark" ? "dark" : "light";
    var archivesHtml = "";
    if (archives.length > 0) {
      var cards = "";
      for (var i = 0; i < archives.length; i++) {
        var a = archives[i];
        var preview = a.body.length > 55 ? a.body.slice(0, 55) + "…" : a.body;
        cards += '<div class="aw-swipe-cell">' +
          '<div class="aw-swipe-content">' +
            '<button class="archive-world-card" data-action="load-archive" data-id="' + a.id + '">' +
              '<span class="aw-mark">' + (a.tone === "light" ? "☼" : "☾") + '</span>' +
              '<div class="aw-body">' +
                '<strong>' + esc(a.title) + '</strong>' +
                '<small>' + esc(preview) + '</small>' +
              '</div>' +
              '<span class="aw-arrow">→</span>' +
            '</button>' +
          '</div>' +
          '<button class="aw-delete-btn" data-action="delete-archive" data-id="' + a.id + '">删除</button>' +
        '</div>';
      }
      archivesHtml = '<div class="home-archive-list">' + cards + '</div>';
    } else {
      archivesHtml = '<div class="home-archive-empty">' +
        '<span>✦</span>' +
        '<strong>尚未留下世界</strong>' +
        '<p>完成一次白日幻想后，它会被写在这里。</p>' +
      '</div>';
    }
    return '<section class="dream-home is-' + tone + '" data-home-tone="' + tone + '">' +
      '<div class="home-hero" aria-hidden="true">' +
        '<img class="home-wizard home-wizard-light" src="素材/竖版背景（光明）.png" alt="">' +
        '<img class="home-wizard home-wizard-dark" src="素材/figma-expression/wizard-background.png" alt="">' +
        '<span class="home-paper-grade"></span>' +
      '</div>' +
      '<div class="home-tone-picker" aria-label="选择世界气质">' +
        '<span class="home-tone-label home-tone-light"><strong>光明</strong><small>可能性 · 修复</small></span>' +
        '<button class="home-tone-switch" data-action="toggle-home-tone" type="button" ' +
          'aria-label="切换光明与黑暗" aria-pressed="' + (tone === "dark" ? "true" : "false") + '">' +
          '<span class="home-tone-track" aria-hidden="true">' +
            '<img class="home-tone-image home-tone-image-light" src="素材/home-tone-light.png" alt="">' +
            '<img class="home-tone-image home-tone-image-dark" src="素材/home-tone-dark.png" alt="">' +
          '</span>' +
        '</button>' +
        '<span class="home-tone-label home-tone-dark"><strong>黑暗</strong><small>代价 · 禁忌</small></span>' +
      '</div>' +
      '<div class="home-dream-entry" aria-label="入梦动画">' +
        '<video class="home-dream-video" muted playsinline preload="auto">' +
          '<source src="素材/开场入梦动画.mp4" type="video/mp4">' +
        '</video>' +
        '<button class="home-dream-trigger" data-action="play-dream" type="button" aria-label="播放动画并进入世界">' +
          '<span class="home-play-triangle" aria-hidden="true"></span>' +
        '</button>' +
      '</div>' +
      '<div class="home-dream-caption" aria-label="白日幻想 Dreaming World">' +
        '<strong>白 日 幻 想</strong>' +
        '<span>Dreaming World</span>' +
      '</div>' +
      '<button class="home-archive-dock" data-action="toggle-home-archive" type="button" aria-expanded="false">' +
        '<img class="home-archive-feather" src="素材/按钮羽毛.png" alt="" aria-hidden="true">' +
        '<span>存档的世界</span>' +
      '</button>' +
      '<button class="home-archive-backdrop" data-action="close-home-archive" type="button" aria-label="关闭存档遮罩"></button>' +
      '<aside class="home-archive-sheet" aria-label="世界的存档">' +
        '<div class="home-archive-paper" aria-hidden="true"></div>' +
        '<button class="home-archive-handle" data-action="close-home-archive" type="button" aria-label="收起世界存档">' +
          '<span></span>' +
        '</button>' +
        '<header>' +
          '<small>WORLD ARCHIVES</small>' +
          '<h2>世界的存档</h2>' +
          '<p>羽毛记得你曾经抵达的地方。</p>' +
        '</header>' +
        archivesHtml +
      '</aside>' +
      '<div class="safe-area" aria-hidden="true"></div>' +
    '</section>';
  }

  function renderDomain() {
    return onboardingShell(
      '<div class="step-heading">' +
        '<span class="eyebrow">02 · 选择进入方式</span>' +
        '<h1>这个世界，<br>从哪里来？</h1>' +
        '<p>决定了世界种子的材料来源——进入人类已有的叙事世界，还是从空白中创造。</p>' +
      '</div>' +
      '<div class="tone-choices">' +
        '<button class="tone-card" data-action="choose-domain" data-value="archaeology">' +
          '<span class="tone-sigil">⌂</span>' +
          '<span class="tone-copy"><strong>现存</strong><small>历史 · 神话 · 文学 · 人物 · 现场 · 悬疑 · 二次元 · 武侠</small></span>' +
          '<span class="choice-arrow">→</span>' +
        '</button>' +
        '<button class="tone-card dark" data-action="choose-domain" data-value="fiction">' +
          '<span class="tone-sigil">✦</span>' +
          '<span class="tone-copy"><strong>虚构</strong><small>现实 · 科幻 · 幻想 · 心灵</small></span>' +
          '<span class="choice-arrow">→</span>' +
        '</button>' +
      '</div>' +
      '<p class="whisper">现存的世界，你有一双藏在历史中的眼睛——通过交互，你会逐渐发现自己是谁。<br>虚构的世界，一切从零开始——你写下它的第一条记录。</p>'
    );
  }

  function renderBase() {
    // Archaeology fork: show 8 material/mine options
    if (state.domain === "archaeology") {
      var materialAssets = {
        history: "素材/archaeology/history.png",
        myth: "素材/archaeology/myth.png",
        literature: "素材/archaeology/literature.png",
        anime: "素材/archaeology/anime.png",
        martial: "素材/archaeology/martial.png",
        mystery: "素材/archaeology/mystery.png",
        scene: "素材/archaeology/scene.png",
        person: "素材/archaeology/person.png"
      };
      var materialCards = "";
      var materialKeys = Object.keys(MATERIALS);
      for (var mi = 0; mi < materialKeys.length; mi++) {
        var mid = materialKeys[mi];
        var m = MATERIALS[mid];
        var isSelected = state.selectedMaterialPreview === mid;
        if (isSelected && state.materialFlipOpen) {
          var inlineThemes = "";
          for (var ft = 0; ft < state.primaryThemes.length; ft++) {
            var flipTheme = state.primaryThemes[ft];
            inlineThemes += '<button class="flip-theme-option" role="listitem" ' +
              'data-action="choose-primary" data-id="' + flipTheme.id + '" data-name="' + esc(flipTheme.name) + '" ' +
              'aria-label="选择母题' + esc(flipTheme.name) + '">' +
              '<span class="flip-theme-index">0' + (ft + 1) + '</span>' +
              '<strong>' + esc(flipTheme.name) + '</strong>' +
            '</button>';
          }
          materialCards += '<div class="material-illustration-card material-inline-flip selected" role="listitem" ' +
            'aria-label="' + esc(m.name) + '的五个一级母题">' +
              '<div class="material-inline-stage">' +
                '<div class="material-inline-face material-inline-front">' +
                  '<img src="' + materialAssets[mid] + '" alt="" aria-hidden="true">' +
                  '<span class="material-title-wash" aria-hidden="true"></span>' +
                  '<strong>' + esc(m.name) + '</strong>' +
                  '<span class="material-inline-color" aria-hidden="true"></span>' +
                '</div>' +
                '<div class="material-inline-face material-inline-back">' +
                  '<button class="material-inline-close" data-action="close-material-flip" aria-label="翻回' + esc(m.name) + '图面">↶</button>' +
                  '<span class="material-flip-kicker">' + esc(m.name) + '</span>' +
                  '<div class="material-flip-themes" role="list" aria-label="选择一级母题">' + inlineThemes + '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
        } else {
          materialCards += '<button class="material-illustration-card' + (isSelected ? ' selected' : '') + '" ' +
            'role="listitem" data-action="preview-material" data-value="' + mid + '" ' +
            'aria-label="选择' + esc(m.name) + '" aria-pressed="' + (isSelected ? "true" : "false") + '">' +
            '<img src="' + materialAssets[mid] + '" alt="" aria-hidden="true">' +
            '<span class="material-title-wash" aria-hidden="true"></span>' +
            '<strong>' + m.name + '</strong>' +
          '</button>';
        }
      }
      var selectedMaterial = MATERIALS[state.selectedMaterialPreview];
      return onboardingShell(
        '<div class="archaeology-base-screen">' +
          '<div class="material-illustration-grid' + (selectedMaterial ? ' has-selection' : '') + '" role="list" aria-label="选择叙事矿脉">' + materialCards + '</div>' +
        '</div>',
        {
          wide: true,
          contentClass: "archaeology-base-content",
          shellClass: "archaeology-base-page"
        }
      );
    }

    // Fiction fork: Figma game-hall composition with four interactive doors
    var doorAssets = {
      reality: "素材/figma-base/reality-door.png",
      scifi: "素材/figma-base/scifi-door.png",
      fantasy: "素材/figma-base/fantasy-door.png",
      psyche: "素材/figma-base/psyche-door.png"
    };
    var cards = "";
    var baseKeys = Object.keys(BASES);
    for (var i = 0; i < baseKeys.length; i++) {
      var id = baseKeys[i];
      var base = BASES[id];
      cards += '<button class="portal-choice portal-' + id + '" role="listitem" ' +
        'data-action="choose-base" data-value="' + id + '" aria-label="选择' + esc(base.name) + '">' +
        '<img src="' + doorAssets[id] + '" alt="" aria-hidden="true">' +
        '<strong>' + base.name + '</strong>' +
      '</button>';
    }
    return onboardingShell(
      '<div class="base-portal-screen">' +
        '<div class="base-portal-heading">' +
          '<p>旅人，<em>词汇</em>将指引你前往你想去的</p>' +
          '<h1>故事世界</h1>' +
        '</div>' +
        '<div class="base-portal-grid" role="list" aria-label="选择世界基底">' + cards + '</div>' +
      '</div>',
      {
        wide: true,
        contentClass: "base-portal-content",
        shellClass: "base-portal-page"
      }
    );
  }

  function renderPrimary() {
    var spread = state.domain === "fiction" ? PRIMARY_SPREADS[state.base] : null;
    var tarotArt = spread ? BASE_TAROT_ART[state.base] : "";
    var cards = "";
    for (var i = 0; i < state.primaryThemes.length; i++) {
      var theme = state.primaryThemes[i];
      var position = spread ? spread.positions[i] : null;
      var positionAttrs = position
        ? ' data-position-key="' + esc(position.key) + '"' +
          ' data-position-label="' + esc(position.label) + '"' +
          ' data-position-meaning="' + esc(position.meaning) + '"'
        : "";
      var ariaLabel = "选择母题" + theme.name;
      var artHtml = tarotArt
        ? '<img class="theme-card-art" src="' + tarotArt + '" alt="" aria-hidden="true">'
        : "";
      cards += '<button class="theme-card card-' + (i + 1) + (tarotArt ? ' has-figma-art' : '') + '" role="listitem" ' +
        'data-action="choose-primary" data-id="' + theme.id + '" data-name="' + esc(theme.name) + '"' +
        positionAttrs + ' aria-label="' + esc(ariaLabel) + '">' +
        artHtml +
        '<span class="card-veil"></span>' +
        '<span class="theme-index">0' + (i + 1) + '</span>' +
        '<strong>' + esc(theme.name) + '</strong>' +
      '</button>';
    }
    var toneLabel = state.tone === "light" ? "光明" : "黑暗";
    var domainHint = state.domain === "archaeology" && state.material ? "现存·" + MATERIALS[state.material].name : (BASES[state.base] ? BASES[state.base].name : "");
    var spreadName = spread ? spread.name : "抽取一级母题";
    var spreadQuestion = spread ? spread.question : "五张牌，哪一张先叫住了你？";
    var layoutClass = spread ? " spread-" + spread.layout : " spread-archive";
    return onboardingShell(
      '<div class="tarot-draw-screen">' +
      '<div class="tarot-draw-heading">' +
        '<span class="eyebrow">04 · ' + esc(spreadName) + '</span>' +
        '<h1>五张牌，哪一张<br>先叫住了你？</h1>' +
        '<p>' + esc(spreadQuestion) + '<br>' + toneLabel + ' · ' + esc(domainHint) + ' 已改变了牌阵的概率。</p>' +
      '</div>' +
      '<div class="tarot-spread tarot-draw-spread" role="list" aria-label="本轮五个一级母题">' + cards + '</div>' +
      '<div class="spread-actions tarot-draw-actions">' +
        '<button class="text-button" data-action="refresh-themes"' + (state.themeRefreshUsed ? " disabled" : "") + '>' +
          '<span>↻</span> ' + (state.themeRefreshUsed ? "已经换过一组" : "换一组 · 仅一次") +
        '</button>' +
      '</div>' +
      '<p class="whisper tarot-draw-whisper">同一牌阵不会出现重复或高度相近的母题。</p>' +
      '</div>',
      {
        wide: true,
        contentClass: "tarot-draw-content",
        shellClass: "tarot-draw-page" + layoutClass
      }
    );
  }

  function renderExpression() {
    return onboardingShell(
      '<div class="expression-figma-screen">' +
        '<div class="selected-theme-orb" aria-label="已选择母题：' + esc(state.selectedPrimaryTheme) + '">' +
          '<span>世界母题</span>' +
          '<strong>' + esc(state.selectedPrimaryTheme) + '</strong>' +
        '</div>' +
        '<form class="ritual-form expression-ritual-form" data-form="expression">' +
          '<div class="ornate-textarea expression-textarea">' +
          '<textarea id="expression-input" maxlength="280" required ' +
            'placeholder="写下一个问题、想法或感受……" ' +
            'aria-label="写下一个问题、想法或感受">' + esc(state.userExpression) + '</textarea>' +
          '</div>' +
          '<div class="char-count"><span data-count>' + state.userExpression.length + '</span> / 280</div>' +
          '<button class="seal-cta expression-submit" type="submit" aria-label="交给世界">' +
            '<img src="素材/figma-expression/submit-button.png" alt="" aria-hidden="true">' +
          '</button>' +
        '</form>' +
      '</div>',
      {
        wide: true,
        contentClass: "expression-figma-content",
        shellClass: "expression-figma-page"
      }
    );
  }

  function renderSecondary() {
    var words = "";
    for (var i = 0; i < state.secondaryThemes.length; i++) {
      var theme = state.secondaryThemes[i];
      words += '<button class="word-choice word-' + (i + 1) + '" role="listitem" ' +
        'data-action="choose-secondary" data-value="' + esc(theme) + '">' +
        '<span>' + esc(theme) + '</span>' +
        '<small>0' + (i + 1) + '</small>' +
      '</button>';
    }
    return onboardingShell(
      '<div class="secondary-ritual-screen">' +
        '<div class="secondary-theme-core" aria-label="世界母题：' + esc(state.selectedPrimaryTheme) + '">' +
          '<span>世界母题</span>' +
          '<strong>' + esc(state.selectedPrimaryTheme) + '</strong>' +
        '</div>' +
        '<div class="word-orbit" role="list">' + words + '</div>' +
        '<div class="secondary-ritual-copy">' +
          '<span class="eyebrow">06 · 二级联想</span>' +
          '<div class="expression-quote">"' + esc(state.userExpression) + '"</div>' +
          '<h1>哪一个词，更接近你想继续探索的方向？</h1>' +
          '<p>这些词只向外打开方向，不替你解释原来的表达。</p>' +
        '</div>' +
      '</div>',
      {
        wide: true,
        contentClass: "ritual-continuity-content",
        shellClass: "ritual-continuity-page secondary-ritual-page"
      }
    );
  }

  var MAX_ROUNDS = 5;

  function renderSeed() {
    var total = state.worldSeeds.length;
    var idx = state.activeSeedIndex;
    var seed = state.worldSeed;
    var roundLabel = total > 1 ? "第 " + (idx + 1) + " / " + total + " 颗种子" : "";

    // 种子导航
    var navHtml = "";
    if (total > 1) {
      navHtml = '<div class="seed-nav">' +
        '<button data-action="seed-prev" aria-label="上一颗种子"' + (idx <= 0 || busy ? " disabled" : "") + '>‹</button>' +
        '<span>' + roundLabel + '</span>' +
        '<button data-action="seed-next" aria-label="下一颗种子"' + (idx >= total - 1 || busy ? " disabled" : "") + '>›</button>' +
      '</div>';
    }

    // 底部操作区
    var actionsHtml = "";
    if (total >= MAX_ROUNDS) {
      actionsHtml = '<div class="seed-actions">' +
        '<p class="seed-exhausted">这里没有你想去的世界<br>你需要自己构建</p>' +
      '</div>';
    } else {
      var remaining = MAX_ROUNDS - total;
      actionsHtml = '<div class="seed-actions">' +
        '<button class="text-button" data-action="retry-secondary"' + (busy ? " disabled" : "") + '>' +
          '<span>↻</span> 不满意，再抽一批方向词（还剩 ' + remaining + ' 次）' +
        '</button>' +
      '</div>';
    }

    var domainLabel = state.domain === "archaeology" && state.material ? "现存·" + MATERIALS[state.material].name : (BASES[state.base] ? BASES[state.base].name : "");
    return onboardingShell(
      '<div class="step-heading compact center seed-heading">' +
        '<span class="eyebrow">07 · 世界种子' + (total > 0 ? ' · 第 ' + (idx + 1) + ' 颗' : '') + '</span>' +
        '<h1>一个不完整的世界<br>正在等你进入</h1>' +
        '<div class="seed-meta"><span>' + (state.tone === "light" ? "光明" : "黑暗") + '</span>' +
          '<i>×</i><span>' + esc(domainLabel) + '</span>' +
          '<i>×</i><span>' + esc(state.selectedPrimaryTheme) + '</span>' +
          '<i>×</i><span>' + esc(state.selectedSecondaryTheme) + '</span></div>' +
      '</div>' +
      navHtml +
      '<article class="seed-card">' +
        '<span class="seed-number">WORLD SEED · ' + String(idx + 1).padStart(3, "0") + '</span>' +
        '<h2>' + esc(seed.title) + '</h2>' +
        '<div class="seed-divider"><span>✦</span></div>' +
        '<p>' + highlightTerms(esc(seed.body)) + '</p>' +
        '<footer>人物、原因、历史与法则仍留有空缺</footer>' +
      '</article>' +
      actionsHtml +
      '<button class="enter-world" data-action="enter-world">' +
        '<span><small>确认这颗种子</small>送入世界</span>' +
        '<b>→</b>' +
      '</button>',
      { wide: true }
    );
  }

  function renderLoading(label) {
    app.innerHTML = onboardingShell(
      '<div class="summoning">' +
        '<div class="summoning-ring"><span></span></div>' +
        '<h1>' + label + '</h1>' +
        '<p>线索正在彼此靠近，请稍候……</p>' +
      '</div>'
    );
  }

  /* ====== 打字机逐字揭示 ====== */
  function typewriteText(el, text, speed, onComplete) {
    var i = 0;
    speed = speed || 42;
    // 保存原文以便之后可能恢复
    if (!el.dataset.twOriginal) el.dataset.twOriginal = el.textContent || "";

    function tick() {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
        var ch = text[i - 1];
        // 标点和换行停顿稍长
        var delay = /[。，！？；：、…—》」\n]/.test(ch) ? speed * 3.2 : speed;
        // 逗号、分号中等停顿
        if (/[，；：]/.test(ch)) delay = speed * 2;
        setTimeout(tick, delay);
      } else {
        if (onComplete) onComplete();
      }
    }

    tick();
  }

  /* ====== 世界模式等待态：不冻结 UI，仅禁用作曲家 ====== */
  function setComposerWaiting(waiting, label) {
    var composer = document.querySelector(".composer");
    if (!composer) return;
    var textarea = composer.querySelector("textarea");
    var sendBtn = composer.querySelector(".send-button");
    var voiceBtn = composer.querySelector(".voice-button");

    if (waiting) {
      if (textarea) { textarea.disabled = true; textarea.placeholder = label || "世界正在回应……"; }
      if (sendBtn) sendBtn.disabled = true;
      if (voiceBtn) voiceBtn.disabled = true;
      composer.classList.add("composer-waiting");
    } else {
      if (textarea) { textarea.disabled = false; textarea.placeholder = state.activeView === "story" ? "在世界中行动、设定或发问……" : "向" + (VIEWS[state.activeView] ? VIEWS[state.activeView].name : "") + "档案查询……"; }
      if (sendBtn) sendBtn.disabled = false;
      if (voiceBtn) voiceBtn.disabled = false;
      composer.classList.remove("composer-waiting");
    }
  }

  /* ====== Seed Radical Meditation (散落偏旁) ====== */
  function playChakraMeditation(aiPromise) {
    return new Promise(function (resolve) {
      var MIN_PICK = 5;               // 至少采撷 5 个
      var PEAK_START = 0.44;          // 峰窗起点（scale ≈ 0.98）
      var PEAK_END = 0.56;            // 峰窗终点（scale ≈ 0.98）

      var CHARS = [
        "氵", "扌", "艹", "辶", "宀",
        "忄", "纟", "钅", "灬", "刂",
        "阝", "亻", "彳", "饣", "冫",
        "冖", "讠", "廴", "彡", "夂",
        "爫", "礻", "衤", "疒", "罒"
      ];

      var completed = 0;
      var fired = false;
      var aiReady = false;
      var last = performance.now();
      var raf = null;
      var missTimer = null;
      var phase = 0;                  // 当前活跃偏旁的脉冲相位 0→1
      var activeIdx = -1;             // 当前活跃偏旁的索引

      aiPromise.then(function () { aiReady = true; }, function () { aiReady = true; });

      var wordData = [];              // { x(%), y(%), word, size(倍率), duration(ms) }
      var activationOrder = [];
      var MIN_GAP = 12;

      /* ---- 生成单个偏旁的位置和 DOM ---- */
      function spawnOne() {
        var idx = wordData.length;
        var ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        var x, y, tooClose, attempts = 0;
        do {
          x = 8 + Math.random() * 76;
          y = 10 + Math.random() * 68;
          tooClose = false;
          for (var oj = 0; oj < wordData.length; oj++) {
            var dx = x - wordData[oj].x;
            var dy = y - wordData[oj].y;
            if (dx * dx + dy * dy < MIN_GAP * MIN_GAP) {
              tooClose = true; break;
            }
          }
          attempts++;
        } while (tooClose && attempts < 70);

        var wd = {
          x: x, y: y, word: ch,
          size: 0.7 + Math.random() * 0.65,
          duration: 2100 + Math.random() * 1100
        };
        wordData.push(wd);

        // 初始偏旁会先写入 wordData，再由下面的模板一次性渲染。
        // 只有 AI 尚未返回、需要动态追加偏旁时，stage 才已经存在。
        if (stage) {
          var span = document.createElement("span");
          span.className = "seed-word";
          span.id = "co" + idx;
          span.style.cssText =
            "--x:" + x.toFixed(1) + "%;" +
            "--y:" + y.toFixed(1) + "%;" +
            "--sz:" + wd.size.toFixed(2) + ";" +
            "--dur:" + wd.duration + "ms";
          span.textContent = ch;
          stage.appendChild(span);
        }

        activationOrder.push(idx);
        return idx;
      }

      /* ---- 初始生成 MIN_PICK 个偏旁 ---- */
      for (var oi = 0; oi < MIN_PICK; oi++) {
        var newIdx = spawnOne();
        // 从 activationOrder 末尾取出（spawnOne 已 push），随机插入
        activationOrder.pop();
        var insertAt = Math.floor(Math.random() * (activationOrder.length + 1));
        activationOrder.splice(insertAt, 0, newIdx);
      }

      /* ---- 构建 HTML ---- */
      var wordsHtml = "";
      for (var oi2 = 0; oi2 < wordData.length; oi2++) {
        var wd = wordData[oi2];
        wordsHtml += '<span class="seed-word" id="co' + oi2 + '" ' +
          'style="--x:' + wd.x.toFixed(1) + '%;--y:' + wd.y.toFixed(1) + '%;--sz:' + wd.size.toFixed(2) + ';--dur:' + wd.duration + 'ms">' +
          esc(wd.word) +
        '</span>';
      }

      app.innerHTML = onboardingShell(
        '<div class="chakra-meditation">' +
          '<p class="chakra-title">偏旁正在凝聚成世界</p>' +
          '<div class="chakra-stage seed-stage" id="cs">' +
            wordsHtml +
          '</div>' +
          '<p class="chakra-sub" id="csub">偏旁起伏时，在最佳时刻轻触</p>' +
          '<div class="stream-preview" id="csp" aria-live="polite">' +
            '<p class="sp-text" id="cspt"></p>' +
          '</div>' +
        '</div>',
        { wide: true }
      );

      var stage = document.getElementById("cs");
      var sub = document.getElementById("csub");

      /* ---- 激活下一个偏旁 ---- */
      function activateNext() {
        for (var an = 0; an < activationOrder.length; an++) {
          var candIdx = activationOrder[an];
          var cand = document.getElementById("co" + candIdx);
          if (cand && !cand.classList.contains("ignited")) {
            activeIdx = candIdx;
            phase = 0;
            return;
          }
        }
        // 全部点亮 → 如果 AI 还没好就继续生成
        if (!aiReady && !fired) {
          activeIdx = spawnOne();
          phase = 0;
          return;
        }
        activeIdx = -1;
      }

      activateNext();

      /* ---- 视觉更新：根据相位设置文字大小和透明度 ---- */
      function updateWordVisual(idx, p) {
        var word = document.getElementById("co" + idx);
        if (!word || word.classList.contains("ignited")) return;

        var sc, op;
        if (p < 0) {
          sc = 0.28; op = 0.1;
        } else {
          sc = 0.28 + 0.72 * Math.sin(p * Math.PI);
          if (p < PEAK_START) {
            op = 0.12 + (p / PEAK_START) * 0.74;
          } else if (p <= PEAK_END) {
            op = 0.92;
          } else {
            op = 0.88 - ((p - PEAK_END) / (1 - PEAK_END)) * 0.76;
          }
        }

        var inPeak = p >= PEAK_START && p <= PEAK_END;
        word.style.setProperty("--scale", String(Math.max(0.26, sc)));
        word.style.setProperty("--opacity", String(Math.max(0.08, op)));
        if (inPeak) {
          word.classList.add("peak");
        } else {
          word.classList.remove("peak");
        }
      }

      /* ---- 点亮偏旁 ---- */
      function ignite(idx) {
        var word = document.getElementById("co" + idx);
        if (!word) return;
        word.classList.remove("peak");
        word.classList.add("ignited");
        word.style.animation = "none";
        word.offsetHeight;
        word.style.animation = "seed-flash 0.5s ease-out forwards";
        completed++;
        activateNext();
        if (activeIdx >= 0) {
          sub.textContent = "第 " + completed + " 个偏旁已采撷 · 继续等待";
        }
        tryFinish();
      }

      /* ---- 检查是否结束 ---- */
      function allIgnited() {
        for (var i = 0; i < wordData.length; i++) {
          var el = document.getElementById("co" + i);
          if (el && !el.classList.contains("ignited")) return false;
        }
        return true;
      }

      function tryFinish() {
        if (fired) return;
        if (!aiReady || completed < MIN_PICK) return;
        if (!allIgnited()) return;
        fired = true;
        transitionCooldownUntil = Date.now() + 400;
        cancelAnimationFrame(raf);
        sub.textContent = "世界已经成形……";
        setTimeout(resolve, 500);
      }

      /* ---- 动画循环 ---- */
      function loop(now) {
        if (fired) return;
        var dt = Math.min(100, now - last);
        last = now;

        if (activeIdx >= 0) {
          var wd2 = wordData[activeIdx];
          phase += dt / wd2.duration;
          if (phase >= 1) {
            phase = 0;
            clearTimeout(missTimer);
            sub.textContent = "尚未到时机 · 等偏旁再次浮现";
            missTimer = setTimeout(function () {
              if (!fired && activeIdx >= 0) sub.textContent = "偏旁起伏时，在最佳时刻轻触";
            }, 900);
          }
          updateWordVisual(activeIdx, phase);

          // 暗掉所有其他未点亮的偏旁
          for (var i = 0; i < wordData.length; i++) {
            if (i !== activeIdx) {
              var o = document.getElementById("co" + i);
              if (o && !o.classList.contains("ignited")) updateWordVisual(i, -1);
            }
          }
        }

        if (aiReady && !stage.classList.contains("ai-ready")) {
          stage.classList.add("ai-ready");
          if (activeIdx >= 0) {
            sub.textContent = "世界已在等待 · 采撷偏旁";
          }
        }

        tryFinish();
        if (!fired) raf = requestAnimationFrame(loop);
      }

      /* ---- 点击处理 ---- */
      stage.addEventListener("click", function () {
        if (fired || activeIdx < 0) return;
        if (phase >= PEAK_START && phase <= PEAK_END) {
          ignite(activeIdx);
          phase = 0;
          clearTimeout(missTimer);
        } else {
          clearTimeout(missTimer);
          sub.textContent = "尚未到时机 · 等偏旁再次浮现";
          missTimer = setTimeout(function () {
            if (!fired && activeIdx >= 0) sub.textContent = "偏旁起伏时，在最佳时刻轻触";
          }, 900);
        }
      });

      stage.addEventListener("touchstart", function (e) {
        e.preventDefault();
        stage.dispatchEvent(new Event("click"));
      });

      raf = requestAnimationFrame(loop);
    });
  }

  /* ====== Falling Words Mini-Game ====== */
  function playFallingWords(aiPromise) {
    return new Promise(function (resolve) {
      var MAX_COLLECT = 3;
      var WORDS_PER_ROUND = 18;
      var SPAWN_MIN = 320;
      var SPAWN_MAX = 700;
      var FALL_MIN = 4.2;
      var FALL_MAX = 7.8;

      var collected = [];
      var spawned = 0;
      var gameOver = false;
      var aiDone = false;
      var spawnTimer = null;
      var checkTimer = null;

      aiPromise.then(function () { aiDone = true; }, function () { aiDone = true; });

      // Shuffle and pick words
      var pool = FALLING_WORDS_POOL.slice().sort(function () { return Math.random() - 0.5; }).slice(0, WORDS_PER_ROUND);

      // Build collection slots
      var slotsHtml = "";
      for (var i = 0; i < MAX_COLLECT; i++) {
        slotsHtml += '<span class="fw-slot" data-slot="' + i + '"></span>';
      }

      app.innerHTML = onboardingShell(
        '<div class="falling-words-wrap">' +
          '<p class="fw-title">词语正在从深处浮起</p>' +
          '<p class="fw-sub" id="fwsub">轻触那些触动你的 · 最多三个</p>' +
          '<div class="fw-stage" id="fws"></div>' +
          '<div class="fw-collect" id="fwc">' + slotsHtml + '</div>' +
        '</div>',
        { wide: true }
      );

      var stage = document.getElementById("fws");
      var sub = document.getElementById("fwsub");
      var collectEl = document.getElementById("fwc");

      function updateSlots() {
        var slots = collectEl.querySelectorAll(".fw-slot");
        for (var j = 0; j < slots.length; j++) {
          if (j < collected.length) {
            slots[j].textContent = collected[j];
            slots[j].classList.add("filled");
          } else {
            slots[j].textContent = "";
            slots[j].classList.remove("filled");
          }
        }
        if (collected.length >= MAX_COLLECT) {
          sub.textContent = "已收集三个 · 世界正在重新编织";
        }
      }

      function spawnWord() {
        if (gameOver || spawned >= pool.length) {
          // All words spawned — check if we can finish
          tryFinish();
          return;
        }
        var word = pool[spawned];
        spawned++;

        var el = document.createElement("span");
        el.className = "fw-word";
        el.textContent = word;
        el.dataset.word = word;

        var startX = 6 + Math.random() * 76; // % from left
        var drift = (Math.random() - 0.5) * 36; // degrees
        var dur = FALL_MIN + Math.random() * (FALL_MAX - FALL_MIN);

        el.style.setProperty("--start-x", startX + "%");
        el.style.setProperty("--drift", drift + "deg");
        el.style.setProperty("--fall-dur", dur + "s");

        stage.appendChild(el);

        // Auto-remove after animation ends
        setTimeout(function () {
          if (el.parentNode) el.remove();
        }, dur * 1000 + 400);

        // Schedule next spawn
        if (!gameOver && spawned < pool.length) {
          var delay = SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN);
          spawnTimer = setTimeout(spawnWord, delay);
        }
      }

      function tryFinish() {
        if (gameOver) return;
        var allSpawned = spawned >= pool.length;
        var lastWordsGone = !stage.querySelector(".fw-word:not(.shattered)");
        if (aiDone && (collected.length >= MAX_COLLECT || (allSpawned && lastWordsGone))) {
          gameOver = true;
          clearTimeout(spawnTimer);
          clearTimeout(checkTimer);
          setTimeout(function () { resolve(collected); }, 600);
        }
      }

      /* ---- tap handler ---- */
      stage.addEventListener("click", function (e) {
        if (gameOver) return;
        var wordEl = e.target.closest(".fw-word");
        if (!wordEl || wordEl.classList.contains("shattered")) return;
        if (collected.length >= MAX_COLLECT) return;

        var word = wordEl.dataset.word;
        wordEl.classList.add("shattered");

        collected.push(word);
        updateSlots();

        if (collected.length >= MAX_COLLECT) tryFinish();
      });

      // Mobile touch
      stage.addEventListener("touchstart", function (e) {
        var el = e.target.closest(".fw-word");
        if (el && !el.classList.contains("shattered") && collected.length < MAX_COLLECT) {
          e.preventDefault();
          el.click();
        }
      });

      /* ---- periodic AI check ---- */
      function checkAI() {
        if (aiDone && !gameOver) {
          sub.textContent = "世界已准备好新的词语 · 你可以继续收集";
          tryFinish();
        }
        if (!gameOver) checkTimer = setTimeout(checkAI, 400);
      }

      // Kick off
      spawnTimer = setTimeout(spawnWord, 250);
      checkTimer = setTimeout(checkAI, 500);
    });
  }

  /* ====== Morse Code Rhythm Mini-Game ====== */
  function playMorseCode(aiPromise) {
    return new Promise(function (resolve) {
      var DOT_THRESHOLD = 320;       // ms: below = dot, above = dash
      var MIN_TAP = 40;              // ignore taps shorter than this
      var SEQS_PER_LEVEL = 3;        // sequences before difficulty increases
      var MAX_COLLECT = 3;           // max subconscious words

      var collectedWords = [];       // picked from the falling words pool
      var completedSeqs = 0;
      var gameOver = false;
      var aiDone = false;
      var pointerDown = 0;
      var pressing = false;
      var checkTimer = null;

      aiPromise.then(function () { aiDone = true; }, function () { aiDone = true; });

      /* ---- helpers ---- */
      function generateSeq(len) {
        var seq = [];
        for (var s = 0; s < len; s++) {
          seq.push(Math.random() < 0.5 ? "·" : "−");
        }
        return seq;
      }

      function seqLength() {
        if (completedSeqs < SEQS_PER_LEVEL) return 3;
        if (completedSeqs < SEQS_PER_LEVEL * 2) return 4;
        if (completedSeqs < SEQS_PER_LEVEL * 3) return 5;
        return 6;
      }

      var currentSeq = generateSeq(3);
      var currentIdx = 0;

      /* ---- build DOM ---- */
      app.innerHTML = onboardingShell(
        '<div class="morse-ritual-screen">' +
          '<div class="morse-meditation">' +
            '<p class="morse-title">向世界发送调谐信号</p>' +
            '<p class="morse-sub" id="mosub">轻触 = <b>·</b> &nbsp; 长按 = <b>−</b></p>' +
            '<div class="morse-stage" id="most">' +
              '<div class="morse-target" id="motgt"></div>' +
              '<div class="morse-ripples" id="morip"></div>' +
            '</div>' +
            '<p class="morse-tally" id="motal">尚未校准</p>' +
            '<p class="morse-ai" id="moai"></p>' +
          '</div>' +
        '</div>',
        {
          wide: true,
          contentClass: "ritual-continuity-content",
          shellClass: "ritual-continuity-page morse-ritual-page"
        }
      );

      var stage = document.getElementById("most");
      var sub = document.getElementById("mosub");
      var target = document.getElementById("motgt");
      var ripples = document.getElementById("morip");
      var tally = document.getElementById("motal");
      var aiHint = document.getElementById("moai");

      /* ---- render ---- */
      function renderSeq() {
        var syms = "";
        for (var i = 0; i < currentSeq.length; i++) {
          syms += '<span class="ms-sym' +
            (i < currentIdx ? ' done' : '') +
            (i === currentIdx ? ' current' : '') +
            '">' + currentSeq[i] + '</span>';
        }
        target.innerHTML = syms;
      }

      function flashRipple(type) {
        var dot = document.createElement("span");
        dot.className = "mr-rip " + type;
        dot.textContent = type === "dot" ? "·" : "−";
        ripples.appendChild(dot);
        setTimeout(function () { if (dot.parentNode) dot.remove(); }, 650);
      }

      function completeSeq() {
        completedSeqs++;

        // Pick a subconscious word (avoid duplicates)
        var pool = FALLING_WORDS_POOL;
        var poolCopy = pool.slice().sort(function () { return Math.random() - 0.5; });
        for (var w = 0; w < poolCopy.length; w++) {
          if (collectedWords.length >= MAX_COLLECT) break;
          if (collectedWords.indexOf(poolCopy[w]) === -1) {
            collectedWords.push(poolCopy[w]);
            break;
          }
        }

        currentSeq = generateSeq(seqLength());
        currentIdx = 0;
        renderSeq();

        // Update UI
        if (completedSeqs === 1) {
          tally.textContent = '已校准 1 组 · 收获「' + collectedWords[0] + '」';
        } else if (completedSeqs <= MAX_COLLECT) {
          tally.textContent = '已校准 ' + completedSeqs + ' 组 · 收获「' + collectedWords[collectedWords.length - 1] + '」';
        } else {
          tally.textContent = '已校准 ' + completedSeqs + ' 组';
        }

        // Brief celebration
        ripples.classList.add("success");
        setTimeout(function () { ripples.classList.remove("success"); }, 420);

        // Make sub hint more encouraging
        if (completedSeqs >= SEQS_PER_LEVEL) {
          sub.innerHTML = '信号越来越清晰……';
        }

        tryFinish();
      }

      function tryFinish() {
        if (!gameOver && aiDone && completedSeqs >= 1) {
          gameOver = true;
          transitionCooldownUntil = Date.now() + 400;
          sub.textContent = '方向词已经生成';
          tally.textContent = completedSeqs + ' 组校准 · ' + collectedWords.length + ' 个词语进入世界';
          setTimeout(function () { resolve(collectedWords); }, 700);
        }
      }

      /* ---- tap handling ---- */
      function processTap(duration) {
        if (gameOver) return;
        if (duration < MIN_TAP) return; // ignore accidental taps

        var isDot = duration < DOT_THRESHOLD;
        var tapped = isDot ? "·" : "−";
        var expected = currentSeq[currentIdx];

        flashRipple(isDot ? "dot" : "dash");

        if (tapped === expected) {
          // Correct
          currentIdx++;
          renderSeq();
          if (currentIdx >= currentSeq.length) {
            completeSeq();
          }
        } else {
          // Mismatch — reset current sequence, no penalty
          sub.innerHTML = isDot ? '这里需要<b>长按</b>' : '这里需要<b>轻触</b>';
          currentIdx = 0;
          renderSeq();
          ripples.classList.add("error");
          stage.classList.add("error");
          setTimeout(function () {
            ripples.classList.remove("error");
            stage.classList.remove("error");
            sub.innerHTML = '轻触 = <b>·</b> &nbsp; 长按 = <b>−</b>';
          }, 700);
        }
      }

      /* ---- event listeners ---- */
      stage.addEventListener("pointerdown", function (e) {
        if (gameOver) return;
        e.preventDefault();
        pressing = true;
        pointerDown = Date.now();
        stage.classList.add("pressing");
        stage.setPointerCapture(e.pointerId);
      });

      stage.addEventListener("pointerup", function () {
        if (!pressing || gameOver) return;
        pressing = false;
        stage.classList.remove("pressing");
        processTap(Date.now() - pointerDown);
      });

      stage.addEventListener("pointerleave", function () {
        if (pressing && !gameOver) {
          pressing = false;
          stage.classList.remove("pressing");
          processTap(Date.now() - pointerDown);
        }
      });

      // Mobile
      stage.addEventListener("touchstart", function (e) {
        if (gameOver) return;
        e.preventDefault();
        pressing = true;
        pointerDown = Date.now();
        stage.classList.add("pressing");
      });

      stage.addEventListener("touchend", function () {
        if (!pressing || gameOver) return;
        pressing = false;
        stage.classList.remove("pressing");
        processTap(Date.now() - pointerDown);
      });

      stage.addEventListener("touchcancel", function () {
        if (pressing && !gameOver) {
          pressing = false;
          stage.classList.remove("pressing");
          processTap(Date.now() - pointerDown);
        }
      });

      /* ---- AI ready hint ---- */
      function checkAI() {
        if (aiDone && !gameOver) {
          aiHint.textContent = '方向词已生成 · 至少完成一组校准即可查看';
        }
        if (!gameOver) checkTimer = setTimeout(checkAI, 500);
      }
      checkTimer = setTimeout(checkAI, 500);

      renderSeq();
    });
  }

  /* ====== Word Association Mini-Game ====== */
  function playWordAssociation(aiPromise, primaryTheme) {
    return new Promise(function (resolve) {
      // Two slots: ___X  ·  X___
      var aiDone = false;
      var resolved = false;

      aiPromise.then(function () { aiDone = true; }, function () { aiDone = true; });

      app.innerHTML = onboardingShell(
        '<div class="wa-wrap">' +
          '<div class="wa-slots" id="was">' +
            '<label class="wa-slot">' +
              '<input maxlength="16" placeholder="____" data-slot="0">' +
              '<span class="wa-anchor">' + esc(primaryTheme) + '</span>' +
            '</label>' +
            '<label class="wa-slot">' +
              '<span class="wa-anchor">' + esc(primaryTheme) + '</span>' +
              '<input maxlength="16" placeholder="____" data-slot="1">' +
            '</label>' +
          '</div>' +
          '<button class="wa-done" id="wad">送入世界</button>' +
          '<button class="wa-skip" id="wax">跳过</button>' +
        '</div>',
        { wide: true }
      );

      var doneBtn = document.getElementById("wad");
      var skipBtn = document.getElementById("wax");
      var inputs = document.querySelectorAll(".wa-slot input");

      function collect() {
        var words = [];
        for (var j = 0; j < inputs.length; j++) {
          var val = inputs[j].value.trim();
          if (val.length >= 1) words.push(val);
        }
        return words;
      }

      function finish() {
        if (resolved) return;
        resolved = true;
        var words = collect();
        doneBtn.textContent = "……";
        skipBtn.style.display = "none";
        setTimeout(function () { resolve(words); }, 400);
      }

      // Auto-advance: Enter moves to next slot
      for (var k = 0; k < inputs.length; k++) {
        (function (idx) {
          inputs[idx].addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
              e.preventDefault();
              if (idx < inputs.length - 1) {
                inputs[idx + 1].focus();
              } else {
                finish();
              }
            }
          });
        })(k);
      }

      doneBtn.addEventListener("click", function () { finish(); });

      skipBtn.addEventListener("click", function () {
        if (resolved) return;
        resolved = true;
        setTimeout(function () { resolve([]); }, 300);
      });

      // AI finishes → subtle hint
      var checkTimer = setInterval(function () {
        if (aiDone && !resolved) {
          doneBtn.textContent = "词语已生成 · 送入世界";
          doneBtn.style.borderColor = "rgba(180,130,40,.5)";
          doneBtn.style.color = "#8a5a30";
        }
      }, 500);

      // Auto-resolve if AI done and user hasn't interacted after a while
      // (don't force — user might still be typing)
    });
  }

  /* ====== Candle Guardian Mini-Game (ring-match mechanic) ====== */
  function playCandleGuardian(aiPromise) {
    return new Promise(function (resolve) {
      var ROUNDS = 2;
      var ROUND_TIME = 1000;        // ms to hold flame in zone per round
      var TOTAL_TIMEOUT = 12000;    // auto-complete after 12s regardless
      var PRESS_RATE = 0.028;       // flame size increase per frame while pressing
      var RELEASE_RATE = 0.018;     // flame size decrease per frame while released
      var OSC_SPEED = 0.003;        // natural oscillation speed
      var MIN_SIZE = 0.2;
      var totalElapsed = 0;         // total elapsed time for auto-complete fallback

      var round = 0;                // 0, 1, 2
      var flameSize = 0.45;         // current flame size 0-1
      var zoneTimer = 0;            // ms accumulated in target zone this round
      var pressing = false;
      var raf = null;
      var last = performance.now();
      var gameOver = false;
      var aiDone = false;
      var oscPhase = 0;

      aiPromise.then(function () { aiDone = true; }, function () { aiDone = true; });

      // Round dots HTML
      var dotsHtml = "";
      for (var d = 0; d < ROUNDS; d++) {
        dotsHtml += '<span data-rd="' + d + '"></span>';
      }

      app.innerHTML = onboardingShell(
        '<div class="candle-meditation">' +
          '<p class="candle-title">词语正在火焰中转化</p>' +
          '<div class="candle-stage" id="cds">' +
            '<div class="candle-glow" id="cdg"></div>' +
            '<span class="cd-flame-ghost" id="cdfg"></span>' +
            '<div class="candle-flame" id="cdf">' +
              '<span class="cf-outer"></span>' +
              '<span class="cf-mid"></span>' +
              '<span class="cf-core"></span>' +
            '</div>' +
            '<div class="candle-wick"></div>' +
            '<div class="candle-body"></div>' +
          '</div>' +
          '<p class="candle-hint" id="cdh">按住屏幕让火焰变大 · 松手变小 · 停在线内即完成守护</p>' +
          '<div class="candle-rounds" id="cdr">' + dotsHtml + '</div>' +
          '<div class="candle-zone-bar" id="cdz"><span id="cdzs"></span></div>' +
        '</div>',
        { wide: true }
      );

      var stage = document.getElementById("cds");
      var hint = document.getElementById("cdh");
      var flame = document.getElementById("cdf");
      var glow = document.getElementById("cdg");
      var flameGhost = document.getElementById("cdfg");
      var zoneBar = document.getElementById("cdzs");
      var roundsEl = document.getElementById("cdr");

      /* ---- target zone params (wider, easier) ---- */
      function zone() {
        var center = 0.50 + round * 0.03;
        var half = 0.22 - round * 0.04;  // much wider than before
        return { min: center - half, max: center + half };
      }

      /* Scale ghost outline to show target flame size */
      function updateFlameGhost() {
        var z = zone();
        var targetScale = 0.55 + ((z.min + z.max) / 2) * 0.85;
        flameGhost.style.transform = "scale(" + targetScale.toFixed(3) + ")";
      }

      function updateVisual() {
        // Flame visual scale: map 0→1 size to a visible range
        var scale = 0.55 + flameSize * 0.85;
        var flicker = 1 + (Math.random() - 0.5) * 0.04;
        flame.style.transform = "scale(" + (scale * flicker) + ")";
        glow.style.opacity = String(0.08 + flameSize * 0.7);
        glow.style.transform = "scale(" + (0.55 + flameSize * 0.85) + ")";

        // Zone progress bar
        var pct = Math.min(100, (zoneTimer / ROUND_TIME) * 100);
        zoneBar.style.width = pct.toFixed(1) + "%";

        // Round dots
        var dots = roundsEl.querySelectorAll("span");
        for (var i = 0; i < dots.length; i++) {
          dots[i].className = "";
          if (i < round) dots[i].className = "done";
          if (i === round) dots[i].className = "active";
        }
      }

      function tryFinish() {
        if (!gameOver && round >= ROUNDS && aiDone) {
          gameOver = true;
          cancelAnimationFrame(raf);
          flameGhost.classList.remove("matched");
          hint.textContent = "词语已经浮现……";
          setTimeout(resolve, 500);
        }
      }

      function loop(now) {
        if (gameOver) return;
        var dt = Math.min(100, now - last);
        last = now;
        totalElapsed += dt;

        // Auto-complete fallback: if stuck too long, finish all rounds
        if (totalElapsed > TOTAL_TIMEOUT) {
          round = ROUNDS;
          hint.textContent = aiDone ? "词语已经浮现……" : "守护完成，等待词语……";
        }

        if (round < ROUNDS) {
          // Natural oscillation
          oscPhase += OSC_SPEED * (dt / 16);
          var osc = Math.sin(oscPhase) * 0.04;

          // User control
          if (pressing) {
            flameSize = Math.min(1, flameSize + PRESS_RATE);
          } else {
            flameSize = Math.max(MIN_SIZE, flameSize - RELEASE_RATE);
          }
          // Apply oscillation
          var effective = flameSize + osc;

          var z = zone();
          var inZone = effective >= z.min && effective <= z.max;

          if (inZone) {
            zoneTimer += dt;
            flameGhost.classList.add("matched");
            hint.textContent = "保持住……";
          } else {
            zoneTimer = Math.max(0, zoneTimer - dt * 0.6);
            flameGhost.classList.remove("matched");
            hint.textContent = pressing ? "太大了 · 松手" : "太小了 · 按住";
          }

          if (zoneTimer >= ROUND_TIME) {
            // Round complete
            round++;
            zoneTimer = 0;
            updateFlameGhost();
            hint.textContent = round >= ROUNDS
              ? (aiDone ? "三轮守护完成 · 词语浮现" : "三轮守护完成 · 等待词语……")
              : "第 " + (round + 1) + " 环 · 继续守护";
          }
        }

        // AI ready visual
        if (aiDone && !flameGhost.classList.contains("ai-ready")) {
          flameGhost.classList.add("ai-ready");
        }

        updateVisual();
        tryFinish();

        if (!gameOver) raf = requestAnimationFrame(loop);
      }

      // Init zone lines
      updateFlameGhost();

      /* ---- press handlers ---- */
      stage.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        pressing = true;
        stage.setPointerCapture(e.pointerId);
      });
      stage.addEventListener("pointerup", function () { pressing = false; });
      stage.addEventListener("pointerleave", function () { pressing = false; });
      stage.addEventListener("touchstart", function (e) { e.preventDefault(); pressing = true; });
      stage.addEventListener("touchend", function () { pressing = false; });
      stage.addEventListener("touchcancel", function () { pressing = false; });

      raf = requestAnimationFrame(loop);
    });
  }

  /* ====== World Workspace ====== */

  function renderWorldHeader() {
    var view = VIEWS[state.activeView];
    var echoHtml = "";
    if (state.activeView === "story") {
      var pending = state.interactionLog.length - state.lastEchoIndex;
      echoHtml = '<button class="echo-button' + (pending > 0 ? ' has-pending' : '') + '" data-action="echo"' + (busy ? " disabled" : "") + ' aria-label="生成回响">' +
        '<img class="echo-icon" src="素材/按钮书1.png" alt="">' +
        (pending > 0 ? '<i>' + pending + '</i>' : "") +
      '</button>';
    }
    var isStory = state.activeView === "story";
    return '<header class="world-header">' +
      '<button class="back-arrow" data-action="back-to-home" aria-label="回到首页">←</button>' +
      (isStory ? '<span></span>' :
        '<div>' +
          '<small>' + state.worldSeed.title.replace(/[《》]/g, "") + '</small>' +
          '<h1>' + view.name + '</h1>' +
        '</div>') +
      '<div class="world-actions">' +
        echoHtml +
        '<button class="icon-button" data-action="open-session-menu" aria-label="会话选项">•••</button>' +
      '</div>' +
    '</header>';
  }

  function recordBadge(item) {
    var level = item.level || (item.intent === "world_question" ? "提问" : "讨论");
    var labels = { added: "已写入", supplemented: "已补充", revised: "已修订", conflict: "有冲突", deferred: "未采纳", none: "未写入" };
    return '<span class="record-status ' + item.result + '">' + esc(level) + ' · ' + esc(labels[item.result]) + '</span>';
  }

  function renderStory() {
    var firstQuestion = state.userExpression || "";
    var firstLine = firstQuestion
      ? firstQuestion + " · " + (state.selectedPrimaryTheme || "")
      : (state.selectedPrimaryTheme || "世界初醒");
    var timeline = [];
    for (var i = 0; i < state.interactionLog.length; i++) {
      timeline.push({ type: "interaction", index: i, createdAt: state.interactionLog[i].createdAt, item: state.interactionLog[i] });
    }
    for (var j = 0; j < state.echoes.length; j++) {
      timeline.push({ type: "echo", createdAt: state.echoes[j].createdAt, item: state.echoes[j] });
    }
    timeline.sort(function (a, b) { return new Date(a.createdAt) - new Date(b.createdAt); });

    var entries = "";
    for (var k = 0; k < timeline.length; k++) {
      var entry = timeline[k];
      if (entry.type === "echo") {
        entries += '<section class="formal-prose echo-prose" id="' + entry.item.id + '">' +
          '<header><span>〰</span><h3>' + esc(entry.item.title) + '</h3>' +
          '<small>收录互动 ' + (entry.item.startIndex + 1) + '—' + (entry.item.endIndex + 1) + '</small></header>' +
          '<p>' + esc(entry.item.body) + '</p>' +
        '</section>';
      } else if (state.showFullLog) {
        entries += '<section class="manuscript-entry">' +
          '<div class="entry-label"><span>你的笔迹</span><time>' + formatTime(entry.item.createdAt) + '</time></div>' +
          '<p class="user-ink">' + esc(entry.item.userInput) + '</p>' +
          '<div class="world-response">' +
            recordBadge(entry.item) +
            '<p>' + esc(entry.item.response) + '</p>' +
          '</div>' +
        '</section>';
      }
    }

    if (!timeline.length) {
      entries = '<div class="blank-page">' +
        '<span>✦</span>' +
        '<p>世界停在入口处。写下一个行动、一条设定，或向眼前的异常发问。</p>' +
      '</div>';
    }

    return '<div class="manuscript-scroll" data-scroll-container>' +
      '<label class="log-switch log-switch-float" aria-label="切换交互/叙事视图">' +
        '<input type="checkbox" class="log-switch-input" data-action="toggle-log"' + (state.showFullLog ? ' checked' : '') + '>' +
        '<span class="log-switch-track"><span class="log-switch-thumb"></span></span>' +
      '</label>' +
      '<article class="manuscript">' +
        '<header class="manuscript-title">' +
          '<span>' + esc(firstLine) + '</span>' +
          '<h2>' + esc(state.worldSeed.title) + '</h2>' +
          '<div class="seed-divider"><span>✦</span></div>' +
        '</header>' +
        '<section class="formal-prose seed-prose">' +
          '<p>' + highlightTerms(esc(state.worldSeed.bodyExpanded || state.worldSeed.body)) + '</p>' +
        '</section>' +
        entries +
        '<div class="manuscript-end" aria-hidden="true">· · ·</div>' +
      '</article>' +
    '</div>';
  }

  function formatTime(value) {
    if (!value) return "";
    return new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
  }

  function listSection(title, level, items, renderItem) {
    var list = "";
    if (items.length) {
      list = '<div class="archive-list">';
      for (var i = 0; i < items.length; i++) {
        list += renderItem(items[i], i);
      }
      list += '</div>';
    } else {
      list = '<p class="empty-archive">尚未形成正式记录</p>';
    }
    return '<section class="archive-section">' +
      '<header><span>' + level + '</span><h3>' + title + '</h3><b>' + items.length + '</b></header>' +
      list +
    '</section>';
  }

  function renderSettings() {
    return listSection("底层公理", "L1", state.worldState.axioms, function (item) {
      return '<article><strong>' + esc(item.text) + '</strong><small>极少修订 · 影响整个世界</small></article>';
    }) +
    listSection("运行规则", "L2", state.worldState.rules, function (item) {
      return '<article><strong>' + esc(item.text) + '</strong><small>制度、文化、自然或共同信念</small></article>';
    });
  }

  function renderTimeline() {
    return listSection("已经发生", "EVENTS", state.worldState.events, function (item, index) {
      return '<article class="timeline-item">' +
        '<span>' + String(index + 1).padStart(2, "0") + '</span>' +
        '<div><strong>' + esc(item.title) + '</strong><p>' + esc(item.text) + '</p></div>' +
      '</article>';
    });
  }

  function renderCharacters() {
    return listSection("人物与实体", "L3", state.worldState.entities, function (item) {
      var latestFact = item.facts && item.facts.length ? item.facts[item.facts.length - 1] : "尚无更多事实";
      return '<article class="entity-item"><span>' + esc(item.name.slice(0, 1)) + '</span>' +
        '<div><strong>' + esc(item.name) + '</strong><p>' + esc(latestFact) + '</p></div></article>';
    }) +
    listSection("关系", "LINKS", state.worldState.relationships, function (item) {
      return '<article><strong>' + esc(item.from) + ' → ' + esc(item.to) + '</strong><small>' + esc(item.type) + '</small></article>';
    });
  }

  function renderLocations() {
    return listSection("空间与地点", "L3", state.worldState.locations, function (item, index) {
      return '<article class="location-item"><span>⌖</span>' +
        '<div><strong>' + esc(item.name) + '</strong><p>' + esc(item.description) + '</p>' +
        '<small>地点 ' + String(index + 1).padStart(2, "0") + '</small></div></article>';
    });
  }

  function renderArchive() {
    var renderers = { settings: renderSettings, timeline: renderTimeline, characters: renderCharacters, locations: renderLocations };
    var queries = state.archiveQueries[state.activeView] || [];
    var view = VIEWS[state.activeView];

    var consultationsHtml = "";
    if (queries.length) {
      consultationsHtml = '<section class="archive-consultations">' +
        '<header><span>AI</span><h3>档案问答</h3></header>';
      for (var i = 0; i < queries.length; i++) {
        var query = queries[i];
        consultationsHtml += '<article>' +
          '<strong>' + esc(query.question) + '</strong>' +
          '<p>' + esc(query.answer) + '</p>' +
          '<button data-action="write-query-to-story" data-id="' + query.id + '"' + (query.written ? " disabled" : "") + '>' +
            (query.written ? "已写入故事" : "明确写入故事") +
          '</button>' +
        '</article>';
      }
      consultationsHtml += '</section>';
    }

    return '<div class="archive-scroll" data-scroll-container>' +
      '<div class="archive-intro">' +
        '<span>' + view.icon + '</span>' +
        '<p>这里是同一世界状态的「' + view.name + '」投影。查询与整理默认不会进入故事正文。</p>' +
      '</div>' +
      renderers[state.activeView]() +
      consultationsHtml +
      '<div class="archive-bottom-space"></div>' +
    '</div>';
  }

  function renderComposer() {
    var isStory = state.activeView === "story";
    var formType = isStory ? "world-input" : "archive-query";
    var placeholder = isStory ? "在世界中行动、设定或发问……" : "向" + VIEWS[state.activeView].name + "档案查询……";

    // Guide button: only in story mode, only if hints/quests exist
    var guideBtnHtml = "";
    if (isStory) {
      var totalGuideItems = (state.worldSeed.hints ? state.worldSeed.hints.length : 0) + (state.worldSeed.quests ? state.worldSeed.quests.length : 0);
      var remaining = totalGuideItems - state.revealedGuideCount;
      if (totalGuideItems > 0) {
        var guideLabel = remaining > 0 ? "提示 · 剩" + remaining : "提示 · 已全部揭示";
        var guideClass = "guide-button" + (remaining > 0 ? "" : " all-revealed") + (busy ? "" : "");
        guideBtnHtml = '<button type="button" class="' + guideClass + '" data-action="reveal-guide" aria-label="' + guideLabel + '"' + (remaining <= 0 ? " disabled" : "") + '>' +
          '<span>' + (remaining > 0 ? remaining : "⌘") + '</span>' +
        '</button>';
      }
    }

    return '<form class="composer ' + (isStory ? "story-composer" : "archive-composer") + '" data-form="' + formType + '">' +
      (guideBtnHtml || '<span class="composer-spacer"></span>') +
      '<label>' +
        '<textarea rows="1" maxlength="500" data-composer-input required placeholder="' + placeholder + '"></textarea>' +
      '</label>' +
      '<button type="submit" class="send-button" aria-label="发送"' + (busy ? " disabled" : "") + '>→</button>' +
    '</form>';
  }

  function renderWorld() {
    return '<section class="world-workspace tone-' + state.tone + '">' +
      renderWorldHeader() +
      '<main class="world-view">' +
        (state.activeView === "story" ? renderStory() : renderArchive()) +
      '</main>' +
      renderComposer() +
      '<nav class="world-tabs" aria-label="世界构建书视图">' +
        (function () {
          var tabs = "";
          var viewKeys = Object.keys(VIEWS);
          for (var i = 0; i < viewKeys.length; i++) {
            var id = viewKeys[i];
            var v = VIEWS[id];
            tabs += '<button data-action="switch-view" data-value="' + id + '"' +
              (state.activeView === id ? ' class="active" aria-current="page"' : ' aria-current="false"') + '>' +
              (id === "story"
                ? '<img class="tab-book-icon" src="素材/书.png" alt="">'
                : '<small>' + v.name + '</small>') +
            '</button>';
          }
          return tabs;
        })() +
      '</nav>' +
    '</section>';
  }

  function renderMenu() {
    var existing = document.querySelector(".session-sheet");
    if (existing) return existing.remove();
    var archiveBtn = state.phase === "world"
      ? '<button data-action="archive-world">存档 <span>保留当前世界，回到首页</span></button>'
      : "";
    var exportBtn = state.phase === "world"
      ? '<button data-action="export-session">导出世界档案 <span>JSON</span></button>'
      : "";
    app.insertAdjacentHTML("beforeend",
      '<div class="sheet-backdrop" data-action="close-menu"></div>' +
      '<aside class="session-sheet" role="dialog" aria-modal="true" aria-label="会话选项">' +
        '<span class="sheet-handle"></span>' +
        '<h2>这个世界</h2>' +
        '<p>内容已自动保存在当前设备。</p>' +
        archiveBtn +
        exportBtn +
        '<button class="danger" data-action="reset-session">开启一个新世界 <span>清除当前进度</span></button>' +
        '<button class="cancel" data-action="close-menu">取消</button>' +
      '</aside>'
    );
  }

  function render() {
    if (state.phase === "world") {
      app.innerHTML = renderWorld();
      requestAnimationFrame(function () {
        var scroll = document.querySelector("[data-scroll-container]");
        if (scroll && state.activeView === "story") scroll.scrollTop = scroll.scrollHeight;
      });
      return;
    }
    var renderers = {
      tone: renderTone,
      domain: renderDomain,
      base: renderBase,
      primary: renderPrimary,
      expression: renderExpression,
      secondary: renderSecondary,
      seed: renderSeed
    };
    app.innerHTML = renderers[state.phase]();
  }

  /* ====== Actions ====== */

  function drawThemes() {
    return window.TarotThemes.drawPrimaryThemes(state.tone, state.base, state.domain, state.material);
  }

  async function chooseSecondary(value) {
    if (busy) return;
    busy = true;
    // Capture subconscious words before they get cleared
    var subconsciousWords = state.subconsciousWords || [];
    setState({ selectedSecondaryTheme: value, subconsciousWords: [] }, false);

    // 流式预览：在脉轮冥想期间实时显示 AI 正在写出的文字
    var streamedText = "";
    var onChunk = function (chunk, fullText) {
      streamedText = fullText;
      var preview = document.getElementById("cspt");
      if (preview) {
        // 只显示最后 ~100 个字，避免太长
        var display = fullText.length > 100 ? "……" + fullText.slice(-100) : fullText;
        preview.textContent = display;
      }
    };

    // Start AI call immediately — runs in parallel with the meditation game
    var aiPromise = window.TarotAI.generateWorldSeed({
      tone: state.tone,
      domain: state.domain,
      material: state.material,
      base: state.base,
      primaryTheme: state.selectedPrimaryTheme,
      primaryPosition: state.selectedSpreadPosition,
      secondaryTheme: value,
      userExpression: state.userExpression,
      rejectedWorlds: state.worldSeeds,
      subconsciousWords: subconsciousWords
    }, onChunk);
    try {
      // Meditation mini-game: user taps chakras while AI streams
      await playChakraMeditation(aiPromise);
      var seed = await aiPromise;
      var seedEntry = { title: seed.title, body: seed.body, bodyExpanded: seed.bodyExpanded || seed.body, secondaryTheme: value };
      var worldSeeds = state.worldSeeds.concat([seedEntry]);
      busy = false;
      setState({
        worldSeed: seed,
        worldSeeds: worldSeeds,
        activeSeedIndex: worldSeeds.length - 1,
        playerIdentity: seed.playerIdentity || null,
        phase: "seed"
      });
      // 打字机逐字揭示世界种子
      requestAnimationFrame(function () {
        var titleEl = document.querySelector(".seed-card h2");
        var bodyEl = document.querySelector(".seed-card > p");
        if (titleEl && bodyEl) {
          var titleText = titleEl.textContent;
          var bodyText = bodyEl.textContent;
          titleEl.textContent = "";
          bodyEl.textContent = "";
          // 先打字标题，稍快
          typewriteText(titleEl, titleText, 30, function () {
            setTimeout(function () {
              // 再打字正文，稍慢；完成后恢复高亮
              typewriteText(bodyEl, bodyText, 36, function () {
                // 打字完成后恢复关键词高亮
                bodyEl.innerHTML = highlightTerms(esc(bodyText));
              });
            }, 350);
          });
        }
      });
    } catch (error) {
      busy = false;
      console.error("生成世界种子流程失败：", error);
      showToast("世界暂时没有回应，请再试一次");
      render();
    }
  }

  async function retrySecondary() {
    if (busy) return;
    if (state.worldSeeds.length >= MAX_ROUNDS) {
      showToast("已经尝试了" + MAX_ROUNDS + "批方向，请从已有的世界中选择");
      return;
    }
    busy = true;
    // Start AI call immediately — runs in parallel with Morse code game
    var aiPromise = window.TarotAI.generateSecondaryThemes({
      domain: state.domain,
      material: state.material,
      base: state.base,
      tone: state.tone,
      primaryTheme: state.selectedPrimaryTheme,
      primaryThemeId: state.selectedPrimaryThemeId,
      primaryPosition: state.selectedSpreadPosition,
      userExpression: state.userExpression,
      previousSeeds: state.worldSeeds.map(function (s) {
        return { secondaryTheme: s.secondaryTheme, title: s.title };
      })
    });
    try {
      // Morse code rhythm game: user taps sequences, collects subconscious words
      var collectedWords = await playMorseCode(aiPromise);
      var secondaryThemes = await aiPromise;
      busy = false;
      setState({
        secondaryThemes: secondaryThemes,
        selectedSecondaryTheme: "",
        subconsciousWords: collectedWords,
        phase: "secondary"
      });
    } catch (error) {
      busy = false;
      showToast("词语暂时没有回应，请再试一次");
      render();
    }
  }

  function switchSeed(delta) {
    var idx = state.activeSeedIndex + delta;
    if (idx < 0 || idx >= state.worldSeeds.length) return;
    var seed = state.worldSeeds[idx];
    setState({
      activeSeedIndex: idx,
      worldSeed: seed,
      selectedSecondaryTheme: seed.secondaryTheme
    });
  }

  function applyWorldPatches(patches) {
    return window.TarotAI.applyPatches(state.worldState, patches);
  }

  var generatingGuides = false;

  async function generateNewGuides() {
    if (generatingGuides) return;
    generatingGuides = true;
    try {
      var existingHints = state.worldSeed.hints || [];
      var existingQuests = state.worldSeed.quests || [];
      var newGuides = await window.TarotAI.generateAdditionalGuides(
        state.worldSeed, state.worldState, state.interactionLog,
        existingHints, existingQuests,
        state.material || state.base
      );
      if (newGuides && ((newGuides.hints && newGuides.hints.length) || (newGuides.quests && newGuides.quests.length))) {
        var updatedHints = existingHints.concat(newGuides.hints || []);
        var updatedQuests = existingQuests.concat(newGuides.quests || []);
        setState({
          worldSeed: { ...state.worldSeed, hints: updatedHints, quests: updatedQuests }
        });
        persist();
        render();
        showToast("新的线索浮现了");
      }
    } catch (e) {
      console.warn("generateNewGuides 失败: " + e.message);
    } finally {
      generatingGuides = false;
    }
  }

  async function extractWorldSeedEntities() {
    var seedSnapshot = state.worldSeed || {};
    var extractionKey = [
      seedSnapshot.title || "",
      seedSnapshot.bodyExpanded || seedSnapshot.body || "",
      state.tone || "",
      state.domain || "",
      state.material || state.base || ""
    ].join("\u0001");
    if (!(seedSnapshot.bodyExpanded || seedSnapshot.body) || activeSeedExtractionKey === extractionKey) return;

    var runId = ++seedExtractionRun;
    activeSeedExtractionKey = extractionKey;
    try {
      var extracted = await window.TarotAI.extractSeedEntities(
        seedSnapshot, state.tone, state.domain, state.material || state.base
      );
      var currentKey = [
        state.worldSeed && state.worldSeed.title || "",
        state.worldSeed && (state.worldSeed.bodyExpanded || state.worldSeed.body) || "",
        state.tone || "",
        state.domain || "",
        state.material || state.base || ""
      ].join("\u0001");
      // 只允许最新一次、且仍属于当前世界种子的请求回写状态。
      if (runId !== seedExtractionRun || currentKey !== extractionKey) return;
      if (!extracted) return;
      var now = new Date().toISOString();
      var genId = window.TarotAI.uid;
      var patches = [];
      if (extracted.entities) {
        for (var i = 0; i < extracted.entities.length; i++) {
          var ent = extracted.entities[i];
          patches.push({ collection: "entities", value: { id: ent.id || genId("entity"), name: ent.name, type: ent.type || "character", facts: ent.facts || [], createdAt: ent.createdAt || now } });
        }
      }
      if (extracted.locations) {
        for (var j = 0; j < extracted.locations.length; j++) {
          var loc = extracted.locations[j];
          patches.push({ collection: "locations", value: { id: loc.id || genId("location"), name: loc.name, description: loc.description || "", createdAt: loc.createdAt || now } });
        }
      }
      if (extracted.events) {
        for (var k = 0; k < extracted.events.length; k++) {
          var evt = extracted.events[k];
          patches.push({ collection: "events", value: { id: evt.id || genId("event"), title: evt.title || "", text: evt.text || "", order: state.worldState.events.length + k + 1, createdAt: evt.createdAt || now } });
        }
      }
      if (extracted.axioms) {
        for (var a = 0; a < extracted.axioms.length; a++) {
          patches.push({ collection: "axioms", value: { id: extracted.axioms[a].id || genId("axiom"), text: extracted.axioms[a].text, level: "L1", createdAt: extracted.axioms[a].createdAt || now } });
        }
      }
      if (extracted.rules) {
        for (var r = 0; r < extracted.rules.length; r++) {
          patches.push({ collection: "rules", value: { id: extracted.rules[r].id || genId("rule"), text: extracted.rules[r].text, level: "L2", createdAt: extracted.rules[r].createdAt || now } });
        }
      }
      if (extracted.relationships) {
        for (var rel = 0; rel < extracted.relationships.length; rel++) {
          var relObj = extracted.relationships[rel];
          patches.push({ collection: "relationships", value: { id: relObj.id || genId("rel"), from: relObj.from, to: relObj.to, type: relObj.type || "关联", createdAt: relObj.createdAt || now } });
        }
      }
      if (patches.length > 0) {
        var newWorldState = applyWorldPatches(patches);
        // 用户正在提交内容时不重建编辑器；提交完成后的 render 会带出最新状态。
        setState({ worldState: newWorldState }, !busy);
        if (!busy && !extracted._fallback) {
          showToast("已从种子中解析出 " + patches.length + " 项设定");
        }
      }
    } catch (e) {
      console.warn("extractSeedEntities 失败: " + e.message);
    } finally {
      if (runId === seedExtractionRun) activeSeedExtractionKey = "";
    }
  }

  async function submitWorldInput(input) {
    if (busy) return;
    busy = true;
    // 不重建整个 DOM，仅禁用输入区 + 呼吸态提示
    setComposerWaiting(true);
    try {
      var result = await window.TarotAI.processWorldInput(state, input);
      var entry = {
        id: "log_" + Date.now().toString(36),
        userInput: input,
        intent: result.intent,
        level: result.level,
        result: result.result,
        patches: result.patches,
        response: result.response,
        createdAt: new Date().toISOString(),
        retracted: false
      };
      var worldState = result.patches.length ? applyWorldPatches(result.patches) : state.worldState;
      // 计数有效互动（meta 类型的写作讨论不算）
      var isMeaningful = result.intent !== "meta";
      var newCounter = state.guideInteractionCounter + (isMeaningful ? 1 : 0);
      setState({
        worldState: worldState,
        interactionLog: state.interactionLog.concat([entry]),
        guideInteractionCounter: newCounter
      });
      autoSaveArchive();
      // 渐进式引导生成：每 N 次有效互动触发一次
      if (isMeaningful && newCounter > 0 && newCounter % GUIDE_UNLOCK_INTERVAL === 0) {
        generateNewGuides();
      }
    } catch (error) {
      showToast("世界没有听清，请再写一次");
    } finally {
      busy = false;
      setComposerWaiting(false);
      render();
    }
  }

  async function submitArchiveQuery(question) {
    if (busy) return;
    busy = true;
    // 不冻结 UI：仅禁用输入区
    setComposerWaiting(true, "正在查阅档案……");
    try {
      var answer = await window.TarotAI.queryArchive(state.activeView, state.worldState, question, state.tone, state.worldSeed);
      var query = {
        id: "query_" + Date.now().toString(36),
        question: question,
        answer: answer,
        written: false,
        createdAt: new Date().toISOString()
      };
      var archiveQueries = clone(state.archiveQueries);
      archiveQueries[state.activeView].push(query);
      setState({ archiveQueries: archiveQueries });
    } catch (error) {
      showToast("档案暂时无法回答");
    } finally {
      busy = false;
      setComposerWaiting(false);
      render();
    }
  }

  async function createEcho() {
    if (busy) return;
    var endIndex = state.interactionLog.length - 1;
    if (endIndex < state.lastEchoIndex) {
      showToast("还没有新的有效互动可供编纂");
      return;
    }
    busy = true;
    // 直接禁用回响按钮，不重建整个视图（用户仍可翻阅故事）
    var echoBtn = document.querySelector(".echo-button");
    if (echoBtn) echoBtn.disabled = true;
    showToast("正在编纂尚未叙事化的互动");
    try {
      var echo = await window.TarotAI.generateEcho(state, state.lastEchoIndex, endIndex);
      if (!echo) {
        showToast("这一段没有通过检定的世界变化");
        busy = false;
        if (echoBtn) echoBtn.disabled = false;
        return;
      }
      setState({
        echoes: state.echoes.concat([echo]),
        lastEchoIndex: endIndex + 1
      });
      autoSaveArchive();
    } catch (error) {
      showToast("回响暂时没有形成");
    } finally {
      busy = false;
      render();
    }
  }

  function writeQueryToStory(id) {
    var archiveQueries = clone(state.archiveQueries);
    var source = null;
    var keys = Object.keys(archiveQueries);
    for (var i = 0; i < keys.length; i++) {
      var queries = archiveQueries[keys[i]];
      for (var j = 0; j < queries.length; j++) {
        if (queries[j].id === id) {
          queries[j].written = true;
          source = queries[j];
          break;
        }
      }
      if (source) break;
    }
    if (!source) return;
    var entry = {
      id: "log_" + Date.now().toString(36),
      userInput: "我把档案中的问题带入世界：" + source.question,
      intent: "meta",
      level: null,
      result: "deferred",
      patches: [],
      response: "这条档案查询已被明确带入羽毛故事书，作为尚未成为事实的创作痕迹。若要让它改变世界，请继续写下世界内的行动或设定。",
      createdAt: new Date().toISOString(),
      retracted: false
    };
    setState({
      archiveQueries: archiveQueries,
      interactionLog: state.interactionLog.concat([entry]),
      activeView: "story"
    });
    autoSaveArchive();
    showToast("已明确写入羽毛故事书");
  }

  function goBack() {
    if (state.materialFlipOpen) {
      setState({ material: "", selectedMaterialPreview: "", materialFlipOpen: false });
      return;
    }
    if (state.phase === "expression" && state.domain === "archaeology") {
      setState({
        phase: "base",
        material: "",
        selectedMaterialPreview: "",
        materialFlipOpen: false,
        selectedPrimaryTheme: "",
        selectedPrimaryThemeId: "",
        userExpression: "",
        secondaryThemes: []
      });
      return;
    }
    var index = stepIndex();
    if (index <= 0) return;
    var previous = PHASES[index - 1];
    var reset = { phase: previous };
    if (previous === "tone") {
      var homeTone = state.tone;
      var def = clone(DEFAULT_STATE);
      def.phase = "tone";
      def.tone = homeTone;
      reset = def;
    }
    if (previous === "domain") {
      reset.domain = "";
      reset.material = "";
      reset.materialFlipOpen = false;
      reset.base = "";
      reset.primaryThemes = [];
      reset.selectedPrimaryTheme = "";
      reset.selectedPrimaryThemeId = "";
      reset.selectedSpreadPosition = clone(DEFAULT_STATE.selectedSpreadPosition);
    }
    if (previous === "base") {
      reset.material = "";
      reset.selectedMaterialPreview = "";
      reset.materialFlipOpen = false;
      reset.base = "";
      reset.primaryThemes = [];
      reset.selectedPrimaryTheme = "";
      reset.selectedPrimaryThemeId = "";
      reset.selectedSpreadPosition = clone(DEFAULT_STATE.selectedSpreadPosition);
    }
    if (previous === "primary") {
      reset.selectedPrimaryTheme = "";
      reset.selectedPrimaryThemeId = "";
      reset.selectedSpreadPosition = clone(DEFAULT_STATE.selectedSpreadPosition);
      reset.userExpression = "";
      reset.secondaryThemes = [];
    }
    if (previous === "expression") {
      reset.secondaryThemes = [];
      reset.selectedSecondaryTheme = "";
      reset.subconsciousWords = [];
    }
    if (previous === "secondary") {
      reset.selectedSecondaryTheme = "";
      reset.subconsciousWords = [];
      reset.worldSeed = { title: "", body: "", bodyExpanded: "", hints: [], quests: [] };
      reset.worldSeeds = [];
      reset.activeSeedIndex = -1;
    }
    setState(reset);
  }

  function exportSession() {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "白日幻想-" + (state.worldSeed.title.replace(/[《》]/g, "") || "世界档案") + ".json";
    link.click();
    URL.revokeObjectURL(url);
    showToast("世界档案已导出");
  }

  function buildArchiveData(keepId, keepCreatedAt) {
    return {
      id: keepId,
      title: state.worldSeed.title,
      body: state.worldSeed.body,
      bodyExpanded: state.worldSeed.bodyExpanded,
      hints: state.worldSeed.hints || [],
      quests: state.worldSeed.quests || [],
      tone: state.tone,
      domain: state.domain,
      material: state.material,
      base: state.base,
      playerIdentity: state.playerIdentity,
      primaryTheme: state.selectedPrimaryTheme,
      primaryPosition: state.selectedSpreadPosition,
      secondaryTheme: state.selectedSecondaryTheme,
      userExpression: state.userExpression,
      worldState: state.worldState,
      interactionLog: state.interactionLog,
      echoes: state.echoes,
      lastEchoIndex: state.lastEchoIndex,
      archiveQueries: state.archiveQueries,
      storyStartedAt: state.storyStartedAt,
      revealedGuideCount: state.revealedGuideCount,
      guideInteractionCounter: state.guideInteractionCounter,
      createdAt: keepCreatedAt,
      updatedAt: new Date().toISOString()
    };
  }

  function findArchiveIndex(archives, title) {
    for (var i = 0; i < archives.length; i++) {
      if (archives[i].title === title) return i;
    }
    return -1;
  }

  function archiveWorld() {
    var archives = loadArchives();
    var title = state.worldSeed.title;
    if (!title) { showToast("没有可存档的世界"); return; }
    var existingIdx = findArchiveIndex(archives, title);
    var keepId = existingIdx >= 0 ? archives[existingIdx].id : "arc_" + Date.now().toString(36);
    var keepCreatedAt = existingIdx >= 0 ? archives[existingIdx].createdAt : new Date().toISOString();
    var archive = buildArchiveData(keepId, keepCreatedAt);
    if (existingIdx >= 0) archives.splice(existingIdx, 1);
    archives.unshift(archive);
    if (archives.length > 10) archives.length = 10;
    saveArchives(archives);
    var def = clone(DEFAULT_STATE);
    def.phase = "tone";
    def.tone = state.tone;
    setState(def);
    showToast(existingIdx >= 0 ? "世界存档已更新" : "世界已存档");
  }

  function autoSaveArchive() {
    var title = state.worldSeed.title;
    if (!title || state.phase !== "world") return;
    var archives = loadArchives();
    var existingIdx = findArchiveIndex(archives, title);
    if (existingIdx >= 0) {
      var archive = buildArchiveData(archives[existingIdx].id, archives[existingIdx].createdAt);
      archives[existingIdx] = archive;
    } else {
      var newArchive = buildArchiveData("arc_" + Date.now().toString(36), new Date().toISOString());
      archives.unshift(newArchive);
      if (archives.length > 10) archives.length = 10;
    }
    saveArchives(archives);
  }

  function loadArchivedWorld(id) {
    var archives = loadArchives();
    var archive = null;
    for (var i = 0; i < archives.length; i++) {
      if (archives[i].id === id) { archive = archives[i]; break; }
    }
    if (!archive) return;
    localStorage.removeItem(STORAGE_KEY);
    setState({
      phase: "world",
      activeView: "story",
      tone: archive.tone,
      domain: archive.domain || "",
      material: archive.material || "",
      base: archive.base || "",
      playerIdentity: archive.playerIdentity || null,
      selectedPrimaryTheme: archive.primaryTheme,
      selectedSpreadPosition: archive.primaryPosition || clone(DEFAULT_STATE.selectedSpreadPosition),
      selectedSecondaryTheme: archive.secondaryTheme,
      userExpression: archive.userExpression,
      worldSeed: { title: archive.title, body: archive.body, bodyExpanded: archive.bodyExpanded, hints: archive.hints || [], quests: archive.quests || [] },
      worldState: { ...clone(DEFAULT_STATE.worldState), ...(archive.worldState || {}) },
      interactionLog: archive.interactionLog,
      echoes: archive.echoes,
      lastEchoIndex: archive.lastEchoIndex,
      archiveQueries: archive.archiveQueries,
      storyStartedAt: archive.storyStartedAt,
      revealedGuideCount: archive.revealedGuideCount || 0,
      guideInteractionCounter: archive.guideInteractionCounter || 0
    });
    showToast("已载入存档：" + esc(archive.title));
    // 如果存档的 worldState 是完全空的，后台提取种子内容
    var ws = archive.worldState || {};
    if (!(ws.axioms && ws.axioms.length) && !(ws.rules && ws.rules.length) && !(ws.entities && ws.entities.length) && !(ws.events && ws.events.length) && !(ws.locations && ws.locations.length)) {
      extractWorldSeedEntities();
    }
  }

  function deleteArchive(id) {
    var archives = loadArchives();
    archives = archives.filter(function (a) { return a.id !== id; });
    saveArchives(archives);
    render();
    showToast("存档已删除");
  }

  /* ====== Swipe-to-delete ====== */

  var swipeState = { el: null, startX: 0, currentX: 0, open: false, pointerDown: false, hasMoved: false };

  function closeSwipe() {
    if (swipeState.el) {
      swipeState.el.style.transform = "translateX(0)";
      swipeState.el = null;
      swipeState.open = false;
    }
    swipeState.pointerDown = false;
  }

  function getClientX(e) {
    // Touch event
    if (e.touches && e.touches.length) return e.touches[0].clientX;
    // Mouse event
    if (typeof e.clientX === "number") return e.clientX;
    return 0;
  }

  function handleSwipeStart(e) {
    // If another card is open and pointer is outside it, close it first
    if (swipeState.open && swipeState.el) {
      var openCell = swipeState.el.closest(".aw-swipe-cell");
      if (openCell && !openCell.contains(e.target)) {
        closeSwipe();
      } else if (!openCell) {
        closeSwipe();
      } else {
        return;
      }
    }
    var cell = e.target.closest(".aw-swipe-content");
    if (!cell) return;
    if (swipeState.el === cell && swipeState.open) return;
    swipeState.el = cell;
    swipeState.startX = getClientX(e);
    swipeState.currentX = 0;
    swipeState.pointerDown = true;
    swipeState.hasMoved = false;
  }

  function handleSwipeMove(e) {
    if (!swipeState.el || !swipeState.pointerDown) return;
    var dx = getClientX(e) - swipeState.startX;
    swipeState.currentX = dx;
    if (Math.abs(dx) > 5) swipeState.hasMoved = true;
    if (dx > 0) {
      swipeState.el.style.transform = "translateX(0)";
      return;
    }
    var maxSwipe = 72;
    dx = Math.max(dx, -maxSwipe);
    swipeState.el.style.transform = "translateX(" + dx + "px)";
  }

  function handleSwipeEnd(e) {
    if (!swipeState.el || !swipeState.pointerDown) return;
    swipeState.pointerDown = false;
    var threshold = -30;
    if (swipeState.currentX < threshold) {
      swipeState.el.style.transform = "translateX(-72px)";
      swipeState.open = true;
    } else {
      swipeState.el.style.transform = "translateX(0)";
      swipeState.el = null;
      swipeState.open = false;
    }
  }

  // Touch events (mobile)
  app.addEventListener("touchstart", handleSwipeStart, { passive: true });
  app.addEventListener("touchmove", handleSwipeMove, { passive: true });
  app.addEventListener("touchend", handleSwipeEnd);

  // Mouse events (desktop)
  app.addEventListener("mousedown", handleSwipeStart);
  app.addEventListener("mousemove", handleSwipeMove);
  app.addEventListener("mouseup", handleSwipeEnd);
  // Cancel swipe if mouse leaves the app area
  app.addEventListener("mouseleave", function () {
    if (swipeState.pointerDown) handleSwipeEnd();
  });

  /* ====== Event Delegation ====== */

  app.addEventListener("click", function (event) {
    // 交互游戏结束后的冷却期，防止误触
    if (Date.now() < transitionCooldownUntil) return;
    // Suppress click if a swipe/drag just happened
    if (swipeState.hasMoved) {
      swipeState.hasMoved = false;
      return;
    }
    var target = event.target.closest("[data-action]");
    if (!target) return;
    var action = target.dataset.action;

    if (action === "toggle-home-tone") {
      var nextTone = state.tone === "dark" ? "light" : "dark";
      state = Object.assign({}, state, { tone: nextTone });
      persist();
      var home = document.querySelector(".dream-home");
      if (home) {
        home.classList.toggle("is-light", nextTone === "light");
        home.classList.toggle("is-dark", nextTone === "dark");
        home.dataset.homeTone = nextTone;
      }
      target.setAttribute("aria-pressed", nextTone === "dark" ? "true" : "false");
    } else if (action === "play-dream") {
      var dreamEntry = target.closest(".home-dream-entry");
      if (!dreamEntry || dreamEntry.classList.contains("is-playing")) return;
      var dreamVideo = dreamEntry.querySelector(".home-dream-video");
      if (!dreamVideo) return;
      dreamEntry.classList.add("is-playing");
      var playingHome = dreamEntry.closest(".dream-home");
      if (playingHome) playingHome.classList.add("dream-playing");
      target.setAttribute("aria-label", "入梦动画正在播放");
      dreamVideo.currentTime = 0;
      dreamVideo.muted = true;
      var playPromise = dreamVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          dreamEntry.classList.remove("is-playing");
          if (playingHome) playingHome.classList.remove("dream-playing");
          target.setAttribute("aria-label", "播放动画并进入世界");
          showToast("轻触一次，让梦境开始播放");
        });
      }
    } else if (action === "toggle-home-archive" || action === "close-home-archive") {
      var dreamHome = document.querySelector(".dream-home");
      if (dreamHome) {
        var shouldOpen = action === "toggle-home-archive" && !dreamHome.classList.contains("archive-open");
        dreamHome.classList.toggle("archive-open", shouldOpen);
        var archiveDock = dreamHome.querySelector(".home-archive-dock");
        if (archiveDock) archiveDock.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
      }
    } else if (action === "choose-tone") {
      setState({ tone: target.dataset.value, phase: "domain", restored: false });
    } else if (action === "choose-domain") {
      setState({ domain: target.dataset.value, selectedMaterialPreview: "", materialFlipOpen: false, phase: "base" });
    } else if (action === "preview-material") {
      var previewMaterial = target.dataset.value;
      state = Object.assign({}, state, { material: previewMaterial });
      setState({
        material: previewMaterial,
        selectedMaterialPreview: previewMaterial,
        materialFlipOpen: true,
        primaryThemes: drawThemes(),
        selectedSpreadPosition: clone(DEFAULT_STATE.selectedSpreadPosition)
      });
    } else if (action === "close-material-flip") {
      setState({ material: "", selectedMaterialPreview: "", materialFlipOpen: false });
    } else if (action === "choose-material") {
      var material = target.dataset.value;
      state = Object.assign({}, state, { material: material });
      setState({
        material: material,
        selectedMaterialPreview: material,
        primaryThemes: drawThemes(),
        selectedSpreadPosition: clone(DEFAULT_STATE.selectedSpreadPosition),
        phase: "primary"
      });
    } else if (action === "choose-base") {
      var base = target.dataset.value;
      state = Object.assign({}, state, { base: base });
      setState({
        primaryThemes: drawThemes(),
        selectedSpreadPosition: clone(DEFAULT_STATE.selectedSpreadPosition),
        phase: "primary"
      });
    } else if (action === "choose-primary") {
      setState({
        selectedPrimaryTheme: target.dataset.name,
        selectedPrimaryThemeId: target.dataset.id,
        materialFlipOpen: false,
        selectedSpreadPosition: {
          key: target.dataset.positionKey || "",
          label: target.dataset.positionLabel || "",
          meaning: target.dataset.positionMeaning || ""
        },
        phase: "expression"
      });
    } else if (action === "refresh-themes" && !state.themeRefreshUsed) {
      setState({ primaryThemes: drawThemes(), themeRefreshUsed: true });
    } else if (action === "choose-secondary") {
      chooseSecondary(target.dataset.value);
    } else if (action === "retry-secondary") {
      retrySecondary();
    } else if (action === "seed-prev") {
      switchSeed(-1);
    } else if (action === "seed-next") {
      switchSeed(1);
    } else if (action === "enter-world") {
      var worldState = window.TarotAI.initializeWorldState(state);
      setState({
        worldState: worldState,
        interactionLog: [],
        echoes: [],
        lastEchoIndex: 0,
        archiveQueries: clone(DEFAULT_STATE.archiveQueries),
        phase: "world",
        activeView: "story",
        storyStartedAt: new Date().toISOString(),
        revealedGuideCount: 0,
        guideInteractionCounter: 0
      });
      // 后台解析世界种子，提取人物/地点/事件/设定
      extractWorldSeedEntities();
    } else if (action === "back") {
      goBack();
    } else if (action === "dismiss-restore") {
      setState({ restored: false });
    } else if (action === "switch-view") {
      autoSaveArchive();
      setState({ activeView: target.dataset.value });
    } else if (action === "toggle-log") {
      setState({ showFullLog: !state.showFullLog });
    } else if (action === "echo") {
      createEcho();
    } else if (action === "reveal-guide") {
      var hints = state.worldSeed.hints || [];
      var quests = state.worldSeed.quests || [];
      var allTexts = [];
      for (var gi = 0; gi < hints.length; gi++) {
        allTexts.push(hints[gi].label + "：" + hints[gi].value);
      }
      for (var gj = 0; gj < quests.length; gj++) {
        allTexts.push(quests[gj]);
      }
      if (state.revealedGuideCount < allTexts.length) {
        var newCount = state.revealedGuideCount + 1;
        var revealedText = allTexts[state.revealedGuideCount];
        state = { ...state, revealedGuideCount: newCount };
        persist();
        render();
        // 把揭示的文字填入文本框
        requestAnimationFrame(function () {
          var ta = document.querySelector("[data-composer-input]");
          if (ta) {
            ta.value = revealedText;
            ta.style.color = "var(--red)";
            ta.focus();
            ta.setSelectionRange(ta.value.length, ta.value.length);
            // 触发高度调整
            ta.style.height = "auto";
            ta.style.height = Math.min(ta.scrollHeight, 96) + "px";
          }
        });
      }
    } else if (action === "write-query-to-story") {
      writeQueryToStory(target.dataset.id);
    } else if (action === "open-session-menu" || action === "close-menu") {
      renderMenu();
      var backdrop = document.querySelector(".sheet-backdrop");
      if (backdrop) backdrop.remove();
      if (action === "open-session-menu") {
        app.insertAdjacentHTML("beforeend", '<div class="sheet-backdrop" data-action="close-menu"></div>');
      }
    } else if (action === "back-to-home") {
      autoSaveArchive();
      var activeTone = state.tone;
      var def = clone(DEFAULT_STATE);
      def.phase = "tone";
      def.tone = activeTone;
      setState(def);
    } else if (action === "reset-session") {
      localStorage.removeItem(STORAGE_KEY);
      state = clone(DEFAULT_STATE);
      render();
    } else if (action === "export-session") {
      exportSession();
      renderMenu();
      var bd = document.querySelector(".sheet-backdrop");
      if (bd) bd.remove();
    } else if (action === "archive-world") {
      archiveWorld();
      renderMenu();
      var bd2 = document.querySelector(".sheet-backdrop");
      if (bd2) bd2.remove();
    } else if (action === "load-archive") {
      loadArchivedWorld(target.dataset.id);
    } else if (action === "delete-archive") {
      deleteArchive(target.dataset.id);
    }
    // Close swipe when tapping outside a swipe cell
    if (swipeState.open && !target.closest(".aw-swipe-cell")) {
      closeSwipe();
    }
  });

  app.addEventListener("timeupdate", function (event) {
    var video = event.target;
    if (!video.classList || !video.classList.contains("home-dream-video")) return;
    var entry = video.closest(".home-dream-entry");
    if (!entry || !Number.isFinite(video.duration)) return;
    if (video.duration - video.currentTime < .7) entry.classList.add("is-ending");
  }, true);

  app.addEventListener("ended", function (event) {
    var video = event.target;
    if (!video.classList || !video.classList.contains("home-dream-video")) return;
    setState({
      tone: state.tone === "dark" ? "dark" : "light",
      phase: "domain",
      restored: false
    });
  }, true);

  app.addEventListener("submit", async function (event) {
    event.preventDefault();
    var form = event.target;
    if (form.dataset.form === "expression") {
      var input = form.querySelector("textarea").value.trim();
      if (input.length < 2 || busy) {
        showToast("再多写一点，让世界听见你");
        return;
      }
      busy = true;
      setState({ userExpression: input, subconsciousWords: [] }, false);
      // Start AI call immediately — runs in parallel with Morse code game
      var aiPromise = window.TarotAI.generateSecondaryThemes({
        domain: state.domain,
        material: state.material,
        base: state.base,
        tone: state.tone,
        primaryTheme: state.selectedPrimaryTheme,
        primaryThemeId: state.selectedPrimaryThemeId,
        primaryPosition: state.selectedSpreadPosition,
        userExpression: input
      });
      try {
        // Morse code rhythm game: tap sequences to calibrate signals
        var associations = await playMorseCode(aiPromise);
        var secondaryThemes = await aiPromise;
        busy = false;
        setState({ secondaryThemes: secondaryThemes, subconsciousWords: associations, phase: "secondary" });
      } catch (error) {
        busy = false;
        showToast("词语暂时没有回应，请再试一次");
        render();
      }
    } else if (form.dataset.form === "world-input") {
      var textarea = form.querySelector("textarea");
      var value = textarea.value.trim();
      if (value) await submitWorldInput(value);
    } else if (form.dataset.form === "archive-query") {
      var ta = form.querySelector("textarea");
      var val = ta.value.trim();
      if (val) await submitArchiveQuery(val);
    }
  });

  app.addEventListener("input", function (event) {
    if (event.target.id === "expression-input") {
      var count = document.querySelector("[data-count]");
      if (count) count.textContent = event.target.value.length;
    }
    if (event.target.matches("[data-composer-input]")) {
      event.target.style.color = ""; // 用户打字后，红色提示恢复为正常颜色
      event.target.style.height = "auto";
      event.target.style.height = Math.min(event.target.scrollHeight, 96) + "px";
    }
  });

  window.addEventListener("beforeunload", function () {
    autoSaveArchive();
  });

  render();
})();
