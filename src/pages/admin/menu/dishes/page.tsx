import { useState, useMemo } from "react";
import { Plus, Edit2, Trash2, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { MENU_CATEGORIES } from "../../../menu/data.ts";
import type { Category, Dish } from "../../../menu/data.ts";
import DishForm from "../../_components/dish-form.tsx";

type DishStatus = "published" | "draft" | "hidden" | "out_of_stock" | "archived";

type AdminDish = {
  id: string;
  name: string;
  nameRu: string;
  category: string;
  tab: string;
  price: string;
  status: DishStatus;
  isNew?: boolean;
  isSignature?: boolean;
  isVeg?: boolean;
  image: string;
};

const STATUS_META: Record<DishStatus, { label: string; color: string }> = {
  published: { label: "Published", color: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400" },
  draft: { label: "Draft", color: "text-yellow-700 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400" },
  hidden: { label: "Hidden", color: "text-gray-500 bg-gray-100 dark:bg-gray-800" },
  out_of_stock: { label: "Out of stock", color: "text-orange-700 bg-orange-50 dark:bg-orange-950 dark:text-orange-400" },
  archived: { label: "Archived", color: "text-red-500 bg-red-50 dark:bg-red-950 dark:text-red-400" },
};

// Build dishes list from real data.ts
const buildDishes = (): AdminDish[] => {
  const dishes: AdminDish[] = [];
  MENU_CATEGORIES.forEach((cat: Category) => {
    cat.dishes.forEach((d: Dish, i: number) => {
      dishes.push({
        id: `${cat.id}-${i}`,
        name: d.name,
        nameRu: d.name,
        category: cat.label,
        tab: cat.tab,
        price: d.price,
        status: "published",
        isNew: d.isNew,
        isSignature: d.isSignature,
        isVeg: d.isVeg,
        image: d.image,
      });
    });
  });
  return dishes;
};

const categoryOptions = MENU_CATEGORIES.map((c: Category) => c.label);

export default function DishesPage() {
  const [dishes, setDishes] = useState<AdminDish[]>(buildDishes);
  const [search, setSearch] = useState("");
  const [tabFilter, setTabFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | DishStatus>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [bulkPrice, setBulkPrice] = useState("");
  const [showBulkPrice, setShowBulkPrice] = useState(false);

  const TAB_OPTIONS = [
    { value: "all", label: "All sections" },
    { value: "food", label: "Food" },
    { value: "beverage", label: "Beverage" },
    { value: "dessert", label: "Dessert" },
    { value: "takeaway", label: "Takeaway" },
  ];

  const filtered = useMemo(() => dishes.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
    const matchTab = tabFilter === "all" || d.tab === tabFilter;
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchTab && matchStatus;
  }), [dishes, search, tabFilter, statusFilter]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((d) => d.id)));
  };

  const handleDelete = (id: string) => setDishes(dishes.filter((d) => d.id !== id));

  const handleBulkSetStatus = (status: DishStatus) => {
    setDishes(dishes.map((d) => selected.has(d.id) ? { ...d, status } : d));
    setSelected(new Set());
  };

  const handleBulkDelete = () => {
    setDishes(dishes.filter((d) => !selected.has(d.id)));
    setSelected(new Set());
  };

  const handleBulkPriceApply = () => {
    if (!bulkPrice.trim()) return;
    setDishes(dishes.map((d) => selected.has(d.id) ? { ...d, price: `${bulkPrice}\u00a0000 \u0441\u045e\u043c` } : d));
    setSelected(new Set());
    setBulkPrice("");
    setShowBulkPrice(false);
  };

  const publishedCount = dishes.filter((d) => d.status === "published").length;

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Dishes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {dishes.length} total \u00b7 {publishedCount} published
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> Add Dish
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes or categories..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <select
            value={tabFilter}
            onChange={(e) => setTabFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none"
          >
            {TAB_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | DishStatus)}
            className="px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none"
          >
            <option value="all">All statuses</option>
            {(Object.keys(STATUS_META) as DishStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
          <span className="text-sm font-semibold text-primary">{selected.size} selected</span>
          <div className="flex flex-wrap gap-2 ml-auto">
            {!showBulkPrice ? (
              <button
                onClick={() => setShowBulkPrice(true)}
                className="px-3 py-1.5 text-xs font-medium bg-card border border-border rounded-lg hover:bg-muted"
              >
                Set price
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  placeholder="Price (000s)"
                  className="w-28 px-2 py-1.5 text-xs border border-input rounded-lg bg-background focus:outline-none"
                />
                <button onClick={handleBulkPriceApply} className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg">Apply</button>
                <button onClick={() => setShowBulkPrice(false)} className="px-2 py-1.5 text-xs bg-muted text-muted-foreground rounded-lg">Cancel</button>
              </div>
            )}
            {(["published", "hidden", "draft"] as DishStatus[]).map((s) => (
              <button key={s} onClick={() => handleBulkSetStatus(s)} className="px-3 py-1.5 text-xs font-medium bg-card border border-border rounded-lg hover:bg-muted">
                \u2192 {STATUS_META[s].label}
              </button>
            ))}
            <button onClick={handleBulkDelete} className="px-3 py-1.5 text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/20">
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dish</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((dish) => (
                <tr key={dish.id} className={cn("group hover:bg-muted/30 transition-colors", selected.has(dish.id) && "bg-primary/5")}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(dish.id)} onChange={() => toggleSelect(dish.id)} className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={dish.image} alt={dish.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{dish.name}</p>
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          {dish.isSignature && <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 px-1.5 py-0.5 rounded">Signature</span>}
                          {dish.isNew && <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded">New</span>}
                          {dish.isVeg && <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">Veg</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">{dish.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold whitespace-nowrap">{dish.price}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={dish.status}
                      onChange={(e) => setDishes(dishes.map((d) => d.id === dish.id ? { ...d, status: e.target.value as DishStatus } : d))}
                      className={cn(
                        "text-xs font-semibold px-2 py-1 rounded-full border-0 bg-transparent cursor-pointer focus:outline-none",
                        STATUS_META[dish.status].color
                      )}
                    >
                      {(Object.keys(STATUS_META) as DishStatus[]).map((s) => (
                        <option key={s} value={s}>{STATUS_META[s].label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <button className="p-1.5 rounded hover:bg-muted"><Edit2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
                      <button onClick={() => handleDelete(dish.id)} className="p-1.5 rounded hover:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No dishes match your filters</p>
          </div>
        )}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {dishes.length}</span>
          {filtered.length > 0 && (
            <span>{selected.size} selected</span>
          )}
        </div>
      </div>

      {showForm && <DishForm categories={categoryOptions} onClose={() => setShowForm(false)} />}
    </div>
  );
}
