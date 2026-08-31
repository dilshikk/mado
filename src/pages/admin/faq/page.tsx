import { useState, useEffect } from "react";
import {
  Plus, Edit2, Trash2, ChevronDown, ChevronRight, Search, Loader2, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";

// ─── Types ────────────────────────────────────────────────────────────────────

type LangCode = "ru" | "uz" | "en" | "tr";

type FaqItem = {
  id: number;
  category: string;
  question_ru: string | null;
  question_uz: string | null;
  question_en: string | null;
  question_tr: string | null;
  answer_ru: string | null;
  answer_uz: string | null;
  answer_en: string | null;
  answer_tr: string | null;
  position?: number;
};

type FaqFormData = {
  category: string;
  question_ru: string;
  question_uz: string;
  question_en: string;
  question_tr: string;
  answer_ru: string;
  answer_uz: string;
  answer_en: string;
  answer_tr: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGS: { code: LangCode; flag: string; label: string }[] = [
  { code: "ru", flag: "🇷🇺", label: "Русский" },
  { code: "uz", flag: "🇺🇿", label: "Ўзбек" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "tr", flag: "🇹🇷", label: "Türkçe" },
];

const CATEGORIES = ["General", "Catering", "Menu", "Careers"] as const;
type FaqCategory = (typeof CATEGORIES)[number];

const CAT_COLORS: Record<FaqCategory, string> = {
  General: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  Catering: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  Menu: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  Careers: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
};

const EMPTY_FORM: FaqFormData = {
  category: "General",
  question_ru: "", question_uz: "", question_en: "", question_tr: "",
  answer_ru: "", answer_uz: "", answer_en: "", answer_tr: "",
};

// ─── FAQ Form ─────────────────────────────────────────────────────────────────

function FaqForm({
  initial,
  onSubmit,
  onCancel,
  saving,
}: {
  initial?: Partial<FaqFormData>;
  onSubmit: (data: FaqFormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FaqFormData>({ ...EMPTY_FORM, ...initial });
  const [activeLang, setActiveLang] = useState<LangCode>("ru");

  const set = (key: keyof FaqFormData, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const qKey = `question_${activeLang}` as keyof FaqFormData;
  const aKey = `answer_${activeLang}` as keyof FaqFormData;

  const hasQuestion = LANGS.some((l) => (form[`question_${l.code}` as keyof FaqFormData] as string).trim() !== "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasQuestion) {
      alert("Введите вопрос хотя бы на одном языке");
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-accent/50 rounded-xl p-4 space-y-4">
      {/* Category */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Категория</label>
        <select
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          disabled={saving}
          className="px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none disabled:opacity-50"
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Language tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {LANGS.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setActiveLang(l.code)}
            disabled={saving}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
              activeLang === l.code
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <span>{l.flag}</span> {l.label}
            {(form[`question_${l.code}` as keyof FaqFormData] as string).trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Question */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Вопрос ({activeLang.toUpperCase()})
        </label>
        <input
          autoFocus
          value={form[qKey] as string}
          onChange={(e) => set(qKey, e.target.value)}
          placeholder="например, Есть ли у вас парковка?"
          disabled={saving}
          className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
      </div>

      {/* Answer */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Ответ ({activeLang.toUpperCase()})
        </label>
        <textarea
          rows={4}
          value={form[aKey] as string}
          onChange={(e) => set(aKey, e.target.value)}
          placeholder="Напишите ответ..."
          disabled={saving}
          className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <Loader2 className="w-3 h-3 animate-spin" />}
          Сохранить
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm disabled:opacity-50"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | "new" | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [catFilter, setCatFilter] = useState<"all" | FaqCategory>("all");
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<FaqCategory>>(new Set(CATEGORIES));

  useEffect(() => { void loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getFaqItems();
      setItems(Array.isArray(data) ? (data as FaqItem[]) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить FAQ");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (data: FaqFormData) => {
    try {
      setSavingId("new");
      await api.createFaqItem(data as unknown as Record<string, unknown>);
      setAdding(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать вопрос");
    } finally {
      setSavingId(null);
    }
  };

  const handleEdit = async (id: number, data: FaqFormData) => {
    try {
      setSavingId(id);
      await api.updateFaqItem(id, data as unknown as Record<string, unknown>);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить вопрос");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить этот вопрос?")) return;
    try {
      setDeletingId(id);
      await api.deleteFaqItem(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить вопрос");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleCat = (cat: FaqCategory) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const filtered = items.filter((i) => {
    const matchCat = catFilter === "all" || i.category === catFilter;
    const q = search.toLowerCase();
    if (!q) return matchCat;
    const searchIn = [
      i.question_ru, i.question_uz, i.question_en, i.question_tr,
      i.answer_ru, i.answer_uz, i.answer_en, i.answer_tr,
    ].join(" ").toLowerCase();
    return matchCat && searchIn.includes(q);
  });

  const grouped = CATEGORIES.reduce<Record<FaqCategory, FaqItem[]>>((acc, cat) => {
    acc[cat] = filtered.filter((i) => i.category === cat);
    return acc;
  }, { General: [], Catering: [], Menu: [], Careers: [] });

  const isBusy = savingId !== null || deletingId !== null;

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">FAQ</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Загрузка..." : `${items.length} вопросов в ${CATEGORIES.length} категориях`}
          </p>
        </div>
        <button
          onClick={() => { setEditingId(null); setAdding(true); }}
          disabled={loading || isBusy}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Добавить вопрос
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="text-sm text-red-700 font-medium">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-sm underline shrink-0">Закрыть</button>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск на всех языках..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCatFilter("all")}
            className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", catFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}
          >
            Все
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", catFilter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {adding && (
        <FaqForm
          onSubmit={handleAdd}
          onCancel={() => setAdding(false)}
          saving={savingId === "new"}
        />
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const catItems = grouped[cat];
            if (catItems.length === 0 && catFilter !== "all" && catFilter !== cat) return null;
            const isOpen = expandedCats.has(cat);
            return (
              <div key={cat} className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleCat(cat)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  {isOpen
                    ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  <span className={cn("text-xs font-bold px-2 py-0.5 rounded", CAT_COLORS[cat])}>
                    {cat}
                  </span>
                  <span className="text-sm text-muted-foreground">{catItems.length} вопросов</span>
                </button>

                {isOpen && (
                  <div className="divide-y divide-border border-t border-border">
                    {catItems.map((item) => (
                      <div key={item.id} className="group">
                        {editingId === item.id ? (
                          <div className="p-4 bg-muted/20">
                            <FaqForm
                              initial={{
                                category: item.category,
                                question_ru: item.question_ru ?? "",
                                question_uz: item.question_uz ?? "",
                                question_en: item.question_en ?? "",
                                question_tr: item.question_tr ?? "",
                                answer_ru: item.answer_ru ?? "",
                                answer_uz: item.answer_uz ?? "",
                                answer_en: item.answer_en ?? "",
                                answer_tr: item.answer_tr ?? "",
                              }}
                              onSubmit={(data) => { void handleEdit(item.id, data); }}
                              onCancel={() => setEditingId(null)}
                              saving={savingId === item.id}
                            />
                          </div>
                        ) : (
                          <div className="flex items-start gap-3 px-4 py-4 hover:bg-muted/20">
                            <div className="flex-1 min-w-0">
                              <div className="space-y-2">
                                {LANGS.map((l) => {
                                  const q = item[`question_${l.code}` as keyof FaqItem] as string | null;
                                  const a = item[`answer_${l.code}` as keyof FaqItem] as string | null;
                                  if (!q?.trim() && !a?.trim()) return null;
                                  return (
                                    <div key={l.code}>
                                      <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-0.5">
                                        {l.flag} {l.label}
                                      </p>
                                      {q?.trim() && (
                                        <p className="text-sm font-semibold text-foreground leading-snug">{q}</p>
                                      )}
                                      {a?.trim() && (
                                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{a}</p>
                                      )}
                                    </div>
                                  );
                                })}
                                {!LANGS.some((l) => (item[`question_${l.code}` as keyof FaqItem] as string | null)?.trim()) && (
                                  <p className="text-sm text-muted-foreground italic">Нет текста</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                              <button
                                onClick={() => { setAdding(false); setEditingId(item.id); }}
                                disabled={isBusy}
                                className="p-1.5 rounded hover:bg-muted disabled:opacity-50"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                              <button
                                onClick={() => { void handleDelete(item.id); }}
                                disabled={deletingId === item.id || savingId !== null}
                                className="p-1.5 rounded hover:bg-destructive/10 disabled:opacity-50"
                              >
                                {deletingId === item.id
                                  ? <Loader2 className="w-3.5 h-3.5 text-destructive animate-spin" />
                                  : <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {catItems.length === 0 && (
                      <div className="text-center py-6 text-xs text-muted-foreground">Нет вопросов</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Нет вопросов. Добавьте первый!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
