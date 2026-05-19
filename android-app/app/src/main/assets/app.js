const SAVE_ENDPOINT = "/api/saved";
const hasAndroidStorage = Boolean(window.AndroidStorage);
const isFileMode = window.location.protocol === "file:" && !hasAndroidStorage;
const fileModeMessage = "直接打开 index.html 时不能写入收藏文件。请双击 start-local.cmd 打开可保存版本。";

const state = {
  current: null,
  saved: [],
  storageMessage: "正在读取收藏文件...",
};

const labels = {
  daily: "日常",
  emotion: "情绪",
  relationship: "关系",
  memory: "回忆",
  thought: "想法",
  random: "随机",
};

const depthLabels = {
  1: "轻触",
  2: "浅谈",
  3: "适中",
  4: "深入",
  5: "探底",
};

const toneOpeners = {
  soft: ["慢慢说", "不急着总结", "先把它放在桌面上看看", "给这件事留一点余地"],
  curious: ["换个角度看", "像第一次遇见它那样说", "追着那个疑问往前走", "把答案先放一边"],
  sharp: ["直接说到最刺的地方", "别绕开那个判断", "把真正介意的东西说出来", "看看这件事暴露了什么"],
  light: ["从一个轻一点的入口说起", "先说好玩的一面", "把它当成一段小片段", "别急着严肃起来"],
};

