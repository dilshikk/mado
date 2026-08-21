/**
 * seed-beverages.js
 * Заполняет базу категориями и блюдами из меню напитков.
 *
 * CLI:  node server/src/db/seed-beverages.js
 * HTTP: POST /api/dishes/seed-beverages  (только admin)
 *
 * Безопасно: ON CONFLICT DO NOTHING — повторный запуск не дублирует данные.
 */

import pool from './pool.js';

const CATEGORIES = [
  {
    label_ru: 'Вода', label_uz: 'Suv', label_en: 'Water', label_tr: 'Su',
    tab: 'beverage',
    dishes: [
      ['Nov 0.5', 'Nov 0.5', 'Nov 0.5', 'Nov 0.5', 45000],
      ['Блан Блю 0.33', 'Blanc Blue 0.33', 'Blanc Blue 0.33', 'Blanc Blue 0.33', 40000],
      ['Блан Блю 0.5', 'Blanc Blue 0.5', 'Blanc Blue 0.5', 'Blanc Blue 0.5', 50000],
      ['Блан Блю 0.7', 'Blanc Blue 0.7', 'Blanc Blue 0.7', 'Blanc Blue 0.7', 60000],
      ['Чорток Премиум 0.33', 'Chortoq Premium 0.33', 'Chortoq Premium 0.33', 'Chortoq Premium 0.33', 40000],
      ['Чорток Премиум 0.5', 'Chortoq Premium 0.5', 'Chortoq Premium 0.5', 'Chortoq Premium 0.5', 50000],
      ['Чорток Премиум 0.75', 'Chortoq Premium 0.75', 'Chortoq Premium 0.75', 'Chortoq Premium 0.75', 60000],
      ['Чорток Премиум N32 0.5', 'Chortoq Premium N32 0.5', 'Chortoq Premium N32 0.5', 'Chortoq Premium N32 0.5', 50000],
    ],
  },
  {
    label_ru: 'Горячий шоколад', label_uz: 'Issiq shokolad', label_en: 'Hot Chocolate', label_tr: 'Sıcak Çikolata',
    tab: 'beverage',
    dishes: [
      ['Горячий шоколад', 'Issiq shokolad', 'Hot Chocolate', 'Sıcak Çikolata', 55000],
    ],
  },
  {
    label_ru: 'Турецкий кофе', label_uz: 'Turk qahvasi', label_en: 'Turkish Coffee', label_tr: 'Türk Kahvesi',
    tab: 'beverage',
    dishes: [
      ['Двойной турецкий кофе', "Qo'sh turk qahvasi", 'Double Turkish Coffee', 'Çift Türk Kahvesi', 60000],
      ['Кофе Дибек', 'Dibek qahvasi', 'Dibek Coffee', 'Dibek Kahvesi', 60000],
      ['Турецкий кофе', 'Turk qahvasi', 'Turkish Coffee', 'Türk Kahvesi', 45000],
    ],
  },
  {
    label_ru: 'Кофе', label_uz: 'Qahva', label_en: 'Coffee', label_tr: 'Kahve',
    tab: 'beverage',
    dishes: [
      ['Американо', 'Amerikano', 'Americano', 'Americano', 40000],
      ['Двойной американо', "Qo'sh amerikano", 'Double Americano', 'Çift Americano', 59000],
      ['Двойной капучино', "Qo'sh kapuchino", 'Double Cappuccino', 'Çift Cappuccino', 69000],
      ['Двойной эспрессо', "Qo'sh espresso", 'Double Espresso', 'Çift Espresso', 39000],
      ['Имбирный латте', 'Zanjabilli latte', 'Ginger Latte', 'Zencefilli Latte', 63000],
      ['Капучино', 'Kapuchino', 'Cappuccino', 'Cappuccino', 53000],
      ['Карамель Макиато', 'Karamel Makiato', 'Caramel Macchiato', 'Karamel Macchiato', 60000],
      ['Латте', 'Latte', 'Latte', 'Latte', 58000],
      ['Макиато', 'Makiato', 'Macchiato', 'Macchiato', 53000],
      ['Мокко', 'Mokko', 'Mocha', 'Mocha', 58000],
      ['Раф', 'Raf qahvasi', 'Raf Coffee', 'Raf Coffee', 69000],
      ['Уайт Мокко', 'Oq mokko', 'White Mocha', 'Beyaz Mocha', 55000],
      ['Фильтр-кофе', 'Filtr qahvasi', 'Filter Coffee', 'Filtre Kahve', 55000],
      ['Флет Уайт', 'Flat White', 'Flat White', 'Flat White', 63000],
      ['Эспрессо', 'Espresso', 'Espresso', 'Espresso', 28000],
    ],
  },
  {
    label_ru: 'Матча (горячая)', label_uz: 'Matcha (issiq)', label_en: 'Matcha (Hot)', label_tr: 'Matcha (Sıcak)',
    tab: 'beverage',
    dishes: [
      ['Капучино Матча', 'Matcha kapuchino', 'Matcha Cappuccino', 'Matcha Cappuccino', 57000],
    ],
  },
  {
    label_ru: 'Салеп', label_uz: 'Sahlep', label_en: 'Salep', label_tr: 'Sahlep',
    tab: 'beverage',
    dishes: [
      ['Салеп с мороженым', 'Muzqaymoqli sahlep', 'Salep with Ice Cream', 'Dondurmalı Sahlep', 75000],
      ["Традиционный салеп", "An'anaviy sahlep", 'Traditional Salep', 'Geleneksel Sahlep', 60000],
    ],
  },
  {
    label_ru: 'Турецкий чай', label_uz: 'Turk choy', label_en: 'Turkish Tea', label_tr: 'Türk Çayı',
    tab: 'beverage',
    dishes: [
      ['Турецкий чай (Бардак)', 'Turk choy (Stakan)', 'Turkish Tea (Glass)', 'Türk Çayı (Bardak)', 11500],
      ['Турецкий чай (Чайник)', 'Turk choy (Choydish)', 'Turkish Tea (Teapot)', 'Türk Çayı (Çaydanlık)', 85000],
    ],
  },
  {
    label_ru: 'Чай', label_uz: 'Choy', label_en: 'Tea', label_tr: 'Çay',
    tab: 'beverage',
    dishes: [
      ['Гампаудер', 'Gunpowder', 'Gunpowder Tea', 'Gunpowder Çayı', 49000],
      ['Детокс чай', 'Detoks choy', 'Detox Tea', 'Detoks Çayı', 30000],
      ['Жасминовый чай', 'Yasmin choy', 'Jasmine Tea', 'Yasemin Çayı', 59000],
      ['Имбирный чай', 'Zanjabilli choy', 'Ginger Tea', 'Zencefilli Çay', 89000],
      ['Марокканский чай', 'Marokash choy', 'Moroccan Tea', 'Fas Çayı', 79000],
      ['Облепиха-Апельсиновый чай', 'Dengiz qaraqat-apelsin choy', 'Sea Buckthorn-Orange Tea', 'Deniz Üzümü-Portakal Çayı', 89000],
      ['Чай листовый', 'Bargli choy', 'Loose Leaf Tea', 'Yaprak Çay', 34000],
      ['Чай Релакс', 'Relax choy', 'Tea Relax', 'Relax Çayı', 54000],
      ['Чай с лимоном', 'Limonli choy', 'Tea with Lemon', 'Limonlu Çay', 54000],
      ['Чай яблоко с корицей', 'Olma-darchinli choy', 'Apple Cinnamon Tea', 'Elmalı Tarçın Çayı', 59000],
      ['Ягодный чай', 'Mevali choy', 'Berry Tea', 'Meyveli Çay', 89000],
    ],
  },
  {
    label_ru: 'Добавки', label_uz: "Qo'shimchalar", label_en: 'Add-ons', label_tr: 'Ekstralar',
    tab: 'beverage',
    dishes: [
      ['Имбирь', 'Zanjabil', 'Ginger', 'Zencefil', 20000],
      ['Лимон', 'Limon', 'Lemon', 'Limon', 12000],
      ['Мёд 30г', 'Asal 30g', 'Honey 30g', 'Bal 30g', 15000],
      ['Молоко', 'Sut', 'Milk', 'Süt', 12000],
      ['Мята', 'Yalpiz', 'Mint', 'Nane', 10000],
      ['Печенье 1шт', 'Pechene 1 dona', 'Cookie 1 pcs', 'Kurabiye 1 adet', 1000],
      ['Сироп', 'Sirop', 'Syrup', 'Şurup', 12000],
    ],
  },
  {
    label_ru: 'Айран', label_uz: 'Ayron', label_en: 'Ayran', label_tr: 'Ayran',
    tab: 'beverage',
    dishes: [
      ['Айран', 'Ayron', 'Ayran', 'Ayran', 25000],
      ['Айран с мятой', 'Yalpizli ayron', 'Ayran with Mint', 'Nane ile Ayran', 29000],
      ["Айран (Графин)", "Ayron (Ko'za)", 'Ayran (Jug)', 'Ayran (Sürahi)', 85000],
    ],
  },
  {
    label_ru: 'Газированные напитки', label_uz: 'Gazli ichimliklar', label_en: 'Soft Drinks', label_tr: 'Gazlı İçecekler',
    tab: 'beverage',
    dishes: [
      ['Бейпазары', 'Beypazari', 'Beypazari', 'Beypazarı', 30000],
      ['Кока-Кола 0.25', 'Coca-Cola 0.25', 'Coca-Cola 0.25', 'Coca-Cola 0.25', 30000],
      ['Напиток Juss', 'Juss ichimligi', 'Juss Drink', 'Juss İçeceği', 22000],
      ['Ред Булл 0.25', 'Red Bull 0.25', 'Red Bull 0.25', 'Red Bull 0.25', 50000],
      ['Спрайт 0.25', 'Sprite 0.25', 'Sprite 0.25', 'Sprite 0.25', 30000],
      ['Фанта 0.25', 'Fanta 0.25', 'Fanta 0.25', 'Fanta 0.25', 30000],
      ['Черчилль', 'Churchill', 'Churchill', 'Churchill', 35000],
    ],
  },
  {
    label_ru: 'Кофе со льдом', label_uz: 'Muzli qahva', label_en: 'Iced Coffee', label_tr: 'Buzlu Kahve',
    tab: 'beverage',
    dishes: [
      ['Айс американо', 'Muz amerikano', 'Ice Americano', 'Buzlu Americano', 50000],
      ['Айс белый мокко', 'Muz oq mokko', 'Ice White Mocha', 'Buzlu Beyaz Mocha', 63000],
      ['Айс капучино', 'Muz kapuchino', 'Ice Cappuccino', 'Buzlu Cappuccino', 66000],
      ['Айс Карамель Макиато', 'Muz karamel makiato', 'Ice Caramel Macchiato', 'Buzlu Karamel Macchiato', 69000],
      ['Айс латте', 'Muz latte', 'Ice Latte', 'Buzlu Latte', 59000],
      ['Айс мокко', 'Muz mokko', 'Ice Mocha', 'Buzlu Mocha', 63000],
      ['Аффогато', 'Affogato', 'Affogato', 'Affogato', 79000],
      ['Фраппе', 'Frappe', 'Frappe', 'Frappe', 66000],
      ['Фраппучино', 'Frappuccino', 'Frappuccino', 'Frappuccino', 66000],
    ],
  },
  {
    label_ru: 'Лимонады', label_uz: 'Limonadlar', label_en: 'Lemonades', label_tr: 'Limonatalar',
    tab: 'beverage',
    dishes: [
      ['Айс ти', 'Muz choy', 'Ice Tea', 'Buzlu Çay', 0],
      ['Классический лимонад', 'Klassik limonad', 'Classic Lemonade', 'Klasik Limonata', 0],
      ['Клубничный лимонад', 'Qulupnay limonad', 'Strawberry Lemonade', 'Çilekli Limonata', 0],
      ['Клубничный Мохито', 'Qulupnay Mohito', 'Strawberry Mojito', 'Çilekli Mojito', 0],
      ['Лимонад с мятой', 'Yalpizli limonad', 'Mint Lemonade', 'Naneli Limonata', 0],
      ['Манго-Маракуйя', 'Mango-Marakuya', 'Mango & Passion Fruit', 'Mango & Passion Fruit', 0],
      ['Мохито', 'Mohito', 'Mojito', 'Mojito', 0],
      ['Океан', 'Okean', 'Ocean', 'Okyanus', 0],
      ['Тархун', 'Estragon limonadi', 'Tarragon Lemonade', 'Tarhun Limonatası', 0],
      ['Ягодный лимонад', 'Mevali limonad', 'Berry Lemonade', 'Meyveli Limonata', 0],
    ],
  },
  {
    label_ru: 'Матча (холодная)', label_uz: 'Matcha (sovuq)', label_en: 'Matcha (Cold)', label_tr: 'Matcha (Soğuk)',
    tab: 'beverage',
    dishes: [
      ["Голубая матча латте", "Ko'k matcha latte", 'Blue Matcha Latte', 'Mavi Matcha Latte', 60000],
      ['Матча латте', 'Matcha latte', 'Matcha Latte', 'Matcha Latte', 60000],
      ['Розовая матча латте', 'Pushti matcha latte', 'Pink Matcha Latte', 'Pembe Matcha Latte', 60000],
    ],
  },
  {
    label_ru: 'Милкшейки', label_uz: 'Milksheyкlar', label_en: 'Milkshakes', label_tr: "Milkshake'ler",
    tab: 'beverage',
    dishes: [
      ['Банановый милкшейк', 'Bananli milkshake', 'Banana Milkshake', 'Muzlu Milkshake', 70000],
      ["Ежевичный милкшейк", "Ezg'ili milkshake", 'Blackberry Milkshake', 'Böğürtlenli Milkshake', 70000],
      ['Классический милкшейк', 'Klassik milkshake', 'Classic Milkshake', 'Klasik Milkshake', 70000],
      ['Клубничный милкшейк', 'Qulupnay milkshake', 'Strawberry Milkshake', 'Çilekli Milkshake', 70000],
      ['Малиновый милкшейк', 'Malinali milkshake', 'Raspberry Milkshake', 'Ahududulu Milkshake', 70000],
      ['Милкшейк Дыня', 'Qovun milkshake', 'Honeydew Milkshake', 'Kavunlu Milkshake', 70000],
      ['Фисташковый милкшейк', 'Pistali milkshake', 'Pistachio Milkshake', 'Fıstıklı Milkshake', 70000],
      ['Шоколадный милкшейк', 'Shokoladli milkshake', 'Chocolate Milkshake', 'Çikolatalı Milkshake', 70000],
    ],
  },
  {
    label_ru: 'Смузи', label_uz: 'Smuzlar', label_en: 'Smoothies', label_tr: 'Smoothieler',
    tab: 'beverage',
    dishes: [
      ['Лимонный смузи', 'Limonli smuz', 'Lemon Smoothie', 'Limonlu Smoothie', 69000],
      ['Малиновый смузи', 'Malinali smuz', 'Raspberry Smoothie', 'Ahududulu Smoothie', 85000],
      ['Тропический смузи', 'Tropik smuz', 'Tropical Smoothie', 'Tropikal Smoothie', 79000],
    ],
  },
  {
    label_ru: 'Фреши', label_uz: 'Taza sharbatlar', label_en: 'Fresh Juices', label_tr: 'Taze Meyve Suları',
    tab: 'beverage',
    dishes: [
      ['Апельсиновый фреш', 'Apelsin sharbati', 'Fresh Orange Juice', 'Taze Portakal Suyu', 75000],
      ['Витаминный бум', 'Vitamin boom', 'Vitamin Boost', 'Vitamin Boost', 85000],
      ['Доброе утро', 'Xayrli tong', 'Good Morning', 'Günaydın', 85000],
      ['Максимальная сила', 'Maksimal kuch', 'Maximum Power', 'Maksimum Güç', 85000],
      ['Морковный фреш', 'Sabzi sharbati', 'Fresh Carrot Juice', 'Taze Havuç Suyu', 60000],
      ['Энергетический бум', 'Energetik boom', 'Energy Boost', 'Enerji Boost', 85000],
      ['Яблочно-морковный фреш', 'Olma-sabzi sharbati', 'Fresh Apple Carrot Juice', 'Taze Elma Havuç Suyu', 70000],
      ['Яблочный фреш', 'Olma sharbati', 'Fresh Apple Juice', 'Taze Elma Suyu', 65000],
    ],
  },
];

