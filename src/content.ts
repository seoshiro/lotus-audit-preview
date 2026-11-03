import {orbitCopy} from "./orbit.ts";
import {recentCopy} from "./recent.ts";
export const locales = ["en", "ru", "kk"] as const;
export type Locale = (typeof locales)[number];
export function validLocale(value: string | null): Locale | null {
  return locales.includes(value as Locale) ? (value as Locale) : null;
}
export const projects = [
  {id:"orbit",name:"ORBIT",category:"EDUCATIONAL TOOLS",stack:["TypeScript","Three.js","Orbital mechanics","LocalStorage"],live:"https://seoshiro.github.io/orbit-studio/",source:"https://github.com/seoshiro/orbit-studio",evidence:"https://github.com/seoshiro/orbit-studio/blob/main/docs/VERIFICATION.md",color:"#c1afff",width:1440,height:1000},
  {id:"reson",name:"RESON",category:"01 / PRODUCT DESIGN TOOLS",stack:["TypeScript","Three.js","WebGL","LocalStorage"],live:"https://seoshiro.github.io/reson-studio/",source:"https://github.com/seoshiro/reson-studio",evidence:"https://github.com/seoshiro/reson-studio/blob/main/docs/AUDITS.md",color:"#b68962",width:1440,height:1000},
  {id:"lumen",name:"LUMEN",category:"02 / INTERACTIVE PRODUCT STUDIES",stack:["TypeScript","Three.js","WebGL","Scroll choreography"],live:"https://seoshiro.github.io/lumen-lens/",source:"https://github.com/seoshiro/lumen-lens",evidence:"https://github.com/seoshiro/lumen-lens/blob/main/README.md",color:"#bdb5a3",width:1440,height:1000},
  {
    id: "perch",
    name: "PERCH",
    category: "01 / SPATIAL TOOLS",
    stack: ["React", "TypeScript", "Three.js", "SVG"],
    live: "https://seoshiro.github.io/perch-studio/",
    source: "https://github.com/seoshiro/perch-studio",
    evidence: "https://github.com/seoshiro/perch-studio/blob/main/docs/AUDITS.md",
    color: "#b9c18f",
    width: 1440,
    height: 1000,
  },
  {
    id: "forme",
    name: "FORME",
    category: "02 / VISUAL DIRECTION",
    stack: ["React", "TypeScript", "Web Workers", "IndexedDB"],
    live: "https://forme-studio-coral.vercel.app/",
    source: "https://github.com/seoshiro/forme-studio",
    evidence:
      "https://github.com/seoshiro/forme-studio/blob/main/docs/ENGINEERING.md",
    color: "#b49c82",
    width: 1440,
    height: 1000,
  },
  {
    id: "selvedge",
    name: "SELVEDGE",
    category: "03 / CREATIVE TOOLS",
    stack: ["React", "TypeScript", "Canvas", "IndexedDB"],
    live: "https://seoshiro.github.io/selvedge-studio/",
    source: "https://github.com/seoshiro/selvedge-studio",
    evidence:
      "https://github.com/seoshiro/selvedge-studio/blob/main/docs/VERIFICATION.md",
    color: "#aec2b3",
    width: 1440,
    height: 1000,
  },
  {
    id: "guidecheck",
    name: "GuideCheck",
    category: "04 / REVIEW SYSTEMS",
    stack: ["TypeScript", "IndexedDB", "SQLite", "Playwright"],
    live: "https://seoshiro.github.io/guidecheck/",
    source: "https://github.com/seoshiro/guidecheck",
    evidence: "https://github.com/seoshiro/guidecheck/blob/main/VALIDATION.md",
    color: "#a3b9cf",
    width: 1440,
    height: 1000,
  },
  {
    id: "archiveguard",
    name: "ArchiveGuard",
    category: "05 / FILE INTEGRITY",
    stack: ["TypeScript", "Web Workers", "Web Crypto", "EXIF"],
    live: "https://seoshiro.github.io/archiveguard/",
    source: "https://github.com/seoshiro/archiveguard",
    evidence:
      "https://github.com/seoshiro/archiveguard/blob/main/docs/VALIDATION.md",
    color: "#bdaccc",
    width: 1440,
    height: 1000,
  },
  {
    "id": "iter",
    "name": "ITER",
    "category": "NAVIGATION AND ACCESSIBILITY",
    "stack": [
      "React",
      "TypeScript",
      "Three.js",
      "SVG",
      "Web Speech"
    ],
    "live": "https://iter-navigator.vercel.app/",
    "source": "https://github.com/seoshiro/iter-navigator",
    "evidence": "https://github.com/seoshiro/iter-navigator/blob/main/README.md",
    "color": "#9ab8b2",
    "width": 1440,
    "height": 1000
  },
  {
    "id": "ayqyn",
    "name": "AYQYN",
    "category": "LOCAL APPLICATIONS",
    "stack": [
      "Electron",
      "JavaScript",
      "ONNX Runtime",
      "MediaPipe"
    ],
    "live": "https://seoshiro.github.io/ayqyn-local/replay/",
    "source": "https://github.com/seoshiro/ayqyn-local",
    "evidence": "https://github.com/seoshiro/ayqyn-local/blob/main/docs/LOCALIZATION_QA.md",
    "color": "#79cabc",
    "width": 1800,
    "height": 1200
  },
  {
    "id": "sidereal",
    "name": "SIDEREAL",
    "category": "MUSICAL INSTRUMENTS",
    "stack": [
      "TypeScript",
      "SVG",
      "Web Audio",
      "LocalStorage"
    ],
    "live": "https://seoshiro.github.io/sidereal/",
    "source": "https://github.com/seoshiro/sidereal",
    "evidence": "https://github.com/seoshiro/sidereal/blob/main/docs/QA.md",
    "color": "#b9c9ff",
    "width": 1920,
    "height": 1080
  },
] as const;
export type ProjectId = (typeof projects)[number]["id"];
export const dimensions: Record<
  ProjectId,
  {
    main: [number, number];
    preview: [number, number];
    detail: [number, number];
  }
