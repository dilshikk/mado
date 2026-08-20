import { useState, useEffect, type ReactNode } from "react";
import { LanguageContext, type LangCode } from "@/hooks/use-language.ts";

const STORAGE_KEY = "mado_lang";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // remember guest's choice for 30 days

interface StoredLang {
  lang: LangCode;
  savedAt: number;
}

function isLangCode(value: unknown): value is LangCode {
  return value === "ru" || value === "uz" || value === "en" || value === "tr";
}

function readStoredLang(): LangCode | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredLang>;
    if (!isLangCode(parsed.lang) || typeof parsed.savedAt !== "number") {
      return null;
    }
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.lang;
  } catch {
    return null;
  }
}

function writeStoredLang(lang: LangCode) {
  try {
    const value: StoredLang = { lang, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // localStorage may be unavailable
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => readStoredLang() ?? "ru");

  const setLang = (newLang: LangCode) => {
    setLangState(newLang);
    writeStoredLang(newLang);
  };

  // Sync on mount in case localStorage changed in another tab, and expire old choices
  useEffect(() => {
    const stored = readStoredLang();
    if (stored) {
      setLangState(stored);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
