/**
 * Seed script: fills meta_title_ru/uz/en/tr + meta_description_ru/uz/en/tr
 * for all 8 public pages.
 *
 * Usage:
 *   node server/src/db/seed-page-meta.js
 *
 * Safe to run multiple times — uses UPDATE … WHERE slug = '…'
 * Only rows that already exist in the pages table will be updated.
 */

import pool from './pool.js';

const PAGES = [
  {
    slug: '',          // home page
    title_ru: 'MADO — Турецкий ресторан в Ташкенте',
    title_uz: 'MADO — Toshkentdagi turk restoran',
    title_en: 'MADO — Turkish Restaurant in Tashkent',
    title_tr: 'MADO — Taşkent\'te Türk Restoranı',
    meta_title_ru: 'MADO — Турецкий ресторан в Ташкенте | Аутентичная кухня',
    meta_title_uz: 'MADO — Toshkentdagi turk restorani | Haqiqiy oshxona',
    meta_title_en: 'MADO — Turkish Restaurant in Tashkent | Authentic Cuisine',
    meta_title_tr: 'MADO — Taşkent\'te Türk Restoranı | Otantik Mutfak',
    meta_description_ru: 'MADO — аутентичный турецкий ресторан в Ташкенте. Традиционная кухня, мороженое Марашского типа, кейтеринг и уютная атмосфера. Более 300 ресторанов по всему миру.',
    meta_description_uz: 'MADO — Toshkentdagi haqiqiy turk restorani. An\'anaviy oshxona, Maraş usuli muzqaymoq, keytring va qulay muhit. Dunyoda 300 dan ortiq restoran.',
    meta_description_en: 'MADO is an authentic Turkish restaurant in Tashkent. Traditional cuisine, Maraş-style ice cream, catering and cozy atmosphere. Over 300 restaurants worldwide.',
    meta_description_tr: 'MADO, Taşkent\'te otantik bir Türk restoranıdır. Geleneksel mutfak, Maraş dondurması, catering ve samimi atmosfer. Dünya genelinde 300\'den fazla restoran.',
  },
  {
    slug: 'story',
    title_ru: 'Наша история — MADO',
    title_uz: 'Bizning tariximiz — MADO',
    title_en: 'Our Story — MADO',
    title_tr: 'Hikayemiz — MADO',
    meta_title_ru: 'История MADO | С 1850 года — традиции Кахраманмараша',
    meta_title_uz: 'MADO tarixi | 1850 yildan — Kahramanmaraş an\'analari',
    meta_title_en: 'MADO Story | Since 1850 — Kahramanmaraş Traditions',
    meta_title_tr: 'MADO\'nun Hikayesi | 1850\'den beri — Kahramanmaraş Gelenekleri',
    meta_description_ru: 'Узнайте историю MADO — бренда, который с 1850 года хранит традиции турецкого мороженого дондурма из Кахраманмараша. Семья Канбур, коза молоко и салеп.',
    meta_description_uz: 'MADO tarixini bilib oling — 1850 yildan beri Kahramanmaraş\'dagi turk dondurma an\'analarini saqlayotgan brend. Kanbur oilasi, echki suti va salep.',
    meta_description_en: 'Discover the story of MADO — a brand that has preserved the traditions of Turkish dondurma ice cream from Kahramanmaraş since 1850. The Kanbur family, goat milk and salep.',
    meta_description_tr: 'MADO\'nun hikayesini keşfedin — 1850\'den beri Kahramanmaraş\'ın Türk dondurma geleneklerini yaşatan bir marka. Kanbur ailesi, keçi sütü ve salep.',
  },
  {
    slug: 'menu',
    title_ru: 'Меню — MADO',
    title_uz: 'Menyu — MADO',
    title_en: 'Menu — MADO',
    title_tr: 'Menü — MADO',
    meta_title_ru: 'Меню MADO | Турецкая кухня, десерты и напитки в Ташкенте',
    meta_title_uz: 'MADO menyusi | Toshkentda turk taomlari, desertlar va ichimliklar',
    meta_title_en: 'MADO Menu | Turkish Food, Desserts & Drinks in Tashkent',
    meta_title_tr: 'MADO Menüsü | Taşkent\'te Türk Yemekleri, Tatlılar ve İçecekler',
    meta_description_ru: 'Изучите полное меню MADO: горячие блюда турецкой кухни, пахлава, дондурма, напитки. Аутентичные рецепты, свежие ингредиенты, доставка по Ташкенту.',
    meta_description_uz: 'MADO\'ning to\'liq menyusini ko\'ring: turk oshxonasining issiq taomlari, baklava, dondurma, ichimliklar. Haqiqiy retseptlar, yangi mahsulotlar, Toshkent bo\'ylab yetkazib berish.',
    meta_description_en: 'Explore the full MADO menu: hot Turkish dishes, baklava, dondurma, drinks. Authentic recipes, fresh ingredients, delivery across Tashkent.',
    meta_description_tr: 'MADO\'nun tam menüsünü keşfedin: sıcak Türk yemekleri, baklava, dondurma, içecekler. Otantik tarifler, taze malzemeler, Taşkent genelinde teslimat.',
  },
  {
    slug: 'catering',
    title_ru: 'Кейтеринг — MADO',
    title_uz: 'Keytring — MADO',
    title_en: 'Catering — MADO',
    title_tr: 'Catering — MADO',
    meta_title_ru: 'Кейтеринг MADO | Турецкая кухня для ваших мероприятий',
    meta_title_uz: 'MADO keytringa | Tadbirlaringiz uchun turk oshxonasi',
    meta_title_en: 'MADO Catering | Turkish Cuisine for Your Events',
    meta_title_tr: 'MADO Catering | Etkinlikleriniz İçin Türk Mutfağı',
    meta_description_ru: 'Кейтеринг от MADO — аутентичная турецкая кухня для корпоративных мероприятий, свадеб и торжеств в Ташкенте. Профессиональное обслуживание и неповторимые вкусы.',
    meta_description_uz: 'MADO\'dan keytring — Toshkentdagi korporativ tadbirlar, to\'ylar va bayramlar uchun haqiqiy turk oshxonasi. Professional xizmat va unutilmas ta\'mlar.',
    meta_description_en: 'MADO catering — authentic Turkish cuisine for corporate events, weddings and celebrations in Tashkent. Professional service and unforgettable flavours.',
    meta_description_tr: 'MADO catering — Taşkent\'teki kurumsal etkinlikler, düğünler ve kutlamalar için otantik Türk mutfağı. Profesyonel hizmet ve unutulmaz lezzetler.',
  },
  {
    slug: 'locations',
    title_ru: 'Наши рестораны — MADO',
    title_uz: 'Bizning restoranlarimiz — MADO',
    title_en: 'Our Locations — MADO',
    title_tr: 'Şubelerimiz — MADO',
    meta_title_ru: 'Рестораны MADO в Ташкенте | Адреса и режим работы',
    meta_title_uz: 'Toshkentdagi MADO restoranlari | Manzillar va ish vaqti',
    meta_title_en: 'MADO Restaurants in Tashkent | Locations & Opening Hours',
    meta_title_tr: 'Taşkent\'teki MADO Restoranları | Adresler ve Çalışma Saatleri',
    meta_description_ru: 'Найдите ближайший ресторан MADO в Ташкенте. Адреса, телефоны и режим работы всех наших заведений. Посетите нас в торговых центрах города.',
    meta_description_uz: 'Toshkentdagi eng yaqin MADO restoranini toping. Barcha muassasalarimizning manzillari, telefon raqamlari va ish vaqti. Shahar savdo markazlarida bizni ziyorat qiling.',
    meta_description_en: 'Find the nearest MADO restaurant in Tashkent. Addresses, phone numbers and opening hours of all our venues. Visit us in the city\'s shopping centres.',
    meta_description_tr: 'Taşkent\'teki en yakın MADO restoranını bulun. Tüm şubelerimizin adresleri, telefon numaraları ve çalışma saatleri. Şehrin alışveriş merkezlerinde bizi ziyaret edin.',
  },
  {
    slug: 'careers',
    title_ru: 'Карьера в MADO',
    title_uz: 'MADO\'da karyera',
    title_en: 'Careers at MADO',
    title_tr: 'MADO\'da Kariyer',
    meta_title_ru: 'Работа в MADO | Вакансии в Ташкенте — присоединяйтесь к команде',
    meta_title_uz: 'MADO\'da ish | Toshkentdagi bo\'sh o\'rinlar — jamoaga qo\'shiling',
    meta_title_en: 'Jobs at MADO | Vacancies in Tashkent — Join Our Team',
    meta_title_tr: 'MADO\'da İş | Taşkent\'teki Pozisyonlar — Ekibimize Katılın',
    meta_description_ru: 'Вакансии в ресторанах MADO в Ташкенте. Работа поваром, официантом, менеджером и другие позиции. Конкурентная зарплата, обучение и дружная команда.',
    meta_description_uz: 'Toshkentdagi MADO restoranlarida bo\'sh o\'rinlar. Oshpaz, ofitsiant, menejer va boshqa lavozimlar. Raqobatbardosh maosh, o\'qitish va do\'stona jamoa.',
    meta_description_en: 'Vacancies at MADO restaurants in Tashkent. Jobs as cook, waiter, manager and other positions. Competitive salary, training and a friendly team.',
    meta_description_tr: 'Taşkent\'teki MADO restoranlarında açık pozisyonlar. Aşçı, garson, menejer ve diğer roller. Rekabetçi maaş, eğitim ve samimi ekip.',
  },
  {
    slug: 'contact',
    title_ru: 'Контакты — MADO',
    title_uz: 'Aloqa — MADO',
    title_en: 'Contact — MADO',
    title_tr: 'İletişim — MADO',
    meta_title_ru: 'Контакты MADO | Свяжитесь с нами в Ташкенте',
    meta_title_uz: 'MADO aloqa | Toshkentda biz bilan bog\'laning',
    meta_title_en: 'Contact MADO | Get in Touch in Tashkent',
    meta_title_tr: 'MADO İletişim | Taşkent\'te Bizimle İletişime Geçin',
    meta_description_ru: 'Свяжитесь с MADO: телефон +998 90 008 00 40, email madotashkent@gmail.com. Вопросы по кейтерингу, бронированию столов, карьере и партнёрству.',
    meta_description_uz: 'MADO bilan bog\'laning: telefon +998 90 008 00 40, email madotashkent@gmail.com. Keytring, stol bron qilish, karyera va hamkorlik bo\'yicha savollar.',
    meta_description_en: 'Contact MADO: phone +998 90 008 00 40, email madotashkent@gmail.com. Questions about catering, table reservations, careers and partnerships.',
    meta_description_tr: 'MADO\'ya ulaşın: telefon +998 90 008 00 40, e-posta madotashkent@gmail.com. Catering, masa rezervasyonu, kariyer ve ortaklık hakkında sorular.',
  },
  {
    slug: 'reviews',
    title_ru: 'Отзывы — MADO',
    title_uz: 'Sharhlar — MADO',
    title_en: 'Reviews — MADO',
    title_tr: 'Yorumlar — MADO',
    meta_title_ru: 'Отзывы о MADO | Что говорят наши гости',
    meta_title_uz: 'MADO haqida sharhlar | Mehmonlarimiz nima deydi',
    meta_title_en: 'MADO Reviews | What Our Guests Say',
    meta_title_tr: 'MADO Yorumları | Misafirlerimiz Ne Diyor',
    meta_description_ru: 'Читайте отзывы гостей о ресторанах MADO в Ташкенте. Оставьте свой отзыв и поделитесь впечатлениями о турецкой кухне, обслуживании и атмосфере.',
    meta_description_uz: 'Toshkentdagi MADO restoranlari haqida mehmonlar sharhlarini o\'qing. O\'z sharhingizni qoldiring va turk oshxonasi, xizmat va muhit haqidagi taassurotlaringizni baham ko\'ring.',
    meta_description_en: 'Read guest reviews of MADO restaurants in Tashkent. Leave your own review and share your impressions of the Turkish cuisine, service and atmosphere.',
    meta_description_tr: 'Taşkent\'teki MADO restoranları hakkında misafir yorumlarını okuyun. Kendi yorumunuzu bırakın ve Türk mutfağı, hizmet ve atmosfer hakkındaki izlenimlerinizi paylaşın.',
  },
];

