import type { LangCode } from "@/hooks/use-language.ts";

export const cateringPageText: Record<LangCode, {
  heroTitle: string; heroSub: string;
  introTitle: string; introText: string;
  howItWorksTitle: string;
  occasionsTitle: string;
  occasions: { title: string; text: string }[];
  faqTitle: string; faqSub: string;
  quoteTitle: string; quoteSub: string;
}> = {
  ru: {
    heroTitle: "Кейтеринг с аутентичными турецкими вкусами",
    heroSub: "От душевных встреч до грандиозных торжеств — MADO приносит богатство турецкой кухни на ваше особое мероприятие.",
    introTitle: "Незабываемые вкусы для каждого случая",
    introText: "Кейтеринг MADO объединяет вековые традиции турецкой кухни с современной подачей и сервисом. Мы создаём незабываемые кулинарные впечатления для любого мероприятия в Ташкенте — от небольших встреч до масштабных праздников, уделяя внимание каждой детали.",
    howItWorksTitle: "Как это работает?",
    occasionsTitle: "Кейтеринг для разных мероприятий",
    occasions: [
      { title: "Корпоративные мероприятия", text: "Профессиональный кейтеринг для встреч, конференций и корпоративных праздников с изысканными вкусами и элегантной подачей." },
      { title: "Частные торжества", text: "Идеально для дней рождения, юбилеев и семейных встреч — аутентичные блюда и тёплая, гостеприимная атмосфера." },
      { title: "Особые случаи", text: "От свадеб до эксклюзивных празднований — MADO создаёт незабываемые кулинарные впечатления для вашего события." },
      { title: "Десертные и мороженое станции", text: "Фирменная дондурма MADO и сладости, поданные свежими и красиво оформленными для ваших гостей." },
    ],
    faqTitle: "Нужно больше деталей?",
    faqSub: "Свяжитесь с нашей командой, чтобы получить персональную консультацию по кейтерингу.",
    quoteTitle: "Свяжитесь с MADO Catering",
    quoteSub: "Мы верим, что каждое мероприятие заслуживает исключительной еды и безупречного сервиса. Поделитесь деталями вашего мероприятия, и наша команда поможет создать кейтеринг, который идеально соответствует вашему случаю, предпочтениям и бюджету.",
  },
  uz: {
    heroTitle: "Original turk ta'mlari bilan keytering",
    heroSub: "Samimiy uchrashuvlardan katta bayramlarga qadar — MADO turk oshxonasining boyligini sizning maxsus tadbiringizga olib keladi.",
    introTitle: "Har bir tadbir uchun unutilmas ta'mlar",
    introText: "MADO keyteringi turk oshxonasining asrlik an'analarini zamonaviy taqdimot va xizmat bilan birlashtiradi. Biz Toshkentdagi har qanday tadbir uchun — kichik uchrashuvlardan katta bayramlarga qadar — har bir tafsilotga e'tibor berib, unutilmas gastronomik taassurotlar yaratamiz.",
    howItWorksTitle: "Bu qanday ishlaydi?",
    occasionsTitle: "Turli tadbirlar uchun keytering",
    occasions: [
      { title: "Korporativ tadbirlar", text: "Uchrashuvlar, konferensiyalar va korporativ bayramlar uchun nafis ta'mlar va nafis taqdimot bilan professional keytering." },
      { title: "Shaxsiy tantanalar", text: "Tug'ilgan kunlar, yubileylar va oilaviy uchrashuvlar uchun ideal — original taomlar va issiq, mehmondo'st muhit." },
      { title: "Maxsus tadbirlar", text: "To'ylardan tortib eksklyuziv bayramlargacha — MADO sizning tadbiringiz uchun unutilmas gastronomik taassurotlar yaratadi." },
      { title: "Shirinlik va muzqaymoq stansiyalari", text: "MADOning maxsus dondurmasi va shirinliklari mehmonlaringiz uchun yangi va chiroyli tarzda taqdim etiladi." },
    ],
    faqTitle: "Ko'proq tafsilot kerakmi?",
    faqSub: "Keytering bo'yicha shaxsiy maslahat olish uchun jamoamiz bilan bog'laning.",
    quoteTitle: "MADO Catering bilan bog'laning",
    quoteSub: "Biz har bir tadbir ajoyib taom va benuqson xizmatga loyiq deb hisoblaymiz. Tadbiringiz haqida tafsilotlarni bering, jamoamiz sizning holatingiz, afzalliklaringiz va byudjetingizga mos keytering yaratishga yordam beradi.",
  },
  en: {
    heroTitle: "Catering with Authentic Turkish Flavors",
    heroSub: "From intimate gatherings to grand celebrations — MADO brings the richness of Turkish cuisine to your special event.",
    introTitle: "Unforgettable Flavors for Every Occasion",
    introText: "MADO Catering combines the age-old traditions of Turkish cuisine with modern presentation and service. We create unforgettable culinary experiences for any event in Tashkent — from small gatherings to large celebrations — with attention to every detail.",
    howItWorksTitle: "How It Works",
    occasionsTitle: "Catering for Every Event",
    occasions: [
      { title: "Corporate Events", text: "Professional catering for meetings, conferences, and corporate celebrations with refined flavors and elegant presentation." },
      { title: "Private Celebrations", text: "Perfect for birthdays, anniversaries, and family gatherings — authentic dishes and a warm, welcoming atmosphere." },
      { title: "Special Occasions", text: "From weddings to exclusive celebrations — MADO creates unforgettable culinary experiences for your event." },
      { title: "Dessert & Ice Cream Stations", text: "MADO's signature dondurma and sweets, served fresh and beautifully presented for your guests." },
    ],
    faqTitle: "Need More Details?",
    faqSub: "Contact our team for a personal catering consultation.",
    quoteTitle: "Get in Touch with MADO Catering",
    quoteSub: "We believe every event deserves exceptional food and flawless service. Share the details of your event, and our team will help create a catering package tailored to your occasion, preferences, and budget.",
  },
  tr: {
    heroTitle: "Otantik Türk Lezzetleriyle Catering",
    heroSub: "Samimi buluşmalardan büyük kutlamalara — MADO, Türk mutfağının zenginliğini özel etkinliğinize taşıyor.",
    introTitle: "Her Anlam İçin Unutulmaz Lezzetler",
    introText: "MADO Catering, Türk mutfağının asırlık geleneklerini modern sunum ve servisle birleştirir. Taşkent'teki her etkinlik için — küçük buluşmalardan büyük kutlamalara kadar — her ayrıntıya dikkat ederek unutulmaz gastronomi deneyimleri yaratıyoruz.",
    howItWorksTitle: "Nasıl Çalışır?",
    occasionsTitle: "Her Etkinlik İçin Catering",
    occasions: [
      { title: "Kurumsal Etkinlikler", text: "Toplantılar, konferanslar ve kurumsal kutlamalar için zarif lezzetler ve şık sunumla profesyonel catering." },
      { title: "Özel Kutlamalar", text: "Doğum günleri, yıldönümleri ve aile buluşmaları için ideal — otantik yemekler ve sıcak, davetkâr bir atmosfer." },
      { title: "Özel Günler", text: "Düğünlerden özel kutlamalara — MADO etkinliğiniz için unutulmaz gastronomi deneyimleri yaratır." },
      { title: "Tatlı ve Dondurma İstasyonları", text: "MADO'nun özel dondurması ve tatlıları, misafirleriniz için taze ve güzelce sunulur." },
    ],
    faqTitle: "Daha Fazla Bilgiye mi Gerek Var?",
    faqSub: "Kişisel catering danışmanlığı için ekibimizle iletişime geçin.",
    quoteTitle: "MADO Catering ile İletişime Geçin",
    quoteSub: "Her etkinliğin olağanüstü yemek ve kusursuz servis hak ettiğine inanıyoruz. Etkinliğinizin ayrıntılarını paylaşın, ekibimiz durumunuza, tercihlerinize ve bütçenize uygun bir catering paketi oluşturmanıza yardımcı olsun.",
  },
};