// ─── Exportable function (used by HTTP endpoint) ──────────────────────────────

export async function runSeedBeverages() {
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
          'SELECT id FROM menu_categories WHERE label_ru = $1',
          [cat.label_ru]
        );
        if (existing.rows.length === 0) {
          log.push(`⚠ Пропущено: ${cat.label_ru}`);
          continue;
        }
        categoryId = existing.rows[0].id;
        log.push(`~ Уже есть: ${cat.label_ru} (id=${categoryId})`);
      }

      for (const [pos, dish] of cat.dishes.entries()) {
        const [name_ru, name_uz, name_en, name_tr, price] = dish;
        const status = price === 0 ? 'draft' : 'published';
        await client.query(`
          INSERT INTO dishes (category_id, name_ru, name_uz, name_en, name_tr, price, status, position)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT DO NOTHING
        `, [categoryId, name_ru, name_uz, name_en, name_tr, price, status, pos + 1]);
        totalDishes++;
      }
    }

    return { ok: true, newCategories, totalDishes, log };
  } finally {
    client.release();
  }
}

// ─── CLI entry point ──────────────────────────────────────────────────────────

const isCli = process.argv[1] && process.argv[1].endsWith('seed-beverages.js');
if (isCli) {
  console.log('🚀 Загрузка напитков...\n');
  runSeedBeverages()
    .then(({ newCategories, totalDishes, log }) => {
      log.forEach((l) => console.log(l));
      console.log(`\n✅ Готово! Категорий: ${newCategories}, блюд: ${totalDishes}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Ошибка:', err.message);
      process.exit(1);
    });
}
