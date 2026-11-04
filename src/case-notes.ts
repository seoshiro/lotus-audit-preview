import type { Locale, ProjectId } from './content.ts';

export const projectLabels: Record<Locale, Record<ProjectId, string>> = {
  ru: { orbit: 'Орбитальная учебная студия', reson: 'Конфигуратор акустики', lumen: 'Интерактивная история объектива', perch: 'Планировщик комнаты', forme: 'Мудборды и дизайн-наборы', selvedge: 'Студия принтов', guidecheck: 'Проверки по руководствам', archiveguard: 'Контроль целостности файлов', iter: 'Учебная навигация по зданию', ayqyn: 'Локальный прототип прокторинга', sidereal: 'Музыкальные созвездия' },
  en: { orbit: 'Orbital learning studio', reson: 'Speaker configurator', lumen: 'Interactive lens story', perch: 'Room planner', forme: 'Moodboards & design kits', selvedge: 'Print workroom', guidecheck: 'Guideline review workspace', archiveguard: 'File integrity checks', iter: 'Educational building navigator', ayqyn: 'Local proctoring prototype', sidereal: 'Musical constellations' },
  kk: { orbit: 'Орбиталарды үйрену студиясы', reson: 'Акустика конфигураторы', lumen: 'Объективтің интерактивті тарихы', perch: 'Бөлме жоспарлаушысы', forme: 'Мудбордтар мен дизайн жинақтары', selvedge: 'Принт студиясы', guidecheck: 'Нұсқаулық бойынша тексеру', archiveguard: 'Файл тұтастығын тексеру', iter: 'Ғимараттың оқу навигаторы', ayqyn: 'Жергілікті прокторинг прототипі', sidereal: 'Музыкалық шоқжұлдыздар' },
};

