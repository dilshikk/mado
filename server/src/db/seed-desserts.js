/**
 * seed-desserts.js
 * Заполняет базу категориями и блюдами из меню десертов.
 *
 * CLI:  node server/src/db/seed-desserts.js
 * HTTP: POST /api/dishes/seed-desserts  (только admin)
 *
 * Безопасно: ON CONFLICT DO NOTHING — повторный запуск не дублирует данные.
 */

import pool from './pool.js';

// [name_ru, name_en, price]  —  name_uz дублирует name_ru, name_tr дублирует name_en
const CATEGORIES = [
  {
    label_ru: 'Вафля',
    label_uz: 'Vafli',
    label_en: 'Waffles',
    label_tr: 'Waffle',
    tab: 'desserts',
    dishes: [
      ['Фруктовая вафля', 'Fruit Waffle', 99000],
      ['Шоколадная вафля', 'Chocolate Waffle', 89000],
    ],
  },
  {
    label_ru: 'Горячие сладости',
    label_uz: 'Issiq shirinliklar',
    label_en: 'Hot Sweets',
    label_tr: 'Sıcak Tatlılar',
    tab: 'desserts',
    dishes: [
      ['Бурма-кадаиф с сыром', 'Cheese Burma', 112000],
      ['Катмер', 'Katmer', 138000],
      ['Кюнефе', 'Künefe', 135000],
      ['Кюнефе для двоих', 'Double Künefe', 135000],
      ['Кюнефе на подносе', 'Künefe Sharing Tray', 224000],
      ['Кюнефе шоколадное', 'Chocolate Künefe', 136000],
      ['Медовый бёрек', 'Honey Börek', 120000],
      ['Мини кюнефе', 'Mini Künefe', 144000],
      ['Фисташковый бурма-кадаиф', 'Pistachio Burma Kadayif', 112000],
    ],
  },
  {
    label_ru: 'Десертные тарелки с мороженым',
    label_uz: 'Muzqaymoqli desert tarelkalar',
    label_en: 'Dessert Plates with Ice Cream',
    label_tr: 'Dondurmalı Tatlı Tabakaları',
    tab: 'desserts',
    dishes: [
      ['Ассорти сладостей', 'Mixed Dessert Plate', 119000],
      ['Поднос сладостей с мороженым', 'Dessert Tray with Ice Cream', 296000],
      ['Фисташковый набор сладостей', 'Pistachio Dessert Set', 125000],
      ['Фруктовый ассорти', 'Fruit Assortment', 600000],
    ],
  },
  {
    label_ru: 'Десерты с грецкими орехами',
    label_uz: 'Yong\'oqli desertlar',
    label_en: 'Walnut Desserts',
    label_tr: 'Cevizli Tatlılar',
    tab: 'desserts',
    dishes: [
      ['Баклава с грец. орехом', 'Walnut Special Baklava', 89000],
    ],
  },
  {
    label_ru: 'Десерты с фисташками',
    label_uz: 'Pistali desertlar',
    label_en: 'Pistachio Desserts',
    label_tr: 'Fıstıklı Tatlılar',
    tab: 'desserts',
    dishes: [
      ['Бурма кадаиф с фисташками', 'Pistachio Burma Kadayif', 109000],
      ['Кадаиф с фисташками', 'Pistachio Tel Kadayif', 99000],
      ['Морковный ломтик', 'Carrot Slice (Havuç Dilimi)', 79000],
      ['Особая фисташковая баклава', 'Special Pistachio Baklava', 99000],
      ['Фисташковая баклава', 'Pistachio Baklava', 99000],
      ['Фисташковая мидье', 'Pistachio Midye', 149000],
      ['Фисташковый долама', 'Pistachio Dolama', 99000],
      ['Фисташковый шёбиет', 'Pistachio Şöbiyet', 99000],
    ],
  },
  {
    label_ru: 'Добавки',
    label_uz: 'Qo\'shimchalar',
    label_en: 'Extras',
    label_tr: 'Ekstralar',
    tab: 'desserts',
    dishes: [
      ['Банан свежий 100 г', 'Fresh Banana 100 g', 20000],
      ['Клубника свежая 100 г', 'Fresh Strawberries 100 g', 40000],
    ],
  },
  {
    label_ru: 'Мадолина',
    label_uz: 'Madolina',
    label_en: 'Madolina',
    label_tr: 'Madolina',
    tab: 'desserts',
    dishes: [
      ['Карам. бисквит Банановый куп-торт', 'Caramelized Biscuit Banana Cup Cake', 76000],
      ['Клубничный куп торт', 'Strawberry Cup Cake', 76000],
      ['Шок. бисквит Клубничный куп торт', 'Chocolate Biscuit Strawberry Cup Cake', 76000],
    ],
  },
  {
    label_ru: 'Молочные сладости',
    label_uz: 'Sutli shirinliklar',
    label_en: 'Milk Desserts',
    label_tr: 'Sütlü Tatlılar',
    tab: 'desserts',
    dishes: [
      ['Крем-брюле', 'Crème Brûlée', 90000],
      ['Молочный пудинг', 'Baked Rice Pudding (Sutlac)', 64000],
      ['Триличе', 'Trilece', 64000],
      ['Холодная пахлава', 'Cold Baklava', 99000],
      ['Шоколадный пудинг', 'Chocolate Pudding (Supangle)', 79000],
    ],
  },
  {
    label_ru: 'Мороженое',
    label_uz: 'Muzqaymoq',
    label_en: 'Ice Cream',
    label_tr: 'Dondurma',
    tab: 'desserts',
    dishes: [
      ['1 шарик мороженого', '1 Scoop Ice Cream', 31000],
      ['2 шарика мороженого', '2 Scoops Ice Cream', 56000],
      ['3 шарика мороженого', '3 Scoops Ice Cream', 79000],
      ['4 шарика мороженого', '4 Scoops Ice Cream', 99000],
    ],
  },
  {
    label_ru: 'Новинки пудинги',
    label_uz: 'Yangi pudinlar',
    label_en: 'New Puddings',
    label_tr: 'Yeni Muhallebiler',
    tab: 'desserts',
    dishes: [
      ['Бананово-фист. мухаллеби', 'Banana Pistachio Muhallebi', 66000],
      ['Клубничный мухаллеби', 'Strawberry Muhallebi', 66000],
      ['Лимонный мухаллеби', 'Lemon Muhallebi', 66000],
      ['Малиновый мухаллеби', 'Raspberry Muhallebi', 66000],
      ['Мухаллеби с печеньем', 'Cookie Muhallebi', 66000],
      ['Шоколадный мухаллеби', 'Chocolate Muhallebi', 66000],
    ],
  },
  {
    label_ru: 'Профитроли в креманках',
    label_uz: 'Kremankadagi profitroler',
    label_en: 'Profiteroles',
    label_tr: 'Profiteroller',
    tab: 'desserts',
    dishes: [
      ['Профитроли с белым шоколадом', 'White Chocolate Profiterole', 85000],
      ['Профитроли с класс. мороженым', 'Classic Ice Cream Profiterole', 79000],
      ['Профитроли с шокол. мороженым', 'Chocolate Ice Cream Profiterole', 79000],
      ['Профитроли шоколадные', 'Chocolate Profiterole', 85000],
    ],
  },
  {
    label_ru: 'Торты и десерты',
    label_uz: 'Tortlar va desertlar',
    label_en: 'Cakes & Desserts',
    label_tr: 'Pastalar ve Tatlılar',
    tab: 'desserts',
    dishes: [
      ['Дубайский тирамису', 'Dubai Style Tiramisu', 109000],
      ['Матильда', 'Matilda Chocolate Cake', 99000],
      ['Премиум десерты', 'Premium Desserts', 125000],
      ['Тирамису', 'Tiramisu', 99000],
      ['Чизкейк', 'Cheesecake', 92000],
      ['Чизкейк Сан-Себастьян', 'San Sebastian Cheesecake', 92000],
    ],
  },
  {
    label_ru: 'Эклер и круассан',
    label_uz: 'Ekler va kruassan',
    label_en: 'Eclairs & Croissants',
    label_tr: 'Ekler ve Kruvasan',
    tab: 'desserts',
    dishes: [
      ['Круассан', 'Croissant', 55000],
      ['Тарелка эклеров', 'Eclair Plate', 89000],
    ],
  },
];

