/**
 * seed-kitchen.js
 * Заполняет базу категориями и блюдами из меню кухни.
 *
 * CLI:  node server/src/db/seed-kitchen.js
 * HTTP: POST /api/dishes/seed-kitchen  (только admin)
 *
 * Безопасно: ON CONFLICT DO NOTHING — повторный запуск не дублирует данные.
 */

import pool from './pool.js';

// [name_ru, name_en, price]  —  name_uz/name_tr дублируют name_ru / name_en
const CATEGORIES = [
  // ── ЗАВТРАКИ ─────────────────────────────────────────────────────────────
  {
    label_ru: 'Блюда из яиц',
    label_uz: 'Tuxum taomlar',
    label_en: 'Egg Dishes',
    label_tr: 'Yumurta Yemekleri',
    tab: 'food',
    dishes: [
      ['Классический омлет', 'Plain Omelette', 52000],
      ['Менемен в сковороде', 'Menemen in Pan', 74000],
      ['Омлет с грибами', 'Mushroom Omelette', 75000],
      ['Омлет с зеленью', 'Herb Omelette', 78000],
      ['Омлет с паст. и суджуком', 'Omelette with Pastrami & Sucuk', 86000],
      ['Смешанный омлет', 'Mixed Omelette', 75000],
      ['Чакалли менемен в сковороде', 'Çakallı Menemen in Pan', 78000],
      ['Яичница-глазунья', 'Sunny Side Up Eggs', 49000],
    ],
  },
  {
    label_ru: 'Буреки',
    label_uz: 'Byoreklar',
    label_en: 'Böreks',
    label_tr: 'Börekler',
    tab: 'food',
    dishes: [
      ['Ачма с брынзой', 'Açma with White Cheese', 20000],
      ['Бёрек с картофелем', 'Potato Börek', 64000],
      ['Бёрек с сыром', 'Cheese Börek', 86000],
      ['Бёрек с фаршем', 'Minced Meat Börek', 78000],
      ['Бёрек со шпинатом', 'Spinach Börek', 64000],
      ['Сигара-бёрек', 'Cigarette Börek', 78000],
    ],
  },
  {
    label_ru: 'Завтрак для одного',
    label_uz: 'Bitta uchun nonushta',
    label_en: 'Breakfast for One',
    label_tr: 'Tek Kişilik Kahvaltı',
    tab: 'food',
    dishes: [
      ['Быстрый завтрак', 'Quick Breakfast', 115000],
      ['Деревенский завтрак MADO', 'MADO Village Breakfast', 179000],
      ['Завтрак с бёреком', 'Börek Breakfast', 129000],
      ['Завтрак с круассаном', 'Croissant Breakfast', 125000],
      ['Мой завтрак', 'My Breakfast', 149000],
    ],
  },
  {
    label_ru: 'Завтраки на двоих',
    label_uz: 'Ikki kishi uchun nonushta',
    label_en: 'Breakfast for Two',
    label_tr: 'İki Kişilik Kahvaltı',
    tab: 'food',
    dishes: [
      ['Завтрак микс', 'Mixed Breakfast', 359000],
      ['Завтрак на подносе', 'Breakfast Tray', 261000],
      ['Завтрак на подносе с жареным мясом', 'Kavurmalı Breakfast Tray', 248000],
      ['Поднос для завтрака с менеменом', 'Menemenli Breakfast Tray', 227000],
    ],
  },
  {
    label_ru: 'Тосты',
    label_uz: 'Tostlar',
    label_en: 'Toasts',
    label_tr: 'Toastlar',
    tab: 'food',
    dishes: [
      ['Тост с белым сыром', 'White Cheese Toast', 85000],
      ['Тост с двойным сыром', 'Double Cheese Toast', 75000],
      ['Тост с суджуком и кашаром', 'Sucuk & Kaşar Toast', 89000],
    ],
  },

  // ── ЗАКУСКИ И ГАРНИРЫ ─────────────────────────────────────────────────────
  {
    label_ru: 'Закуски и гарниры',
    label_uz: 'Mazali taomlar va garnirlar',
    label_en: 'Appetizers & Sides',
    label_tr: 'Mezeler ve Garnitürler',
    tab: 'food',
    dishes: [
      ['Закусочная тарелка', 'Mixed Appetizer Plate', 143000],
      ['Картофель фри', 'French Fries', 39000],
      ['Картофельное пюре', 'Mashed Potatoes', 39000],
      ['Отварной рис', 'Boiled Rice', 39000],
      ['Рис', 'Rice', 25000],
      ['Хрустящие куриные палочки', 'Crispy Chicken Sticks', 85000],
    ],
  },

  // ── ОСНОВНЫЕ БЛЮДА ────────────────────────────────────────────────────────
  {
    label_ru: 'Блюдо от шефа',
    label_uz: 'Oshpaz tavsiyasi',
    label_en: "Chef's Specials",
    label_tr: 'Şefin Önerileri',
    tab: 'food',
    dishes: [
      ['Антрекот', 'Entrecôte', 229000],
      ['Говяжья вырезка в сливочном масле', 'Beef Tenderloin in Butter', 269000],
      ['Каре из ягнёнка', 'Lamb Chops', 269000],
      ['Кесме кебаб', 'Kesme Kebab', 269000],
    ],
  },
  {
    label_ru: 'Манты',
    label_uz: 'Mantı',
    label_en: 'Manti',
    label_tr: 'Mantı',
    tab: 'food',
    dishes: [
      ['MADO манты', 'MADO Manti', 147000],
      ['Хрустящие манты', 'Crispy Manti', 152000],
    ],
  },
  {
    label_ru: 'Пасты',
    label_uz: 'Pastalar',
    label_en: 'Pastas',
    label_tr: 'Makarnalar',
    tab: 'food',
    dishes: [
      ['Пенне с острым соусом', 'Spicy Sauce Penne', 109000],
      ['Спагетти Болоньезе', 'Spaghetti Bolognese', 122000],
      ['Фетучини с курицей и грибами', 'Chicken Mushroom Fettuccine', 135000],
    ],
  },
  {
    label_ru: 'С курицей',
    label_uz: 'Tovuqli taomlar',
    label_en: 'Chicken Dishes',
    label_tr: 'Tavuklu Yemekler',
    tab: 'food',
    dishes: [
      ['Куриное филе на гриле', 'Grilled Chicken Fillet', 115000],
      ['Куриное филе с соусом Café de Paris', 'Chicken Fillet Café de Paris', 135000],
      ['Куриный шашлык', 'Chicken Skewer', 119000],
      ['Куриный шницель', 'Chicken Schnitzel', 135000],
      ['Курица в соусе карри', 'Chicken in Curry Sauce', 115000],
      ['Курица с баклажанным пюре', 'Chicken with Eggplant Purée', 119000],
      ['Курица с грибами в сливочно-сырном соусе', 'Chicken Mushroom Cream Cheese Sauce', 125000],
      ['Курица с рисом', 'Chicken with Rice', 99000],
      ['Острые куриные бёдра гриль', 'Spicy Grilled Chicken Thighs', 99000],
    ],
  },
  {
    label_ru: 'С мясом',
    label_uz: 'Go\'shtli taomlar',
    label_en: 'Meat Dishes',
    label_tr: 'Etli Yemekler',
    tab: 'food',
    dishes: [
      ['Вырезка с грибным соусом', 'Beef Tenderloin Mushroom Sauce', 179000],
      ['Вырезка с соусом Café de Paris', 'Beef Tenderloin Café de Paris', 169000],
      ['Кебаб с бегенди', 'Kebab with Beğendi', 159000],
      ['Мараш тава', 'Maraş Tava', 169000],
      ['Сач кавурма', 'Saç Kavurma', 159000],
      ['Челтик кебаб', 'Çeltik Kebab', 167000],
      ['Шашлык из говядины', 'Beef Skewer', 189000],
    ],
  },
  {
    label_ru: 'С фрикадельками',
    label_uz: 'Ko\'ftali taomlar',
    label_en: 'Köfte Dishes',
    label_tr: 'Köfteli Yemekler',
    tab: 'food',
    dishes: [
      ['Кёфте на гриле', 'Grilled Köfte', 79000],
      ['Кёфте с бегенди', 'Köfte with Beğendi', 112000],
      ['Кёфте с йогуртовым соусом', 'Köfte with Yogurt Sauce', 99000],
      ['Фрикадельки в соусе демиглас', 'Meatballs in Demi-Glace Sauce', 109000],
      ['Фрикадельки с пюре', 'Meatballs with Mashed Potatoes', 109000],
    ],
  },

  // ── САЛАТЫ ────────────────────────────────────────────────────────────────
  {
    label_ru: 'Салаты',
    label_uz: 'Salat va sovuq maza',
    label_en: 'Salads',
    label_tr: 'Salatalar',
    tab: 'food',
    dishes: [
      ['Греческий салат', 'Greek Salad', 97000],
      ['Здоровый боул', 'Healthy Bowl', 112000],
      ['Салат с авокадо и тулумом', 'Avocado Tulum Salad', 105000],
      ['Салат с баклажанами', 'Eggplant Salad', 146000],
      ['Салат с говядиной и горчичным соусом', 'Warm Beef Salad with Mustard Sauce', 133000],
      ['Салат с киноа', 'Quinoa Salad', 103000],
      ['Салат с рукколой и сыром тулум', 'Arugula and Tulum Cheese Salad', 79000],
      ['Салат с тунцом', 'Tuna Salad', 120000],
      ['Салат с хрустящей курицей', 'Crispy Chicken Salad', 121000],
      ['Салат Чобан', 'Çoban Salad', 74000],
      ['Цезарь с курицей', 'Chicken Caesar Salad', 109000],
    ],
  },

  // ── СВЕЖАЯ ВЫПЕЧКА ────────────────────────────────────────────────────────
  {
    label_ru: 'Свежая выпечка',
    label_uz: 'Yangi pishiriq',
    label_en: 'Fresh Bakery',
    label_tr: 'Taze Fırın Ürünleri',
    tab: 'food',
    dishes: [
      ['Афганская лепёшка', 'Afghan Bread', 40000],
      ['Лепёшка', 'Flatbread', 7000],
      ['Симит', 'Simit', 15000],
    ],
  },

  // ── СУПЫ ─────────────────────────────────────────────────────────────────
  {
    label_ru: 'Супы',
    label_uz: 'Sho\'rvalar',
    label_en: 'Soups',
    label_tr: 'Çorbalar',
    tab: 'food',
    dishes: [
      ['Куриный суп', 'Chicken Soup', 69000],
      ['Суп с языком', 'Tongue Soup', 99000],
      ['Суп Эзогелин', 'Ezogelin Soup', 56000],
      ['Томатный суп', 'Tomato Soup', 63000],
      ['Чечевичный суп', 'Lentil Soup', 56000],
    ],
  },

  // ── ФАСТФУД ───────────────────────────────────────────────────────────────
  {
    label_ru: 'Бургеры',
    label_uz: 'Burgerlar',
    label_en: 'Burgers',
    label_tr: 'Burgerler',
    tab: 'food',
    dishes: [
      ['BBQ бургер', 'BBQ Burger', 115000],
      ['MADO бургер', 'MADO Burger', 125000],
      ['Цезарь бургер', 'Caesar Burger', 119000],
      ['Чеддер бургер', 'Cheddar Burger', 135000],
    ],
  },
  {
    label_ru: 'Дюрюмы',
    label_uz: 'Dyurymlar',
    label_en: 'Wraps',
    label_tr: 'Dürümler',
    tab: 'food',
    dishes: [
      ['Дюрюм с куриным тантуни и йогуртом', 'Chicken Tantuni Yogurt Wrap', 138000],
      ['Дюрюм с курицей MADO', 'MADO Chicken Wrap', 112000],
      ['Дюрюм с мясным тантуни и йогуртом', 'Beef Tantuni Yogurt Wrap', 225000],
      ['Дюрюм с мясом MADO', 'MADO Beef Wrap', 132000],
    ],
  },
  {
    label_ru: 'Пиде',
    label_uz: 'Pideler',
    label_en: 'Pide',
    label_tr: 'Pideler',
    tab: 'food',
    dishes: [
      ['Закрытая пиде с мясом', 'Closed Meat Pide', 129000],
      ['Закрытая пиде с сыром', 'Closed Cheese Pide', 109000],
      ['Лахмаджун', 'Lahmacun', 79000],
      ['Пиде с курицей', 'Chicken Pide', 109000],
      ['Пиде с мясом', 'Diced Meat Pide', 129000],
      ['Пиде с суджуком и кашаром', 'Sucuk & Kashar Pide', 115000],
      ['Пиде с сыром', 'Kashar Cheese Pide', 97000],
    ],
  },
  {
    label_ru: 'Пиццы',
    label_uz: 'Pizzalar',
    label_en: 'Pizzas',
    label_tr: 'Pizzalar',
    tab: 'food',
    dishes: [
      ['Овощная пицца', 'Vegetable Pizza', 109000],
      ['Пицца Ассорти', 'Mixed Pizza', 145000],
      ['Пицца Маргарита', 'Margherita Pizza', 115000],
      ['Пицца Пепперони', 'Pepperoni Pizza', 135000],
      ['Пицца с курицей', 'Chicken Pizza', 119000],
    ],
  },
];

// ─── Exportable function (used by HTTP endpoint) ──────────────────────────────

export async function runSeedKitchen() {
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

const isCli = process.argv[1] && process.argv[1].endsWith('seed-kitchen.js');
if (isCli) {
  console.log('🚀 Загрузка меню кухни...\n');
  runSeedKitchen()
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