const banks = {
  daily: {
    lead: ["从一个具体瞬间开始", "从今天最有画面感的地方开始", "从身体先记得的部分开始"],
    starters: [
      "先说一件今天在脑子里停留最久的小事，它发生在什么地方，周围有什么声音？",
      "挑一个今天反复出现的细节，说清楚它的颜色、温度、气味和你的反应。",
      "把今天当成一段电影，先口述第一个镜头，再说它为什么值得留下。",
      "从你今天最想跳过的那几分钟开始，那里可能藏着真正的材料。",
    ],
    tags: ["场景", "身体", "物件", "节奏", "反差", "尾声", "微光", "转折"],
    questions: [
      ["今天哪个瞬间最像一个小小的转折？", "它发生前后，你的语气或动作有什么变化？"],
      ["今天有什么东西被你看见了两次以上？", "第二次看见它时，你心里冒出的第一句话是什么？"],
      ["今天的哪个声音最有存在感？", "如果它能代表一种情绪，那会是什么？"],
      ["有哪件事本来很普通，却让你停顿了一下？", "那个停顿里有什么没说出口的想法？"],
      ["今天你在哪个时刻感觉自己回到了熟悉的轨道？", "这个轨道让你安心，还是让你厌倦？"],
      ["今天哪件小事消耗了你？", "它真正消耗的是时间、耐心，还是自尊？"],
      ["今天你对谁或什么东西多看了一眼？", "那一眼里有期待、比较、怀念，还是别的东西？"],
      ["今天结束时，你最想保留哪一帧？", "这帧画面里不要漏掉哪个不起眼的细节？"],
      ["今天有什么事情没有结果，但仍然值得记？", "它悬在那里时，你怎么和它相处？"],
      ["如果今天有一个标题，它会朴素地叫什么？", "为什么不是更漂亮、更夸张的那个标题？"],
    ],
    threads: ["天气和身体", "一句话的余波", "被忽略的小物", "路上的停顿", "睡前的判断", "晚一点才懂"],
  },
  emotion: {
    lead: ["给情绪一个落点", "先辨认那股劲", "把心里的天气说清"],
    starters: [
      "先说今天最明显的一种情绪，它第一次出现时，你正在做什么？",
      "从情绪最重的那一分钟开始，不解释原因，只描述它在身体里的位置。",
      "挑一个你没太承认的感受，用三句话把它请出来。",
      "先把今天的情绪分成表面和底层，各说一个词。",
    ],
    tags: ["起点", "身体", "防御", "愿望", "余波", "命名", "边界", "安放"],
    questions: [
      ["今天哪个情绪来得最快？", "它像是保护你，还是推动你？"],
      ["你今天有没有把某种感受压低一点？", "压低之后，它换成了什么形式出现？"],
      ["有哪个瞬间你其实很想被理解？", "如果对方真的理解了，你希望他明白哪一句？"],
      ["今天的疲惫更像身体累，还是心里不想再解释？", "这两种累分别需要什么？"],
      ["哪一个反应让你事后有点意外？", "它提醒你，你其实在乎什么？"],
      ["今天你有没有假装没关系？", "那句“没关系”下面压着什么？"],
      ["如果给今天的情绪一个形状，它是什么？", "它的边缘锋利、松散，还是沉重？"],
      ["今天有什么事让你变小，或变硬？", "你当时想保护的是什么？"],
      ["你现在最想对自己承认什么？", "承认之后，事情会变轻一点还是更真实一点？"],
      ["今天哪种情绪已经过去了，但还留下一点味道？", "那点味道像什么？"],
    ],
    threads: ["第一反应", "身体里的位置", "没说出口的句子", "保护自己的方式", "情绪的余味", "真正的需要"],
  },
  relationship: {
    lead: ["从人与人之间的空隙开始", "把一句话背后的关系说出来", "看见靠近和退后"],
    starters: [
      "先说今天和某个人之间最细微的变化，不急着判断它好坏。",
      "从一句让你停住的话开始，说说它为什么在你心里留下痕迹。",
      "选一个今天的眼神、语气或沉默，把它放大成一段关系的切片。",
      "说说今天你靠近了谁一点，又从谁那里退开了一点。",
    ],
    tags: ["靠近", "边界", "误会", "期待", "沉默", "照顾", "比较", "位置"],
    questions: [
      ["今天谁的哪句话在你心里停了一会儿？", "它真正触到的是期待、委屈，还是某种旧经验？"],
      ["你今天有没有为了维持气氛而调整自己？", "那个调整让你舒服，还是让你变得有点远？"],
      ["今天某段对话里，最重要的可能是哪句没说的话？", "如果它被说出来，关系会发生什么变化？"],
      ["你今天对谁有一点新的理解？", "这个理解让你更靠近，还是更清醒？"],
      ["有哪个瞬间你感觉自己被看见了？", "被看见的具体是哪一部分？"],
      ["今天你有没有想解释，却最后没有解释？", "你放弃解释的理由是什么？"],
      ["你今天对某个人的期待有没有移动？", "它从哪里移动到了哪里？"],
      ["哪段关系今天让你感觉轻一点？", "轻是因为信任、距离，还是没有表演？"],
      ["今天你在关系里扮演了什么角色？", "这个角色是你选的，还是习惯替你选的？"],
      ["如果把今天的一段关系写成一个房间，里面有什么？", "门是开着的、半掩的，还是锁着的？"],
    ],
    threads: ["一句话的重量", "我退后的一步", "被看见的部分", "习惯里的角色", "关系的房间", "期待的位置"],
  },
  memory: {
    lead: ["让旧记忆和今天碰一下", "从被唤起的过去开始", "把回忆写成可触摸的东西"],
    starters: [
      "先说今天哪个细节让你想起了以前，它们之间真正相似的是什么？",
      "挑一个突然冒出来的旧画面，说说它为什么偏偏在今天回来。",
      "把一段回忆缩小成一个物件、一个气味或一句话，从那里开始。",
      "说说今天的你和过去某个时刻的你，隔着时间互相看见了什么。",
    ],
    tags: ["旧物", "童年", "地点", "重复", "遗憾", "告别", "味道", "重逢"],
    questions: [
      ["今天哪个细节像一把钥匙，打开了旧记忆？", "那扇门后面最先出现的画面是什么？"],
      ["你有没有在今天重复过去的某种反应？", "这次重复和以前相比，有什么微小差别？"],
      ["有哪个旧人或旧地方突然变得清晰？", "它清晰的是画面，还是你当年的感受？"],
      ["如果今天要写给过去的自己一句话，会是哪一句？", "这句话是安慰、提醒，还是道歉？"],
      ["哪段记忆你以前总是跳过？", "今天能不能只写它的一小角？"],
      ["有个东西曾经很重要，现在已经变轻了吗？", "变轻的过程是自然发生的，还是你努力放下的？"],
      ["今天的某个场景和过去哪里重叠了？", "重叠处露出了什么你还没写过的感受？"],
      ["你记忆里的某个人，今天会怎样看你？", "你希望他看到什么，又不希望他看到什么？"],
      ["有哪个旧愿望还没有完全消失？", "它现在换成了什么样子？"],
      ["把一段回忆写成天气，它是什么天气？", "那种天气里，你站在哪里？"],
    ],
    threads: ["突然回来的画面", "旧地方的气味", "过去的反应", "写给从前的我", "没完全消失的愿望", "记忆里的天气"],
  },
  thought: {
    lead: ["把想法拆成可说的话", "从一个没想完的问题开始", "让判断慢一点成形"],
    starters: [
      "先说今天脑子里最常回来的一个念头，它在帮你整理什么？",
      "把一个没想明白的问题口述出来，先不要急着得出结论。",
      "从今天的一个小判断开始，问问它背后相信了什么。",
      "挑一个你想反驳自己的念头，给它一点完整表达的机会。",
    ],
    tags: ["判断", "信念", "矛盾", "选择", "意义", "变化", "怀疑", "答案"],
    questions: [
      ["今天你反复想起的那个问题是什么？", "它真正想问的是事实、选择，还是意义？"],
      ["你今天做了哪个小判断？", "这个判断背后藏着什么默认标准？"],
      ["有没有一个念头让你既同意又不舒服？", "不舒服的部分在提醒你什么？"],
      ["今天有什么事让你对自己有了新看法？", "这个看法更像事实，还是一时的情绪结论？"],
      ["你最近正在改变的一个想法是什么？", "它是被经验改变的，还是被失望改变的？"],
      ["今天你最想弄清楚的边界在哪里？", "越过它会发生什么，不越过又会怎样？"],
      ["有哪个答案你已经知道，却还不愿意承认？", "不承认它能暂时保护你什么？"],
      ["今天有什么小事可以说明你正在成为什么样的人？", "这个人和你想象中的自己相近吗？"],
      ["如果把今天的想法写成一个公式，它会是什么？", "公式里哪个变量最不稳定？"],
      ["你现在最值得继续追问的一句话是什么？", "它可以再往下问三层吗？"],
    ],
    threads: ["反复出现的问题", "默认标准", "同意但不舒服", "边界在哪里", "我正在成为什么", "再问三层"],
  },
};

