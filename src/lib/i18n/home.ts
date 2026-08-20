import type { LangCode } from "@/hooks/use-language.ts";

/**
 * Shared translations for static homepage sections and other components
 * that are not editable through the admin panel.
 */

export const heroText: Record<LangCode, {
  eyebrow: string; title: string; subtitle: string; menuBtn: string; locationsBtn: string;
}> = {
  ru: {
    eyebrow: "Настоящий праздник вкуса",
    title: "Аутентичная турецкая кухня",
    subtitle: "Настоящий праздник вкуса. Откройте для себя вековые традиции, десерты, приготовленные вручную, и легендарные турецкие блюда, созданные с любовью и уважением к традициям.",
    menuBtn: "Смотреть меню",
    locationsBtn: "Наши рестораны",
  },
  uz: {
    eyebrow: "Haqiqiy did bayrami",
    title: "Original turk oshxonasi",
    subtitle: "Haqiqiy did bayrami. Asrlar davomidagi an'analarni, qo'lda tayyorlangan shirinliklarni va sevgi bilan yaratilgan afsonaviy turk taomlarini kashf eting.",
    menuBtn: "Menyuni ko'rish",
    locationsBtn: "Restoranlarimiz",
  },
  en: {
    eyebrow: "A True Celebration of Flavor",
    title: "Authentic Turkish Cuisine",
    subtitle: "A true celebration of flavor. Discover age-old traditions, handmade desserts, and legendary Turkish dishes crafted with love and respect for tradition.",
    menuBtn: "View Menu",
    locationsBtn: "Our Restaurants",
  },
  tr: {
    eyebrow: "Gerçek Bir Lezzet Şöleni",
    title: "Otantik Türk Mutfağı",
    subtitle: "Gerçek bir lezzet şöleni. Asırlık gelenekleri, el yapımı tatlıları ve sevgiyle hazırlanan efsanevi Türk yemeklerini keşfedin.",
    menuBtn: "Menüyü Gör",
    locationsBtn: "Restoranlarımız",
  },
};

export const storyText: Record<LangCode, {
  storyLabel: string; storyTitleL1: string; storyTitleL2: string; storyText: string; storyBtn: string;
  heritageLabel: string; heritageTitleL1: string; heritageTitleL2: string; heritageText: string; heritageBtn: string;
}> = {
  ru: {
    storyLabel: "Наша история",
    storyTitleL1: "Попробуйте настоящую",
    storyTitleL2: "турецкую кухню!",
    storyText: "Откройте для себя многовековые вкусы, десерты ручной работы и культовые турецкие блюда, приготовленные с любовью и традицией. Почувствуйте неповторимый вкус MADO в каждом кусочке.",
    storyBtn: "Посмотреть меню",
    heritageLabel: "Наследие MADO",
    heritageTitleL1: "300 лет традиций.",
    heritageTitleL2: "Один мир вкуса.",
    heritageText: "MADO, обладающий более чем 300-летней историей и более чем 300 заведениями по всему миру, предлагает аутентичный вкус турецкой кухни каждому посетителю. MADO — это не просто место, где можно купить мороженое, это полноценный гастрономический опыт: от фирменных десертов и насыщенного мороженого до тортов-мороженого, профитролей с начинкой и освежающих напитков — все приготовлено с любовью и вниманием к деталям.",
    heritageBtn: "Узнать больше",
  },
  uz: {
    storyLabel: "Bizning tariximiz",
    storyTitleL1: "Haqiqiy turk oshxonasini",
    storyTitleL2: "tatib ko'ring!",
    storyText: "Asrlar davomidagi ta'mlarni, qo'lda tayyorlangan shirinliklarni va sevgi va an'ana bilan pishirilgan mashhur turk taomlarini kashf eting. Har bir bo'lakda MADOning o'ziga xos ta'mini his eting.",
    storyBtn: "Menyuni ko'rish",
    heritageLabel: "MADO merosi",
    heritageTitleL1: "300 yillik an'analar.",
    heritageTitleL2: "Bitta did olami.",
    heritageText: "300 yildan ortiq tarixga va dunyo bo'ylab 300 dan ortiq shoxobchaga ega bo'lgan MADO har bir mehmonga turk oshxonasining haqiqiy ta'mini taqdim etadi. MADO shunchaki muzqaymoq sotiladigan joy emas — bu to'liq gastronomik tajriba: maxsus shirinliklardan va boy muzqaymoqdan tortib, muzqaymoq tortlari, to'ldirilgan profitrollar va salqinlashtiruvchi ichimliklargacha — barchasi sevgi va e'tibor bilan tayyorlanadi.",
    heritageBtn: "Ko'proq bilish",
  },
  en: {
    storyLabel: "Our Story",
    storyTitleL1: "Taste the Real",
    storyTitleL2: "Turkish Cuisine!",
    storyText: "Discover centuries-old flavors, handmade desserts, and iconic Turkish dishes made with love and tradition. Feel the unique taste of MADO in every bite.",
    storyBtn: "View Menu",
    heritageLabel: "MADO Heritage",
    heritageTitleL1: "300 Years of Tradition.",
    heritageTitleL2: "One World of Flavor.",
    heritageText: "With a history spanning over 300 years and more than 300 locations worldwide, MADO offers every guest the authentic taste of Turkish cuisine. MADO is not just a place to buy ice cream — it's a full culinary experience: from signature desserts and rich ice cream to ice cream cakes, filled profiteroles, and refreshing drinks, all made with love and attention to detail.",
    heritageBtn: "Learn More",
  },
  tr: {
    storyLabel: "Hikayemiz",
    storyTitleL1: "Gerçek Türk Mutfağını",
    storyTitleL2: "Tadın!",
    storyText: "Yüzyıllık lezzetleri, el yapımı tatlıları ve sevgi ve gelenekle hazırlanan ikonik Türk yemeklerini keşfedin. MADO'nun eşsiz tadını her lokmada hissedin.",
    storyBtn: "Menüyü Gör",
    heritageLabel: "MADO Mirası",
    heritageTitleL1: "300 Yıllık Gelenek.",
    heritageTitleL2: "Bir Lezzet Dünyası.",
    heritageText: "300 yılı aşan tarihi ve dünya çapında 300'den fazla şubesiyle MADO, her misafire otantik Türk mutfağı tadını sunar. MADO sadece dondurma alınacak bir yer değil, tam bir gastronomi deneyimidir: özel tatlılardan zengin dondurmaya, dondurma pastalarından doldurulmuş profiterollere ve serinletici içeceklere kadar her şey sevgi ve titizlikle hazırlanır.",
    heritageBtn: "Daha Fazla Bilgi",
  },
};