export const howItWorksText: Record<LangCode, {
  steps: { step: string; title: string; text: string }[];
}> = {
  ru: {
    steps: [
      { step: "Шаг 1", title: "Расскажите нам о своём мероприятии", text: "Каждое торжество начинается с идеи. Поделитесь своим видением, и мы подготовим план кейтеринга, который воплотит его в жизнь." },
      { step: "Шаг 2", title: "Меню, созданное для вас", text: "Наши шеф-повара составят индивидуальное меню из блюд MADO, учитывая тематику мероприятия, количество гостей и ваши предпочтения." },
      { step: "Шаг 3", title: "Готовится нашей командой", text: "Каждое блюдо готовится вручную нашей опытной командой с использованием традиционных рецептов и свежих ингредиентов." },
      { step: "Шаг 4", title: "Мы берём всё на себя", text: "От доставки и сервировки до обслуживания гостей — наша команда позаботится обо всех деталях, чтобы вы могли расслабиться и наслаждаться праздником." },
    ],
  },
  uz: {
    steps: [
      { step: "1-qadam", title: "Tadbiringiz haqida gapirib bering", text: "Har bir tantana g'oyadan boshlanadi. Fikringizni bizga ayting, biz uni amalga oshiradigan keytering rejasini tayyorlaymiz." },
      { step: "2-qadam", title: "Siz uchun yaratilgan menyu", text: "Oshpazlarimiz tadbir mavzusi, mehmonlar sonini va afzalliklaringizni hisobga olib, MADO taomlaridan shaxsiy menyu tuzadi." },
      { step: "3-qadam", title: "Jamoamiz tomonidan tayyorlanadi", text: "Har bir taom tajribali jamoamiz tomonidan an'anaviy retseptlar va yangi ingredientlar bilan qo'lda tayyorlanadi." },
      { step: "4-qadam", title: "Hammasini o'z zimmamizga olamiz", text: "Yetkazib berish va servisdan tortib mehmonlarga xizmat qilishgacha — jamoamiz barcha tafsilotlarni hal qiladi, siz esa dam olib bayramdan bahramand bo'lasiz." },
    ],
  },
  en: {
    steps: [
      { step: "Step 1", title: "Tell Us About Your Event", text: "Every celebration starts with an idea. Share your vision, and we'll prepare a catering plan to bring it to life." },
      { step: "Step 2", title: "A Menu Made for You", text: "Our chefs create a custom menu from MADO's dishes, tailored to your event's theme, guest count, and preferences." },
      { step: "Step 3", title: "Prepared by Our Team", text: "Every dish is handmade by our experienced team using traditional recipes and fresh ingredients." },
      { step: "Step 4", title: "We Handle Everything", text: "From delivery and setup to serving your guests — our team takes care of every detail so you can relax and enjoy the celebration." },
    ],
  },
  tr: {
    steps: [
      { step: "Adım 1", title: "Etkinliğinizden Bahsedin", text: "Her kutlama bir fikirle başlar. Vizyonunuzu bizimle paylaşın, onu hayata geçirecek bir catering planı hazırlayalım." },
      { step: "Adım 2", title: "Sizin İçin Hazırlanan Menü", text: "Şeflerimiz, etkinliğinizin temasına, misafir sayısına ve tercihlerinize göre MADO yemeklerinden özel bir menü hazırlar." },
      { step: "Adım 3", title: "Ekibimiz Tarafından Hazırlanır", text: "Her yemek, deneyimli ekibimiz tarafından geleneksel tarifler ve taze malzemelerle elde hazırlanır." },
      { step: "Adım 4", title: "Her Şeyi Biz Hallediyoruz", text: "Teslimattan servise, misafirlerinize hizmet etmeye kadar — ekibimiz her ayrıntıyla ilgilenir, siz rahatlayıp kutlamanın tadını çıkarın." },
    ],
  },
};

