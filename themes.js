(function () {
  const themes = [
    { id: "power", name: "权力", lightWeight: .55, darkWeight: 1, baseWeights: { reality: 1, scifi: .86, fantasy: .92, psyche: .45 }, relatedThemes: ["order"], exclusiveGroup: "control" },
    { id: "freedom", name: "自由", lightWeight: .95, darkWeight: .72, baseWeights: { reality: .9, scifi: .86, fantasy: .8, psyche: .92 }, relatedThemes: ["fate"], exclusiveGroup: "agency" },
    { id: "memory", name: "记忆", lightWeight: .8, darkWeight: .88, baseWeights: { reality: .72, scifi: .95, fantasy: .75, psyche: 1 }, relatedThemes: ["identity"], exclusiveGroup: "selfhood" },
    { id: "order", name: "秩序", lightWeight: .58, darkWeight: .9, baseWeights: { reality: .95, scifi: .92, fantasy: .82, psyche: .42 }, relatedThemes: ["power"], exclusiveGroup: "control" },
    { id: "identity", name: "身份", lightWeight: .84, darkWeight: .86, baseWeights: { reality: .9, scifi: .86, fantasy: .72, psyche: 1 }, relatedThemes: ["memory"], exclusiveGroup: "selfhood" },
    { id: "trust", name: "信任", lightWeight: .98, darkWeight: .75, baseWeights: { reality: 1, scifi: .64, fantasy: .72, psyche: .88 }, relatedThemes: ["connection"], exclusiveGroup: "bond" },
    { id: "responsibility", name: "责任", lightWeight: .9, darkWeight: .8, baseWeights: { reality: 1, scifi: .72, fantasy: .76, psyche: .7 }, relatedThemes: ["sacrifice"], exclusiveGroup: "duty" },
    { id: "desire", name: "欲望", lightWeight: .58, darkWeight: 1, baseWeights: { reality: .78, scifi: .65, fantasy: .9, psyche: 1 }, relatedThemes: ["fear"], exclusiveGroup: "impulse" },
    { id: "belonging", name: "归属", lightWeight: 1, darkWeight: .7, baseWeights: { reality: .96, scifi: .65, fantasy: .72, psyche: .94 }, relatedThemes: ["loneliness"], exclusiveGroup: "belonging" },
    { id: "truth", name: "真相", lightWeight: .74, darkWeight: 1, baseWeights: { reality: .94, scifi: .9, fantasy: .78, psyche: .84 }, relatedThemes: ["knowledge"], exclusiveGroup: "revelation" },
    { id: "fate", name: "命运", lightWeight: .58, darkWeight: .96, baseWeights: { reality: .45, scifi: .72, fantasy: 1, psyche: .78 }, relatedThemes: ["freedom"], exclusiveGroup: "agency" },
    { id: "change", name: "改变", lightWeight: 1, darkWeight: .68, baseWeights: { reality: .88, scifi: .78, fantasy: .78, psyche: .96 }, relatedThemes: ["rebirth"], exclusiveGroup: "renewal" },
    { id: "death", name: "死亡", lightWeight: .38, darkWeight: 1, baseWeights: { reality: .72, scifi: .78, fantasy: .98, psyche: .68 }, relatedThemes: ["survival"], exclusiveGroup: "mortality" },
    { id: "meaning", name: "意义", lightWeight: .92, darkWeight: .76, baseWeights: { reality: .75, scifi: .62, fantasy: .7, psyche: 1 }, relatedThemes: ["faith"], exclusiveGroup: "purpose" },
    { id: "loneliness", name: "孤独", lightWeight: .62, darkWeight: .96, baseWeights: { reality: .88, scifi: .86, fantasy: .65, psyche: 1 }, relatedThemes: ["belonging"], exclusiveGroup: "belonging" },
    { id: "justice", name: "正义", lightWeight: .9, darkWeight: .74, baseWeights: { reality: 1, scifi: .68, fantasy: .86, psyche: .45 }, relatedThemes: ["responsibility"], exclusiveGroup: "ethics" },
    { id: "sacrifice", name: "牺牲", lightWeight: .65, darkWeight: 1, baseWeights: { reality: .75, scifi: .72, fantasy: .95, psyche: .75 }, relatedThemes: ["responsibility"], exclusiveGroup: "duty" },
    { id: "fear", name: "恐惧", lightWeight: .5, darkWeight: 1, baseWeights: { reality: .74, scifi: .76, fantasy: .88, psyche: 1 }, relatedThemes: ["desire"], exclusiveGroup: "impulse" },
    { id: "civilization", name: "文明", lightWeight: .82, darkWeight: .8, baseWeights: { reality: .65, scifi: 1, fantasy: .92, psyche: .3 }, relatedThemes: ["order"], exclusiveGroup: "society" },
    { id: "connection", name: "连接", lightWeight: 1, darkWeight: .62, baseWeights: { reality: .8, scifi: .98, fantasy: .7, psyche: .9 }, relatedThemes: ["trust"], exclusiveGroup: "bond" },
    { id: "time", name: "时间", lightWeight: .72, darkWeight: .86, baseWeights: { reality: .48, scifi: 1, fantasy: .92, psyche: .86 }, relatedThemes: ["memory"], exclusiveGroup: "continuity" },
    { id: "knowledge", name: "知识", lightWeight: .9, darkWeight: .72, baseWeights: { reality: .82, scifi: 1, fantasy: .75, psyche: .62 }, relatedThemes: ["truth"], exclusiveGroup: "revelation" },
    { id: "survival", name: "生存", lightWeight: .65, darkWeight: 1, baseWeights: { reality: .86, scifi: .98, fantasy: .88, psyche: .55 }, relatedThemes: ["death"], exclusiveGroup: "mortality" },
    { id: "faith", name: "信念", lightWeight: .96, darkWeight: .7, baseWeights: { reality: .66, scifi: .42, fantasy: 1, psyche: .9 }, relatedThemes: ["meaning"], exclusiveGroup: "purpose" },
    { id: "rebirth", name: "新生", lightWeight: 1, darkWeight: .42, baseWeights: { reality: .58, scifi: .7, fantasy: .96, psyche: .88 }, relatedThemes: ["change"], exclusiveGroup: "renewal" },
    { id: "creation", name: "创造", lightWeight: 1, darkWeight: .52, baseWeights: { reality: .78, scifi: .9, fantasy: 1, psyche: .8 }, relatedThemes: ["civilization"], exclusiveGroup: "making" }
  ];

  // Archaeology mode: dimension pools — not abstract themes, but era / region / sub-genre / scale / style
  var ARCHAEOLOGY_DIMENSIONS = {
    history: [
      "唐朝", "宋朝", "明朝", "晚清", "民国",
      "中世纪", "拜占庭", "江户", "印加", "中东",
      "文艺复兴", "维多利亚", "英雄史诗", "群体叙事", "小人物",
      "宫廷", "市井", "战乱", "盛世", "末世",
      "边陲", "商路", "殖民", "革命", "流亡"
    ],
    myth: [
      "中国民间", "希腊", "北欧", "日本", "印度",
      "埃及", "凯尔特", "美索不达米亚", "斯拉夫", "非洲",
      "精怪", "鬼神", "仙道", "巫觋", "妖兽",
      "梦境", "冥界", "山林", "水域", "人间夹缝",
      "创世", "末日", "报应", "化身", "祭祀"
    ],
    literature: [
      "哥特", "黑色电影", "魔幻现实", "俄国", "拉美",
      "法国", "日本私小说", "美国南方", "英国庄园", "中国乡土",
      "书信体", "不可靠叙述", "成长", "流亡", "囚禁",
      "漫游", "荒诞", "史诗", "独白", "碎片",
      "意识流", "童话", "反乌托邦", "流浪汉", "哥特南方"
    ],
    anime: [
      "日式", "克苏鲁", "赛博朋克", "异世界", "蒸汽朋克",
      "末日废土", "机战", "日常系", "暗黑奇幻", "校园",
      "都市", "太空", "地下城", "虚拟世界", "美式超英",
      "魔法少女", "运动", "美食", "音乐", "里世界",
      "时间循环", "战队", "妖怪退治", "偶像", "赌局"
    ],
    martial: [
      "宋", "明", "架空", "西域", "苗疆",
      "东海", "塞北", "蜀中", "金式", "古式",
      "黄式", "新派", "侠客", "门派", "朝廷",
      "魔教", "散人", "镖局", "世家", "隐士",
      "浪人", "商人", "军旅", "邪道", "正道"
    ],
    mystery: [
      "本格", "社会派", "硬汉", "倒叙", "叙述性诡计",
      "心理惊悚", "法庭", "间谍", "暴风雪山庄", "都市",
      "小镇", "列车", "医院", "学校", "家族宅邸",
      "记者视角", "侦探视角", "凶手视角", "家属视角", "失踪者",
      "匿名信", "密室", "不在场", "巧合", "反转"
    ],
    scene: [
      "灾难", "丑闻", "战地", "法庭", "边境",
      "疫区", "贫民窟", "权力中心", "地下经济", "记者",
      "幸存者", "内部人", "调查员", "旁观者", "封锁中",
      "发酵中", "被遗忘", "被篡改", "正在发生", "重建",
      "冲突", "撤离", "审判", "救援", "哨站"
    ],
    person: [
      "画家", "诗人", "匠人", "帝王", "科学家",
      "作曲家", "舞者", "建筑师", "僧侣", "水手",
      "文艺复兴", "宋朝", "维多利亚", "民国", "当代",
      "书信", "日记", "画作", "手稿", "遗物",
      "独居者", "流亡者", "开拓者", "守夜人", "信使"
    ]
  };

  function weightedPick(items, score) {
    if (!items.length) return null;
    const pool = items.map(item => ({ item, weight: Math.max(.01, score(item)) }));
    const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
    let cursor = Math.random() * total;
    for (const entry of pool) {
      cursor -= entry.weight;
      if (cursor <= 0) return entry.item;
    }
    return pool[pool.length - 1].item;
  }

  function conflicts(candidate, selected) {
    return selected.some(item =>
      item.id === candidate.id ||
      (item.exclusiveGroup && item.exclusiveGroup === candidate.exclusiveGroup) ||
      item.relatedThemes.includes(candidate.id) ||
      candidate.relatedThemes.includes(item.id)
    );
  }

  function drawPrimaryThemes(tone, base, domain, material) {
    const selected = [];

    // Archaeology mode: draw dimension words from material-specific pools
    if (domain === "archaeology" && material && ARCHAEOLOGY_DIMENSIONS[material]) {
      var pool = ARCHAEOLOGY_DIMENSIONS[material].slice();
      // Shuffle, then take 5
      for (var i = pool.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
      }
      return pool.slice(0, 5).map(function (t, idx) {
        return { id: material + "-" + idx, name: t, kind: "material" };
      });
    }

    // Fiction mode: original weighted drawing logic
    const toneKey = tone === "light" ? "lightWeight" : "darkWeight";
    const matchScore = (theme) => theme[toneKey] * theme.baseWeights[base];

    const take = (candidates, kind, score = matchScore) => {
      const available = candidates.filter(theme => !conflicts(theme, selected));
      const picked = weightedPick(available, score);
      if (picked) selected.push({ ...picked, kind });
      return picked;
    };

    const ranked = [...themes].sort((a, b) => matchScore(b) - matchScore(a));
    const highPool = ranked.slice(0, 15);
    for (let i = 0; i < 3; i += 1) {
      take(highPool, "matched", theme => Math.pow(matchScore(theme), 3));
    }

    const universal = themes.filter(theme => {
      const weights = Object.values(theme.baseWeights);
      return Math.min(...weights) >= .62 && Math.max(...weights) - Math.min(...weights) <= .3;
    });
    take(universal, "universal", theme => theme[toneKey] * .7 + .3);

    const surprise = themes.filter(theme => {
      const otherBest = Math.max(...Object.entries(theme.baseWeights).filter(([key]) => key !== base).map(([, value]) => value));
      return theme.baseWeights[base] <= .72 && otherBest >= .85 && theme[toneKey] >= .5;
    });
    take(surprise, "surprise", theme => (1.05 - theme.baseWeights[base]) * theme[toneKey]);

    while (selected.length < 5) {
      if (!take(themes, selected.length === 4 ? "surprise" : "matched")) break;
    }

    return selected.slice(0, 5).sort(() => Math.random() - .5).map(theme => ({
      id: theme.id,
      name: theme.name,
      kind: theme.kind
    }));
  }

  window.TarotThemes = { themes, drawPrimaryThemes };
})();