const seedPageMeta = async () => {
  console.log('Seeding multilingual meta fields for pages...\n');

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const page of PAGES) {
    // Check if the page row exists
    const existing = await pool.query(
      'SELECT id, slug FROM pages WHERE slug = $1',
      [page.slug],
    );

    if (existing.rows.length === 0) {
      // Row doesn't exist — insert it
      await pool.query(
        `INSERT INTO pages (
          title, slug,
          title_ru, title_uz, title_en, title_tr,
          meta_title, meta_description,
          meta_title_ru, meta_title_uz, meta_title_en, meta_title_tr,
          meta_description_ru, meta_description_uz, meta_description_en, meta_description_tr,
          status
        ) VALUES (
          $1, $2,
          $3, $4, $5, $6,
          $3, $7,
          $8, $9, $10, $11,
          $12, $13, $14, $15,
          'published'
        )`,
        [
          page.title_ru,
          page.slug,
          page.title_ru, page.title_uz, page.title_en, page.title_tr,
          page.meta_description_ru,
          page.meta_title_ru, page.meta_title_uz, page.meta_title_en, page.meta_title_tr,
          page.meta_description_ru, page.meta_description_uz, page.meta_description_en, page.meta_description_tr,
        ],
      );
      console.log(`  ✓ INSERTED  slug="${page.slug || '(home)'}"`);
      inserted++;
    } else {
      // Row exists — update only the meta fields (don't overwrite existing non-null values? — actually do overwrite to ensure data quality)
      const result = await pool.query(
        `UPDATE pages SET
          title_ru              = COALESCE(title_ru, $1),
          title_uz              = COALESCE(title_uz, $2),
          title_en              = COALESCE(title_en, $3),
          title_tr              = COALESCE(title_tr, $4),
          meta_title            = COALESCE(meta_title, $5),
          meta_description      = COALESCE(meta_description, $6),
          meta_title_ru         = $7,
          meta_title_uz         = $8,
          meta_title_en         = $9,
          meta_title_tr         = $10,
          meta_description_ru   = $11,
          meta_description_uz   = $12,
          meta_description_en   = $13,
          meta_description_tr   = $14,
          updated_at            = CURRENT_TIMESTAMP
        WHERE slug = $15`,
        [
          page.title_ru, page.title_uz, page.title_en, page.title_tr,
          page.meta_title_ru, page.meta_description_ru,
          page.meta_title_ru, page.meta_title_uz, page.meta_title_en, page.meta_title_tr,
          page.meta_description_ru, page.meta_description_uz, page.meta_description_en, page.meta_description_tr,
          page.slug,
        ],
      );
      if (result.rowCount > 0) {
        console.log(`  ✓ UPDATED   slug="${page.slug || '(home)'}"`);
        updated++;
      } else {
        console.log(`  – SKIPPED   slug="${page.slug || '(home)'}"`);
        skipped++;
      }
    }
  }

  console.log(`\nDone! inserted=${inserted}  updated=${updated}  skipped=${skipped}`);
  await pool.end();
  process.exit(0);
};

seedPageMeta().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
