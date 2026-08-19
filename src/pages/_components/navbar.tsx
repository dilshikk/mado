import { useState } from "react";
import { motion } from "motion/react";
import { Menu, X, IceCreamCone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { toast } from "sonner";
import { useLanguage, LANG_OPTIONS } from "@/hooks/use-language.ts";

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

const ORDER_LABEL: Record<"ru" | "uz" | "en" | "tr", string> = {
  ru: "Заказать",
  uz: "Buyurtma",
  en: "Order",
  tr: "Sipariş",
};

const ORDER_TOAST: Record<"ru" | "uz" | "en" | "tr", { title: string; desc: string }> = {
  ru: { title: "Скоро будет доступно!", desc: "Онлайн-заказ уже в пути." },
  uz: { title: "Tez orada bo'ladi!", desc: "Online buyurtma yo'lda." },
  en: { title: "Coming soon!", desc: "Online ordering is on the way." },
  tr: { title: "Yakında kullanıma açılacak!", desc: "Online sipariş yolda." },
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { lang, setLang } = useLanguage();

  const navLinks = NAV_LABELS[lang];
  const orderLabel = ORDER_LABEL[lang];
  const orderToast = ORDER_TOAST[lang];

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
          {/* Language switcher */}
          <div className="flex items-center gap-1 rounded-full border border-border/60 px-1.5 py-1">
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                onClick={() => setLang(opt.code)}
                className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  lang === opt.code
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Button
            className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => toast(orderToast.title, { description: orderToast.desc })}
          >
            {orderLabel}
          </Button>
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
            <div className="flex gap-2 mt-2 px-1">
              {LANG_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => setLang(opt.code)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    lang === opt.code
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {opt.flag} {opt.label}
                </button>
              ))}
            </div>
            <Button
              className="mt-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                setOpen(false);
                toast(orderToast.title, { description: orderToast.desc });
              }}
            >
              {orderLabel}
            </Button>
          </nav>
        </motion.div>
      )}
    </header>
  );
}
