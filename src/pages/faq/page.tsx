import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils.ts";
import Navbar from "../_components/navbar.tsx";
import Footer from "../_components/footer.tsx";
import { useLanguage } from "@/hooks/use-language.ts";
import type { LangCode } from "@/hooks/use-language.ts";
import { publicApi } from "@/lib/public-api.ts";
import type { PublicFaqItem } from "@/lib/public-api.ts";

// ─── i18n ─────────────────────────────────────────────────────────────────────

const TEXT = {
  ru: {
    eyebrow: "Часто задаваемые вопросы",
    title: "FAQ",
    subtitle: "Ответы на популярные вопросы о MADO Tashkent",
    allLabel: "Все",
    empty: "Нет вопросов в этой категории.",
    errorText: "Не удалось загрузить FAQ. Попробуйте позже.",
  },
  uz: {
    eyebrow: "Ko'p so'raladigan savollar",
    title: "FAQ",
    subtitle: "MADO Tashkent haqida eng ko'p beriladigan savollarga javoblar",
    allLabel: "Barchasi",
    empty: "Bu bo'limda savollar yo'q.",
    errorText: "FAQ yuklanmadi. Keyinroq urinib ko'ring.",
  },
  en: {
    eyebrow: "Frequently Asked Questions",
    title: "FAQ",
    subtitle: "Answers to the most common questions about MADO Tashkent",
    allLabel: "All",
    empty: "No questions in this category.",
    errorText: "Failed to load FAQ. Please try again later.",
  },
  tr: {
    eyebrow: "Sıkça Sorulan Sorular",
    title: "SSS",
    subtitle: "MADO Tashkent hakkında en çok sorulan soruların cevapları",
    allLabel: "Tümü",
    empty: "Bu kategoride soru bulunmuyor.",
    errorText: "SSS yüklenemedi. Lütfen daha sonra tekrar deneyin.",
  },
} satisfies Record<LangCode, { eyebrow: string; title: string; subtitle: string; allLabel: string; empty: string; errorText: string }>;

const CAT_LABELS: Record<string, Record<LangCode, string>> = {
  General:  { ru: "Общие",    uz: "Umumiy",    en: "General",  tr: "Genel"   },
  Catering: { ru: "Кейтеринг", uz: "Keytering", en: "Catering", tr: "Catering" },
  Menu:     { ru: "Меню",     uz: "Menyu",     en: "Menu",     tr: "Menü"    },
  Careers:  { ru: "Карьера",  uz: "Karyera",   en: "Careers",  tr: "Kariyer" },
};

const CATEGORY_ORDER = ["General", "Catering", "Menu", "Careers"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLocalizedText(
  ru: string | null,
  uz: string | null,
  en: string | null,
  tr: string | null,
  lang: LangCode,
): string {
  const map: Record<LangCode, string | null> = { ru, uz, en, tr };
  return map[lang]?.trim() || ru?.trim() || uz?.trim() || en?.trim() || tr?.trim() || "";
}

// ─── Single accordion item ────────────────────────────────────────────────────

function FaqAccordionItem({ item, lang }: { item: PublicFaqItem; lang: LangCode }) {
  const [open, setOpen] = useState(false);

  const question = getLocalizedText(
    item.question_ru, item.question_uz, item.question_en, item.question_tr, lang,
  );
  const answer = getLocalizedText(
    item.answer_ru, item.answer_uz, item.answer_en, item.answer_tr, lang,
  );

  if (!question) return null;

  return (
    <div className="border-b border-border/60 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 py-5 text-left transition-colors hover:text-primary"
      >
        <span className="text-base font-semibold text-foreground leading-snug">{question}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" as const }}
          className="mt-0.5 shrink-0 text-muted-foreground"
        >
          <ChevronDown className="size-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && answer && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" as const }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FaqPublicPage() {
  const { lang } = useLanguage();
  const t = TEXT[lang];
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data: allItems = [], isLoading, isError } = useQuery({
    queryKey: ["public-faq"],
    queryFn: () => publicApi.getFaq(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Determine categories present in data (keep canonical order)
  const presentCategories = useMemo(() => {
    const inData = new Set(allItems.map((i) => i.category));
    return CATEGORY_ORDER.filter((c) => inData.has(c));
  }, [allItems]);

  const filtered = useMemo(
    () => activeCategory === "all" ? allItems : allItems.filter((i) => i.category === activeCategory),
    [allItems, activeCategory],
  );

  // Group by category for display when "all" is active
  const grouped = useMemo(() => {
    if (activeCategory !== "all") return null;
    return CATEGORY_ORDER.reduce<Record<string, PublicFaqItem[]>>((acc, cat) => {
      const items = filtered.filter((i) => i.category === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    }, {});
  }, [activeCategory, filtered]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative flex h-[220px] items-center justify-center overflow-hidden sm:h-[280px]"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-primary/75" />
        <div className="relative z-10 max-w-2xl px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" as const }}
            className="text-xs font-semibold tracking-[0.3em] text-accent uppercase"
          >
            {t.eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" as const, delay: 0.05 }}
            className="mt-3 font-serif text-4xl font-bold text-primary-foreground sm:text-5xl"
          >
            {t.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-3 text-sm text-primary-foreground/80"
          >
            {t.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Category filter */}
      {!isLoading && !isError && presentCategories.length > 0 && (
        <div className="border-b border-border/60 bg-background/95 backdrop-blur-md sticky top-[57px] z-40">
          <div className="mx-auto max-w-3xl px-6">
            <div className="flex gap-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={cn(
                  "relative shrink-0 px-5 py-4 text-sm font-semibold tracking-wide transition-colors",
                  activeCategory === "all" ? "text-primary" : "text-foreground/60 hover:text-foreground",
                )}
              >
                {t.allLabel}
                {activeCategory === "all" && (
                  <motion.span layoutId="faq-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
              {presentCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "relative shrink-0 px-5 py-4 text-sm font-semibold tracking-wide transition-colors",
                    activeCategory === cat ? "text-primary" : "text-foreground/60 hover:text-foreground",
                  )}
                >
                  {(CAT_LABELS[cat]?.[lang]) ?? cat}
                  {activeCategory === cat && (
                    <motion.span layoutId="faq-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <section className="mx-auto max-w-3xl px-6 py-12 sm:py-16">

        {isLoading && (
          <div className="flex justify-center py-24">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && isError && (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <AlertCircle className="size-8 text-destructive" />
            <p className="text-sm text-muted-foreground">{t.errorText}</p>
          </div>
        )}

        {!isLoading && !isError && activeCategory !== "all" && (
          <div className="rounded-2xl border border-border/60 bg-card px-6 shadow-sm">
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">{t.empty}</p>
            ) : (
              filtered.map((item) => (
                <FaqAccordionItem key={item.id} item={item} lang={lang} />
              ))
            )}
          </div>
        )}

        {!isLoading && !isError && activeCategory === "all" && grouped && (
          <div className="space-y-10">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <h2 className="mb-4 font-serif text-xl font-bold text-primary">
                  {(CAT_LABELS[cat]?.[lang]) ?? cat}
                </h2>
                <div className="rounded-2xl border border-border/60 bg-card px-6 shadow-sm">
                  {items.map((item) => (
                    <FaqAccordionItem key={item.id} item={item} lang={lang} />
                  ))}
                </div>
              </div>
            ))}
            {allItems.length === 0 && (
              <p className="py-12 text-center text-sm text-muted-foreground">{t.empty}</p>
            )}
          </div>
        )}

      </section>

      <Footer />
    </div>
  );
}