const mixedThreads = [
  "窗外的变化",
  "一句没发出的消息",
  "今天的耐心",
  "某个旧习惯",
  "身体的提醒",
  "突然清楚的一刻",
  "我避开的答案",
  "被保留下来的温柔",
];

const wildcardQuestions = [
  ["如果今天删掉一个瞬间，哪一部分会变得不完整？", "它为什么比看起来更重要？"],
  ["今天有什么事只适合小声说？", "小声不是因为不重要，而是因为什么？"],
  ["今天哪一刻你最不像平时的自己？", "这个不像，是自由一点，还是陌生一点？"],
  ["今天有没有一个念头来得很短，却很亮？", "它像提醒、诱惑，还是一个还没长大的决定？"],
  ["如果今天有一个隐藏主题，它会是什么？", "这个主题在哪三个细节里露了面？"],
  ["今天你最想替哪件事辩护？", "你为什么觉得它容易被误解？"],
  ["今天哪个细节让你突然安静下来？", "安静里是舒服、警觉，还是累了？"],
  ["今天有什么事可以从结尾倒着讲？", "倒着讲时，开头会变成什么？"],
  ["今天你对什么东西有一点点舍不得？", "这点舍不得具体粘在哪个画面上？"],
  ["如果今天只能留下一个动词，会是哪一个？", "这个动词背后藏着怎样的你？"],
  ["今天有没有一件事让你想换一种活法，哪怕只是一秒？", "那一秒里，你看见了什么可能性？"],
  ["今天你在哪个地方没有完全说真话？", "没说完的部分是在保护谁？"],
  ["今天有没有一个瞬间让你觉得生活很荒诞？", "荒诞过后，你是笑了，还是更清醒了？"],
  ["今天哪件事最适合写成一段对话？", "对话里哪一句其实不该被省掉？"],
  ["今天你对什么东西的耐心变多了或变少了？", "这种变化从什么时候开始的？"],
];