// Product choices and corrections are grounded in the linked repository notes.
// They describe the delivered work, not unrecorded interviews or manual authorship of code.
export const caseLabels = {
  ru: { problem: 'Для кого и зачем', choices: 'Решения в продукте', fix: 'Что изменилось после проверки', scenario: 'Попробовать за один проход', share: 'Скопировать ссылку', copied: 'Ссылка скопирована', copyFailed: 'Ссылка на кейс', demo: 'Открыть демо' },
  en: { problem: 'Who it helps', choices: 'Product decisions', fix: 'A documented correction', scenario: 'Try a complete workflow', share: 'Copy case link', copied: 'Link copied', copyFailed: 'Case link', demo: 'Open demo' },
  kk: { problem: 'Кімге және не үшін', choices: 'Өнімдегі шешімдер', fix: 'Тексеруден кейінгі түзету', scenario: 'Толық сценарийді байқап көріңіз', share: 'Сілтемені көшіру', copied: 'Сілтеме көшірілді', copyFailed: 'Кейс сілтемесі', demo: 'Демоны ашу' },
};
type Note = { role: string; problem: string; choices: string[]; fix: string; scenario: string };
export const caseNotes: Record<Locale, Partial<Record<ProjectId, Note>>> = {
  ru: {
    perch: {
      problem: 'Для человека, который хочет сравнить расстановки своей комнаты до перестановки мебели. Отправная точка — реальные размеры, а не красивый рендер без масштаба.',
      role: 'Моя роль — постановка задачи, направление AI-assisted реализации и оценка результата. В PERCH фокус работы — связать план, объём и сравнение вариантов в понятный сценарий. Код и автоматизированные проверки подготовлены с ИИ; их результаты и ограничения сохранены в репозитории.',
      choices: ['Перетаскивание в плане, осмотр в 3D. Разделение действий устраняет конфликт между перемещением мебели и вращением камеры; числовые поля дают точную альтернативу мыши.', 'Одна модель комнаты для двух представлений. Изменение ширины дивана сразу меняет план и объём — не нужно поддерживать две независимые версии расстановки.', 'Локальное сохранение и переносимый JSON. Можно начать без аккаунта и сравнить независимые копии комнаты. Цена решения — отсутствие облачной синхронизации; резервную копию нужно экспортировать.'],
      fix: 'В релизном аудите обнаружили, что очистка React-эффекта преждевременно отменяла перетаскивание в плане. Исправление дополнили проверками завершённого и отменённого жеста, повторных числовых изменений и undo/redo. Это зафиксированная правка реализации, а не результат пользовательского исследования.',
      scenario: 'Откройте готовую комнату → измените её размеры → передвиньте диван в плане → создайте копию и сравните две расстановки → сохраните JSON или размерный SVG.',
    },
    selvedge: {
      problem: 'Для небольшой марки или автора мерча: разместить один рисунок на футболках разных цветов и подготовить понятное визуальное согласование с печатником.',
      role: 'Моя роль — задать рабочий сценарий и визуальное направление, вести реализацию с ИИ и оценивать результат. В SELVEDGE главное — согласованность коллекции, история вариантов и ясная передача макета. Реализация и проверки выполнены с ИИ и документированы отдельно.',
      choices: ['Иллюстрация изделия и размеры принта вместо обещания фотореалистичного 3D. Это делает размещение понятным; физический размер и цвет всё равно согласуются с печатником.', 'Общее размещение для коллекции с возможностью правки отдельного цвета. Можно сравнивать варианты, не повторяя одну операцию шесть раз.', 'Именованные ревизии и переносимый проект вместо одного финального PNG. Вариант можно восстановить и продолжить редактировать; PNG и PDF служат визуальными пробами.'],
      fix: 'Корректные JPEG/WebP могли не пройти лимит после преобразования в PNG и получали неверное сообщение «2 MB». Добавлены адаптивное уменьшение и предварительный просмотр с итоговыми размерами и DPI. Отмена сохраняет текущий проект; регрессии проверяют прозрачность и реальные экспорты.',
      scenario: 'Загрузите PNG → задайте ширину и положение → примените к цветовым вариантам → сохраните ревизию → сравните с другой → скачайте визуальную пробу и JSON.',
    },
    forme: {
      problem: 'Для автора, который собирает визуальное направление: перейти от разрозненных референсов к редактируемой композиции, палитре и типографике.',
      role: 'Моя роль — направление продукта и визуальной подачи, постановка задач ИИ и оценка результата. В FORME фокус — связать сбор материалов с композицией и дизайн-набором. Код и проверки подготовлены с ИИ; демо-коллекции не являются клиентскими работами.',
      choices: ['Библиотека, доска и дизайн-набор используют один документ. Цвет из референса получает роль в интерфейсе и попадает в экспорт, а не остаётся отдельной картинкой.', 'Фиксированная доска 1400 × 1000 вместо бесконечного холста. Композиция имеет предсказуемый итоговый формат; произвольные размеры и вращение объектов пока вне рамок.', 'Локальные оригиналы и архив .forme вместо обязательного аккаунта. Проект можно восстановить в другом браузере; совместной облачной работы нет.'],
      fix: 'Репозиторий фиксирует проверку узкого окна 683 × 384: маленькие образцы палитры оказались неудобными целями. Список слоёв предоставляет более крупные эквивалентные элементы выбора. Это ограниченная проверка интерфейса, не доказательство доступности на всех устройствах.',
      scenario: 'Откройте «Тихую архитектуру» → переместите референс и измените заметку → назначьте акцент в дизайн-наборе → экспортируйте PNG и .forme → восстановите архив в чистом браузере.',
    },
  },
  en: {
    perch: {
      problem: 'For someone comparing layouts before moving their furniture. Real room measurements are the starting point, rather than an image without scale.',
      role: 'I define the brief, direct AI-assisted implementation and review the result. For PERCH, the focus is a coherent path through the plan, 3D view and layout comparison. Code and automated checks were prepared with AI; the repository records their results and limits.',
      choices: ['Move furniture in the plan; inspect it in 3D. Separating these actions avoids a conflict with camera orbit. Numeric fields provide a precise alternative to dragging.', 'One room model drives both views. Resizing a sofa changes its plan and volume together, without maintaining separate versions of the layout.', 'Local saves and portable JSON let you start without an account and compare independent room copies. The tradeoff is no cloud sync; export a backup to move devices.'],
      fix: 'The release audit found React effect cleanup cancelling plan drags too early. The correction was checked with completed and cancelled gestures, repeated numeric moves, and undo/redo. This is a documented implementation correction, not a user-research finding.',
      scenario: 'Open a furnished room → change its dimensions → move the sofa in the plan → duplicate and compare two layouts → export JSON or a dimensioned SVG.',
    },
    selvedge: {
      problem: 'For small apparel brands and merch designers: arrange one graphic across tee colorways and prepare a clear visual conversation with a printer.',
      role: 'I shape the workflow and visual direction, guide implementation with AI and review the result. SELVEDGE focuses on a consistent collection, named revisions and a clear handoff. AI-assisted implementation and verification are documented separately.',
      choices: ['An illustrated garment and print measurements keep placement legible without promising photorealistic 3D. Physical size and color still need printer confirmation.', 'Shared placement across the collection with per-colorway edits avoids repeating the same action six times while keeping individual variants editable.', 'Named revisions and a portable project preserve an editable direction, instead of keeping only a final PNG. PNG and PDF are visual proofs.'],
      fix: 'Valid JPEG/WebP uploads could exceed the stored PNG limit and receive an inaccurate “2 MB” error. Adaptive resizing now offers a review with final dimensions and DPI. Cancellation preserves the current project; regressions check transparency and actual exports.',
      scenario: 'Upload a PNG → set its width and position → apply it across colorways → save a revision → compare another direction → download a proof and JSON.',
    },
    forme: {
      problem: 'For a creator developing a visual direction: turn scattered references into an editable composition, palette and typography.',
      role: 'I direct the product and visual presentation, set tasks for AI and review the result. FORME connects collecting references with composition and a design kit. Code and checks were prepared with AI; demo collections are not client work.',
      choices: ['The library, board and design kit share one document. A reference color receives a semantic role and travels into the export instead of remaining a separate image.', 'A fixed 1400 × 1000 board gives the composition a predictable output format. Arbitrary sizes, rotation and an infinite canvas remain outside the current scope.', 'Local original images and .forme archives avoid a required account and let you restore a project in another browser. There is no cloud collaboration.'],
      fix: 'The repository records a 683 × 384 check that found small palette targets. The Layers list provides larger equivalent selection controls. This is a bounded interface check, not evidence of accessibility on every device.',
      scenario: 'Open the “Quiet Architecture” demo → move a reference and edit a note → assign an accent in the kit → export PNG and .forme → restore the archive in a clean browser.',
    },
  },
  kk: {
    perch: {
      problem: 'Жиһазды жылжытпай тұрып бөлме нұсқаларын салыстырғысы келетін адамға арналған. Бастапқы негіз — масштабсыз сурет емес, бөлменің нақты өлшемдері.',
      role: 'Мен міндетті анықтаймын, ИИ көмегімен іске асыруды бағыттаймын және нәтижені бағалаймын. PERCH жобасында жоспар, 3D көрініс және нұсқаларды салыстыру бір сценарийге біріктірілді. Код пен автоматты тексерулер ИИ көмегімен дайындалды; нәтижелері мен шектеулері репозиторийде сақталған.',
      choices: ['Жиһаз жоспарда жылжытылады, 3D көріністе қаралады. Бұл камераны бұрумен қайшылықты болдырмайды; сандық өрістер дәл басқаруға мүмкіндік береді.', 'Екі көрініс бір бөлме моделін пайдаланады. Диванның енін өзгерткенде жоспар мен көлем бірге жаңарады.', 'Жергілікті сақтау және JSON тасымалы аккаунтсыз бастауға, тәуелсіз нұсқаларды салыстыруға мүмкіндік береді. Бұлттық синхрондау жоқ; басқа құрылғыға өту үшін көшірмені экспорттау керек.'],
      fix: 'Релиз аудитінде React эффектісін тазарту жоспарда сүйреуді ерте тоқтататыны анықталды. Түзету аяқталған және тоқтатылған қимылдармен, сандық өзгерістермен және undo/redo арқылы тексерілді. Бұл пайдаланушы зерттеуі емес, құжатталған техникалық түзету.',
      scenario: 'Дайын бөлмені ашыңыз → өлшемдерін өзгертіңіз → диванды жоспарда жылжытыңыз → көшірме жасап, екі нұсқаны салыстырыңыз → JSON немесе өлшемді SVG экспорттаңыз.',
    },
    selvedge: {
      problem: 'Шағын киім маркасына немесе мерч авторына: бір суретті түрлі түсті футболкаларға орналастырып, баспаханамен келісуге түсінікті үлгі дайындау.',
      role: 'Мен жұмыс сценарийі мен визуалды бағытты анықтап, ИИ көмегімен іске асыруды бағыттаймын және нәтижені бағалаймын. SELVEDGE жобасында коллекцияның бірізділігі, нұсқалар тарихы және макетті анық жеткізу маңызды. Іске асыру мен тексерулер ИИ көмегімен жасалып, құжатталған.',
      choices: ['Фотореалистік 3D орнына киім иллюстрациясы мен принт өлшемдері берілген. Орналастыру түсінікті, бірақ физикалық өлшем мен түс баспаханада расталуы керек.', 'Коллекцияға ортақ орналастыру және әр түсті бөлек өңдеу бір әрекетті алты рет қайталауды азайтады.', 'Атаулы нұсқалар мен тасымалданатын жоба өңдеуді жалғастыруға мүмкіндік береді. PNG және PDF — визуалды үлгілер.'],
      fix: 'Жарамды JPEG/WebP файлы PNG-ге айналғанда шектен асып, қате «2 MB» хабарын алатын. Енді қосымша кішірейту алдында соңғы өлшемдер мен DPI көрсетіледі. Бас тарту ағымдағы жобаны сақтайды; тексерулер мөлдірлік пен экспорттарды қамтиды.',
      scenario: 'PNG жүктеңіз → ені мен орнын орнатыңыз → түстерге қолданыңыз → нұсқаны сақтаңыз → басқа нұсқамен салыстырыңыз → үлгі мен JSON жүктеп алыңыз.',
    },
    forme: {
      problem: 'Визуалды бағыт жинайтын авторға: жеке референстерден өңделетін композицияға, палитра мен типографикаға өту.',
      role: 'Мен өнім мен визуалды ұсыну бағытын анықтаймын, ИИ-ге тапсырма беремін және нәтижені бағалаймын. FORME материал жинауды композиция және дизайн жинағымен байланыстырады. Код пен тексерулер ИИ көмегімен дайындалды; демо-жинақтар клиенттік жұмыс емес.',
      choices: ['Кітапхана, тақта және дизайн жинағы бір құжатты пайдаланады. Референс түсі нақты рөл алып, экспортқа өтеді.', '1400 × 1000 бекітілген тақта нәтижені алдын ала анықтайды. Еркін өлшем, айналдыру және шексіз кенеп әзірге жоқ.', 'Жергілікті түпнұсқалар мен .forme архиві аккаунтсыз жұмыс істеуге және жобаны басқа браузерде ашуға мүмкіндік береді. Бұлттық бірлескен жұмыс жоқ.'],
      fix: 'Репозиторийдегі 683 × 384 тексеруі палитра нысандарының кішкентай екенін анықтаған. Қабаттар тізімі үлкенірек балама басқаруды ұсынады. Бұл барлық құрылғыда қолжетімділікті дәлелдемейтін шектеулі тексеру.',
      scenario: '«Тихая архитектура» демосын ашыңыз → референсті жылжытып, жазбаны өңдеңіз → акцент тағайындаңыз → PNG және .forme экспорттаңыз → архивті таза браузерде қалпына келтіріңіз.',
    },
  },
};
