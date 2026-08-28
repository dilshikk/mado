import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, AlertCircle, Loader2, ImageOff, CornerDownRight, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";
import ImageUploadCrop from "@/components/image-upload-crop.tsx";

type Section = {
  id: number;
  slug: string;
  label: string;
  label_ru: string | null;
  label_uz: string | null;
  label_en: string | null;
  label_tr: string | null;
  position: number;
};

type Category = {
  id: string | number;
  label: string;
  label_ru: string | null;
  label_uz: string | null;
  label_en: string | null;
  label_tr: string | null;
  tab: string;
  section_id: number | null;
  parent_id: number | null;
  image_url: string | null;
  dishCount?: number;
  childCount?: number;
};

type CategoryFormData = {
  label_ru: string;
  label_uz: string;
  label_en: string;
  label_tr: string;
  tab: string;
  section_id: number | null;
  parent_id: number | null;
  image_url: string;
};

const LANGS = [
  { code: "ru" as const, flag: "🇷🇺", label: "Русский" },
  { code: "uz" as const, flag: "🇺🇿", label: "Ўзбек" },
  { code: "en" as const, flag: "🇬🇧", label: "English" },
  { code: "tr" as const, flag: "🇹🇷", label: "Türkçe" },
];

// Category banner: 800×150 px
const CATEGORY_IMG_WIDTH = 800;
const CATEGORY_IMG_HEIGHT = 150;
const CATEGORY_IMG_ASPECT = CATEGORY_IMG_WIDTH / CATEGORY_IMG_HEIGHT;

function getDisplayLabel(cat: { label_ru?: string | null; label_uz?: string | null; label_en?: string | null; label_tr?: string | null; label?: string }): string {
  return [cat.label_ru, cat.label_uz, cat.label_en, cat.label_tr].find(
    (v): v is string => typeof v === "string" && v.trim() !== ""
  ) ?? cat.label ?? "Без названия";
}

const SECTION_COLORS = [
  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
];

function sectionColor(sectionId: number | null, sections: Section[]): string {
  if (sectionId == null) return "bg-muted text-muted-foreground";
  const index = sections.findIndex((s) => s.id === sectionId);
  return SECTION_COLORS[index % SECTION_COLORS.length] ?? "bg-muted text-muted-foreground";
}

/** Read a boolean from localStorage, returning `fallback` if not set. */
function lsGetBool(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === "1";
  } catch {
    return fallback;
  }
}

function lsSetBool(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? "1" : "0");
  } catch {
    // ignore quota errors
  }
}

/** Collect all descendant ids of a category so it (and its subtree) can be excluded as a valid parent choice. */
function collectDescendantIds(categoryId: string | number, categories: Category[]): Set<string | number> {
  const result = new Set<string | number>();
  const queue = [categoryId];
  while (queue.length > 0) {
    const current = queue.shift();
    const children = categories.filter((c) => String(c.parent_id) === String(current));
    for (const child of children) {
      if (!result.has(child.id)) {
        result.add(child.id);
        queue.push(child.id);
      }
    }
  }
  return result;
}

/**
 * Returns the sibling categories for a given category.
 * For root categories (parent_id === null), siblings are other roots in the same section.
 * For child categories, siblings are categories with the same parent_id.
 */
function getCategorySiblings(cat: Category, allCategories: Category[]): Category[] {
  if (cat.parent_id !== null) {
    return allCategories.filter((c) => c.parent_id === cat.parent_id);
  }
  // Root: siblings share the same section
  return allCategories.filter((c) => c.parent_id === null && c.section_id === cat.section_id);
}

// ─── Category form ─────────────────────────────────────────────────────────────

