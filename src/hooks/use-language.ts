import { createContext, useContext } from "react";

// ─── Language code ─────────────────────────────────────────────────────────────
export type LangCode = "ru" | "uz" | "en" | "tr";

export const LANG_OPTIONS: { code: LangCode; label: string; flag: string }[] = [
  { code: "ru", label: "RU", flag: "🇷🇺" },
  { code: "uz", label: "UZ", flag: "🇺🇿" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "tr", label: "TR", flag: "🇹🇷" },
];

// ─── Context ──────────────────────────────────────────────────────────────────
export interface LanguageContextValue {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
}

export const LanguageContext = createContext<LanguageContextValue>({
  lang: "ru",
  setLang: () => {},
});

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