const anglePrefixes = [
  "从一个动作切进去：",
  "只写事实，不急着解释：",
  "从身体最先知道的地方问：",
  "像给未来的自己留线索一样：",
  "换成一个旁观者的角度：",
  "从你最想跳过的地方开始：",
  "把它缩小到一分钟里：",
  "先承认那个不太好看的念头：",
  "用很朴素的话问自己：",
  "把答案放慢一点：",
];

const followUpAddons = [
  "补一个具体画面，不要只写判断。",
  "给它加上当时的光线、声音或气味。",
  "试着说出你当时没有说出口的那句话。",
  "写到这里时，停一下，问问自己有没有漏掉身体反应。",
  "把这件事和最近反复出现的一个主题连起来。",
  "如果只允许写三句话，哪三句最不能删？",
  "给这段经历找一个不漂亮但准确的标题。",
  "把它写成“我以为……但其实……”的句子。",
  "想象另一个人会怎样误读这件事。",
  "用一句收尾的话把它暂时放下。",
];

const writingMoves = [
  "先口述 3 分钟，不修改，不回头。",
  "用“我注意到……”开头，连续说 5 句。",
  "写一版很克制的，再写一版很诚实的。",
  "只用细节，不用抽象词，写满一小段。",
  "把它写成给朋友的一条长消息。",
  "先列 3 个画面，再挑最有重量的那个展开。",
  "用“其实我真正想说的是……”接下去。",
  "把这件事写成一个问题，不急着回答。",
  "用过去的你、现在的你各说一句。",
  "先写反面：这件事不是什么。",
  "给它安排一个停顿：写一句话，然后留白，再继续。",
  "把最后一句写得轻一点，像把门虚掩上。",
];

const threadBoosters = [
  "一个误会的入口",
  "今天没说完的话",
  "我在意的顺序",
  "事情的背面",
  "某个重复动作",
  "被压低的愿望",
  "一段关系的温度",
  "最小的变化",
  "一件事的余波",
  "我给自己的解释",
];

const elements = {
  todayLabel: document.querySelector("#todayLabel"),
  themeToggle: document.querySelector("#themeToggle"),
  fileModeNotice: document.querySelector("#fileModeNotice"),
  seedInput: document.querySelector("#seedInput"),
  toneSelect: document.querySelector("#toneSelect"),
  countSelect: document.querySelector("#countSelect"),
  depthRange: document.querySelector("#depthRange"),
  depthOutput: document.querySelector("#depthOutput"),
  generateButton: document.querySelector("#generateButton"),
  copyAllButton: document.querySelector("#copyAllButton"),
  clearSavedButton: document.querySelector("#clearSavedButton"),
  leadTitle: document.querySelector("#leadTitle"),
  statusText: document.querySelector("#statusText"),
  starterText: document.querySelector("#starterText"),
  copyStarterButton: document.querySelector("#copyStarterButton"),
  promptGrid: document.querySelector("#promptGrid"),
  threadList: document.querySelector("#threadList"),
  copyThreadButton: document.querySelector("#copyThreadButton"),
  exportSavedButton: document.querySelector("#exportSavedButton"),
  savedList: document.querySelector("#savedList"),
  savedCount: document.querySelector("#savedCount"),
  toast: document.querySelector("#toast"),
};

async function readSaved() {
  if (hasAndroidStorage) {
    return JSON.parse(window.AndroidStorage.readSaved() || "[]");
  }

  if (isFileMode) {
    return [];
  }

  const response = await fetch(SAVE_ENDPOINT, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to read saved prompts");
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.items || [];
}

async function persistSaved() {
  if (hasAndroidStorage) {
    const ok = window.AndroidStorage.writeSaved(JSON.stringify(state.saved));
    if (!ok) {
      throw new Error("Android storage write failed");
    }
    return;
  }

  if (isFileMode) {
    throw new Error("File mode cannot write saved prompts");
  }

  const response = await fetch(SAVE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain; charset=utf-8" },
    body: JSON.stringify(state.saved),
  });

  if (!response.ok) {
    throw new Error(`Unable to write saved prompts: ${response.status}`);
  }
}