function CategoryForm({
  initialData, sections, categories, editingId, onSubmit, onCancel, saving,
}: {
  initialData?: Partial<CategoryFormData>;
  sections: Section[];
  categories: Category[];
  editingId?: string | number | null;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const defaultForm: CategoryFormData = {
    label_ru: "", label_uz: "", label_en: "", label_tr: "",
    tab: sections[0]?.slug ?? "food",
    section_id: sections[0]?.id ?? null,
    parent_id: null,
    image_url: "",
  };
  const [form, setForm] = useState<CategoryFormData>({ ...defaultForm, ...initialData });
  const [activeLang, setActiveLang] = useState<"ru" | "uz" | "en" | "tr">("ru");

  const set = (key: keyof CategoryFormData, value: string | number | null) => setForm((f) => ({ ...f, [key]: value }));
  const hasAnyLabel = [form.label_ru, form.label_uz, form.label_en, form.label_tr].some((v) => v.trim() !== "");
  const labelKey = `label_${activeLang}` as keyof CategoryFormData;

  const handleSectionChange = (sectionId: number) => {
    const section = sections.find((s) => s.id === sectionId);
    set("section_id", sectionId);
    if (section) set("tab", section.slug);
  };

  // A category can't be its own parent, nor a parent of one of its own descendants (would create a cycle)
  const excludedParentIds = editingId != null
    ? new Set([editingId, ...collectDescendantIds(editingId, categories)])
    : new Set<string | number>();
  const eligibleParents = categories.filter((c) => !excludedParentIds.has(c.id));

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

      {/* Section selector — categories are children of a main menu section */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Раздел</label>
        <select
          value={form.section_id ?? ""}
          onChange={(e) => handleSectionChange(Number(e.target.value))}
          disabled={saving || sections.length === 0}
          className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none disabled:opacity-50"
        >
          {sections.length === 0 && <option value="">Нет разделов</option>}
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{getDisplayLabel(s)}</option>
          ))}
        </select>
      </div>

      {/* Parent category selector — optional, makes this a child/subcategory */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Родительская категория
          <span className="ml-1.5 text-[10px] text-muted-foreground/70">(необязательно — для создания дочерних категорий)</span>
        </label>
        <select
          value={form.parent_id ?? ""}
          onChange={(e) => set("parent_id", e.target.value ? Number(e.target.value) : null)}
          disabled={saving}
          className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none disabled:opacity-50"
        >
          <option value="">Без родителя (основная категория)</option>
          {eligibleParents.map((c) => (
            <option key={c.id} value={c.id}>{getDisplayLabel(c)}</option>
          ))}
        </select>
      </div>

      {/* Image upload with crop — fixed 800×150 px output */}
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">
          Изображение категории
          <span className="ml-1.5 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono">
            {CATEGORY_IMG_WIDTH}×{CATEGORY_IMG_HEIGHT}px
          </span>
        </label>
        <ImageUploadCrop
          value={form.image_url}
          onChange={(url) => set("image_url", url)}
          aspect={CATEGORY_IMG_ASPECT}
          outputWidth={CATEGORY_IMG_WIDTH}
          outputHeight={CATEGORY_IMG_HEIGHT}
          disabled={saving}
          previewClass="w-32 h-6"
          label="Выбрать баннер"
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
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<number | "all">("all");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [savingId, setSavingId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => { void loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [catData, sectionData] = await Promise.all([api.getCategories(), api.getSections()]);
      setCategories(Array.isArray(catData) ? (catData as Category[]) : []);
      setSections(Array.isArray(sectionData) ? (sectionData as Section[]) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить категории");
    } finally {
      setLoading(false);
    }
  };

  // Only top-level categories (no parent) are shown grouped by section.
  // Child categories render nested underneath their parent in CategoryList.
  const topLevelCategories = categories.filter((c) => c.parent_id == null);

  const filtered = activeSectionId === "all" ? topLevelCategories : topLevelCategories.filter((c) => c.section_id === activeSectionId);

  const grouped = sections.reduce<Record<number, Category[]>>((acc, section) => {
    acc[section.id] = topLevelCategories.filter((c) => c.section_id === section.id);
    return acc;
  }, {});
  const unassigned = topLevelCategories.filter((c) => c.section_id == null);

  const handleAdd = async (data: CategoryFormData) => {
    try {
      setSavingId("new");
      await api.createCategory(data);
      setAdding(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать категорию");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Удалить категорию? Блюда в этой категории удалены не будут, а дочерние категории останутся без родителя.")) return;
    try {
      setDeletingId(id);
      await api.deleteCategory(id);
      await loadData();
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
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить категорию");
    } finally {
      setSavingId(null);
    }
  };

  /**
   * Move a category up or down within its sibling group.
   * Optimistically updates local state, then persists to backend.
   */
  const handleMoveCategory = async (id: string | number, direction: -1 | 1) => {
    const cat = categories.find((c) => String(c.id) === String(id));
    if (!cat) return;

    const siblings = getCategorySiblings(cat, categories);
    const sibIdx = siblings.findIndex((c) => String(c.id) === String(id));
    const targetIdx = sibIdx + direction;
    if (targetIdx < 0 || targetIdx >= siblings.length) return;

    // Find the actual positions of these two siblings in the global categories array
    const posA = categories.findIndex((c) => String(c.id) === String(siblings[sibIdx].id));
    const posB = categories.findIndex((c) => String(c.id) === String(siblings[targetIdx].id));
    if (posA === -1 || posB === -1) return;

    // Swap in the global array (optimistic update)
    const newCats = [...categories];
    [newCats[posA], newCats[posB]] = [newCats[posB], newCats[posA]];
    setCategories(newCats);

    try {
      setReordering(true);
      await api.reorderCategories(newCats.map((c) => c.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось изменить порядок");
      await loadData();
    } finally {
      setReordering(false);
    }
  };

  const listProps = {
    allCategories: categories,
    sections,
    editingId,
    onStartEdit: (id: string | number) => { setAdding(false); setEditingId(id); },
    onSaveEdit: saveEdit,
    onCancelEdit: () => setEditingId(null),
    onDelete: handleDelete,
    onMove: handleMoveCategory,
    savingId,
    deletingId,
    reordering,
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
            <button
              onClick={() => setActiveSectionId("all")}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors uppercase",
                activeSectionId === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              Все
              <span className="ml-1.5 text-xs opacity-70">{topLevelCategories.length}</span>
            </button>
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSectionId(s.id)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors uppercase",
                  activeSectionId === s.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {getDisplayLabel(s)}
                <span className="ml-1.5 text-xs opacity-70">{topLevelCategories.filter((c) => c.section_id === s.id).length}</span>
              </button>
            ))}
          </div>

          {sections.length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-700">
                Нет разделов меню. Создайте их на странице «Разделы», чтобы привязывать категории.
              </span>
            </div>
          )}

          {adding && (
            <CategoryForm sections={sections} categories={categories} onSubmit={handleAdd} onCancel={() => setAdding(false)} saving={savingId === "new"} />
          )}

          {activeSectionId === "all" ? (
            <div className="space-y-4">
              {sections.map((section) => (
                <SectionGroup
                  key={section.id}
                  section={section}
                  categories={grouped[section.id] ?? []}
                  {...listProps}
                />
              ))}
              {unassigned.length > 0 && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="px-4 py-3 flex items-center gap-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">БЕЗ РАЗДЕЛА</span>
                    <span className="text-sm text-muted-foreground">{unassigned.length} категорий</span>
                  </div>
                  <CategoryList categories={unassigned} {...listProps} />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <CategoryList categories={filtered} {...listProps} />
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
  allCategories: Category[];
  sections: Section[];
  editingId: string | number | null;
  onStartEdit: (id: string | number) => void;
  onSaveEdit: (id: string | number, data: CategoryFormData) => void;
  onCancelEdit: () => void;
  onDelete: (id: string | number) => void;
  onMove: (id: string | number, direction: -1 | 1) => void;
  savingId: string | number | null;
  deletingId: string | number | null;
  reordering: boolean;
};

function SectionGroup({ section, categories, allCategories, sections, ...rest }: { section: Section } & ListProps) {
  // Persist open/closed state per section id
  const lsKey = `mado_cat_section_open_${section.id}`;
  const [open, setOpen] = useState(() => lsGetBool(lsKey, true));

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      lsSetBool(lsKey, next);
      return next;
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        <span className={cn("text-xs font-bold px-2 py-0.5 rounded uppercase", sectionColor(section.id, sections))}>
          {getDisplayLabel(section)}
        </span>
        <span className="text-sm text-muted-foreground">{categories.length} категорий</span>
      </button>
      {open && <CategoryList categories={categories} allCategories={allCategories} sections={sections} {...rest} />}
    </div>
  );
}

function CategoryList({
  categories, allCategories, sections, editingId, onStartEdit, onSaveEdit, onCancelEdit, onDelete, onMove, savingId, deletingId, reordering,
}: ListProps) {
  return (
    <div className="divide-y divide-border">
      {categories.map((cat) => (
        <CategoryRow
          key={cat.id}
          cat={cat}
          depth={0}
          allCategories={allCategories}
          sections={sections}
          editingId={editingId}
          onStartEdit={onStartEdit}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onDelete={onDelete}
          onMove={onMove}
          savingId={savingId}
          deletingId={deletingId}
          reordering={reordering}
        />
      ))}
      {categories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Нет категорий</p>
        </div>
      )}
    </div>
  );
}

function CategoryRow({
  cat, depth, allCategories, sections, editingId, onStartEdit, onSaveEdit, onCancelEdit, onDelete, onMove, savingId, deletingId, reordering,
}: {
  cat: Category;
  depth: number;
} & Omit<ListProps, "categories">) {
  // Persist open/closed state per category id
  const lsKey = `mado_cat_children_open_${cat.id}`;
  const [childrenOpen, setChildrenOpen] = useState(() => lsGetBool(lsKey, true));
  const children = allCategories.filter((c) => c.parent_id === cat.id);

  const toggleChildren = () => {
    setChildrenOpen((prev) => {
      const next = !prev;
      lsSetBool(lsKey, next);
      return next;
    });
  };

  // Determine position among siblings for disabling ↑↓ buttons
  const siblings = getCategorySiblings(cat, allCategories);
  const sibIdx = siblings.findIndex((c) => String(c.id) === String(cat.id));
  const isFirst = sibIdx === 0;
  const isLast = sibIdx === siblings.length - 1;
  const isBusy = savingId !== null || deletingId !== null || reordering;

  return (
    <>
      {editingId === cat.id ? (
        <div className="p-3" style={{ paddingLeft: `${12 + depth * 20}px` }}>
          <CategoryForm
            sections={sections}
            categories={allCategories}
            editingId={cat.id}
            initialData={{
              label_ru: cat.label_ru ?? "",
              label_uz: cat.label_uz ?? "",
              label_en: cat.label_en ?? "",
              label_tr: cat.label_tr ?? "",
              tab: cat.tab,
              section_id: cat.section_id,
              parent_id: cat.parent_id,
              image_url: cat.image_url ?? "",
            }}
            onSubmit={(data) => onSaveEdit(cat.id, data)}
            onCancel={onCancelEdit}
            saving={savingId === cat.id}
          />
        </div>
      ) : (
        <div
          className="group flex items-center gap-3 px-4 py-3 hover:bg-muted/30"
          style={{ paddingLeft: `${16 + depth * 20}px` }}
        >
          {depth > 0 && <CornerDownRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />}
          {children.length > 0 && (
            <button
              onClick={toggleChildren}
              className="p-0.5 rounded hover:bg-muted shrink-0"
              title={childrenOpen ? "Свернуть" : "Развернуть"}
            >
              {childrenOpen ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          )}
          {cat.image_url ? (
            <img
              src={cat.image_url}
              alt=""
              className="w-20 h-[15px] rounded object-cover border border-border shrink-0"
            />
          ) : (
            <div className="w-20 h-[15px] rounded bg-muted flex items-center justify-center shrink-0">
              <ImageOff className="w-3 h-3 text-muted-foreground/40" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{getDisplayLabel(cat)}</p>
            <p className="text-xs text-muted-foreground">
              {typeof cat.dishCount === "number" && cat.dishCount > 0 && `${cat.dishCount} блюд`}
              {typeof cat.dishCount === "number" && cat.dishCount > 0 && children.length > 0 && " · "}
              {children.length > 0 && `${children.length} дочерних категорий`}
            </p>
          </div>
          {depth === 0 && (
            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 uppercase", sectionColor(cat.section_id, sections))}>
              {cat.section_id != null
                ? getDisplayLabel(sections.find((s) => s.id === cat.section_id) ?? {})
                : "БЕЗ РАЗДЕЛА"}
            </span>
          )}

          {/* Reorder buttons — always visible for discoverability */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => onMove(cat.id, -1)}
              disabled={isFirst || isBusy}
              className="p-1.5 rounded hover:bg-muted disabled:opacity-30 transition-opacity"
              title="Переместить выше"
            >
              <ArrowUp className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={() => onMove(cat.id, 1)}
              disabled={isLast || isBusy}
              className="p-1.5 rounded hover:bg-muted disabled:opacity-30 transition-opacity"
              title="Переместить ниже"
            >
              <ArrowDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onStartEdit(cat.id)}
              disabled={isBusy}
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
      {childrenOpen && children.map((child) => (
        <CategoryRow
          key={child.id}
          cat={child}
          depth={depth + 1}
          allCategories={allCategories}
          sections={sections}
          editingId={editingId}
          onStartEdit={onStartEdit}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onDelete={onDelete}
          onMove={onMove}
          savingId={savingId}
          deletingId={deletingId}
          reordering={reordering}
        />
      ))}
    </>
  );
}
