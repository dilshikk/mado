import { useState, useEffect, useMemo } from "react";
import { Plus, Edit2, Trash2, Search, Loader2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { mockApiClient as api } from "@/lib/mock-api.ts";
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
  tab: string;
};

const STATUS_META: Record<DishStatus, { label: string; color: string }> = {
  published: { label: "Опубликовано", color: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400" },
  draft: { label: "Черновик", color: "text-yellow-700 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400" },
  hidden: { label: "Скрыто", color: "text-gray-500 bg-gray-100 dark:bg-gray-800" },
  archived: { label: "Архивировано", color: "text-red-500 bg-red-50 dark:bg-red-950 dark:text-red-400" },
};

const getDishDisplayName = (dish: Dish) => {
  const name = [dish.name_ru, dish.name_uz, dish.name_en, dish.name_tr].find(
    (value) => typeof value === "string" && value.trim() !== ""
  );

  return name?.trim() || "No translations yet";
};

const getDishTranslationPreview = (dish: Dish) => {
  const values = [dish.name_ru, dish.name_uz, dish.name_en, dish.name_tr].filter(
    (value): value is string => typeof value === "string" && value.trim() !== ""
  );

  return values.length > 0 ? values.slice(0, 3).join(" • ") : "No translations yet";
};

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | DishStatus>("all");
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [savingId, setSavingId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  
  const [showBulkStatus, setShowBulkStatus] = useState(false);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await api.getCategories();
        const cats = Array.isArray(data) ? data : [];
        setCategories(cats && cats.length > 0 ? cats : []);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  // Load dishes
  const loadDishes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDishes();
      setDishes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dishes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDishes();
  }, []);

  // Filter dishes
  const filtered = useMemo(() => {
    return dishes.filter((dish) => {
      const q = search.toLowerCase();
      const searchable = [
        dish.name_ru,
        dish.name_uz,
        dish.name_en,
        dish.name_tr,
      ].filter((value): value is string => typeof value === "string").join(" ").toLowerCase();

      const matchSearch = searchable.includes(q);
      const matchCategory = categoryFilter === "all" || dish.category_id === categoryFilter;
      const matchStatus = statusFilter === "all" || dish.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [dishes, search, categoryFilter, statusFilter]);

  // Handle add/edit
  const handleSubmit = async (formData: any) => {
    try {
      setSavingId(editingId || 'new');
      const dataToSend = {
        ...formData,
        price: String(formData.price),
      };
      if (editingId) {
        await api.updateDish(editingId, dataToSend);
      } else {
        await api.createDish(dataToSend);
      }
      await loadDishes();
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSavingId(null);
    }
  };

  // Handle delete
  const handleDelete = async (id: string | number) => {
    if (!confirm('Удалить это блюдо?')) return;
    try {
      setDeletingId(id);
      await api.deleteDish(id);
      await loadDishes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (newStatus: DishStatus) => {
    if (selected.size === 0) return;
    try {
      setSavingId('bulk');
      await api.bulkUpdateDishStatus(Array.from(selected), newStatus);
      await loadDishes();
      setSelected(new Set());
      setShowBulkStatus(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSavingId(null);
    }
  };

  const toggleSelect = (id: string | number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(d => d.id)));
    }
  };

  if (loading && dishes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Dishes</h1>
          <p className="text-gray-500">{filtered.length} dishes</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          disabled={savingId === 'new'}
        >
          <Plus className="w-4 h-4" />
          Add Dish
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All statuses</option>
          <option value="published">Опубликовано</option>
          <option value="draft">Черновик</option>
          <option value="hidden">Скрыто</option>
          <option value="archived">Архивировано</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <input
            type="checkbox"
            checked={selected.size === filtered.length}
            onChange={toggleAll}
            className="w-4 h-4"
          />
          <span className="text-sm">{selected.size} selected</span>
          <div className="flex-1" />
          <div className="relative">
            <button
              onClick={() => setShowBulkStatus(!showBulkStatus)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={savingId === 'bulk'}
            >
              {savingId === 'bulk' ? '⏳ Updating...' : 'Change status'}
            </button>
            {showBulkStatus && (
              <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10">
                {Object.entries(STATUS_META).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => handleBulkStatusUpdate(key as DishStatus)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    {meta.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dishes table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No dishes found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((dish) => (
            <div
              key={dish.id}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.has(dish.id)}
                onChange={() => toggleSelect(dish.id)}
                className="w-4 h-4"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{getDishDisplayName(dish)}</p>
                  {dish.is_new && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">🆕 New</span>}
                  {dish.is_signature && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">⭐ Signature</span>}
                  {dish.is_vegetarian && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">🥗 Veg</span>}
                  {dish.is_spicy && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">🌶️ Spicy</span>}
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {getDishTranslationPreview(dish)}
                </p>
              </div>

              <div className="text-sm font-medium min-w-fit">{Number(dish.price).toLocaleString()} сум</div>

              <div className={cn("text-xs px-2 py-1 rounded-full font-medium", STATUS_META[dish.status].color)}>
                {STATUS_META[dish.status].label}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingId(dish.id);
                    setShowForm(true);
                  }}
                  className="p-2 hover:bg-blue-100 rounded-lg disabled:opacity-50"
                  disabled={savingId === dish.id}
                >
                  <Edit2 className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(dish.id)}
                  className="p-2 hover:bg-red-100 rounded-lg disabled:opacity-50"
                  disabled={deletingId === dish.id}
                >
                  {deletingId === dish.id ? (
                    <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-red-600" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative z-10 w-full max-w-2xl">
            <DishForm
              onClose={() => setShowForm(false)}
              onSubmit={handleSubmit}
              initialData={editingId ? dishes.find(d => d.id === editingId) ? {
                ...dishes.find(d => d.id === editingId)!,
                price: String(dishes.find(d => d.id === editingId)!.price),
              } : undefined : undefined}
              categories={categories}
              loading={savingId !== null}
            />
          </div>
        </div>
      )}
    </div>
  );
}