// ─── Exportable function (used by HTTP endpoint) ──────────────────────────────

export async function runSeedDesserts() {
  const client = await pool.connect();
  try {
    let newCategories = 0;
    let totalDishes = 0;
    const log = [];

    for (const [idx, cat] of CATEGORIES.entries()) {
      const catRes = await client.query(`
        INSERT INTO menu_categories (label, label_ru, label_uz, label_en, label_tr, tab, position)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [cat.label_ru, cat.label_ru, cat.label_uz, cat.label_en, cat.label_tr, cat.tab, idx + 1]);

      let categoryId;
      if (catRes.rows.length > 0) {
        categoryId = catRes.rows[0].id;
        newCategories++;
        log.push(`✓ Категория: ${cat.label_ru} (id=${categoryId})`);
      } else {
        const existing = await client.query(
          'SELECT id FROM menu_categories WHERE label_ru = $1 AND tab = $2',
          [cat.label_ru, cat.tab]
        );
        if (existing.rows.length === 0) {
          log.push(`⚠ Пропущено: ${cat.label_ru}`);
          continue;
        }
        categoryId = existing.rows[0].id;
        log.push(`~ Уже есть: ${cat.label_ru} (id=${categoryId})`);
      }

      for (const [pos, dish] of cat.dishes.entries()) {
        const [name_ru, name_en, price] = dish;
        // name_uz mirrors name_ru, name_tr mirrors name_en
        await client.query(`
          INSERT INTO dishes (category_id, name_ru, name_uz, name_en, name_tr, price, status, position)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT DO NOTHING
        `, [categoryId, name_ru, name_ru, name_en, name_en, price, 'published', pos + 1]);
        totalDishes++;
      }
    }

    return { ok: true, newCategories, totalDishes, log };
  } finally {
    client.release();
  }
}

// ─── CLI entry point ──────────────────────────────────────────────────────────

const isCli = process.argv[1] && process.argv[1].endsWith('seed-desserts.js');
if (isCli) {
  console.log('🚀 Загрузка меню десертов...\n');
  runSeedDesserts()
    .then(({ newCategories, totalDishes, log }) => {
      log.forEach((l) => console.log(l));
      console.log(`\n✅ Готово! Новых категорий: ${newCategories}, блюд: ${totalDishes}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Ошибка:', err.message);
      process.exit(1);
    });
}
