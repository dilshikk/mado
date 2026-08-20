import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, IceCreamCone, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage, LANG_OPTIONS, type LangCode } from "@/hooks/use-language.ts";

// ─── Nav labels per language ──────────────────────────────────────────────────

const NAV_LABELS: Record<"ru" | "uz" | "en" | "tr", readonly { label: string; href: string }[]> = {
  ru: [
    { label: "Главная", href: "/" },
    { label: "Наша история", href: "/story" },
    { label: "Меню", href: "/menu" },
    { label: "Кейтеринг", href: "/catering" },
    { label: "Рестораны", href: "/locations" },
    { label: "Отзывы", href: "/reviews" },
    { label: "Карьера", href: "/careers" },
    { label: "Контакты", href: "/contact" },
  ],
  uz: [
    { label: "Bosh sahifa", href: "/" },
    { label: "Bizning tarix", href: "/story" },
    { label: "Menyu", href: "/menu" },
    { label: "Keytering", href: "/catering" },
    { label: "Restoranlar", href: "/locations" },
    { label: "Sharhlar", href: "/reviews" },
    { label: "Karyera", href: "/careers" },
    { label: "Aloqa", href: "/contact" },
  ],
  en: [
    { label: "Home", href: "/" },
    { label: "Our Story", href: "/story" },
    { label: "Menu", href: "/menu" },
    { label: "Catering", href: "/catering" },
    { label: "Locations", href: "/locations" },
    { label: "Reviews", href: "/reviews" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  tr: [
    { label: "Ana Sayfa", href: "/" },
    { label: "Hikayemiz", href: "/story" },
    { label: "Menü", href: "/menu" },
    { label: "Catering", href: "/catering" },
    { label: "Şubelerimiz", href: "/locations" },
    { label: "Yorumlar", href: "/reviews" },
    { label: "Kariyer", href: "/careers" },
    { label: "İletişim", href: "/contact" },
  ],
};

// ─── Language dropdown ─────────────────────────────────────────────────────────

function LanguageDropdown({ align = "right" }: { align?: "left" | "right" }) {
  const { lang, setLang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = LANG_OPTIONS.find((opt) => opt.code === lang) ?? LANG_OPTIONS[0];

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleSelect = (code: LangCode) => {
    setLang(code);
    setMenuOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Выбрать язык"
        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs font-semibold text-foreground/80 transition-colors hover:text-primary"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <ChevronDown className={`size-3.5 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute top-full z-50 mt-2 w-36 overflow-hidden rounded-xl border border-border/60 bg-popover shadow-lg ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => handleSelect(opt.code)}
                className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                  lang === opt.code
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-foreground/80 hover:bg-secondary"
                }`}
              >
                <span>{opt.flag}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { lang } = useLanguage();

  const navLinks = NAV_LABELS[lang];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1140px] items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <IceCreamCone className="size-6 text-primary" />
          <span className="font-serif text-2xl font-bold tracking-wide text-primary">
            MADO
          </span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium tracking-wide text-foreground/80 transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <LanguageDropdown align="right" />
        </div>

        <button
          className="cursor-pointer text-foreground md:hidden"
          aria-label="Открыть меню"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="overflow-hidden border-t border-border/60 md:hidden"
        >
          <nav className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-primary"
              >
                {link.label}
              </a>
            ))}
            {/* Language switcher (mobile) */}
            <div className="mt-2 px-1">
              <LanguageDropdown align="left" />
            </div>
          </nav>
        </motion.div>
      )}
    </header>
  );
}
