import type { LangCode } from "@/hooks/use-language.ts";

// ─── Types
export type TabId = "food" | "beverage" | "dessert" | "takeaway";

export type LocalizedText = Record<LangCode, string>;

export type Dish = {
  name: LocalizedText;
  description: LocalizedText;
  price: string;
  image: string;
  isNew?: boolean;
  isSignature?: boolean;
  isVeg?: boolean;
};

export type Category = {
  id: string;
  label: LocalizedText;
  tab: TabId;
  image: string;
  dishes: Dish[];
};

export const TABS: { id: TabId; label: LocalizedText }[] = [
  { id: "food", label: { ru: "Еда", uz: "Taomlar", en: "Food", tr: "Yemekler" } },
  { id: "beverage", label: { ru: "Напитки", uz: "Ichimliklar", en: "Beverages", tr: "İçecekler" } },
  { id: "dessert", label: { ru: "Десерты", uz: "Shirinliklar", en: "Desserts", tr: "Tatlılar" } },
  { id: "takeaway", label: { ru: "С собой", uz: "Olib ketish", en: "Takeaway", tr: "Paket" } },
];

export const MENU_CATEGORIES: Category[] = [
  {
    id: "breakfast",
    label: { ru: "Завтрак", uz: "Nonushta", en: "Breakfast", tr: "Kahvaltı" },
    tab: "food",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: {
          ru: "MADO фирменный завтрак",
          uz: "MADO maxsus nonushtasi",
          en: "MADO Signature Breakfast",
          tr: "MADO Özel Kahvaltı",
        },
        description: {
          ru: "Традиционный турецкий завтрак: сливочное масло, сыр, оливки, томаты, огурцы, варенье и свежий хлеб.",
          uz: "An'anaviy turk nonushtasi: sariyog', pishloq, zaytun, pomidor, bodring, murabbo va yangi non.",
          en: "A traditional Turkish breakfast: butter, cheese, olives, tomatoes, cucumbers, jam, and fresh bread.",
          tr: "Geleneksel Türk kahvaltısı: tereyağı, peynir, zeytin, domates, salatalık, reçel ve taze ekmek.",
        },
        price: "69\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
      },
      {
        name: { ru: "Менемен", uz: "Menemen", en: "Menemen", tr: "Menemen" },
        description: {
          ru: "Яичница-болтунья с перцем, помидорами, луком и специями в традиционном стиле.",
          uz: "An'anaviy uslubda qalampir, pomidor, piyoz va ziravorlar bilan tuxum qovurma.",
          en: "Scrambled eggs with peppers, tomatoes, onion, and spices, prepared in the traditional style.",
          tr: "Geleneksel usulde biber, domates, soğan ve baharatlarla hazırlanan çılbır benzeri yumurta.",
        },
        price: "45\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80",
        isNew: true,
      },
      {
        name: {
          ru: "Тост с авокадо",
          uz: "Avokadoli tost",
          en: "Avocado Toast",
          tr: "Avokadolu Tost",
        },
        description: {
          ru: "Многозерновой хлеб, кремовое авокадо, помидоры черри, микрозелень.",
          uz: "Ko'p g'alla non, krem avokado, cherri pomidor, mikrozelenlar.",
          en: "Multigrain bread, creamy avocado, cherry tomatoes, and microgreens.",
          tr: "Çok tahıllı ekmek, kremsi avokado, kiraz domates ve mikro yeşillikler.",
        },
        price: "38\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c820?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
      {
        name: {
          ru: "Суджук-омлет с сыром",
          uz: "Sudjukli va pishloqli omlet",
          en: "Sujuk Omelette with Cheese",
          tr: "Sucuklu Kaşarlı Omlet",
        },
        description: {
          ru: "Нежный омлет с турецкой колбасой суджук, сыром фета и свежими томатами.",
          uz: "Turk sudjuk kolbasasi, feta pishloq va yangi pomidorlar bilan mazali omlet.",
          en: "A soft omelette with Turkish sujuk sausage, feta cheese, and fresh tomatoes.",
          tr: "Türk sucuğu, beyaz peynir ve taze domateslerle yumuşak bir omlet.",
        },
        price: "42\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "soup",
    label: { ru: "Супы", uz: "Sho'rvalar", en: "Soups", tr: "Çorbalar" },
    tab: "food",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: {
          ru: "Томатный суп с тимьяном",
          uz: "Jambil bilan pomidor sho'rvasi",
          en: "Tomato Soup with Thyme",
          tr: "Kekikli Domates Çorbası",
        },
        description: {
          ru: "Традиционный турецкий суп на основе свежих томатов с пряными травами.",
          uz: "Yangi pomidorlar va ziravorli o'tlar asosidagi an'anaviy turk sho'rvasi.",
          en: "A traditional Turkish soup made with fresh tomatoes and aromatic herbs.",
          tr: "Taze domates ve baharatlı otlarla hazırlanan geleneksel Türk çorbası.",
        },
        price: "28\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1588566565463-180a5d5a7a69?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
      {
        name: { ru: "Мерджимек", uz: "Mercimek", en: "Mercimek (Lentil Soup)", tr: "Mercimek Çorbası" },
        description: {
          ru: "Густой чечевичный суп со специями, лимонным соком и гренками.",
          uz: "Ziravorlar, limon sharbati va qovurilgan non bo'laklari bilan qalin no'xot sho'rvasi.",
          en: "A hearty lentil soup with spices, lemon juice, and croutons.",
          tr: "Baharatlar, limon suyu ve kruton ile hazırlanan doyurucu mercimek çorbası.",
        },
        price: "26\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
        isVeg: true,
      },
      {
        name: {
          ru: "Куриный суп с лапшой",
          uz: "Tovuqli va noodleli sho'rva",
          en: "Chicken Noodle Soup",
          tr: "Tavuklu Erişte Çorbası",
        },
        description: {
          ru: "Насыщенный наваристый суп с лапшой, морковью, зеленью и лимоном.",
          uz: "Noodle, sabzi, yashil o't va limon bilan boy va to'yimli sho'rva.",
          en: "A rich, hearty soup with noodles, carrots, herbs, and lemon.",
          tr: "Erişte, havuç, yeşillik ve limonla zenginleştirilmiş doyurucu bir çorba.",
        },
        price: "32\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "cold-mezza",
    label: { ru: "Холодные закуски", uz: "Sovuq mezzalar", en: "Cold Mezze", tr: "Soğuk Mezeler" },
    tab: "food",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: {
          ru: "Хумус классический",
          uz: "Klassik xummus",
          en: "Classic Hummus",
          tr: "Klasik Humus",
        },
        description: {
          ru: "Традиционный нутовый хумус с оливковым маслом, паприкой и петрушкой.",
          uz: "Zaytun moyi, qizil qalampir va rezavor bilan an'anaviy no'xot xummusi.",
          en: "Traditional chickpea hummus with olive oil, paprika, and parsley.",
          tr: "Zeytinyağı, kırmızı biber ve maydanozla geleneksel nohut humusu.",
        },
        price: "35\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1554998171-89445e31c52b?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
        isSignature: true,
      },
      {
        name: { ru: "Таббуле", uz: "Tabbule", en: "Tabbouleh", tr: "Tabule" },
        description: {
          ru: "Свежая петрушка, мелкая пшеничная крупа, помидоры, лимонная заправка, оливковое масло.",
          uz: "Yangi rezavor, mayda bug'doy yorma, pomidor, limon sousi, zaytun moyi.",
          en: "Fresh parsley, fine bulgur wheat, tomatoes, lemon dressing, and olive oil.",
          tr: "Taze maydanoz, ince bulgur, domates, limon sosu ve zeytinyağı.",
        },
        price: "33\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
    ],
  },
  {
    id: "grill",
    label: { ru: "На гриле", uz: "Grilda", en: "From the Grill", tr: "Izgara" },
    tab: "food",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: { ru: "Адана-кебаб", uz: "Adana kebab", en: "Adana Kebab", tr: "Adana Kebap" },
        description: {
          ru: "Сочный кебаб из рубленого фарша с острым перцем, жаренный на открытом угле.",
          uz: "Achchiq qalampir bilan qiymalangan go'shtdan ochiq ko'mirda pishirilgan mazali kebab.",
          en: "A juicy kebab of minced meat with hot pepper, grilled over open coals.",
          tr: "Acı biberli kıyma etinden yapılan, ateşte ızgara edilen sulu bir kebap.",
        },
        price: "79\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
      },
      {
        name: {
          ru: "Фисташковый кебаб",
          uz: "Pistali kebab",
          en: "Pistachio Kebab",
          tr: "Fıstıklı Kebap",
        },
        description: {
          ru: "Фирменный кебаб с молотым фисташком, подаётся на баклажанном салате.",
          uz: "Maydalangan pista bilan maxsus kebab, baqlajon salati bilan taqdim etiladi.",
          en: "A signature kebab with ground pistachio, served over eggplant salad.",
          tr: "Öğütülmüş fıstıkla hazırlanan özel kebap, patlıcan salatası üzerinde servis edilir.",
        },
        price: "95\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1558030137-a56c1b002c72?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
        isNew: true,
      },
      {
        name: { ru: "Урфа-кебаб", uz: "Urfa kebab", en: "Urfa Kebab", tr: "Urfa Kebap" },
        description: {
          ru: "Мягкий кебаб из фарша с жареным перцем. Подаётся с лавашом.",
          uz: "Qovurilgan qalampir bilan qiymadan yumshoq kebab. Lavash bilan taqdim etiladi.",
          en: "A mild minced-meat kebab with roasted pepper, served with flatbread.",
          tr: "Kızarmış biberli, hafif baharatlı kıyma kebabı. Lavaşla servis edilir.",
        },
        price: "75\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "specialties",
    label: { ru: "Фирменные", uz: "Maxsus taomlar", en: "Specialties", tr: "Özel Lezzetler" },
    tab: "food",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: {
          ru: "Искендер-кебаб",
          uz: "Iskender kebab",
          en: "Iskender Kebab",
          tr: "İskender Kebap",
        },
        description: {
          ru: "Сладкий ягнёнок с кефиром, томатным соусом и жареным перцем.",
          uz: "Kefir, pomidor sousi va qovurilgan qalampir bilan yumshoq qo'zichoq go'shti.",
          en: "Tender lamb with yoghurt, tomato sauce, and roasted pepper.",
          tr: "Yoğurt, domates sosu ve kızarmış biberle hazırlanan yumuşak kuzu eti.",
        },
        price: "89\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1585325701165-f9e5b78a0e43?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
      },
      {
        name: { ru: "MADO бургер", uz: "MADO burger", en: "MADO Burger", tr: "MADO Burger" },
        description: {
          ru: "Сочная говяжья котлета, помидоры, лук, перец, соус MADO. Подаётся с жареным картофелем.",
          uz: "Mazali mol go'shti kotleti, pomidor, piyoz, qalampir, MADO sousi. Qovurilgan kartoshka bilan taqdim etiladi.",
          en: "A juicy beef patty, tomatoes, onion, pepper, and MADO sauce, served with fries.",
          tr: "Sulu dana köftesi, domates, soğan, biber ve MADO sos. Patates kızartması ile servis edilir.",
        },
        price: "58\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        isNew: true,
      },
    ],
  },
  {
    id: "hot-drinks",
    label: { ru: "Горячие напитки", uz: "Issiq ichimliklar", en: "Hot Drinks", tr: "Sıcak İçecekler" },
    tab: "beverage",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: { ru: "Турецкий чай", uz: "Turk choyi", en: "Turkish Tea", tr: "Türk Çayı" },
        description: {
          ru: "Традиционный чай, подаётся в турецком чайнике с сахаром.",
          uz: "An'anaviy choy, turk choynagida shakar bilan taqdim etiladi.",
          en: "Traditional tea, served in a Turkish teapot with sugar.",
          tr: "Geleneksel çay, Türk çaydanlığında şekerle servis edilir.",
        },
        price: "18\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
      },
      {
        name: { ru: "Турецкий кофе", uz: "Turk qahvasi", en: "Turkish Coffee", tr: "Türk Kahvesi" },
        description: {
          ru: "Традиционный турецкий кофе на песке. Густой, ароматный, незабываемый.",
          uz: "Qumda pishirilgan an'anaviy turk qahvasi. Qalin, xushbo'y, unutilmas.",
          en: "Traditional Turkish coffee brewed on sand. Rich, aromatic, and unforgettable.",
          tr: "Kumda pişirilen geleneksel Türk kahvesi. Yoğun, aromalı, unutulmaz.",
        },
        price: "22\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
      },
      {
        name: { ru: "Капучино", uz: "Kapuchino", en: "Cappuccino", tr: "Kapuçino" },
        description: {
          ru: "Эспрессо с паровым молоком, посыпанный корицей.",
          uz: "Bug'langan sut bilan espresso, dolchin sepilgan.",
          en: "Espresso with steamed milk, topped with cinnamon.",
          tr: "Buharla ısıtılmış sütlü espresso, tarçınla süslenmiş.",
        },
        price: "24\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
    ],
  },
  {
    id: "cold-drinks",
    label: { ru: "Холодные напитки", uz: "Sovuq ichimliklar", en: "Cold Drinks", tr: "Soğuk İçecekler" },
    tab: "beverage",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: { ru: "Айран", uz: "Ayron", en: "Ayran", tr: "Ayran" },
        description: {
          ru: "Освежающий турецкий напиток на основе кефира с солью.",
          uz: "Tuz qo'shilgan kefir asosidagi salqinlashtiruvchi turk ichimligi.",
          en: "A refreshing Turkish drink made from kefir with salt.",
          tr: "Tuz katılmış kefir bazlı serinletici bir Türk içeceği.",
        },
        price: "22\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
      },
      {
        name: {
          ru: "Свежий апельсиновый сок",
          uz: "Yangi apelsin sharbati",
          en: "Fresh Orange Juice",
          tr: "Taze Portakal Suyu",
        },
        description: {
          ru: "Свежевыжатый апельсин без добавок.",
          uz: "Qo'shimchasiz yangi siqilgan apelsin.",
          en: "Freshly squeezed orange, no additives.",
          tr: "Katkısız taze sıkılmış portakal.",
        },
        price: "24\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
      {
        name: { ru: "Манговый смузи", uz: "Mango smuzi", en: "Mango Smoothie", tr: "Mango Smoothie" },
        description: {
          ru: "Спелый манго, кокосовое молоко и мёд. Тропический вкус.",
          uz: "Pishgan mango, kokos suti va asal. Tropik ta'm.",
          en: "Ripe mango, coconut milk, and honey. A tropical flavor.",
          tr: "Olgun mango, hindistancevizi sütü ve bal. Tropik bir lezzet.",
        },
        price: "26\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1561043433-aaf687c4cf04?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
    ],
  },
  {
    id: "ice-cream",
    label: { ru: "Мороженое", uz: "Muzqaymoq", en: "Ice Cream", tr: "Dondurma" },
    tab: "dessert",
    image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: { ru: "Дондурма", uz: "Dondurma", en: "Dondurma", tr: "Dondurma" },
        description: {
          ru: "Фирменное турецкое мороженое, растягивающееся, с фисташками и финиками.",
          uz: "Pista va xurmoli, cho'ziluvchan maxsus turk muzqaymog'i.",
          en: "Our signature stretchy Turkish ice cream with pistachios and dates.",
          tr: "Fıstık ve hurmalı, uzayan özel Türk dondurması.",
        },
        price: "28\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
      },
      {
        name: {
          ru: "Дондурма с баклавой",
          uz: "Paxlavali dondurma",
          en: "Dondurma with Baklava",
          tr: "Baklavalı Dondurma",
        },
        description: {
          ru: "Фирменное мороженое MADO с кусочком фисташковой баклавы.",
          uz: "Pista paxlava bo'lagi bilan MADO maxsus muzqaymog'i.",
          en: "MADO's signature ice cream with a piece of pistachio baklava.",
          tr: "Fıstıklı baklava parçasıyla MADO'nun özel dondurması.",
        },
        price: "35\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
        isNew: true,
      },
    ],
  },
  {
    id: "turkish-dessert",
    label: { ru: "Турецкие десерты", uz: "Turk shirinliklari", en: "Turkish Desserts", tr: "Türk Tatlıları" },
    tab: "dessert",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: {
          ru: "Баклава фисташковая",
          uz: "Pista paxlava",
          en: "Pistachio Baklava",
          tr: "Fıstıklı Baklava",
        },
        description: {
          ru: "Тончайшие листы фило с молотым фисташком и шербетом.",
          uz: "Maydalangan pista va sharbat bilan eng ingichka filo qatlamlari.",
          en: "The thinnest phyllo layers with ground pistachio and syrup.",
          tr: "Öğütülmüş fıstık ve şerbetle en ince yufka katları.",
        },
        price: "35\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
      },
      {
        name: { ru: "Кадаиф", uz: "Kadayif", en: "Kadayif", tr: "Kadayıf" },
        description: {
          ru: "Ореховое тесто с творогом, политое густым шербетом и украшенное молотым фисташком.",
          uz: "Tvorog bilan yong'oqli xamir, qalin sharbat bilan sug'orilgan va maydalangan pista bilan bezatilgan.",
          en: "Nutty pastry with soft cheese, drizzled with thick syrup and topped with ground pistachio.",
          tr: "Lor peyniriyle hazırlanan tel kadayıf, kalın şerbetle ıslatılmış ve öğütülmüş fıstıkla süslenmiştir.",
        },
        price: "40\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
        isNew: true,
      },
      {
        name: { ru: "Сутлач", uz: "Sutlach", en: "Sütlaç", tr: "Sütlaç" },
        description: {
          ru: "Нежный молочный пудинг с корицей, посыпанный корицей.",
          uz: "Dolchin bilan sepilgan mazali sut pudingi.",
          en: "A delicate milk pudding with cinnamon, topped with cinnamon.",
          tr: "Tarçınla süslenmiş, yumuşak bir sütlü puding.",
        },
        price: "32\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1580984969071-a8da8e0a4cce?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
    ],
  },
  {
    id: "combos",
    label: { ru: "Комбо-наборы", uz: "Kombo to'plamlar", en: "Combo Sets", tr: "Kombo Menüler" },
    tab: "takeaway",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1200&q=80",
    dishes: [
      {
        name: { ru: "Комбо «Завтрак»", uz: "«Nonushta» kombosi", en: "\"Breakfast\" Combo", tr: "\"Kahvaltı\" Kombo" },
        description: {
          ru: "Турецкий завтрак + напиток на выбор + дондурма MADO.",
          uz: "Turk nonushtasi + tanlangan ichimlik + MADO dondurmasi.",
          en: "Turkish breakfast + a drink of your choice + MADO dondurma.",
          tr: "Türk kahvaltısı + seçtiğiniz içecek + MADO dondurma.",
        },
        price: "88\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
        isSignature: true,
      },
      {
        name: { ru: "Комбо «Меззе»", uz: "«Mezze» kombosi", en: "\"Mezze\" Combo", tr: "\"Meze\" Kombo" },
        description: {
          ru: "Выбор из 3 холодных закусок + резной хлеб + чай.",
          uz: "3 ta sovuq mezzadan tanlov + kesilgan non + choy.",
          en: "A choice of 3 cold mezze + sliced bread + tea.",
          tr: "3 soğuk mezeden seçim + dilimlenmiş ekmek + çay.",
        },
        price: "75\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=800&q=80",
        isVeg: true,
      },
      {
        name: { ru: "Комбо «Гриль»", uz: "«Gril» kombosi", en: "\"Grill\" Combo", tr: "\"Izgara\" Kombo" },
        description: {
          ru: "Адана-кебаб + салат Таббуле + напиток на выбор.",
          uz: "Adana kebab + Tabbule salati + tanlangan ichimlik.",
          en: "Adana kebab + Tabbouleh salad + a drink of your choice.",
          tr: "Adana kebap + Tabule salatası + seçtiğiniz içecek.",
        },
        price: "110\u00a0000 сум",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
];