async function loadSavedFromFile() {
  if (isFileMode) {
    state.saved = [];
    state.storageMessage = fileModeMessage;
    renderSaved();
    renderCurrent();
    return;
  }

  try {
    state.saved = await readSaved();
    state.storageMessage = "";
  } catch {
    state.saved = [];
    state.storageMessage = "未连接到本地文件服务，收藏不会写入文件。";
  }

  renderSaved();
  renderCurrent();
}

function getDirection() {
  return document.querySelector('input[name="direction"]:checked').value;
}

function getSelectedBank(direction) {
  if (direction !== "random") {
    return { key: direction, bank: banks[direction] };
  }

  const keys = Object.keys(banks);
  const key = pick(keys);
  return { key, bank: banks[key] };
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function uniqueByQuestion(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item[0])) return false;
    seen.add(item[0]);
    return true;
  });
}

function personalize(text, seed) {
  if (!seed) return text;
  const fragments = [
    `把“${seed}”放进来：${text}`,
    `${text} 这和“${seed}”有什么关系？`,
    `如果从“${seed}”开始，${text}`,
    `让“${seed}”当作入口：${text}`,
    `${text} 如果“${seed}”是线索，它指向哪里？`,
  ];
  return pick(fragments);
}

function maybeAddAngle(question, depth) {
  const threshold = depth >= 4 ? 0.72 : 0.54;
  if (Math.random() > threshold) return question;
  return `${pick(anglePrefixes)}${question}`;
}

function tuneByDepth(question, followUp, depth) {
  if (depth <= 2) {
    const gentle = [
      "先说一个小片段就好。",
      "不用总结，先把当时的样子说出来。",
      "如果说不清，就从一个物件或动作开始。",
    ];
    return [question, `${followUp.replace("真正", "大概").replace("最", "比较")} ${pick(gentle)}`];
  }

  if (depth >= 4) {
    const deeper = [
      "这背后有什么你一直没太愿意说清的东西？",
      "如果再诚实一点，你会怎样改写这件事？",
      "它和你反复出现的某个模式有关吗？",
      "这个答案会把你带向什么选择？",
    ];
    return [question, `${followUp} ${pick(deeper)} ${pick(followUpAddons)}`];
  }

  return [question, `${followUp} ${pick(followUpAddons)}`];
}

function buildWritingMove(seed) {
  const move = pick(writingMoves);
  if (!seed || Math.random() > 0.45) return move;

  const seedMoves = [
    `写的时候至少让“${seed}”出现一次，但不要解释得太满。`,
    `先围绕“${seed}”说 5 句，再删掉最空的一句。`,
    `把“${seed}”当成标题，口述一个不超过 2 分钟的小段落。`,
  ];
  return `${move} ${pick(seedMoves)}`;
}

