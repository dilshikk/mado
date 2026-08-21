import type { LangCode } from "@/hooks/use-language.ts";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  { id: "food",     label: { ru: "Еда",     uz: "Taomlar",      en: "Food",      tr: "Yemekler"   } },
  { id: "beverage", label: { ru: "Напитки", uz: "Ichimliklar",   en: "Beverages", tr: "İçecekler"  } },
  { id: "dessert",  label: { ru: "Десерты", uz: "Shirinliklar",  en: "Desserts",  tr: "Tatlılar"   } },
  { id: "takeaway", label: { ru: "С собой", uz: "Olib ketish",   en: "Takeaway",  tr: "Paket"      } },
];

// NOTE: Mock data removed. Menu is now served from the real database via the API.
// Use publicApi.getCategories() and publicApi.getDishes() (see src/lib/public-api.ts).
