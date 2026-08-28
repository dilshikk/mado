import { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus, Edit2, Trash2, Search, Loader2, AlertCircle, X,
  DatabaseZap, UtensilsCrossed, ChevronDown, CheckSquare,
  Square, Eye, EyeOff, Archive, FileText, FolderInput,
  CheckCircle2, ChevronUp, ImageOff, ArrowUp, ArrowDown, Cake, Image,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";
import DishForm from "../../_components/dish-form.tsx";

type DishStatus = "published" | "draft" | "hidden" | "archived";

type Dish = {
  id: string | number;
  category_id: number;
  name_ru: string;
  name_uz: string;
  name_en: string;
  name_tr: string;
  description_ru: string;
  description_uz: string;
  description_en: string;
  description_tr: string;
  price: string | number;
  image_url: string;
  status: DishStatus;
  is_new: boolean;
  is_signature: boolean;
  is_vegetarian: boolean;
  is_spicy: boolean;
};

type Category = {
  id: number;
  label: string;
  label_ru?: string | null;
  label_uz?: string | null;
  label_en?: string | null;
  label_tr?: string | null;
  tab: string;
  parent_id?: number | null;
};

function getCategoryLabel(cat: Category): string {
  return (
    [cat.label_ru, cat.label_uz, cat.label_en, cat.label_tr].find(
      (v): v is string => typeof v === "string" && v.trim() !== ""
    ) ??
    cat.label ??
    "Без названия"
  );
}

/** Collect a category's own id plus every descendant category id (children, grandchildren, ...). */
function collectCategoryAndDescendantIds(categoryId: number, categories: Category[]): Set<number> {
  const result = new Set<number>([categoryId]);
  const queue = [categoryId];
  while (queue.length > 0) {
    const current = queue.shift();
    for (const cat of categories) {
      if (cat.parent_id === current && !result.has(cat.id)) {
        result.add(cat.id);
        queue.push(cat.id);
      }
    }
  }
  return result;
}

/**
 * Returns categories sorted in hierarchical order:
 * each root category is followed immediately by its direct children,
 * so the dropdown reads: Parent → — Child → — Child → Next Parent → …
 */
function getSortedCategories(categories: Category[]): Category[] {
  const roots = categories.filter((c) => c.parent_id == null);
  const result: Category[] = [];
  for (const root of roots) {
    result.push(root);
    for (const child of categories.filter((c) => c.parent_id === root.id)) {
      result.push(child);
    }
  }
  // Append any orphans that didn't match a known root (safety net)
  const inResult = new Set(result.map((c) => c.id));
  for (const cat of categories) {
    if (!inResult.has(cat.id)) result.push(cat);
  }
  return result;
}

const STATUS_META: Record<DishStatus, { label: string; color: string; icon: React.ReactNode }> = {
  published: {
    label: "Опубликовано",
    color: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400",
    icon: <Eye className="w-4 h-4" />,
  },
  draft: {
    label: "Черновик",
    color: "text-yellow-700 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400",
    icon: <FileText className="w-4 h-4" />,
  },
  hidden: {
    label: "Скрыто",
    color: "text-gray-500 bg-gray-100 dark:bg-gray-800",
    icon: <EyeOff className="w-4 h-4" />,
  },
  archived: {
    label: "Архивировано",
    color: "text-red-500 bg-red-50 dark:bg-red-950 dark:text-red-400",
    icon: <Archive className="w-4 h-4" />,
  },
};

const getDishDisplayName = (dish: Dish) => {
  const name = [dish.name_ru, dish.name_uz, dish.name_en, dish.name_tr].find(
    (v) => typeof v === "string" && v.trim() !== ""
  );
  return name?.trim() || "Нет перевода";
};

const getDishTranslationPreview = (dish: Dish) => {
  const values = [dish.name_ru, dish.name_uz, dish.name_en, dish.name_tr].filter(
    (v): v is string => typeof v === "string" && v.trim() !== ""
  );
  return values.length > 0 ? values.slice(0, 3).join(" • ") : "Нет перевода";
};

type SeedResult = { ok: boolean; newCategories: number; totalDishes: number; log: string[] };
type SeedKey = "beverages" | "kitchen" | "desserts";

// ── Dropdown component ────────────────────────────────────────────────────────

type DropdownItem =
  | { type: "item"; label: string; icon?: React.ReactNode; onClick: () => void; danger?: boolean; disabled?: boolean }
  | { type: "separator" }
  | { type: "header"; label: string };

function Dropdown({
  trigger,
  items,
  align = "right",
}: {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute bottom-full mb-1 z-50 min-w-52 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl py-1",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item, i) => {
            if (item.type === "separator") return <div key={i} className="my-1 border-t border-gray-100" />;
            if (item.type === "header")
              return (
                <div key={i} className="sticky top-0 bg-white px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {item.label}
                </div>
              );
            return (
              <button
                key={i}
                disabled={item.disabled}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm transition-colors",
                  item.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-700 hover:bg-gray-50",
                  item.disabled && "opacity-40 cursor-not-allowed pointer-events-none"
                )}
              >
                {item.icon && <span className="flex-shrink-0 text-gray-400">{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Bulk action bar ───────────────────────────────────────────────────────────

function BulkActionBar({
  count,
  total,
  categories,
  onSelectAll,
  onDeselectAll,
  onStatus,
  onMove,
  onDelete,
  loading,
}: {
  count: number;
  total: number;
  categories: Category[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onStatus: (s: DishStatus) => void;
  onMove: (catId: number) => void;
  onDelete: () => void;
  loading: boolean;
}) {
  const statusItems: DropdownItem[] = [
    { type: "header", label: "Изменить статус" },
    { type: "item", label: "Опубликовать", icon: <Eye className="w-4 h-4" />, onClick: () => onStatus("published") },
    { type: "item", label: "В черновик", icon: <FileText className="w-4 h-4" />, onClick: () => onStatus("draft") },
    { type: "item", label: "Скрыть", icon: <EyeOff className="w-4 h-4" />, onClick: () => onStatus("hidden") },
    { type: "item", label: "Архивировать", icon: <Archive className="w-4 h-4" />, onClick: () => onStatus("archived") },
  ];

  const sortedCategories = getSortedCategories(categories);

  const moveItems: DropdownItem[] = [
    { type: "header", label: "Переместить в категорию" },
    ...sortedCategories.map<DropdownItem>((cat) => ({
      type: "item",
      label: (cat.parent_id != null ? "— " : "") + getCategoryLabel(cat),
      onClick: () => onMove(cat.id),
    })),
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-700 animate-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-2 pr-3 border-r border-gray-700">
        <button
          onClick={count === total ? onDeselectAll : onSelectAll}
          className="flex items-center gap-1.5 text-sm font-medium hover:text-gray-300 transition-colors"
          title={count === total ? "Снять выделение" : "Выбрать все"}
        >
          {count === total ? (
            <CheckSquare className="w-4 h-4 text-emerald-400" />
          ) : (
            <Square className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-emerald-400 font-bold">{count}</span>
          <span className="text-gray-400">/ {total}</span>
        </button>
      </div>

      <Dropdown
        align="left"
        trigger={
          <button
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            Статус
            <ChevronUp className="w-3 h-3 text-gray-400" />
          </button>
        }
        items={statusItems}
      />

      <Dropdown
        align="left"
        trigger={
          <button
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <FolderInput className="w-4 h-4 text-amber-400" />
            Переместить
            <ChevronUp className="w-3 h-3 text-gray-400" />
          </button>
        }
        items={moveItems}
      />

      <div className="w-px h-6 bg-gray-700" />

      <button
        disabled={loading}
        onClick={onDelete}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        Удалить
      </button>

      <button
        onClick={onDeselectAll}
        className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
        title="Снять выделение"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [settingDefaultImage, setSettingDefaultImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | DishStatus>("all");
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [savingId, setSavingId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
  const rowMenuRef = useRef<HTMLDivElement>(null);

  const [seeding, setSeeding] = useState<SeedKey | null>(null);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  const [seedLabel, setSeedLabel] = useState("");
  const [showSeedLog, setShowSeedLog] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rowMenuRef.current && !rowMenuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(Array.isArray(data) ? (data as Category[]) : []);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setCategories([]);
    }
  };

  const loadDishes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDishes({});
      setDishes(Array.isArray(data) ? (data as Dish[]) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить блюда");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadDishes();
  }, []);

  const handleSeed = async (key: SeedKey) => {
    const labels: Record<SeedKey, string> = {
      beverages: "напитков (~100 позиций)",
      kitchen: "кухни (~120 позиций)",
      desserts: "десертов (~60 позиций)",
    };
    if (!confirm(`Загрузить меню ${labels[key]}? Повторный запуск безопасен — дубликаты не создаются.`)) return;
    try {
      setSeeding(key);
      setSeedResult(null);
      const endpointMap: Record<SeedKey, string> = {
        beverages: "/dishes/seed-beverages",
        kitchen: "/dishes/seed-kitchen",
        desserts: "/dishes/seed-desserts",
      };
      const result = (await api.request(endpointMap[key], { method: "POST" })) as SeedResult;
      setSeedResult(result);
      const labelMap: Record<SeedKey, string> = {
        beverages: "Напитки",
        kitchen: "Кухня",
        desserts: "Десерты",
      };
      setSeedLabel(labelMap[key]);
      setShowSeedLog(true);
      await loadDishes();
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка импорта");
    } finally {
      setSeeding(null);
    }
  };

  const handleSetDefaultImage = async () => {
    if (!confirm("Поставить лого Mado как фото для всех блюд без фотографии?")) return;
    try {
      setSettingDefaultImage(true);
      const res = (await api.request("/dishes/set-default-image", { method: "POST" })) as { updated: number };
      await loadDishes();
      setError(null);
      // Show a brief success note via the seed-log banner
      setSeedResult({ ok: true, newCategories: 0, totalDishes: res.updated, log: [] });
      setSeedLabel(`Фото по умолчанию — обновлено блюд: ${res.updated}`);
      setShowSeedLog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить фото");
    } finally {
      setSettingDefaultImage(false);
    }
  };

  const categoryFilterIds = useMemo(() => {
    if (categoryFilter === "all") return null;
    return collectCategoryAndDescendantIds(categoryFilter, categories);
  }, [categoryFilter, categories]);

  const filtered = useMemo(() => {
    return dishes.filter((dish) => {
      const q = search.toLowerCase();
      const searchable = [dish.name_ru, dish.name_uz, dish.name_en, dish.name_tr]
        .filter((v): v is string => typeof v === "string")
        .join(" ")
        .toLowerCase();
      const matchSearch = searchable.includes(q);
      const matchCategory = categoryFilterIds === null || categoryFilterIds.has(dish.category_id);
      const matchStatus = statusFilter === "all" || dish.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [dishes, search, categoryFilterIds, statusFilter]);

  const sortedCategories = useMemo(() => getSortedCategories(categories), [categories]);

  const canReorder = categoryFilter !== "all" && search.trim() === "" && statusFilter === "all";

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSubmit = async (formData: Record<string, unknown>) => {
    try {
      setSavingId(editingId || "new");
      const dataToSend = { ...formData, price: String(formData.price) };
      if (editingId) {
        await api.updateDish(editingId, dataToSend);
      } else {
        await api.createDish(dataToSend);
      }
      await loadDishes();
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Удалить это блюдо?")) return;
    try {
      setDeletingId(id);
      await api.deleteDish(id);
      await loadDishes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить");
    } finally {
      setDeletingId(null);
    }
  };

  const handleQuickStatus = async (id: string | number, status: DishStatus) => {
    try {
      setSavingId(id);
      await api.updateDish(id, { status });
      await loadDishes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить статус");
    } finally {
      setSavingId(null);
    }
  };

  const handleBulkStatus = async (status: DishStatus) => {
    if (selected.size === 0) return;
    try {
      setBulkLoading(true);
      await api.bulkUpdateDishStatus(Array.from(selected), status);
      await loadDishes();
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить статусы");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkMove = async (categoryId: number) => {
    if (selected.size === 0) return;
    try {
      setBulkLoading(true);
      await Promise.all(Array.from(selected).map((id) => api.updateDish(id, { category_id: categoryId })));
      await loadDishes();
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось переместить блюда");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Удалить ${selected.size} блюд(о/а)?`)) return;
    try {
      setBulkLoading(true);
      await Promise.all(Array.from(selected).map((id) => api.deleteDish(id)));
      await loadDishes();
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить блюда");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleMoveDish = async (id: string | number, direction: -1 | 1) => {
    if (!canReorder || typeof categoryFilter !== "number") return;
    const idx = filtered.findIndex((d) => d.id === id);
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= filtered.length) return;

    const newFiltered = [...filtered];
    [newFiltered[idx], newFiltered[targetIdx]] = [newFiltered[targetIdx], newFiltered[idx]];

    const posA = dishes.findIndex((d) => d.id === filtered[idx].id);
    const posB = dishes.findIndex((d) => d.id === filtered[targetIdx].id);
    if (posA === -1 || posB === -1) return;
    const newDishes = [...dishes];
    [newDishes[posA], newDishes[posB]] = [newDishes[posB], newDishes[posA]];
    setDishes(newDishes);

    try {
      setReordering(true);
      await api.reorderDishes(categoryFilter, newFiltered.map((d) => d.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось изменить порядок");
      await loadDishes();
    } finally {
      setReordering(false);
    }
  };

  const toggleSelect = (id: string | number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filtered.map((d) => d.id)));
  const deselectAll = () => setSelected(new Set());

  const rowMenuItems = (dish: Dish): DropdownItem[] => [
    { type: "header", label: "Статус" },
    { type: "item", label: "Опубликовать", icon: <Eye className="w-4 h-4" />, onClick: () => handleQuickStatus(dish.id, "published"), disabled: dish.status === "published" },
    { type: "item", label: "В черновик", icon: <FileText className="w-4 h-4" />, onClick: () => handleQuickStatus(dish.id, "draft"), disabled: dish.status === "draft" },
    { type: "item", label: "Скрыть", icon: <EyeOff className="w-4 h-4" />, onClick: () => handleQuickStatus(dish.id, "hidden"), disabled: dish.status === "hidden" },
    { type: "item", label: "Архивировать", icon: <Archive className="w-4 h-4" />, onClick: () => handleQuickStatus(dish.id, "archived"), disabled: dish.status === "archived" },
    { type: "separator" },
    { type: "item", label: "Редактировать", icon: <Edit2 className="w-4 h-4" />, onClick: () => { setEditingId(dish.id); setShowForm(true); } },
    { type: "item", label: "Удалить", icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(dish.id), danger: true },
  ];

  const anyLoading = seeding !== null || settingDefaultImage;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Блюда меню</h1>
          <p className="text-sm text-gray-500">{dishes.length} блюд</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setEditingId(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Добавить блюдо
          </button>
          <button
            onClick={() => handleSeed("kitchen")}
            disabled={anyLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors disabled:opacity-50"
          >
            {seeding === "kitchen" ? <Loader2 className="w-4 h-4 animate-spin" /> : <UtensilsCrossed className="w-4 h-4" />}
            Кухня
          </button>
          <button
            onClick={() => handleSeed("beverages")}
            disabled={anyLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors disabled:opacity-50"
          >
            {seeding === "beverages" ? <Loader2 className="w-4 h-4 animate-spin" /> : <DatabaseZap className="w-4 h-4" />}
            Напитки
          </button>
          <button
            onClick={() => handleSeed("desserts")}
            disabled={anyLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-pink-100 text-pink-700 rounded-lg text-sm font-medium hover:bg-pink-200 transition-colors disabled:opacity-50"
          >
            {seeding === "desserts" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cake className="w-4 h-4" />}
            Десерты
          </button>
          {/* Set default photo for dishes without an image */}
          <button
            onClick={handleSetDefaultImage}
            disabled={anyLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-100 text-sky-700 rounded-lg text-sm font-medium hover:bg-sky-200 transition-colors disabled:opacity-50"
            title="Поставить лого Mado на все блюда без фотографии"
          >
            {settingDefaultImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
            Фото по умолчанию
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {showSeedLog && seedResult && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
          <div className="flex items-center justify-between">
            <p className="font-medium">{seedLabel}</p>
            <button onClick={() => setShowSeedLog(false)} className="text-blue-500 hover:text-blue-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по названию..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value === "all" ? "all" : parseInt(e.target.value))}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="all">Все категории</option>
              {sortedCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.parent_id != null ? "— " : ""}{getCategoryLabel(cat)}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | DishStatus)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              <option value="all">Все статусы</option>
              <option value="published">Опубликовано</option>
              <option value="draft">Черновик</option>
              <option value="hidden">Скрыто</option>
              <option value="archived">Архивировано</option>
            </select>
            {filtered.length > 0 && (
              <button
                onClick={selected.size === filtered.length ? deselectAll : selectAll}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
              >
                {selected.size === filtered.length ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {selected.size === filtered.length ? "Снять всё" : "Выбрать всё"}
              </button>
            )}
          </div>

          {canReorder && filtered.length > 1 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg text-xs text-blue-700 dark:text-blue-400">
              <ArrowUp className="w-3.5 h-3.5 shrink-0" />
              Используйте стрелки ↑↓ для изменения порядка блюд в этой категории. Порядок отобразится на сайте.
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">Блюда не найдены</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((dish, dishIndex) => {
                const isSelected = selected.has(dish.id);
                const isMenuOpen = openMenuId === dish.id;
                const isBusy = savingId === dish.id || deletingId === dish.id || reordering;

                return (
                  <div
                    key={dish.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 border rounded-xl transition-all",
                      isSelected
                        ? "border-emerald-300 bg-emerald-50/50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(dish.id)}
                      className="w-4 h-4 accent-emerald-600 cursor-pointer flex-shrink-0"
                    />

                    <div className="w-11 h-11 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-100">
                      {dish.image_url ? (
                        <img
                          src={dish.image_url}
                          alt={getDishDisplayName(dish)}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                            (e.currentTarget.parentElement as HTMLElement).classList.add("flex", "items-center", "justify-center");
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageOff className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">{getDishDisplayName(dish)}</p>
                        {dish.is_new && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">Новое</span>}
                        {dish.is_signature && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">Фирм.</span>}
                        {dish.is_vegetarian && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Вег</span>}
                        {dish.is_spicy && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">Остр.</span>}
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{getDishTranslationPreview(dish)}</p>
                    </div>

                    <div className="text-sm font-semibold text-gray-700 min-w-fit tabular-nums">
                      {Number(dish.price).toLocaleString("ru-RU")} сум
                    </div>

                    <div className={cn("text-xs px-2 py-1 rounded-full font-medium min-w-fit hidden sm:flex items-center gap-1", STATUS_META[dish.status].color)}>
                      {STATUS_META[dish.status].icon}
                      {STATUS_META[dish.status].label}
                    </div>

                    {canReorder && (
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                          onClick={() => handleMoveDish(dish.id, -1)}
                          disabled={dishIndex === 0 || isBusy}
                          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-opacity"
                          title="Переместить выше"
                        >
                          <ArrowUp className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleMoveDish(dish.id, 1)}
                          disabled={dishIndex === filtered.length - 1 || isBusy}
                          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-opacity"
                          title="Переместить ниже"
                        >
                          <ArrowDown className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </div>
                    )}

                    <div className="relative flex-shrink-0" ref={isMenuOpen ? rowMenuRef : null}>
                      <button
                        onClick={() => setOpenMenuId(isMenuOpen ? null : dish.id)}
                        disabled={savingId === dish.id || deletingId === dish.id}
                        className={cn(
                          "flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-colors disabled:opacity-50",
                          isMenuOpen
                            ? "bg-gray-900 text-white border-gray-900"
                            : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        {savingId === dish.id || deletingId === dish.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <>Действия <ChevronDown className="w-3 h-3" /></>}
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-1 z-50 min-w-52 bg-white border border-gray-200 rounded-xl shadow-xl py-1 max-h-72 overflow-y-auto">
                          {rowMenuItems(dish).map((item, i) => {
                            if (item.type === "separator") return <div key={i} className="my-1 border-t border-gray-100" />;
                            if (item.type === "header")
                              return (
                                <div key={i} className="sticky top-0 bg-white px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                  {item.label}
                                </div>
                              );
                            return (
                              <button
                                key={i}
                                disabled={item.disabled}
                                onClick={() => {
                                  item.onClick();
                                  setOpenMenuId(null);
                                }}
                                className={cn(
                                  "flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm transition-colors",
                                  item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50",
                                  item.disabled && "opacity-40 cursor-not-allowed"
                                )}
                              >
                                {item.icon && <span className="text-gray-400 flex-shrink-0">{item.icon}</span>}
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selected.size > 0 && (
            <BulkActionBar
              count={selected.size}
              total={filtered.length}
              categories={categories}
              onSelectAll={selectAll}
              onDeselectAll={deselectAll}
              onStatus={handleBulkStatus}
              onMove={handleBulkMove}
              onDelete={handleBulkDelete}
              loading={bulkLoading}
            />
          )}

          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
              <div className="relative z-10 w-full max-w-2xl">
                <DishForm
                  onClose={() => setShowForm(false)}
                  onSubmit={handleSubmit}
                  initialData={
                    editingId
                      ? dishes.find((d) => d.id === editingId)
                        ? {
                            ...dishes.find((d) => d.id === editingId)!,
                            price: String(dishes.find((d) => d.id === editingId)!.price),
                          }
                        : undefined
                      : undefined
                  }
                  categories={categories}
                  loading={savingId !== null}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