export const highlightsText: Record<LangCode, {
  eyebrow: string; title: string; subtitle: string; viewMenuBtn: string;
  items: { title: string; description: string }[];
}> = {
  ru: {
    eyebrow: "Настоящий праздник вкуса",
    title: "Почувствуйте вкус настоящей турецкой кухни",
    subtitle: "Откройте для себя вековые традиции, десерты, приготовленные вручную, и легендарные турецкие блюда, созданные с любовью и уважением к традициям.",
    viewMenuBtn: "Смотреть полное меню",
    items: [
      { title: "Фирменное мороженое", description: "Насыщенное мороженое (dondurma), приготовленное вручную по традиционным турецким рецептам из отборных ингредиентов." },
      { title: "Десерты ручной работы", description: "От золотистой пахлавы до профитролей с начинкой — каждый десерт создан с многолетним опытом и мастерством." },
      { title: "Торты-мороженое", description: "Праздничные торты, собранные из нашего фирменного мороженого — идеальны для любого торжества." },
    ],
  },
  uz: {
    eyebrow: "Haqiqiy did bayrami",
    title: "Haqiqiy turk oshxonasi ta'mini his eting",
    subtitle: "Asrlar davomidagi an'analarni, qo'lda tayyorlangan shirinliklarni va sevgi bilan yaratilgan afsonaviy turk taomlarini kashf eting.",
    viewMenuBtn: "To'liq menyuni ko'rish",
    items: [
      { title: "Maxsus muzqaymoq", description: "Tanlangan ingredientlardan an'anaviy turk retseptlari bo'yicha qo'lda tayyorlangan boy muzqaymoq (dondurma)." },
      { title: "Qo'lda tayyorlangan shirinliklar", description: "Oltin rangli paxlavadan to to'ldirilgan profitrollargacha — har bir shirinlik ko'p yillik tajriba va mahorat bilan yaratiladi." },
      { title: "Muzqaymoq tortlari", description: "Bizning maxsus muzqaymoqdan tayyorlangan bayramona tortlar — har qanday tantana uchun mukammal." },
    ],
  },
  en: {
    eyebrow: "A True Celebration of Flavor",
    title: "Taste Authentic Turkish Cuisine",
    subtitle: "Discover age-old traditions, handmade desserts, and legendary Turkish dishes crafted with love and respect for tradition.",
    viewMenuBtn: "View Full Menu",
    items: [
      { title: "Signature Ice Cream", description: "Rich ice cream (dondurma) handmade using traditional Turkish recipes and selected ingredients." },
      { title: "Handmade Desserts", description: "From golden baklava to filled profiteroles — every dessert is crafted with years of experience and skill." },
      { title: "Ice Cream Cakes", description: "Celebration cakes made from our signature ice cream — perfect for any occasion." },
    ],
  },
  tr: {
    eyebrow: "Gerçek Bir Lezzet Şöleni",
    title: "Otantik Türk Mutfağının Tadını Çıkarın",
    subtitle: "Asırlık gelenekleri, el yapımı tatlıları ve sevgiyle hazırlanan efsanevi Türk yemeklerini keşfedin.",
    viewMenuBtn: "Tüm Menüyü Gör",
    items: [
      { title: "Özel Dondurma", description: "Seçkin malzemelerle geleneksel Türk tarifleriyle el yapımı zengin dondurma." },
      { title: "El Yapımı Tatlılar", description: "Altın rengi baklavadan doldurulmuş profiterollere — her tatlı yıllarca deneyim ve ustalıkla hazırlanır." },
      { title: "Dondurma Pastaları", description: "Özel dondurmamızdan hazırlanan kutlama pastaları — her tören için mükemmel." },
    ],
  },
};

