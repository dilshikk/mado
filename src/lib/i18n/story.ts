import type { LangCode } from "@/hooks/use-language.ts";

export const storyPageText: Record<LangCode, {
  heroTitle: string; heroSub: string;
  paragraphs: string[]; sinceLabel: string;
  features: { title: string; text: string }[];
  ctaLabel: string; ctaTitle: string; ctaSub: string; ctaBtn: string;
}> = {
  ru: {
    heroTitle: "НАША ИСТОРИЯ",
    heroSub: "Настоящий турецкий опыт. Настоящий праздник вкуса.",
    paragraphs: [
      "MADO означает Maraş Dondurması — «Мараш» это регион Кахраманмараш, а «Дондурма» — мороженое, приготовленное из трёх главных ингредиентов: сахара, козьего молока и салепа.",
      "История MADO началась с Османа Аги, предка семьи Канбур, который собирал снег с горы Ахир в Кахраманмараше и смешивал его с ароматной патокой, превращая его в освежающий десерт. Опыт и секреты передавались из поколения в поколение, а вкус совершенствовался и раскрывался всё глубже с каждым новым поколением.",
      "В какой-то момент MADO пришлось модернизироваться и перейти от традиционного мороженого ручной работы к машинному производству, чтобы предлагать десерт круглый год и в больших объёмах. Команда MADO работала день и ночь, чтобы внести необходимые изменения и при этом сохранить тот самый неповторимый вкус.",
      "Сегодня MADO — это сеть турецких ресторанов с более чем 300 филиалами по всему миру. MADO — это история успеха бренда, который начинался с простой цели — подарить как можно большему числу людей традиционную мараш-дондурму, а вырос до целой фабрики, рынка и международной ресторанной сети.",
    ],
    sinceLabel: "— С 1850 года",
    features: [
      { title: "Аутентичная турецкая кухня", text: "Почувствуйте настоящий вкус Турции благодаря проверенным временем рецептам и тщательно отобранным ингредиентам." },
      { title: "Доставка", text: "Насладитесь фирменными блюдами и десертами MADO у себя дома. Каждый заказ приезжает свежим и приготовленным с той же заботой." },
      { title: "Кейтеринг", text: "Сделайте ваше торжество незабываемым с кейтерингом от MADO — для корпоративных мероприятий, праздников и частных случаев." },
      { title: "Обеды весь день", text: "Наслаждайтесь атмосферой, где традиция встречается с современной элегантностью, в любое время дня." },
    ],
    ctaLabel: "Восхитительный опыт",
    ctaTitle: "Ужин, мероприятие или праздник?",
    ctaSub: "Планируете уютный ужин, корпоративное мероприятие или особое торжество — MADO предлагает элегантную атмосферу в сочетании с аутентичными турецкими вкусами.",
    ctaBtn: "Узнать больше",
  },
  uz: {
    heroTitle: "BIZNING TARIXIMIZ",
    heroSub: "Haqiqiy turk tajribasi. Haqiqiy did bayrami.",
    paragraphs: [
      "MADO — Maraş Dondurması degani, «Maraş» Qahramanmaraş viloyati, «Dondurma» esa uch asosiy tarkibiy qism — shakar, echki suti va saleptan tayyorlangan muzqaymoq.",
      "MADO tarixi Qanbur oilasining ajdodi Osman Aga bilan boshlangan — u Qahramanmarashdagi Ahir tog'idan qor yig'ib, uni xushbo'y siropga aralashtirib, salqinlashtiruvchi shirinlikka aylantirgan. Tajriba va sirlar avloddan-avlodga o'tib, ta'm har yangi avlod bilan chuqurlashib, takomillashib borgan.",
      "Ma'lum vaqtda MADO an'anaviy qo'lda tayyorlangan muzqaymoqdan mashina ishlab chiqarishga o'tishi kerak bo'ldi — buni yil davomida va katta hajmda taklif qilish uchun. MADO jamoasi zarur o'zgarishlarni amalga oshirish uchun kechayu kunduz ishladi, shu bilan birga o'ziga xos ta'mni saqlab qoldi.",
      "Bugungi kunda MADO dunyo bo'ylab 300 dan ortiq filialga ega turk restoranlar tarmog'idir. MADO — oddiy maqsad, ya'ni iloji boricha ko'proq odamga an'anaviy maraş dondurmasini taqdim etishdan boshlangan, to'liq fabrika, bozor va xalqaro restoran tarmog'iga aylangan brend muvaffaqiyati tarixidir.",
    ],
    sinceLabel: "— 1850 yildan buyon",
    features: [
      { title: "Original turk oshxonasi", text: "Vaqt sinovidan o'tgan retseptlar va ehtiyotkorlik bilan tanlangan ingredientlar orqali Turkiyaning haqiqiy ta'mini his eting." },
      { title: "Yetkazib berish", text: "MADOning maxsus taomlari va shirinliklaridan uyingizda bahramand bo'ling. Har bir buyurtma yangi va bir xil g'amxo'rlik bilan tayyorlanadi." },
      { title: "Keytering", text: "MADO keyteringi bilan tantanangizni unutilmas qiling — korporativ tadbirlar, bayramlar va shaxsiy tadbirlar uchun." },
      { title: "Kun bo'yi taomlanish", text: "An'ana zamonaviy nafislik bilan uchrashadigan muhitdan kun davomida bahramand bo'ling." },
    ],
    ctaLabel: "Ajoyib tajriba",
    ctaTitle: "Kechki ovqat, tadbir yoki bayram?",
    ctaSub: "Sokin kechki ovqat, korporativ tadbir yoki maxsus tantana rejalashtirmoqchimisiz — MADO original turk ta'mlari bilan birga nafis muhit taklif etadi.",
    ctaBtn: "Ko'proq bilish",
  },
  en: {
    heroTitle: "OUR STORY",
    heroSub: "A true Turkish experience. A true celebration of flavor.",
    paragraphs: [
      "MADO stands for Maraş Dondurması — 'Maraş' refers to the Kahramanmaraş region, and 'Dondurma' is ice cream made from three main ingredients: sugar, goat's milk, and salep.",
      "MADO's story began with Osman Aga, an ancestor of the Kanbur family, who gathered snow from Mount Ahir in Kahramanmaraş and mixed it with fragrant molasses, turning it into a refreshing dessert. Experience and secrets were passed down through generations, and the flavor was refined and deepened with each new generation.",
      "At some point, MADO had to modernize and move from traditional handmade ice cream to machine production in order to offer the dessert year-round and in large volumes. The MADO team worked day and night to make the necessary changes while preserving that same unique flavor.",
      "Today, MADO is a chain of Turkish restaurants with more than 300 locations worldwide. MADO is the success story of a brand that started with a simple goal — to bring traditional maraş dondurma to as many people as possible — and grew into a full factory, market, and international restaurant chain.",
    ],
    sinceLabel: "— Since 1850",
    features: [
      { title: "Authentic Turkish Cuisine", text: "Feel the true taste of Turkey through time-tested recipes and carefully selected ingredients." },
      { title: "Delivery", text: "Enjoy MADO's signature dishes and desserts at home. Every order arrives fresh and made with the same care." },
      { title: "Catering", text: "Make your celebration unforgettable with catering from MADO — for corporate events, holidays, and private occasions." },
      { title: "All-Day Dining", text: "Enjoy an atmosphere where tradition meets modern elegance, at any time of day." },
    ],
    ctaLabel: "A Delightful Experience",
    ctaTitle: "Dinner, event, or celebration?",
    ctaSub: "Whether you're planning a cozy dinner, a corporate event, or a special celebration, MADO offers an elegant atmosphere paired with authentic Turkish flavors.",
    ctaBtn: "Learn More",
  },
  tr: {
    heroTitle: "HİKAYEMİZ",
    heroSub: "Gerçek bir Türk deneyimi. Gerçek bir lezzet şöleni.",
    paragraphs: [
      "MADO, Maraş Dondurması anlamına gelir — 'Maraş' Kahramanmaraş bölgesini, 'Dondurma' ise şeker, keçi sütü ve sahlepten yapılan dondurmayı ifade eder.",
      "MADO'nun hikayesi, Kanbur ailesinin atası Osman Ağa ile başladı; Kahramanmaraş'taki Ahir Dağı'ndan kar toplayıp aromalı pekmezle karıştırarak serinletici bir tatlıya dönüştürdü. Deneyim ve sırlar kuşaktan kuşağa aktarıldı, lezzet her yeni kuşakla derinleşip mükemmelleşti.",
      "Bir noktada MADO, tatlıyı yıl boyunca ve büyük miktarlarda sunabilmek için geleneksel el yapımı dondurmadan makine üretimine geçmek zorunda kaldı. MADO ekibi, o eşsiz lezzeti korurken gerekli değişiklikleri yapmak için gece gündüz çalıştı.",
      "Bugün MADO, dünya çapında 300'den fazla şubesi olan bir Türk restoran zinciridir. MADO, mümkün olduğunca çok kişiye geleneksel maraş dondurmasını ulaştırmak gibi basit bir hedefle başlayıp tam bir fabrika, pazar ve uluslararası restoran zincirine dönüşen bir marka başarı hikayesidir.",
    ],
    sinceLabel: "— 1850'den beri",
    features: [
      { title: "Otantik Türk Mutfağı", text: "Zamanın sınadığı tarifler ve dikkatle seçilmiş malzemelerle Türkiye'nin gerçek tadını hissedin." },
      { title: "Teslimat", text: "MADO'nun özel yemeklerinin ve tatlılarının tadını evinizde çıkarın. Her sipariş taze ve aynı özenle hazırlanır." },
      { title: "Catering", text: "MADO catering ile kutlamanızı unutulmaz kılın — kurumsal etkinlikler, bayramlar ve özel günler için." },
      { title: "Gün Boyu Yemek", text: "Geleneğin modern zarafetle buluştuğu bir atmosferin tadını günün her saatinde çıkarın." },
    ],
    ctaLabel: "Keyifli Bir Deneyim",
    ctaTitle: "Akşam yemeği, etkinlik ya da kutlama mı?",
    ctaSub: "Samimi bir akşam yemeği, kurumsal bir etkinlik veya özel bir kutlama planlıyor olun, MADO otantik Türk lezzetleriyle birlikte zarif bir atmosfer sunar.",
    ctaBtn: "Daha Fazla Bilgi",
  },
};