export const faqAccordionText: Record<LangCode, {
  faqs: { question: string; answer: string }[];
}> = {
  ru: {
    faqs: [
      { question: "Какие типы мероприятий вы обслуживаете?", answer: "Мы обслуживаем самые разные мероприятия: от корпоративных встреч и офисных обедов до частных праздников, помолвок и масштабных торжеств. Будь то интимный ужин или крупное событие, наша команда готова создать незабываемый опыт." },
      { question: "Можете ли вы учесть особые пищевые предпочтения?", answer: "Да, мы предлагаем варианты меню с учётом вегетарианских, безглютеновых и других диетических предпочтений. Сообщите нам о ваших требованиях при оформлении заявки, и мы подготовим подходящее меню." },
      { question: "Предоставляете ли вы еду и напитки?", answer: "Мы предлагаем полный спектр кейтеринговых услуг, включая еду и напитки. От фирменных турецких блюд до десертов и мороженого MADO — мы позаботимся обо всём." },
      { question: "Есть ли минимальное количество гостей?", answer: "Минимальное количество гостей зависит от типа мероприятия и выбранного меню. Свяжитесь с нашей командой, чтобы обсудить детали вашего события и получить точную информацию." },
      { question: "Предоставляете ли вы сервировку и уборку?", answer: "Да, наша команда берёт на себя сервировку столов и уборку после мероприятия, чтобы вы могли полностью сосредоточиться на своих гостях." },
      { question: "Можно ли настроить меню под моё мероприятие?", answer: "Конечно! Мы с радостью подберём меню в соответствии с тематикой вашего мероприятия, предпочтениями гостей и бюджетом." },
    ],
  },
  uz: {
    faqs: [
      { question: "Qanday tadbirlarga xizmat ko'rsatasiz?", answer: "Biz korporativ uchrashuvlar va ofis tushliklaridan tortib shaxsiy bayramlar, unashtirishlar va katta tantanalarga qadar turli tadbirlarga xizmat ko'rsatamiz. Samimiy kechki ovqat bo'lsin yoki katta tadbir bo'lsin, jamoamiz unutilmas tajriba yaratishga tayyor." },
      { question: "Maxsus ovqatlanish afzalliklarini hisobga olasizmi?", answer: "Ha, biz vegetarian, glyutensiz va boshqa parhez afzalliklarini hisobga olgan menyu variantlarini taklif qilamiz. Ariza berishda talablaringizni bizga ayting, biz mos menyu tayyorlaymiz." },
      { question: "Ovqat va ichimlik taqdim etasizmi?", answer: "Biz ovqat va ichimliklarni o'z ichiga olgan to'liq keytering xizmatlarini taklif qilamiz. Maxsus turk taomlaridan MADO shirinliklari va muzqaymoqgacha — biz hammasiga g'amxo'rlik qilamiz." },
      { question: "Minimal mehmon soni bormi?", answer: "Minimal mehmon soni tadbir turi va tanlangan menyuga bog'liq. Tadbiringiz tafsilotlarini muhokama qilish va aniq ma'lumot olish uchun jamoamiz bilan bog'laning." },
      { question: "Stol tuzash va tozalashni taqdim etasizmi?", answer: "Ha, jamoamiz stollarni tuzash va tadbirdan keyin tozalashni o'z zimmasiga oladi, shunda siz to'liq mehmonlaringizga e'tibor qaratishingiz mumkin." },
      { question: "Menyuni tadbirimga moslashtirish mumkinmi?", answer: "Albatta! Biz sizning tadbiringiz mavzusi, mehmonlarning afzalliklari va byudjetingizga mos menyu tanlashdan mamnun bo'lamiz." },
    ],
  },
  en: {
    faqs: [
      { question: "What types of events do you cater?", answer: "We cater a wide range of events, from corporate meetings and office lunches to private celebrations, engagements, and large-scale festivities. Whether it's an intimate dinner or a major event, our team is ready to create an unforgettable experience." },
      { question: "Can you accommodate special dietary preferences?", answer: "Yes, we offer menu options for vegetarian, gluten-free, and other dietary preferences. Let us know your requirements when submitting your request, and we'll prepare a suitable menu." },
      { question: "Do you provide food and beverages?", answer: "We offer a full range of catering services, including food and beverages. From signature Turkish dishes to MADO desserts and ice cream — we take care of everything." },
      { question: "Is there a minimum guest count?", answer: "The minimum guest count depends on the type of event and the menu you choose. Contact our team to discuss your event details and get accurate information." },
      { question: "Do you provide table setup and cleanup?", answer: "Yes, our team handles table setup and cleanup after the event, so you can focus entirely on your guests." },
      { question: "Can the menu be customized for my event?", answer: "Absolutely! We're happy to tailor the menu to your event's theme, guest preferences, and budget." },
    ],
  },
  tr: {
    faqs: [
      { question: "Hangi tür etkinliklere hizmet veriyorsunuz?", answer: "Kurumsal toplantılardan ve ofis öğle yemeklerinden özel kutlamalara, nişanlara ve büyük çaplı etkinliklere kadar çok çeşitli etkinliklere hizmet veriyoruz. İster samimi bir akşam yemeği ister büyük bir etkinlik olsun, ekibimiz unutulmaz bir deneyim yaratmaya hazır." },
      { question: "Özel diyet tercihlerini karşılayabiliyor musunuz?", answer: "Evet, vejetaryen, glutensiz ve diğer diyet tercihlerine uygun menü seçenekleri sunuyoruz. Talebinizi gönderirken gereksinimlerinizi bize bildirin, uygun bir menü hazırlayalım." },
      { question: "Yemek ve içecek sağlıyor musunuz?", answer: "Yemek ve içecekler dahil olmak üzere tam kapsamlı catering hizmetleri sunuyoruz. Özel Türk yemeklerinden MADO tatlılarına ve dondurmasına kadar her şeyle biz ilgileniyoruz." },
      { question: "Minimum misafir sayısı var mı?", answer: "Minimum misafir sayısı etkinlik türüne ve seçilen menüye bağlıdır. Etkinliğinizin ayrıntılarını konuşmak ve doğru bilgi almak için ekibimizle iletişime geçin." },
      { question: "Masa düzeni ve temizlik sağlıyor musunuz?", answer: "Evet, ekibimiz etkinlik sonrası masa düzeni ve temizlikle ilgilenir, böylece tamamen misafirlerinize odaklanabilirsiniz." },
      { question: "Menü etkinliğime göre özelleştirilebilir mi?", answer: "Elbette! Etkinliğinizin temasına, misafir tercihlerine ve bütçenize uygun bir menü hazırlamaktan mutluluk duyarız." },
    ],
  },
};