function buildPromptSet() {
  const direction = getDirection();
  const tone = elements.toneSelect.value;
  const depth = Number(elements.depthRange.value);
  const count = Number(elements.countSelect.value);
  const seed = elements.seedInput.value.trim();
  const selected = getSelectedBank(direction);
  const bank = selected.bank;
  const directionLabel = direction === "random" ? labels[selected.key] : labels[direction];
  const leadTitle = pick(bank.lead);
  const opener = pick(toneOpeners[tone]);
  const starter = `${opener}，${personalize(pick(bank.starters), seed)}`;
  const pooledQuestions = uniqueByQuestion([
    ...bank.questions,
    ...shuffle(wildcardQuestions).slice(0, 5),
    ...shuffle(Object.values(banks).flatMap((entry) => entry.questions)).slice(0, 8),
  ]);
  const prompts = shuffle(pooledQuestions)
    .slice(0, count)
    .map(([question, followUp], index) => {
      const tuned = tuneByDepth(maybeAddAngle(personalize(question, seed), depth), followUp, depth);
      return {
        id: `${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
        tag: pick(bank.tags),
        question: tuned[0],
        followUp: tuned[1],
        spark: buildWritingMove(seed),
      };
    });

  const threads = shuffle([
    ...bank.threads,
    ...mixedThreads,
    ...threadBoosters,
    ...(seed ? [`${seed}的前后`, `${seed}和我`, `${seed}留下的声音`] : []),
  ]).slice(0, 5);

  state.current = {
    direction: directionLabel,
    leadTitle,
    starter,
    prompts,
    threads,
  };
}

function renderCurrent() {
  const current = state.current;
  elements.leadTitle.textContent = current.leadTitle;
  elements.starterText.textContent = current.starter;
  elements.statusText.textContent = `已生成 ${current.prompts.length} 条`;

  elements.promptGrid.innerHTML = current.prompts
    .map((prompt) => {
      const saved = state.saved.some((item) => item.key === prompt.question || item.question === prompt.question);
      return `
        <article class="prompt-card" data-id="${prompt.id}">
          <div class="prompt-meta">
            <span class="tag">${prompt.tag}</span>
            <span class="eyebrow">${current.direction}</span>
          </div>
          <div>
            <p class="question">${prompt.question}</p>
            <p class="follow-up">${prompt.followUp}</p>
            <p class="spark-line">写法：${prompt.spark}</p>
          </div>
          <div class="prompt-actions">
            <button class="icon-button copy-one" type="button" aria-label="复制这一条" title="复制这一条">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-1v1a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3h1V7Zm2 1h3a3 3 0 0 1 3 3v3h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v1Zm-3 2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H7Z"/></svg>
            </button>
            <button class="icon-button save-one ${saved ? "is-saved" : ""}" type="button" aria-label="收藏这一条" title="收藏这一条">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.7 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.5l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.7Zm0 4.5-1.6 3.2-3.5.5 2.5 2.5-.6 3.5 3.2-1.7 3.2 1.7-.6-3.5 2.5-2.5-3.5-.5L12 7.2Z"/></svg>
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  elements.threadList.innerHTML = current.threads.map((thread) => `<div class="thread-item">${thread}</div>`).join("");
}

function renderSaved() {
  elements.savedCount.textContent = state.saved.length;

  if (state.saved.length === 0) {
    elements.savedList.innerHTML = `<p class="empty-state">${state.storageMessage || "还没有收藏的问题。"}</p>`;
    return;
  }

  elements.savedList.innerHTML = state.saved
    .map(
      (item) => `
        <article class="saved-item" data-id="${item.id}">
          <p>${item.question}</p>
          <footer>
            <small>${item.tag}</small>
            <button class="icon-button remove-saved" type="button" aria-label="移除收藏" title="移除收藏">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1h3a1 1 0 1 1 0 2h-1v12a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V7H5a1 1 0 0 1 0-2h3Zm2 0h4V4h-4v1Zm-2 2v12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7H8Zm2.7 3a1 1 0 0 1 1 1v5a1 1 0 0 1-2 0v-5a1 1 0 0 1 1-1Zm3.6 0a1 1 0 0 1 1 1v5a1 1 0 0 1-2 0v-5a1 1 0 0 1 1-1Z"/></svg>
            </button>
          </footer>
        </article>
      `
    )
    .join("");
}

function getPromptByCard(card) {
  return state.current.prompts.find((prompt) => prompt.id === card.dataset.id);
}

function promptToText(prompt) {
  return `${prompt.question}\n${prompt.followUp}\n写法：${prompt.spark}`;
}

function currentToText() {
  return [
    state.current.leadTitle,
    state.current.starter,
    "",
    ...state.current.prompts.map((prompt, index) => `${index + 1}. ${promptToText(prompt)}`),
    "",
    `线索串：${state.current.threads.join(" / ")}`,
  ].join("\n");
}

function formatDateForFile(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function savedToMarkdown() {
  const lines = [
    "# 提问小室收藏",
    "",
    `导出时间：${new Intl.DateTimeFormat("zh-CN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date())}`,
    "",
  ];

  state.saved.forEach((item, index) => {
    lines.push(`## ${index + 1}. ${item.tag || "收藏"}`, "");
    lines.push(item.question || "");
    if (item.createdAt) {
      lines.push("", `收藏时间：${new Intl.DateTimeFormat("zh-CN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(item.createdAt))}`);
    }
    lines.push("", "---", "");
  });

  return lines.join("\n");
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportSaved() {
  if (state.saved.length === 0) {
    showToast("还没有可导出的收藏");
    return;
  }

  const filename = `提问小室收藏-${formatDateForFile()}.md`;
  const markdown = savedToMarkdown();

  if (hasAndroidStorage && typeof window.AndroidStorage.shareMarkdown === "function") {
    const ok = window.AndroidStorage.shareMarkdown(filename, markdown);
    showToast(ok ? "已打开导出面板" : "导出失败");
    return;
  }

  downloadTextFile(filename, markdown);
  showToast("已导出 Markdown");
}

async function copyText(text, message = "已复制") {
  try {
    await navigator.clipboard.writeText(text);
    showToast(message);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    showToast(message);
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.remove("show"), 1600);
}

function showFileModeHelp() {
  showToast("请双击 start-local.cmd 打开可保存版本");
}

async function savePrompt(prompt) {
  if (isFileMode) {
    showFileModeHelp();
    return;
  }

  const exists = state.saved.some((item) => item.key === prompt.question || item.question === prompt.question);
  if (exists) {
    showToast("已经收藏过");
    return;
  }

  const previous = state.saved;
  state.saved = [{
    id: prompt.id,
    key: prompt.question,
    tag: prompt.tag,
    question: promptToText(prompt),
    createdAt: new Date().toISOString(),
  }, ...state.saved].slice(0, 30);
  renderSaved();
  renderCurrent();

  try {
    await persistSaved();
    state.storageMessage = "";
    showToast("已收藏到文件");
  } catch (error) {
    console.error(error);
    state.saved = previous;
    renderSaved();
    renderCurrent();
    showToast("保存失败，文件没有写入");
  }
}

async function removeSaved(id) {
  if (isFileMode) {
    showFileModeHelp();
    return;
  }

  const previous = state.saved;
  state.saved = state.saved.filter((item) => item.id !== id);
  renderSaved();
  renderCurrent();

  try {
    await persistSaved();
    showToast("已从文件移除");
  } catch (error) {
    console.error(error);
    state.saved = previous;
    renderSaved();
    renderCurrent();
    showToast("移除失败，文件没有更新");
  }
}

function setDateLabel() {
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  elements.todayLabel.textContent = formatter.format(new Date());
}

function updateDepthLabel() {
  elements.depthOutput.textContent = depthLabels[elements.depthRange.value];
}

function setTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
}

function initEvents() {
  elements.generateButton.addEventListener("click", () => {
    buildPromptSet();
    renderCurrent();
    showToast("换好了一组");
  });

  elements.depthRange.addEventListener("input", updateDepthLabel);

  elements.copyAllButton.addEventListener("click", () => copyText(currentToText(), "已复制全部"));
  elements.copyStarterButton.addEventListener("click", () => copyText(state.current.starter, "已复制开场句"));
  elements.copyThreadButton.addEventListener("click", () => copyText(state.current.threads.join(" / "), "已复制线索串"));
  elements.exportSavedButton.addEventListener("click", exportSaved);

  elements.promptGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const card = button.closest(".prompt-card");
    const prompt = getPromptByCard(card);
    if (!prompt) return;

    if (button.classList.contains("copy-one")) {
      copyText(promptToText(prompt), "已复制这一条");
    }

    if (button.classList.contains("save-one")) {
      savePrompt(prompt);
    }
  });

  elements.savedList.addEventListener("click", (event) => {
    const button = event.target.closest(".remove-saved");
    if (!button) return;
    removeSaved(button.closest(".saved-item").dataset.id);
  });

  elements.clearSavedButton.addEventListener("click", async () => {
    if (isFileMode) {
      showFileModeHelp();
      return;
    }

    const previous = state.saved;
    state.saved = [];
    renderSaved();
    renderCurrent();

    try {
      await persistSaved();
      showToast("收藏文件已清空");
    } catch (error) {
      console.error(error);
      state.saved = previous;
      renderSaved();
      renderCurrent();
      showToast("清空失败，文件没有更新");
    }
  });

  elements.themeToggle.addEventListener("click", () => {
    setTheme(document.body.classList.contains("dark") ? "light" : "dark");
  });
}

async function init() {
  setDateLabel();
  updateDepthLabel();
  if (elements.fileModeNotice) {
    elements.fileModeNotice.hidden = !isFileMode;
  }
  setTheme("light");
  buildPromptSet();
  renderCurrent();
  renderSaved();
  initEvents();
  await loadSavedFromFile();
}

init();
