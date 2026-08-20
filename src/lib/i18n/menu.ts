import type { LangCode } from "@/hooks/use-language.ts";

export const menuPageText: Record<LangCode, {
  eyebrow: string; title: string;
  allLabel: string; searchPlaceholder: string;
  foundResults: (count: number, query: string) => string;
  noResults: (query: string) => string;
  itemsCount: string;
  signatureBadge: string; newBadge: string; vegBadge: string;
}> = {
  ru: {
    eyebrow: "Аутентичная турецкая кухня",
    title: "Наше меню",
    allLabel: "Все",
    searchPlaceholder: "Поиск по меню...",
    foundResults: (count, query) => `Найдено ${count} результатов для «${query}»`,
    noResults: (query) => `Ничего не найдено по запросу «${query}»`,
    itemsCount: "позиций",
    signatureBadge: "Фирменное",
    newBadge: "Новинка",
    vegBadge: "Вегетарианское",
  },
  uz: {
    eyebrow: "Original turk oshxonasi",
    title: "Bizning menyu",
    allLabel: "Barchasi",
    searchPlaceholder: "Menyu bo'yicha qidirish...",
    foundResults: (count, query) => `«${query}» uchun ${count} natija topildi`,
    noResults: (query) => `«${query}» so'rovi bo'yicha hech narsa topilmadi`,
    itemsCount: "pozitsiya",
    signatureBadge: "Maxsus",
    newBadge: "Yangi",
    vegBadge: "Vegetarian",
  },
  en: {
    eyebrow: "Authentic Turkish Cuisine",
    title: "Our Menu",
    allLabel: "All",
    searchPlaceholder: "Search the menu...",
    foundResults: (count, query) => `Found ${count} results for "${query}"`,
    noResults: (query) => `No results found for "${query}"`,
    itemsCount: "items",
    signatureBadge: "Signature",
    newBadge: "New",
    vegBadge: "Vegetarian",
  },
  tr: {
    eyebrow: "Otantik Türk Mutfağı",
    title: "Menümüz",
    allLabel: "Tümü",
    searchPlaceholder: "Menüde ara...",
    foundResults: (count, query) => `"${query}" için ${count} sonuç bulundu`,
    noResults: (query) => `"${query}" için sonuç bulunamadı`,
    itemsCount: "ürün",
    signatureBadge: "Özel",
    newBadge: "Yeni",
    vegBadge: "Vejetaryen",
  },
};
