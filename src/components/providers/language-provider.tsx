import { useState, useEffect, type ReactNode } from "react";
import { LanguageContext, type LangCode } from "@/hooks/use-language.ts";

const STORAGE_KEY = "mado_lang";

function getInitialLang(): LangCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "ru" || stored === "uz" || stored === "en" || stored === "tr") {
      return stored;
    }
  } catch {
    // localStorage may be unavailable
  }
  return "ru";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(getInitialLang);

  const setLang = (newLang: LangCode) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // ignore
    }
  };

  // Sync on mount in case localStorage changed in another tab
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "ru" || stored === "uz" || stored === "en" || stored === "tr") {
      setLangState(stored);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
