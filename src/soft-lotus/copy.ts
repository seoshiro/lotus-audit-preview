import type { Locale } from '../content.ts';

export const sceneCopy = {
  ru: {
    prototype: 'Рабочий макет интерфейса · финальная модель ещё не подключена',
    headline: 'Идеям — пространство.', hint: 'Выбери лепесток', close: 'Вернуться к цветку',
    all: 'Все проекты', scene: 'Навигация по лепесткам', loading: 'Подготавливаем сцену…',
    fallback: 'Доступна лёгкая навигация. Все проекты можно открыть обычными ссылками.',
    read: 'Открыть кейс', return: 'Назад к лепестку', preview: 'Исследовать',
    about: 'Обо мне', contact: 'Контакт', ready: 'Можно исследовать',
    contactText: 'Проекты, исходники и текущая работа — в моём GitHub.',
    skip: 'Перейти к проектам', motion: 'Уменьшить движение', direct: 'Отдельная страница кейса',
  },
  en: {
    prototype: 'Interface prototype · the final model is not connected yet',
    headline: 'Room for ideas.', hint: 'Choose a petal', close: 'Return to the flower',
    all: 'All projects', scene: 'Petal navigation', loading: 'Preparing the scene…',
    fallback: 'Lightweight navigation is available. Every project has an ordinary link.',
    read: 'Read the case', return: 'Back to the petal', preview: 'Explore',
    about: 'About', contact: 'Contact', ready: 'Ready to explore',
    contactText: 'Projects, source code and current work live on my GitHub.',
    skip: 'Skip to projects', motion: 'Reduce motion', direct: 'Standalone case page',
  },
  kk: {
    prototype: 'Интерфейс макеті · соңғы модель әлі қосылмаған',
    headline: 'Идеяларға кеңістік.', hint: 'Күлтені таңдаңыз', close: 'Гүлге оралу',
    all: 'Барлық жобалар', scene: 'Күлтелер арқылы навигация', loading: 'Сахна дайындалуда…',
    fallback: 'Жеңіл навигация қолжетімді. Барлық жобаны қарапайым сілтемемен ашуға болады.',
    read: 'Жобаны оқу', return: 'Күлтеге оралу', preview: 'Зерттеу',
    about: 'Өзім туралы', contact: 'Байланыс', ready: 'Зерттеуге дайын',
    contactText: 'Жобалар, бастапқы код және қазіргі жұмысым — GitHub парақшамда.',
    skip: 'Жобаларға өту', motion: 'Қозғалысты азайту', direct: 'Жобаның жеке беті',
  },
} satisfies Record<Locale, Record<string, string>>;
