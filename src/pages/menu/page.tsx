import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Search, Leaf, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import Navbar from "../_components/navbar.tsx";
import Footer from "../_components/footer.tsx";
import { MENU_CATEGORIES, TABS } from "./data.ts";
import type { Dish, TabId } from "./data.ts";
import PageMeta from "@/components/page-meta.tsx";
import { useLanguage } from "@/hooks/use-language.ts";
import { menuPageText } from "@/lib/i18n/menu.ts";
import type { LangCode } from "@/hooks/use-language.ts";

function DishCard({ dish, index, lang, t }: { dish: Dish; index: number; lang: LangCode; t: typeof menuPageText[LangCode] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className="group overflow-hidden rounded-lg border border-border/60 bg-background shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="overflow-hidden">
        <img
          src={dish.image}
          alt={dish.name[lang]}
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-serif text-base font-bold leading-tight text-foreground">
            {dish.name[lang]}
          </h4>
          <span className="shrink-0 text-sm font-semibold text-accent">
            {dish.price}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {dish.description[lang]}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {dish.isSignature && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
              <Star className="size-2.5" />
              {t.signatureBadge}
            </span>
          )}
          {dish.isNew && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              <Sparkles className="size-2.5" />
              {t.newBadge}
            </span>
          )}
          {dish.isVeg && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <Leaf className="size-2.5" />
              {t.vegBadge}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState<TabId>("food");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { lang } = useLanguage();
  const t = menuPageText[lang];

  const tabCategories = useMemo(
    () => MENU_CATEGORIES.filter((c) => c.tab === activeTab),
    [activeTab],
  );

  const activeCategoryData = useMemo(
    () => tabCategories.find((c) => c.id === activeCategory) ?? null,
    [tabCategories, activeCategory],
  );

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return MENU_CATEGORIES.flatMap((cat) =>
      cat.dishes
        .filter(
          (d) =>
            d.name[lang].toLowerCase().includes(q) ||
            d.description[lang].toLowerCase().includes(q),
        )
        .map((d) => ({ dish: d, categoryLabel: cat.label[lang] })),
    );
  }, [search, lang]);

  const isSearching = search.trim().length > 0;

  const displayCategories = useMemo(() => {
    if (isSearching) return [];
    if (activeCategoryData) return [activeCategoryData];
    return tabCategories;
  }, [isSearching, activeCategoryData, tabCategories]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setActiveCategory(null);
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-background">
      <PageMeta slug="menu" lang={lang} />
      <Navbar />

      {/* Hero */}
      <section
        className="relative flex h-[240px] items-center justify-center overflow-hidden bg-primary bg-cover bg-center sm:h-[320px]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80)",
        }}
      >
        <div className="absolute inset-0 bg-primary/75" />
        <div className="relative z-10 max-w-2xl px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-xs font-semibold tracking-[0.3em] text-accent uppercase"
          >
            {t.eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
            className="mt-3 text-balance font-serif text-4xl font-bold text-primary-foreground sm:text-5xl"
          >
            {t.title}
          </motion.h1>
        </div>
      </section>

      {/* Sticky navigation: tabs + category pills */}
      <div className="sticky top-[57px] z-40 border-b border-border/60 bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-[1140px] px-6">
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "relative shrink-0 cursor-pointer px-5 py-4 text-sm font-semibold tracking-wide transition-colors",
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-foreground/60 hover:text-foreground",
                )}
              >
                {tab.label[lang].toUpperCase()}
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-border/40 bg-secondary/40">
          <div className="mx-auto max-w-[1140px] px-6">
            <div className="flex gap-2 overflow-x-auto py-2.5">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={cn(
                  "shrink-0 cursor-pointer rounded-full border px-3.5 py-1 text-xs font-medium transition-all",
                  activeCategory === null
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/60 bg-background text-foreground/70 hover:bg-secondary hover:text-foreground",
                )}
              >
                {t.allLabel}
              </button>
              {tabCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setActiveCategory((prev) =>
                      prev === cat.id ? null : cat.id,
                    )
                  }
                  className={cn(
                    "shrink-0 cursor-pointer rounded-full border px-3.5 py-1 text-xs font-medium transition-all",
                    activeCategory === cat.id
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-border/60 bg-background text-foreground/70 hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {cat.label[lang]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-secondary/40 py-4">
        <div className="mx-auto max-w-[1140px] px-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-lg border border-border/60 bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30"
            />
          </div>
        </div>
      </div>

      {/* Search results */}
      {isSearching && (
        <section className="bg-background py-12">
          <div className="mx-auto max-w-[1140px] px-6">
            <p className="mb-6 text-sm text-muted-foreground">
              {searchResults.length > 0
                ? t.foundResults(searchResults.length, search)
                : t.noResults(search)}
            </p>
            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {searchResults.map(({ dish, categoryLabel }, i) => (
                  <div key={`${dish.name[lang]}-${i}`} className="relative">
                    <DishCard dish={dish} index={i} lang={lang} t={t} />
                    <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-foreground/70 backdrop-blur-sm">
                      {categoryLabel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories */}
      {!isSearching && (
        <div className="bg-background">
          {displayCategories.map((cat, catIdx) => (
            <section
              key={cat.id}
              className={cn(
                "py-12 sm:py-16",
                catIdx % 2 === 0 ? "bg-background" : "bg-secondary/30",
              )}
            >
              <div className="mx-auto max-w-[1140px] px-6">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="mb-8"
                >
                  <div className="overflow-hidden rounded-xl">
                    <img
                      src={cat.image}
                      alt={cat.label[lang]}
                      className="h-[180px] w-full object-cover sm:h-[240px]"
                    />
                  </div>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">
                        {TABS.find((tb) => tb.id === cat.tab)?.label[lang]}
                      </p>
                      <h2 className="mt-1 font-serif text-2xl font-bold text-primary sm:text-3xl">
                        {cat.label[lang]}
                      </h2>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {cat.dishes.length} {t.itemsCount}
                    </span>
                  </div>
                </motion.div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {cat.dishes.map((dish, dishIdx) => (
                    <DishCard key={dish.name[lang]} dish={dish} index={dishIdx} lang={lang} t={t} />
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
}