export const statsText: Record<LangCode, { dishes: string; years: string; restaurants: string }> = {
  ru: { dishes: "Блюд в меню", years: "Лет истории", restaurants: "Ресторана в ташкенте" },
  uz: { dishes: "Menyudagi taomlar", years: "Yillik tarix", restaurants: "Toshkentdagi restoran" },
  en: { dishes: "Menu Dishes", years: "Years of History", restaurants: "Restaurants in Tashkent" },
  tr: { dishes: "Menüdeki Yemek", years: "Yıllık Tarih", restaurants: "Taşkent'te Restoran" },
};

export const reviewsPreviewText: Record<LangCode, {
  eyebrow: string; title: string; subtitle: string; allBtn: string;
}> = {
  ru: {
    eyebrow: "Что говорят гости",
    title: "Отзывы наших гостей",
    subtitle: "Мы гордимся каждым гостем — читайте, что они говорят о нас.",
    allBtn: "Все отзывы",
  },
  uz: {
    eyebrow: "Mehmonlar nima deydi",
    title: "Mehmonlarimizning sharhlari",
    subtitle: "Biz har bir mehmon bilan faxrlanamiz — ular biz haqimizda nima deyishini o'qing.",
    allBtn: "Barcha sharhlar",
  },
  en: {
    eyebrow: "What Our Guests Say",
    title: "Reviews From Our Guests",
    subtitle: "We're proud of every guest — read what they say about us.",
    allBtn: "All Reviews",
  },
  tr: {
    eyebrow: "Misafirlerimiz Ne Diyor",
    title: "Misafirlerimizin Yorumları",
    subtitle: "Her misafirimizle gurur duyuyoruz — bizim hakkımızda ne dediklerini okuyun.",
    allBtn: "Tüm Yorumlar",
  },
};

export const homeLocationsText: Record<LangCode, {
  eyebrow: string; title: string; subtitle: string; mapBtn: string;
  locations: { name: string; timings: string }[];
}> = {
  ru: {
    eyebrow: "Найдите нас",
    title: "Наши рестораны",
    subtitle: "ташкент, узбекистан",
    mapBtn: "Показать на карте",
    locations: [
      { name: "MADO Сити Молл", timings: "ежедневно (08:00 – 02:00)" },
      { name: "MADO Парк ин Молл", timings: "ежедневно (08:00 – 01:00)" },
    ],
  },
  uz: {
    eyebrow: "Bizni toping",
    title: "Restoranlarimiz",
    subtitle: "toshkent, o'zbekiston",
    mapBtn: "Xaritada ko'rsatish",
    locations: [
      { name: "MADO Siti Moll", timings: "har kuni (08:00 – 02:00)" },
      { name: "MADO Park in Moll", timings: "har kuni (08:00 – 01:00)" },
    ],
  },
  en: {
    eyebrow: "Find Us",
    title: "Our Restaurants",
    subtitle: "Tashkent, Uzbekistan",
    mapBtn: "View on Map",
    locations: [
      { name: "MADO City Mall", timings: "daily (08:00 – 02:00)" },
      { name: "MADO Park In Mall", timings: "daily (08:00 – 01:00)" },
    ],
  },
  tr: {
    eyebrow: "Bizi Bulun",
    title: "Restoranlarımız",
    subtitle: "Taşkent, Özbekistan",
    mapBtn: "Haritada Göster",
    locations: [
      { name: "MADO City Mall", timings: "her gün (08:00 – 02:00)" },
      { name: "MADO Park In Mall", timings: "her gün (08:00 – 01:00)" },
    ],
  },
};