export const quoteFormText: Record<LangCode, {
  fullName: string; email: string; phone: string; eventType: string; eventDate: string;
  guestCount: string; budget: string; message: string;
  fullNamePlaceholder: string; phonePlaceholder: string; eventTypePlaceholder: string;
  guestCountPlaceholder: string; budgetPlaceholder: string; messagePlaceholder: string;
  submitBtn: string; sendingBtn: string;
  successTitle: string; successDesc: (name: string) => string;
  errorMsg: string;
  nameRequired: string; emailInvalid: string; phoneRequired: string;
  eventTypeRequired: string; eventDateRequired: string; guestCountRequired: string;
}> = {
  ru: {
    fullName: "Полное имя", email: "Email", phone: "Номер телефона",
    eventType: "Тип мероприятия", eventDate: "Дата мероприятия", guestCount: "Количество гостей",
    budget: "Бюджет (необязательно)", message: "Сообщение",
    fullNamePlaceholder: "Иван Иванов", phonePlaceholder: "+998 90 000 00 00",
    eventTypePlaceholder: "Свадьба, юбилей, корпоратив...", guestCountPlaceholder: "Например, 50",
    budgetPlaceholder: "Например, 5 000 000 UZS", messagePlaceholder: "Расскажите подробнее о вашем мероприятии...",
    submitBtn: "Запросить предложение", sendingBtn: "Отправка…",
    successTitle: "Заявка отправлена!",
    successDesc: (name) => `Спасибо, ${name}! Мы свяжемся с вами для обсуждения деталей мероприятия.`,
    errorMsg: "Не удалось отправить заявку. Попробуйте ещё раз.",
    nameRequired: "Введите ваше имя", emailInvalid: "Введите корректный email", phoneRequired: "Введите номер телефона",
    eventTypeRequired: "Укажите тип мероприятия", eventDateRequired: "Укажите дату мероприятия", guestCountRequired: "Укажите количество гостей",
  },
  uz: {
    fullName: "To'liq ism", email: "Email", phone: "Telefon raqami",
    eventType: "Tadbir turi", eventDate: "Tadbir sanasi", guestCount: "Mehmonlar soni",
    budget: "Byudjet (ixtiyoriy)", message: "Xabar",
    fullNamePlaceholder: "Ism Familiya", phonePlaceholder: "+998 90 000 00 00",
    eventTypePlaceholder: "To'y, yubiley, korporativ...", guestCountPlaceholder: "Masalan, 50",
    budgetPlaceholder: "Masalan, 5 000 000 so'm", messagePlaceholder: "Tadbiringiz haqida batafsil gapirib bering...",
    submitBtn: "Taklif so'rash", sendingBtn: "Yuborilmoqda…",
    successTitle: "Ariza yuborildi!",
    successDesc: (name) => `Rahmat, ${name}! Tadbir tafsilotlarini muhokama qilish uchun siz bilan bog'lanamiz.`,
    errorMsg: "Arizani yuborib bo'lmadi. Qayta urinib ko'ring.",
    nameRequired: "Ismingizni kiriting", emailInvalid: "To'g'ri email kiriting", phoneRequired: "Telefon raqamingizni kiriting",
    eventTypeRequired: "Tadbir turini kiriting", eventDateRequired: "Tadbir sanasini kiriting", guestCountRequired: "Mehmonlar sonini kiriting",
  },
  en: {
    fullName: "Full Name", email: "Email", phone: "Phone Number",
    eventType: "Event Type", eventDate: "Event Date", guestCount: "Guest Count",
    budget: "Budget (optional)", message: "Message",
    fullNamePlaceholder: "John Smith", phonePlaceholder: "+998 90 000 00 00",
    eventTypePlaceholder: "Wedding, anniversary, corporate event...", guestCountPlaceholder: "e.g. 50",
    budgetPlaceholder: "e.g. 5,000,000 UZS", messagePlaceholder: "Tell us more about your event...",
    submitBtn: "Request a Quote", sendingBtn: "Sending…",
    successTitle: "Request sent!",
    successDesc: (name) => `Thank you, ${name}! We'll contact you to discuss your event details.`,
    errorMsg: "Failed to send the request. Please try again.",
    nameRequired: "Please enter your name", emailInvalid: "Please enter a valid email", phoneRequired: "Please enter your phone number",
    eventTypeRequired: "Please specify the event type", eventDateRequired: "Please specify the event date", guestCountRequired: "Please specify the guest count",
  },
  tr: {
    fullName: "Ad Soyad", email: "E-posta", phone: "Telefon Numarası",
    eventType: "Etkinlik Türü", eventDate: "Etkinlik Tarihi", guestCount: "Misafir Sayısı",
    budget: "Bütçe (isteğe bağlı)", message: "Mesaj",
    fullNamePlaceholder: "Ad Soyad", phonePlaceholder: "+998 90 000 00 00",
    eventTypePlaceholder: "Düğün, yıldönümü, kurumsal etkinlik...", guestCountPlaceholder: "Örn. 50",
    budgetPlaceholder: "Örn. 5.000.000 UZS", messagePlaceholder: "Etkinliğiniz hakkında daha fazla bilgi verin...",
    submitBtn: "Teklif İste", sendingBtn: "Gönderiliyor…",
    successTitle: "Talep gönderildi!",
    successDesc: (name) => `Teşekkürler, ${name}! Etkinlik ayrıntılarını görüşmek için sizinle iletişime geçeceğiz.`,
    errorMsg: "Talep gönderilemedi. Lütfen tekrar deneyin.",
    nameRequired: "Lütfen adınızı girin", emailInvalid: "Lütfen geçerli bir e-posta girin", phoneRequired: "Lütfen telefon numaranızı girin",
    eventTypeRequired: "Lütfen etkinlik türünü belirtin", eventDateRequired: "Lütfen etkinlik tarihini belirtin", guestCountRequired: "Lütfen misafir sayısını belirtin",
  },
};
