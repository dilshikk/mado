import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, AlertCircle, Loader2, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";
import ImageUploadCrop from "@/components/image-upload-crop.tsx";

type Category = {
  id: string | number;
  label: string;
  label_ru: string | null;
  label_uz: string | null;
  label_en: string | null;
  label_tr: string | null;
  tab: string;
  image_url: string | null;
  dishCount?: number;
};

type CategoryFormData = {
  label_ru: string;
  label_uz: string;
  label_en: string;
  label_tr: string;
  tab: string;
  image_url: string;
};

const TAB_COLORS: Record<string, string> = {
  food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  beverage: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  dessert: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  takeaway: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const TAB_LABELS: Record<string, string> = {
  food: "ЕДА",
  beverage: "НАПИТКИ",
  dessert: "ДЕСЕРТЫ",
  takeaway: "НАВЫНОС",
};

const TABS = ["all", "food", "beverage", "dessert", "takeaway"];

const LANGS = [
  { code: "ru" as const, flag: "🇷🇺", label: "Русский" },
  { code: "uz" as const, flag: "🇺🇿", label: "Ўзбек" },
  { code: "en" as const, flag: "🇬🇧", label: "English" },
  { code: "tr" as const, flag: "🇹🇷", label: "Türkçe" },
];

const DEFAULT_FORM: CategoryFormData = {
  label_ru: "", label_uz: "", label_en: "", label_tr: "", tab: "food", image_url: "",
};

function getDisplayLabel(cat: Category): string {
  return [cat.label_ru, cat.label_uz, cat.label_en, cat.label_tr].find(
    (v): v is string => typeof v === "string" && v.trim() !== ""
  ) ?? cat.label ?? "Без названия";
}

// ─── Category form ─────────────────────────────────────────────────────────────

function CategoryForm({
  initialData, onSubmit, onCancel, saving,
}: {
  initialData?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<CategoryFormData>({ ...DEFAULT_FORM, ...initialData });
  const [activeLang, setActiveLang] = useState<"ru" | "uz" | "en" | "tr">("ru");

  const set = (key: keyof CategoryFormData, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const hasAnyLabel = [form.label_ru, form.label_uz, form.label_en, form.label_tr].some((v) => v.trim() !== "");
  const labelKey = `label_${activeLang}` as keyof CategoryFormData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAnyLabel) { alert("Заполните название хотя бы на одном языке"); return; }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-accent/50 rounded-xl p-4 space-y-4">
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
              activeLang === l.code ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <span>{l.flag}</span> {l.label}
          </button>
        ))}
      </div>

      {/* Name input */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Название категории ({activeLang.toUpperCase()})
        </label>
        <input
          autoFocus
          value={form[labelKey] as string}
          onChange={(e) => set(labelKey, e.target.value)}
          placeholder="например, Салаты"
          disabled={saving}
          className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
      </div>

      {/* Tab selector */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Раздел</label>
        <select
          value={form.tab}
          onChange={(e) => set("tab", e.target.value)}
          disabled={saving}
          className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none disabled:opacity-50"
        >
          {["food", "beverage", "dessert", "takeaway"].map((t) => (
            <option key={t} value={t}>{TAB_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {/* Image upload with crop */}
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Изображение категории</label>
        <ImageUploadCrop
          value={form.image_url}
          onChange={(url) => set("image_url", url)}
          aspect={1}
          disabled={saving}
          previewClass="w-20 h-20"
          label="Выбрать фото"
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

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [savingId, setSavingId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  useEffect(() => { void loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCategories();
      setCategories(Array.isArray(data) ? (data as Category[]) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить категории");
    } finally {
      setLoading(false);
    }
  };

  const filtered = activeTab === "all" ? categories : categories.filter((c) => c.tab === activeTab);

  const grouped = ["food", "beverage", "dessert", "takeaway"].reduce<Record<string, Category[]>>((acc, tab) => {
    acc[tab] = categories.filter((c) => c.tab === tab);
    return acc;
  }, {});

  const handleAdd = async (data: CategoryFormData) => {
    try {
      setSavingId("new");
      await api.createCategory(data);
      setAdding(false);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать категорию");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Удалить категорию? Блюда в этой категории удалены не будут.")) return;
    try {
      setDeletingId(id);
      await api.deleteCategory(id);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить категорию");
    } finally {
      setDeletingId(null);
    }
  };

  const saveEdit = async (id: string | number, data: CategoryFormData) => {
    try {
      setSavingId(id);
      await api.updateCategory(id, data);
      setEditingId(null);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить категорию");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Категории меню</h1>
          <p className="text-sm text-muted-foreground mt-1">{categories.length} категорий</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setAdding(true); }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Добавить категорию
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-700 font-medium">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-sm underline">Закрыть</button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors uppercase",
                  activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {tab === "all" ? "Все" : TAB_LABELS[tab]}
                <span className="ml-1.5 text-xs opacity-70">
                  {tab === "all" ? categories.length : categories.filter((c) => c.tab === tab).length}
                </span>
              </button>
            ))}
          </div>

          {adding && (
            <CategoryForm onSubmit={handleAdd} onCancel={() => setAdding(false)} saving={savingId === "new"} />
          )}

          {activeTab === "all" ? (
            <div className="space-y-4">
              {["food", "beverage", "dessert", "takeaway"].map((tab) => (
                <TabGroup
                  key={tab}
                  tab={tab}
                  categories={grouped[tab]}
                  editingId={editingId}
                  onStartEdit={setEditingId}
                  onSaveEdit={saveEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onDelete={handleDelete}
                  savingId={savingId}
                  deletingId={deletingId}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <CategoryList
                categories={filtered}
                editingId={editingId}
                onStartEdit={setEditingId}
                onSaveEdit={saveEdit}
                onCancelEdit={() => setEditingId(null)}
                onDelete={handleDelete}
                savingId={savingId}
                deletingId={deletingId}
              />
            </div>
          )}

          {categories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Нет категорий. Создайте первую!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

type ListProps = {
  categories: Category[];
  editingId: string | number | null;
  onStartEdit: (id: string | number) => void;
  onSaveEdit: (id: string | number, data: CategoryFormData) => void;
  onCancelEdit: () => void;
  onDelete: (id: string | number) => void;
  savingId: string | number | null;
  deletingId: string | number | null;
};

function TabGroup({ tab, categories, ...rest }: { tab: string } & ListProps) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        <span className={cn("text-xs font-bold px-2 py-0.5 rounded", TAB_COLORS[tab])}>{TAB_LABELS[tab]}</span>
        <span className="text-sm text-muted-foreground">{categories.length} категорий</span>
      </button>
      {open && <CategoryList categories={categories} {...rest} />}
    </div>
  );
}

function CategoryList({
  categories, editingId, onStartEdit, onSaveEdit, onCancelEdit, onDelete, savingId, deletingId,
}: ListProps) {
  return (
    <div className="divide-y divide-border">
      {categories.map((cat) => (
        <div key={cat.id} className="group">
          {editingId === cat.id ? (
            <div className="p-3">
              <CategoryForm
                initialData={{
                  label_ru: cat.label_ru ?? "",
                  label_uz: cat.label_uz ?? "",
                  label_en: cat.label_en ?? "",
                  label_tr: cat.label_tr ?? "",
                  tab: cat.tab,
                  image_url: cat.image_url ?? "",
                }}
                onSubmit={(data) => onSaveEdit(cat.id, data)}
                onCancel={onCancelEdit}
                saving={savingId === cat.id}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30">
              {cat.image_url ? (
                <img src={cat.image_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-border shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <ImageOff className="w-4 h-4 text-muted-foreground/40" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{getDisplayLabel(cat)}</p>
                {typeof cat.dishCount === "number" && (
                  <p className="text-xs text-muted-foreground">{cat.dishCount} блюд</p>
                )}
              </div>
              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded shrink-0", TAB_COLORS[cat.tab])}>
                {TAB_LABELS[cat.tab]}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onStartEdit(cat.id)}
                  disabled={savingId !== null || deletingId !== null}
                  className="p-1.5 rounded hover:bg-muted disabled:opacity-50"
                >
                  <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button
                  onClick={() => onDelete(cat.id)}
                  disabled={deletingId === cat.id || savingId !== null}
                  className="p-1.5 rounded hover:bg-destructive/10 disabled:opacity-50 flex items-center gap-1"
                >
                  {deletingId === cat.id
                    ? <Loader2 className="w-3.5 h-3.5 text-destructive animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      {categories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Нет категорий</p>
        </div>
      )}
    </div>
  );
}