export const footerText: Record<LangCode, {
  description: string; navTitle: string; contactTitle: string;
  nameLabel: string; namePlaceholder: string; emailLabel: string; messageLabel: string;
  sendBtn: string; toastTitle: string; toastDesc: (name: string) => string;
  quickLinks: { label: string; href: string }[];
}> = {
  ru: {
    description: "Официальный сайт MADO Ташкент, Узбекистан.",
    navTitle: "Навигация",
    contactTitle: "Связаться с нами",
    nameLabel: "Имя",
    namePlaceholder: "Иван Иванов",
    emailLabel: "Email",
    messageLabel: "Сообщение",
    sendBtn: "Отправить",
    toastTitle: "Сообщение отправлено!",
    toastDesc: (name) => `Спасибо, ${name}! Наша команда свяжется с вами в ближайшее время.`,
    quickLinks: [
      { label: "Главная", href: "/" },
      { label: "Наша история", href: "/story" },
      { label: "Меню", href: "/#menu" },
      { label: "Кейтеринг", href: "/catering" },
      { label: "Рестораны", href: "/locations" },
      { label: "Карьера", href: "/careers" },
      { label: "Контакты", href: "/contact" },
    ],
  },
  uz: {
    description: "MADO Toshkent, O'zbekistonning rasmiy sayti.",
    navTitle: "Navigatsiya",
    contactTitle: "Biz bilan bog'laning",
    nameLabel: "Ism",
    namePlaceholder: "Ism Familiya",
    emailLabel: "Email",
    messageLabel: "Xabar",
    sendBtn: "Yuborish",
    toastTitle: "Xabar yuborildi!",
    toastDesc: (name) => `Rahmat, ${name}! Jamoamiz tez orada siz bilan bog'lanadi.`,
    quickLinks: [
      { label: "Bosh sahifa", href: "/" },
      { label: "Bizning tarix", href: "/story" },
      { label: "Menyu", href: "/#menu" },
      { label: "Keytering", href: "/catering" },
      { label: "Restoranlar", href: "/locations" },
      { label: "Karyera", href: "/careers" },
      { label: "Aloqa", href: "/contact" },
    ],
  },
  en: {
    description: "Official website of MADO Tashkent, Uzbekistan.",
    navTitle: "Navigation",
    contactTitle: "Get in Touch",
    nameLabel: "Name",
    namePlaceholder: "John Smith",
    emailLabel: "Email",
    messageLabel: "Message",
    sendBtn: "Send",
    toastTitle: "Message sent!",
    toastDesc: (name) => `Thank you, ${name}! Our team will get back to you shortly.`,
    quickLinks: [
      { label: "Home", href: "/" },
      { label: "Our Story", href: "/story" },
      { label: "Menu", href: "/#menu" },
      { label: "Catering", href: "/catering" },
      { label: "Locations", href: "/locations" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  tr: {
    description: "MADO Taşkent, Özbekistan resmi web sitesi.",
    navTitle: "Gezinme",
    contactTitle: "Bize Ulaşın",
    nameLabel: "Ad",
    namePlaceholder: "Ad Soyad",
    emailLabel: "E-posta",
    messageLabel: "Mesaj",
    sendBtn: "Gönder",
    toastTitle: "Mesaj gönderildi!",
    toastDesc: (name) => `Teşekkürler, ${name}! Ekibimiz en kısa sürede sizinle iletişime geçecek.`,
    quickLinks: [
      { label: "Ana Sayfa", href: "/" },
      { label: "Hikayemiz", href: "/story" },
      { label: "Menü", href: "/#menu" },
      { label: "Catering", href: "/catering" },
      { label: "Şubelerimiz", href: "/locations" },
      { label: "Kariyer", href: "/careers" },
      { label: "İletişim", href: "/contact" },
    ],
  },
};

export const notFoundText: Record<LangCode, {
  errorLabel: string; title: string; description: string; homeBtn: string; menuBtn: string;
}> = {
  ru: {
    errorLabel: "Ошибка 404",
    title: "Страница не найдена",
    description: "К сожалению, такой страницы не существует. Возможно, она была перемещена или удалена — вернитесь на главную страницу.",
    homeBtn: "На главную",
    menuBtn: "Посмотреть меню",
  },
  uz: {
    errorLabel: "404 xatosi",
    title: "Sahifa topilmadi",
    description: "Afsuski, bunday sahifa mavjud emas. Ehtimol, u ko'chirilgan yoki o'chirilgan — bosh sahifaga qaytib boring.",
    homeBtn: "Bosh sahifaga",
    menuBtn: "Menyuni ko'rish",
  },
  en: {
    errorLabel: "404 Error",
    title: "Page Not Found",
    description: "Unfortunately, this page doesn't exist. It may have been moved or deleted — return to the home page.",
    homeBtn: "Go Home",
    menuBtn: "View Menu",
  },
  tr: {
    errorLabel: "404 Hatası",
    title: "Sayfa Bulunamadı",
    description: "Ne yazık ki bu sayfa mevcut değil. Taşınmış veya silinmiş olabilir — ana sayfaya geri dönün.",
    homeBtn: "Ana Sayfaya Dön",
    menuBtn: "Menüyü Gör",
  },
};