> = {
  iter: {"main":[1440,1000],"preview":[1440,1000],"detail":[1440,1000]},
  ayqyn: {"main":[1800,1200],"preview":[1800,1200],"detail":[1800,1200]},
  sidereal: {"main":[1920,1080],"preview":[1920,1080],"detail":[390,844]},
  orbit: {main:[1440,1000],preview:[1440,1000],detail:[1440,1000]},
  reson: {main:[1440,1000],preview:[1440,1000],detail:[1440,1000]},
  lumen: {main:[1440,1000],preview:[1440,1000],detail:[1440,1000]},
  perch: { main: [1440, 1000], preview: [1440, 1000], detail: [980, 620] },
  forme: { main: [1366, 820], preview: [1366, 820], detail: [1366, 1518] },
  selvedge: { main: [1440, 1000], preview: [1440, 1000], detail: [850, 822] },
  guidecheck: { main: [1440, 1866], preview: [1440, 1050], detail: [390, 870] },
  archiveguard: {
    main: [1280, 2209],
    preview: [1220, 820],
    detail: [1280, 1475],
  },
};
export interface ProjectCopy {
  category: string;
  title: string;
  summary: string;
  alt: string;
  detailAlt: string;
  input: string;
  output: string;
  decisions: [string, string, string];
  limit: string;
  caption: string;
}
export interface Copy {
  title: string;
  description: string;
  skip: string;
  work: string;
  about: string;
  contact: string;
  language: string;
  motion: string;
  motionOff: string;
  motionOn: string;
  eyebrow: string;
  name: string;
  heroLine: string;
  intro: string;
  viewWork: string;
  heroFoot: string;
  selected: string;
  selectedNote: string;
  caseStudy: string;
  live: string;
  source: string;
  role: string;
  roleText: string;
  input: string;
  output: string;
  engineering: string;
  boundaries: string;
  evidence: string;
  back: string;
  next: string;
  aboutLabel: string;
  aboutTitle: string;
  aboutText: string;
  principles: [
    { title: string; text: string },
    { title: string; text: string },
    { title: string; text: string },
  ];
  contactTitle: string;
  contactText: string;
  github: string;
  footer: string;
  imageFailed: string;
  project: Record<ProjectId, ProjectCopy>;
}
export const copy: Record<Locale, Copy> = {
  en: {
    title: "Beibars Ileskhan — AI-assisted product creation",
    description:
      "Digital products by Beibars Ileskhan (seoshiro): ideas, prototypes, and browser tools created with AI assistance.",
    skip: "Skip to content",
    work: "Work",
    about: "About",
    contact: "Contact",
    language: "Language",
    motion: "Animation",
    motionOff: "Pause animation",
    motionOn: "Play animation",
    eyebrow: "AI-ASSISTED PRODUCT CREATION",
    name: "Beibars Ileskhan",
    heroLine: "Ideas take\nshape.",
    intro:
      "I turn ideas into digital products with AI. I define the task, connect tools, and refine the result.",
    viewWork: "Explore the work",
    heroFoot: "Ideas. Tools. Products.",
    selected: "Selected work",
    selectedNote: "Working tools, real interfaces, and the decisions behind them.",
    caseStudy: "Inside the project",
    live: "Live project",
    source: "Source code",
    role: "MY ROLE",
    roleText:
      "AI-assisted product creation: I define the brief, choose and connect tools, direct AI-assisted implementation, and review the visual result. The repository documents the implementation and checks.",
    input: "Starting point",
    output: "What you leave with",
    engineering: "Under the surface",
    boundaries: "Practical boundaries",
    evidence: "Read the verification notes",
    back: "All projects",
    next: "Next project",
    aboutLabel: "A BIT ABOUT MY APPROACH",
    aboutTitle: "Idea. Prototype.\nRefinement.",
    aboutText:
      "I’m Beibars, also known as seoshiro. I explore ideas, assemble prototypes with AI, and refine how they look and work. I’m learning to write code independently and understand it more deeply as I go.",
    principles: [
      {
        title: "Define the task.",
        text: "Clarify the problem, the intended result, and what a useful first version needs.",
      },
      {
        title: "Connect the tools.",
        text: "Choose tools, guide AI, and bring the pieces together in a working prototype.",
      },
      {
        title: "Review and refine.",
        text: "Compare the result with the brief, check the interaction, and improve the visual direction.",
      },
    ],
    contactTitle: "Let’s make\nsomething useful.",
    contactText: "Find my projects and start a conversation on GitHub.",
    github: "Find me on GitHub",
    footer: "Created with AI assistance. Shared with the source.",
    imageFailed:
      "Project screenshot unavailable. The case study and live project are still accessible.",
    project: {
      ...recentCopy.en,
      orbit: orbitCopy.en,
      iter: {
        "category": "Navigation and accessibility",
        "title": "One route.\nThree ways to read it.",
        "summary": "An educational navigator for a fictitious building. Passage constraints, a 3D model, an SVG plan and written steps describe the same route.",
        "alt": "ITER with passage constraints, a three-dimensional building and route steps",
        "detailAlt": "ITER route shown as a 2D plan",
        "input": "Choose a start, destination, minimum passage width and maximum slope. You can avoid stairs or simulate a lift closure. All data belongs to an educational building.",
        "output": "A route with distance, explained constraints, steps, 3D and SVG representations. Select a step from any view.",
        "decisions": [
          "The planner filters graph edges by the constraints and finds the shortest available route. Closed sections and unknown conditions are explicit.",
          "Text, SVG and Three.js share node and edge IDs. Without WebGL, the route remains available as a plan and written steps.",
          "Web Speech API reads the route on request. The educational obstacle wall sends reports through its existing public service with server validation."
        ],
        "limit": "A fictitious building and illustrative geometry. Results do not certify the accessibility of a physical space. Voices depend on the browser; the report wall depends on a separate service.",
        "caption": "A route through ITER’s educational building, with its 3D view and passage settings."
      },
      ayqyn: {
        "category": "Local applications",
        "title": "Observe with context.\nLeave decisions to people.",
        "summary": "A Windows local proctoring prototype: participant consent, camera preparation, on-device observations and a separate human review of events.",
        "alt": "AYQYN observation details and a reviewer’s decision",
        "detailAlt": "AYQYN session overview and preparation",
        "input": "Prepare a local session with participant consent and camera calibration. A test scenario and browser replay let you explore the workflow without a camera.",
        "output": "An observation timeline, reviewer decisions with reasons, and a JSON report without images.",
        "decisions": [
          "YOLO and MediaPipe process frames on the device in a separate process. Processing and snapshot consent are separate; saving snapshots is off by default.",
          "The reviewer sees duration, face count, frame quality and model confidence for phone detection. They confirm or dismiss the observation and explain their decision.",
          "JSON reports contain no images. The public browser replay shows saved detector results as diagrams without running a camera; photographs are used in the local test replay."
        ],
        "limit": "A prototype for Qostanai AI Industry Hackathon 2026, Case 3. Gaze direction is approximate; observations do not prove misconduct and require human review. This is not a certified examination environment. Browser replay does not test camera accuracy.",
        "caption": "Reviewing an observation in AYQYN v0.2.4. The test profile uses licensed photographs, not images of exam participants. Codex was used to prepare the code, interface and project materials. YOLO and MediaPipe models were used as provided; the team did not train them."
      },
      sidereal: {
        "category": "Musical instruments",
        "title": "Draw a constellation.\nHear a composition.",
        "summary": "A musical observatory in the browser. A star’s position sets its timing and pitch; an orbital cursor turns the drawing into a four-bar composition.",
        "alt": "SIDEREAL editor with a circular score, three constellations and note settings",
        "detailAlt": "SIDEREAL editor at phone width",
        "input": "Add stars to the circular score and choose their voices. Start with a preset or learn the controls in a separate practice sky.",
        "output": "Save the composition in the browser atlas, transfer it through JSON or a link, or download a PNG map or a WAV containing one playback with release tails.",
        "decisions": [
          "SVG connects the stars, list and exact note parameters. Angle is time; radius is pitch. Keyboard and numeric controls complement dragging.",
          "Web Audio synthesizes three voices. Sound starts after a user action, the audio clock drives the cursor and a hidden page pauses playback.",
          "The guide runs in a separate practice space. Local records and incoming scores are validated; save failures are visible and JSON transfer needs no server."
        ],
        "limit": "Fixed four bars and three voices. No MIDI, microphone recording or device synchronization. PNG is a constellation score, not staff notation; WAV contains one pass. Listening quality depends on the browser and device.",
        "caption": "SIDEREAL’s circular score and settings for the selected note."
      },
      perch: {
        category: "SPATIAL TOOLS",
        title: "A room.\nA few possibilities.",
        summary:
          "A local-first furniture planner with linked 2D and 3D views. Shape the room, arrange 12 parametric furniture types, and compare layouts before moving anything.",
        alt: "Actual PERCH studio showing a furnished living room in 3D beside its dimensioned 2D plan",
        detailAlt: "Actual PERCH comparison of two independently editable living-room layouts",
        input:
          "A rectangular room, its measurements and openings, and furniture you want to make space for.",
        output:
          "Editable layout alternatives, fit notes, a portable JSON project, a dimensioned SVG plan, a 3D PNG, and a printable room report.",
        decisions: [
          "One room model drives the SVG plan and procedural Three.js furniture. Numeric edits, plan dragging, and 3D selection stay in sync.",
          "Rotated footprints, room bounds, ceiling height, and inward door swings produce fit warnings. Copies remain independent; undo and redo preserve the editing history.",
          "Browser-local saves include a recovery backup. Rendering runs on demand; the plan and forms remain usable without WebGL. The whole workspace supports English, Russian, and Kazakh.",
        ],
        limit:
          "A furnishing study for rectangular rooms, not a construction or safety document. Materials and light are illustrative; fit notes do not certify walking clearance. No cloud sync or collaboration. Export JSON to move work between devices.",
        caption:
          "Actual live studio and layout comparison, using its furnished demo room.",
      },
      forme: {
        category: "VISUAL DIRECTION",
        title: "From references\nto a direction.",
        summary:
          "Collect images, compose a moodboard, and carry its colors and typography into a reusable design kit.",
        alt: "Real FORME moodboard editor with architectural references, notes and color swatches",
        detailAlt:
          "FORME design kit with semantic color roles and a typography preview",
        input:
          "A collection of images, notes, links, and an idea that hasn’t quite come together.",
        output:
          "An editable moodboard, a PNG composition, design tokens, CSS variables, and a portable .forme project.",
        decisions: [
          "One document model connects the reference library, composition editor, and design kit.",
          "IndexedDB commits before showing “Saved”; Web Locks and revision checks protect edits across tabs.",
          "Images are processed in a worker. Archive imports validate paths, sizes, CRC, schema, and image ownership.",
        ],
        limit:
          "A fixed 1400 × 1000 board and a single-browser workspace. No cloud collaboration or infinite canvas. The live interface is in Russian.",
        caption:
          "The actual editor and design kit, using the repository’s demo collection.",
      },
      selvedge: {
        category: "CREATIVE TOOLS",
        title: "One graphic.\nA whole collection.",
        summary:
          "An apparel workroom for artwork placement, colorways, revision comparison, and a clear visual handoff.",
        alt: "Real SELVEDGE workroom with an illustrated tee and artwork placement controls",
        detailAlt:
          "SELVEDGE named revision comparison using the original After Hours graphic",
        input:
          "One piece of artwork and several choices about garment color, placement, and scale.",
        output:
          "A coordinated collection, named revisions, a PNG overview, a PDF visual proof, and an editable project file.",
        decisions: [
          "Artwork placement supports both dragging and numeric controls; touch movement is deliberately opt-in.",
          "Transactional local saves and revision checks prevent another tab from silently replacing work.",
          "Canvas exports use the same project geometry as the workroom. The complete interface supports English, Russian, and Kazakh.",
        ],
        limit:
          "A visual proof, not a manufacturing specification or certified print-ready file. Confirm physical dimensions, color, and print method with a printer.",
        caption:
          "Actual workroom and revision screens with original synthetic artwork.",
      },
      guidecheck: {
        category: "REVIEW SYSTEMS",
        title: "What changed.\nWhat was checked.",
        summary:
          "Compare guide revisions and keep human review evidence attached to the exact steps it belongs to.",
        alt: "Real GuideCheck desktop workspace showing instruction revisions and review states",
        detailAlt: "GuideCheck mobile workspace with review controls",
        input:
          "An instruction guide, its next revision, and the need to distinguish a change from a verified result.",
        output:
          "A deterministic comparison, append-only review history, corrections, and portable workspace backups.",
        decisions: [
          "Stable step IDs match revisions. Changed instructions, links, screenshots, and order are explicit.",
          "Review evidence carries forward only when the step and guide context remain exactly unchanged.",
          "The browser edition uses atomic IndexedDB transactions. An optional loopback edition stores the workspace in SQLite.",
        ],
        limit:
          "Reviews are human statements, not automatic verification or independently authenticated proof. The workspace is single-device; it has no collaborative sync.",
        caption: "Repository screenshots of the real browser workspace.",
      },
      archiveguard: {
        category: "FILE INTEGRITY",
        title: "Keep the photo.\nQuestion the metadata.",
        summary:
          "Compare JPEG capture dates with Google Photos sidecars, resolve exceptions, and export verified new copies.",
        alt: "Real ArchiveGuard conflict review comparing JPEG metadata and sidecar capture dates",
        detailAlt: "ArchiveGuard verified export package and audit summary",
        input:
          "Selected JPEGs and JSON sidecars from an unpacked Google Photos export, with dates that may disagree.",
        output:
          "New JPEG copies, a manifest, and CSV/HTML audit reports recording each input and decision.",
        decisions: [
          "Uncertain matches and date conflicts require explicit decisions. Upload dates never stand in for capture dates.",
          "A worker validates bounded JPEG/EXIF structures and prepares the export without re-encoding image pixels.",
          "Independent metadata readback and non-EXIF byte hashes verify copies before a download becomes available.",
        ],
        limit:
          "JPEG sample preflight, not universal archive repair. Originals remain untouched. No ZIP input, HEIC, RAW, timezone inference, or cloud processing.",
        caption:
          "Actual conflict review and export screens using synthetic sample files.",
      },
    },
  },
  ru: {
    title: "Бейбарс Илесхан — цифровые продукты с ИИ",
    description:
      "Цифровые продукты Бейбарса Илесхана (seoshiro): идеи, прототипы и браузерные инструменты, созданные с помощью ИИ.",
    skip: "К содержимому",
    work: "Проекты",
    about: "Обо мне",
    contact: "Контакт",
    language: "Язык",
    motion: "Анимация",
    motionOff: "Остановить анимацию",
    motionOn: "Включить анимацию",
    eyebrow: "СОЗДАНИЕ ПРОДУКТОВ С ИИ",
    name: "Бейбарс Илесхан",
    heroLine: "Придаю идеям\nформу.",
    intro:
      "Превращаю идеи в цифровые продукты с помощью ИИ. Формулирую задачу, соединяю инструменты и дорабатываю результат.",
    viewWork: "Смотреть проекты",
    heroFoot: "Идеи. Инструменты. Продукты.",
    selected: "Избранные проекты",
    selectedNote: "Работающие инструменты, реальные интерфейсы и решения за ними.",
    caseStudy: "О проекте",
    live: "Открыть проект",
    source: "Исходный код",
    role: "МОЯ РОЛЬ",
    roleText:
      "Создание продукта с помощью ИИ: формулирую задачу, выбираю и соединяю инструменты, направляю реализацию с ИИ и оцениваю визуальный результат. Устройство проекта и проверки описаны в репозитории.",
    input: "С чего начинается",
    output: "Что получается",
    engineering: "Как устроено",
    boundaries: "Практические ограничения",
    evidence: "Читать результаты проверок",
    back: "Все проекты",
    next: "Следующий проект",
    aboutLabel: "О МОЁМ ПОДХОДЕ",
    aboutTitle: "Идея. Прототип.\nДоработка.",
    aboutText:
      "Я Бейбарс, в сети — seoshiro. Исследую идеи, собираю прототипы с ИИ и дорабатываю их внешний вид и поведение. Параллельно учусь самостоятельно писать код и глубже понимать, как он работает.",
    principles: [
      {
        title: "Сформулировать задачу.",
        text: "Разобраться в проблеме, ожидаемом результате и том, что нужно первой полезной версии.",
      },
      {
        title: "Соединить инструменты.",
        text: "Выбрать инструменты, направить ИИ и собрать части в работающий прототип.",
      },
      {
        title: "Проверить и доработать.",
        text: "Сопоставить результат с задачей, проверить взаимодействие и уточнить визуальное направление.",
      },
    ],
    contactTitle: "Давайте создадим\nчто-то полезное.",
    contactText: "Мои проекты и возможность связаться со мной — на GitHub.",
    github: "Найти меня на GitHub",
    footer: "Создано с помощью ИИ. С открытым кодом.",
    imageFailed:
      "Снимок проекта недоступен. Описание и ссылка на проект остаются доступны.",
    project: {
      ...recentCopy.ru,
      orbit: orbitCopy.ru,
      iter: {
        "category": "Навигация и доступность",
        "title": "Один маршрут.\nТри способа прочитать.",
        "summary": "Учебный навигатор по вымышленному зданию. Ограничения прохода, 3D-модель, схема и последовательность шагов объясняют один и тот же маршрут.",
        "alt": "ITER: условия прохода, трёхмерное здание и шаги маршрута",
        "detailAlt": "Схема маршрута ITER в 2D",
        "input": "Выберите начало и цель маршрута, минимальную ширину прохода и допустимый уклон. Можно исключить лестницы или смоделировать закрытие лифта. Все данные относятся к учебному зданию.",
        "output": "Маршрут с расстоянием, объяснением ограничений, шагами, 3D и SVG-представлением. Необходимый шаг можно выбрать в любом представлении.",
        "decisions": [
          "Планировщик фильтрует рёбра графа по условиям и ищет кратчайший доступный путь. Закрытый участок и неизвестное состояние показаны явно.",
          "Текст, SVG и Three.js используют общие идентификаторы узлов и рёбер. При отсутствии WebGL маршрут остаётся в схеме и текстовых шагах.",
          "Web Speech API озвучивает маршрут по явному запросу. Учебная стена препятствий поддерживает сообщения через существующий публичный сервис, с серверной проверкой данных."
        ],
        "limit": "Вымышленное здание и условная геометрия. Результат не подтверждает доступность реального помещения. Голоса зависят от браузера; доступность стены сообщений зависит от отдельного сервиса.",
        "caption": "Маршрут в учебном здании ITER: 3D-вид и настройки условий прохода."
      },
      ayqyn: {
        "category": "Локальные приложения",
        "title": "Наблюдение — с контекстом.\nРешение — за человеком.",
        "summary": "Windows-прототип локального прокторинга: согласие участника, подготовка камеры, наблюдения на устройстве и отдельная проверка событий человеком.",
        "alt": "AYQYN: сведения о наблюдении и решение проверяющего",
        "detailAlt": "AYQYN: обзор и подготовка сессии",
        "input": "Подготовьте локальную сессию: получите согласие участника и выполните калибровку камеры. Для знакомства без камеры есть тестовый сценарий и браузерный повтор наблюдений.",
        "output": "Хронология наблюдений, решения проверяющего с пояснениями и JSON-отчёт без изображений.",
        "decisions": [
          "YOLO и MediaPipe обрабатывают кадры на устройстве в отдельном процессе. Согласие на обработку и сохранение снимков разделены; сохранение снимков по умолчанию выключено.",
          "Проверяющий видит длительность, число лиц, качество кадра и уверенность модели при обнаружении телефона. Он подтверждает или отклоняет наблюдение и поясняет решение.",
          "JSON-отчёт не содержит изображений. Публичный браузерный replay показывает сохранённые результаты детектора в виде схем и не запускает камеру; фотографии используются в локальном тестовом повторе."
        ],
        "limit": "Прототип для Qostanai AI Industry Hackathon 2026, кейс №3. Направление взгляда определяется приблизительно; наблюдения не доказывают нарушение и требуют проверки человеком. Это не сертифицированная экзаменационная среда. Браузерный повтор не проверяет точность работы камеры.",
        "caption": "Проверка наблюдения в AYQYN v0.2.4. Использован тестовый профиль с лицензированными фотографиями, а не снимками участников экзамена. В подготовке кода, интерфейса и материалов использовался Codex. Модели YOLO и MediaPipe взяты готовыми; команда их не обучала."
      },
      sidereal: {
        "category": "Музыкальные инструменты",
        "title": "Нарисовать созвездие.\nУслышать композицию.",
        "summary": "Музыкальная обсерватория в браузере. Положение звезды задаёт время и высоту ноты, а орбитальный курсор собирает рисунок в четырёхтактовую композицию.",
        "alt": "Редактор SIDEREAL: круговая партитура, три созвездия и настройки нот",
        "detailAlt": "Редактор SIDEREAL на экране телефона",
        "input": "Добавьте звёзды на круговую партитуру и выберите для них тембр. Можно начать с готового рисунка или освоить редактор в отдельном учебном небе.",
        "output": "Композицию можно сохранить в атласе браузера, перенести через JSON или ссылку, скачать как PNG-карту или WAV с одним проигрыванием и затуханием звука.",
        "decisions": [
          "SVG связывает звёзды, список и точные параметры нот. Угол — время, радиус — высота; клавиатура и числовые настройки дополняют перетаскивание.",
          "Web Audio синтезирует три голоса. Звук запускается только по действию пользователя, аудиочасы управляют курсором, скрытая вкладка приостанавливает воспроизведение.",
          "Обучение проходит в отдельном пространстве. Локальные записи и входящие партитуры проверяются; ошибки сохранения видны, перенос через JSON не требует сервера."
        ],
        "limit": "Фиксированные четыре такта и три голоса. Нет MIDI, записи микрофона и синхронизации устройств. PNG — карта композиции, а не нотный стан; WAV содержит один проход. Качество звучания зависит от браузера и устройства.",
        "caption": "Круговая партитура SIDEREAL и панель настройки выбранной ноты."
      },
      perch: {
        category: "ПРОСТРАНСТВЕННЫЕ ИНСТРУМЕНТЫ",
        title: "Одна комната.\nНесколько вариантов.",
        summary:
          "Локальный планировщик мебели с общими 2D- и 3D-видами. Задайте комнату, расставьте 12 параметрических типов мебели и сравните варианты до перестановки.",
        alt: "Настоящая студия PERCH: меблированная гостиная в 3D рядом с её 2D-планом и размерами",
        detailAlt: "Настоящее сравнение двух независимых вариантов расстановки гостиной в PERCH",
        input:
          "Прямоугольная комната, её размеры и проёмы, а также мебель, для которой нужно найти место.",
        output:
          "Редактируемые варианты расстановки, замечания о размещении, JSON-проект, SVG-план с размерами, PNG из 3D-вида и отчёт для печати.",
        decisions: [
          "Единая модель комнаты управляет SVG-планом и процедурной мебелью Three.js. Числовые правки, перетаскивание на плане и выбор в 3D синхронизированы.",
          "Поворот мебели, границы комнаты, высота потолка и открывание дверей внутрь учитываются в предупреждениях. Копии независимы; изменения можно отменять и повторять.",
          "Локальное сохранение в браузере включает резервную копию. Сцена рисуется по запросу; план и формы работают без WebGL. Весь интерфейс доступен на английском, русском и казахском.",
        ],
        limit:
          "Эскиз расстановки для прямоугольных комнат, а не строительный документ или оценка безопасности. Материалы и свет условны; замечания не подтверждают нормы проходов. Облачной синхронизации и совместной работы нет. Для переноса на другое устройство экспортируйте JSON.",
        caption:
          "Реальная студия и сравнение расстановок на примере её демонстрационной комнаты.",
      },
      forme: {
        category: "ВИЗУАЛЬНОЕ НАПРАВЛЕНИЕ",
        title: "От референсов\nк направлению.",
        summary:
          "Собрать изображения, составить мудборд и перенести его цвета и типографику в дизайн-набор.",
        alt: "Редактор FORME с архитектурными референсами, заметками и цветами",
        detailAlt: "Дизайн-набор FORME с ролями цветов и типографикой",
        input:
          "Изображения, заметки, ссылки и идея, которая ещё не сложилась в целое.",
        output:
          "Редактируемый мудборд, PNG-композиция, дизайн-токены, CSS-переменные и переносимый проект .forme.",
        decisions: [
          "Единая модель документа связывает библиотеку референсов, редактор и дизайн-набор.",
          "Надпись «Сохранено» появляется после транзакции IndexedDB. Web Locks и проверка ревизий защищают изменения между вкладками.",
          "Изображения обрабатываются в worker. Импорт архива проверяет пути, размеры, CRC, схему и принадлежность изображений.",
        ],
        limit:
          "Холст 1400 × 1000 и работа в одном браузере. Нет совместного облачного редактирования или бесконечного холста. Интерфейс проекта на русском.",
        caption:
          "Реальные редактор и дизайн-набор с демонстрационной коллекцией из репозитория.",
      },
      selvedge: {
        category: "ИНСТРУМЕНТЫ ДЛЯ ТВОРЧЕСТВА",
        title: "Одна графика.\nЦелая коллекция.",
        summary:
          "Рабочая среда для размещения графики на одежде, подбора цветов, сравнения версий и визуального согласования.",
        alt: "SELVEDGE с иллюстрацией футболки и настройками размещения графики",
        detailAlt:
          "Сравнение сохранённых версий SELVEDGE с авторской графикой After Hours",
        input:
          "Графика и решения о цвете изделия, размещении и масштабе принта.",
        output:
          "Согласованная коллекция, именованные версии, PNG-обзор, PDF-макет и редактируемый файл проекта.",
        decisions: [
          "Размещение поддерживает перетаскивание и числовые поля. На сенсорном экране перемещение включается отдельно.",
          "Локальные транзакции и проверка ревизий защищают работу от перезаписи другой вкладкой.",
          "Canvas-экспорт использует геометрию проекта. Весь интерфейс доступен на английском, русском и казахском.",
        ],
        limit:
          "Визуальный макет, не производственная спецификация и не сертифицированный печатный файл. Размеры, цвет и способ печати нужно подтвердить с типографией.",
        caption:
          "Реальные экраны рабочей среды и версий с оригинальной демонстрационной графикой.",
      },
      guidecheck: {
        category: "СИСТЕМЫ ПРОВЕРКИ",
        title: "Что изменилось.\nЧто проверили.",
        summary:
          "Сравнение версий инструкций и история ручных проверок, привязанная к конкретным шагам.",
        alt: "GuideCheck на компьютере: версии инструкций и статусы ручной проверки",
        detailAlt: "Мобильный GuideCheck с элементами ручной проверки",
        input:
          "Инструкция, её новая версия и необходимость отличить изменение от проверенного результата.",
        output:
          "Детерминированное сравнение, неизменяемая история проверок, исправления и переносимые резервные копии.",
        decisions: [
          "Постоянные ID связывают шаги между версиями. Изменения текста, ссылок, скриншотов и порядка видны явно.",
          "Результат проверки переносится, только если шаг и контекст инструкции полностью совпадают.",
          "Браузерная версия использует атомарные транзакции IndexedDB. Необязательная локальная версия хранит данные в SQLite.",
        ],
        limit:
          "Проверки — заявления человека, а не автоматическая верификация или независимое подтверждение личности. Нет совместной синхронизации.",
        caption: "Скриншоты настоящей браузерной рабочей среды из репозитория.",
      },
      archiveguard: {
        category: "ЦЕЛОСТНОСТЬ ФАЙЛОВ",
        title: "Сохранить фото.\nПроверить даты.",
        summary:
          "Сравнение дат JPEG с JSON из Google Photos, явное разрешение конфликтов и экспорт проверенных копий.",
        alt: "ArchiveGuard сравнивает метаданные JPEG и даты из JSON",
        detailAlt: "Проверенный пакет экспорта ArchiveGuard и сводка",
        input:
          "Выбранные JPEG и JSON из распакованного экспорта Google Photos с возможными расхождениями дат.",
        output:
          "Новые копии JPEG, манифест и отчёты CSV/HTML с каждым входным файлом и решением.",
        decisions: [
          "Неоднозначные совпадения и конфликты требуют явного решения. Дата загрузки не подменяет дату съёмки.",
          "Worker проверяет ограниченные структуры JPEG/EXIF и готовит экспорт без повторного кодирования пикселей.",
          "Независимое чтение метаданных и хеши байтов вне EXIF проверяют копии до появления скачивания.",
        ],
        limit:
          "Проверка выборки JPEG, не универсальное восстановление архива. Оригиналы не меняются. Нет ZIP-входа, HEIC, RAW, определения часового пояса или облачной обработки.",
        caption:
          "Реальные экраны конфликтов и экспорта с синтетическими файлами.",
      },
    },
  },
  kk: {
    title: "Бейбарыс Ілесхан — ЖИ көмегімен цифрлық өнімдер",
    description:
      "Бейбарыс Ілесханның (seoshiro) цифрлық өнімдері: ЖИ көмегімен жасалған идеялар, прототиптер және браузер құралдары.",
    skip: "Мазмұнға өту",
    work: "Жобалар",
    about: "Өзім туралы",
    contact: "Байланыс",
    language: "Тіл",
    motion: "Анимация",
    motionOff: "Анимацияны тоқтату",
    motionOn: "Анимацияны қосу",
    eyebrow: "ЖИ КӨМЕГІМЕН ӨНІМ ЖАСАУ",
    name: "Бейбарыс Ілесхан",
    heroLine: "Идеяға пішін\nберемін.",
    intro:
      "ЖИ көмегімен идеяларды цифрлық өнімге айналдырамын. Міндетті анықтап, құралдарды біріктіріп, нәтижені жетілдіремін.",
    viewWork: "Жобаларды көру",
    heroFoot: "Идеялар. Құралдар. Өнімдер.",
    selected: "Таңдаулы жобалар",
    selectedNote: "Жұмыс істейтін құралдар, нақты интерфейстер және олардың шешімдері.",
    caseStudy: "Жоба туралы",
    live: "Жобаны ашу",
    source: "Бастапқы код",
    role: "МЕНІҢ РӨЛІМ",
    roleText:
      "ЖИ көмегімен өнім жасау: міндетті анықтаймын, құралдарды таңдап біріктіремін, ЖИ көмегімен іске асыруды бағыттап, визуалды нәтижені бағалаймын. Жоба құрылымы мен тексерулер репозиторийде сипатталған.",
    input: "Бастапқы нүкте",
    output: "Нәтижесінде",
    engineering: "Ішкі құрылымы",
    boundaries: "Практикалық шектеулер",
    evidence: "Тексеру жазбаларын оқу",
    back: "Барлық жобалар",
    next: "Келесі жоба",
    aboutLabel: "МЕНІҢ ТӘСІЛІМ ТУРАЛЫ",
    aboutTitle: "Идея. Прототип.\nЖетілдіру.",
    aboutText:
      "Мен Бейбарыспын, желіде — seoshiro. Идеяларды зерттеп, ЖИ көмегімен прототиптер жасап, олардың көрінісі мен жұмысын жетілдіремін. Сонымен бірге кодты өз бетімше жазуды және оны тереңірек түсінуді үйреніп жүрмін.",
    principles: [
      {
        title: "Міндетті анықтау.",
        text: "Мәселені, күтілетін нәтижені және алғашқы пайдалы нұсқаға не қажет екенін түсіну.",
      },
      {
        title: "Құралдарды біріктіру.",
        text: "Құралдарды таңдап, ЖИ жұмысын бағыттау және бөліктерді жұмыс істейтін прототипке біріктіру.",
      },
      {
        title: "Тексеру және жетілдіру.",
        text: "Нәтижені міндетпен салыстырып, өзара әрекеттесуді тексеру және визуалды бағытты нақтылау.",
      },
    ],
    contactTitle: "Пайдалы дүние\nжасайық.",
    contactText: "Жобаларымды GitHub-та көріп, сол жерден хабарласа аласыз.",
    github: "GitHub-та табу",
    footer: "ЖИ көмегімен жасалған. Коды ашық.",
    imageFailed:
      "Жоба суреті қолжетімсіз. Сипаттама мен жоба сілтемесі қолжетімді.",
    project: {
      ...recentCopy.kk,
      orbit: orbitCopy.kk,
      iter: {
        "category": "Навигация және қолжетімділік",
        "title": "Бір бағыт.\nҮш түрлі көрініс.",
        "summary": "Ойдан шығарылған ғимаратқа арналған оқу навигаторы. Өту шарттары, 3D модель, SVG сызбасы және мәтіндік қадамдар бір бағытты түсіндіреді.",
        "alt": "ITER: өту шарттары, үш өлшемді ғимарат және бағыт қадамдары",
        "detailAlt": "ITER бағытының 2D сызбасы",
        "input": "Басталу нүктесін, баратын жерді, өткелдің ең аз енін және ең үлкен еңісін таңдаңыз. Баспалдақсыз бағыт іздеуге немесе лифт жабылған жағдайды модельдеуге болады. Барлық дерек оқу ғимаратына жатады.",
        "output": "Қашықтығы мен шарттары түсіндірілген бағыт, қадамдар, 3D және SVG көріністері. Қадамды кез келген көріністен таңдауға болады.",
        "decisions": [
          "Жоспарлаушы граф қырларын шарттар бойынша сүзеді және қолжетімді ең қысқа жолды табады. Жабық бөліктер мен белгісіз жағдайлар айқын көрсетіледі.",
          "Мәтін, SVG және Three.js ортақ түйіндер мен қырлардың ID-лерін қолданады. WebGL болмаса, бағыт сызба мен мәтіндік қадамдарда сақталады.",
          "Web Speech API пайдаланушы сұрағанда бағытты оқиды. Оқу кедергілер қабырғасы хабарламаларды деректерді серверде тексеретін қолданыстағы қызмет арқылы жібереді."
        ],
        "limit": "Ойдан шығарылған ғимарат пен шартты геометрия. Нәтиже нақты бөлменің қолжетімділігін растамайды. Дауыстар браузерге, хабарлама қабырғасы бөлек қызметке байланысты.",
        "caption": "ITER оқу ғимаратындағы бағыт: 3D көрініс және өту шарттарының параметрлері."
      },
      ayqyn: {
        "category": "Жергілікті қолданбалар",
        "title": "Бақылау — контекстпен.\nШешім — адамнан.",
        "summary": "Windows-тағы жергілікті прокторинг прототипі: қатысушы келісімі, камераны дайындау, құрылғыдағы бақылаулар және оқиғаларды адамның бөлек тексеруі.",
        "alt": "AYQYN: бақылау мәліметтері және тексерушінің шешімі",
        "detailAlt": "AYQYN: сессияны шолу және дайындау",
        "input": "Жергілікті сессияны дайындаңыз: қатысушының келісімін алып, камераны калибрлеңіз. Камерасыз танысу үшін тест сценарийі мен браузердегі қайталау бар.",
        "output": "Бақылаулар хронологиясы, тексерушінің түсіндірмесі бар шешімдері және суреттерсіз JSON есебі.",
        "decisions": [
          "YOLO мен MediaPipe кадрларды құрылғыда бөлек процесте өңдейді. Өңдеуге және суреттерді сақтауға келісім бөлек беріледі; суреттерді сақтау әдепкіде өшірулі.",
          "Тексеруші ұзақтықты, беттер санын, кадр сапасын және телефонды анықтау кезіндегі модель сенімділігін көреді. Ол бақылауды растайды немесе қабылдамайды және шешімін түсіндіреді.",
          "JSON есебінде суреттер жоқ. Ашық браузерлік қайталау детектордың сақталған нәтижелерін сызба түрінде көрсетеді және камераны қоспайды; фотолар жергілікті тест қайталауында қолданылады."
        ],
        "limit": "Qostanai AI Industry Hackathon 2026 хакатонының №3 кейсіне арналған прототип. Көзқарас бағыты шамамен анықталады; бақылаулар бұзушылықты дәлелдемейді және адам тексеруін қажет етеді. Бұл сертификатталған емтихан ортасы емес. Браузердегі қайталау камераның дәлдігін тексермейді.",
        "caption": "AYQYN v0.2.4 жүйесінде бақылауды тексеру. Тест профилінде емтихан қатысушыларының суреттері емес, лицензияланған фотолар қолданылған. Кодты, интерфейсті және жоба материалдарын дайындауда Codex қолданылды. YOLO мен MediaPipe модельдері дайын күйінде алынды; команда оларды оқытқан жоқ."
      },
      sidereal: {
        "category": "Музыкалық құралдар",
        "title": "Шоқжұлдыз сал.\nӘуенін тыңда.",
        "summary": "Браузердегі музыкалық обсерватория. Жұлдыздың орны нотаның уақыты мен биіктігін анықтайды, ал орбиталық көрсеткіш суретті төрт тактілік композицияға айналдырады.",
        "alt": "SIDEREAL редакторы: дөңгелек партитура, үш шоқжұлдыз және нота параметрлері",
        "detailAlt": "Телефон экранындағы SIDEREAL редакторы",
        "input": "Дөңгелек партитураға жұлдыздар қосып, олардың тембрін таңдаңыз. Дайын үлгіден бастауға немесе бөлек оқу кеңістігінде жаттығуға болады.",
        "output": "Композицияны браузер атласына сақтауға, JSON не сілтеме арқылы тасымалдауға, PNG картасы немесе бір рет ойнатылып, дыбысы бәсеңдейтін WAV ретінде жүктеп алуға болады.",
        "decisions": [
          "SVG жұлдыздарды, тізімді және нақты параметрлерді байланыстырады. Бұрыш — уақыт, радиус — дыбыс биіктігі. Сүйреуге пернетақта мен сандық басқару балама болады.",
          "Web Audio үш дауысты синтездейді. Дыбыс тек пайдаланушы әрекетінен кейін басталады, көрсеткіш аудио сағатымен жүреді, жасырын бет ойнатуды тоқтатады.",
          "Оқу нұсқаулығы жеке кеңістікте өтеді. Жергілікті жазбалар мен кіріс партитуралар тексеріледі; сақтау қатесі көрінеді, JSON тасымалына сервер қажет емес."
        ],
        "limit": "Төрт такт пен үш дауыс. MIDI, микрофон жазбасы және құрылғылар арасындағы синхрондау жоқ. PNG — композиция картасы, нота дәптері емес; WAV бір айналымды қамтиды. Дыбыс браузер мен құрылғыға байланысты.",
        "caption": "SIDEREAL дөңгелек партитурасы және таңдалған нотаның параметрлері."
      },
      perch: {
        category: "КЕҢІСТІК ҚҰРАЛДАРЫ",
        title: "Бір бөлме.\nБірнеше мүмкіндік.",
        summary:
          "2D және 3D көріністері байланысқан жергілікті жиһаз жоспарлаушысы. Бөлмені баптап, 12 параметрлік жиһаз түрін орналастырыңыз және жылжытпас бұрын нұсқаларды салыстырыңыз.",
        alt: "Нақты PERCH студиясы: жиһаздалған қонақ бөлменің 3D көрінісі және өлшемдері бар 2D жоспары",
        detailAlt: "PERCH ішіндегі қонақ бөлменің екі тәуелсіз орналасу нұсқасын нақты салыстыру",
        input:
          "Тікбұрышты бөлме, оның өлшемдері мен есік-терезелері және орналастырғыңыз келетін жиһаз.",
        output:
          "Өңделетін орналасу нұсқалары, сыйымдылық ескертулері, JSON жобасы, өлшемдері бар SVG жоспар, 3D PNG және басып шығаруға арналған бөлме есебі.",
        decisions: [
          "Бір бөлме моделі SVG жоспар мен процедуралық Three.js жиһазын басқарады. Сандық өңдеу, жоспарда сүйреу және 3D таңдау өзара синхрондалады.",
          "Жиһаздың бұрылуы, бөлме шекарасы, төбе биіктігі және ішке ашылатын есіктер ескертулерде ескеріледі. Көшірмелер тәуелсіз; өзгерістерді болдырмауға және қайталауға болады.",
          "Браузердегі жергілікті сақтау қалпына келтіру көшірмесін қамтиды. Сахна қажет кезде салынады; жоспар мен өрістер WebGL болмаса да жұмыс істейді. Толық интерфейс ағылшын, орыс және қазақ тілдерінде қолжетімді.",
        ],
        limit:
          "Тікбұрышты бөлмені жиһаздау нобайы, құрылыс немесе қауіпсіздік құжаты емес. Материалдар мен жарық шартты; ескертулер өту жолдарының талаптарға сай екенін растамайды. Бұлттық синхрондау және бірлескен жұмыс жоқ. Басқа құрылғыға көшу үшін JSON экспорттаңыз.",
        caption:
          "Нақты студия мен орналасу нұсқаларын салыстыру; жиһаздалған демо бөлме қолданылды.",
      },
      forme: {
        category: "ВИЗУАЛДЫ БАҒЫТ",
        title: "Референстерден\nнақты бағытқа.",
        summary:
          "Суреттерді жинау, мудборд құрастыру және оның түстері мен қаріптерін дизайн жинағына айналдыру.",
        alt: "Сәулет референстері, жазбалар және түстер бар FORME редакторы",
        detailAlt: "Түс рөлдері мен қаріп үлгісі бар FORME дизайн жинағы",
        input:
          "Суреттер, жазбалар, сілтемелер және әлі біртұтас болмаған идея.",
        output:
          "Өңделетін мудборд, PNG композициясы, дизайн токендері, CSS айнымалылары және .forme жобасы.",
        decisions: [
          "Бір құжат моделі референс кітапханасын, редакторды және дизайн жинағын байланыстырады.",
          "«Сақталды» жазуы IndexedDB транзакциясынан кейін шығады. Web Locks пен нұсқа тексеруі қойындылардағы өзгерістерді қорғайды.",
          "Суреттер worker-де өңделеді. Архив импорты жолдарды, өлшемдерді, CRC, схеманы және суреттердің тиесілігін тексереді.",
        ],
        limit:
          "1400 × 1000 кенебі және бір браузердегі жұмыс. Бұлттағы бірлескен өңдеу мен шексіз кенеп жоқ. Жоба интерфейсі орыс тілінде.",
        caption:
          "Репозиторийдегі демо жинақпен көрсетілген нақты редактор мен дизайн жинағы.",
      },
      selvedge: {
        category: "ШЫҒАРМАШЫЛЫҚ ҚҰРАЛДАР",
        title: "Бір графика.\nТұтас коллекция.",
        summary:
          "Киімге графика орналастыру, түстер таңдау, нұсқаларды салыстыру және көрнекі келісу ортасы.",
        alt: "Футболка иллюстрациясы мен графика баптаулары бар SELVEDGE ортасы",
        detailAlt:
          "After Hours авторлық графикасымен SELVEDGE нұсқаларын салыстыру",
        input:
          "Графика және киім түсі, принт орны мен масштабы туралы шешімдер.",
        output:
          "Үйлесімді коллекция, атаулы нұсқалар, PNG шолуы, PDF макеті және өңделетін жоба файлы.",
        decisions: [
          "Орналастыру сүйреуді де, сандық өрістерді де қолдайды. Сенсорлық экранда жылжыту бөлек қосылады.",
          "Жергілікті транзакциялар мен нұсқа тексеруі басқа қойындының жұмысты қайта жазуына жол бермейді.",
          "Canvas экспорты жоба геометриясын қолданады. Интерфейс ағылшын, орыс және қазақ тілдерінде толық қолжетімді.",
        ],
        limit:
          "Бұл — көрнекі макет, өндірістік спецификация немесе сертификатталған баспа файлы емес. Өлшемдерді, түсті және баспа тәсілін баспаханамен нақтылау керек.",
        caption:
          "Түпнұсқа демо графикасы бар нақты жұмыс және нұсқа экрандары.",
      },
      guidecheck: {
        category: "ТЕКСЕРУ ЖҮЙЕЛЕРІ",
        title: "Не өзгерді.\nНе тексерілді.",
        summary:
          "Нұсқаулық нұсқаларын салыстыру және адамның тексеру нәтижесін тиісті қадаммен байланыстыру.",
        alt: "GuideCheck жұмыс ортасында нұсқаулық нұсқалары мен тексеру күйлері",
        detailAlt: "Тексеру басқаруы бар мобильді GuideCheck",
        input:
          "Нұсқаулық, оның жаңа нұсқасы және өзгерісті тексерілген нәтижеден ажырату қажеттілігі.",
        output:
          "Детерминдік салыстыру, тексерулер тарихы, түзетулер және тасымалданатын сақтық көшірмелер.",
        decisions: [
          "Тұрақты қадам ID-лері нұсқаларды байланыстырады. Мәтін, сілтеме, сурет және рет өзгерістері анық көрсетіледі.",
          "Тексеру нәтижесі қадам мен нұсқаулық контексті толық өзгеріссіз қалғанда ғана көшіріледі.",
          "Браузер нұсқасы атомарлық IndexedDB транзакцияларын қолданады. Қосымша жергілікті нұсқа деректерді SQLite-та сақтайды.",
        ],
        limit:
          "Тексерулер — адамның мәлімдемелері, автоматты верификация немесе тәуелсіз расталған дәлел емес. Бірлескен синхрондау жоқ.",
        caption: "Репозиторийдегі нақты браузер жұмыс ортасының суреттері.",
      },
      archiveguard: {
        category: "ФАЙЛ ТҰТАСТЫҒЫ",
        title: "Фотоны сақтау.\nДатаны тексеру.",
        summary:
          "JPEG түсірілім даталарын Google Photos JSON деректерімен салыстыру, қайшылықтарды шешу және тексерілген көшірмелерді экспорттау.",
        alt: "ArchiveGuard JPEG метадеректері мен JSON даталарын салыстырады",
        detailAlt: "ArchiveGuard тексерілген экспорт пакеті мен есебі",
        input:
          "Google Photos экспортынан алынған, даталары сәйкес келмеуі мүмкін JPEG және JSON файлдары.",
        output:
          "Жаңа JPEG көшірмелері, манифест және әр файл мен шешім жазылған CSV/HTML есептері.",
        decisions: [
          "Күмәнді сәйкестіктер мен дата қайшылықтары нақты шешімді талап етеді. Жүктеу датасы түсірілім датасын алмастырмайды.",
          "Worker шектелген JPEG/EXIF құрылымдарын тексеріп, пиксельдерді қайта кодтамай экспорт дайындайды.",
          "Метадеректерді тәуелсіз қайта оқу және EXIF-тен тыс байт хештері көшірмелерді жүктеуге дейін тексереді.",
        ],
        limit:
          "JPEG үлгісін тексеру құралы, бүкіл архивті қалпына келтіру жүйесі емес. Түпнұсқалар өзгермейді. ZIP кірісі, HEIC, RAW, уақыт белдеуін болжау және бұлт өңдеуі жоқ.",
        caption:
          "Синтетикалық файлдармен көрсетілген нақты қайшылық және экспорт экрандары.",
      },
    },
  },
};
export function projectById(id: string) {
  return projects.find((p) => p.id === id);
}
export function pageHref(
  id: ProjectId | null,
  locale: Locale,
  nested: boolean,
) {
  const base = id
    ? `${nested ? "" : "projects/"}${id}.html`
    : `${nested ? "../" : ""}index.html`;
  return `${base}?lang=${locale}`;
}
