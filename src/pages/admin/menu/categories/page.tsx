import { useState } from "react";
import { Plus, Edit2, Trash2, GripVertical, ChevronDown, ChevronRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { MENU_CATEGORIES } from "../../../menu/data.ts";
import type { Category } from "../../../menu/data.ts";

type LocalCategory = {
  id: string;
  label: string;
  tab: string;
  dishCount: number;
};

const TAB_COLORS: Record<string, string> = {
  food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  beverage: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  dessert: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  takeaway: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const TAB_LABELS: Record<string, string> = {
  food: "FOOD",
  beverage: "BEVERAGE",
  dessert: "DESSERT",
  takeaway: "TAKEAWAY",
};

const TABS = ["all", "food", "beverage", "dessert", "takeaway"];

const initialCategories: LocalCategory[] = MENU_CATEGORIES.map((c: Category) => ({
  id: c.id,
  label: c.label,
  tab: c.tab,
  dishCount: c.dishes.length,
}));

export default function CategoriesPage() {
  const [categories, setCategories] = useState<LocalCategory[]>(initialCategories);
  const [activeTab, setActiveTab] = useState("all");
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newTab, setNewTab] = useState("food");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  const filtered = activeTab === "all" ? categories : categories.filter((c) => c.tab === activeTab);

  const grouped = ["food", "beverage", "dessert", "takeaway"].reduce<Record<string, LocalCategory[]>>((acc, tab) => {
    acc[tab] = categories.filter((c) => c.tab === tab);
    return acc;
  }, {});

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    setCategories([
      ...categories,
      { id: Date.now().toString(), label: newLabel, tab: newTab, dishCount: 0 },
    ]);
    setNewLabel("");
    setAdding(false);
  };

  const handleDelete = (id: string) => setCategories(categories.filter((c) => c.id !== id));

  const saveEdit = (id: string) => {
    setCategories(categories.map((c) => c.id === id ? { ...c, label: editLabel } : c));
    setEditingId(null);
  };

  const startEdit = (cat: LocalCategory) => {
    setEditingId(cat.id);
    setEditLabel(cat.label);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Menu Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">{categories.length} categories \u00b7 {categories.reduce((s, c) => s + c.dishCount, 0)} dishes total</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Tabs */}
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
            {tab === "all" ? "All" : TAB_LABELS[tab]}
            <span className="ml-1.5 text-xs opacity-70">
              {tab === "all" ? categories.length : categories.filter((c) => c.tab === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-card border border-accent/50 rounded-xl p-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs text-muted-foreground mb-1 block">Category Name</label>
            <input
              autoFocus
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="e.g. Salads"
              className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Section</label>
            <select
              value={newTab}
              onChange={(e) => setNewTab(e.target.value)}
              className="px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none"
            >
              {["food", "beverage", "dessert", "takeaway"].map((t) => (
                <option key={t} value={t}>{TAB_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Add</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Category list */}
      {activeTab === "all" ? (
        <div className="space-y-4">
          {["food", "beverage", "dessert", "takeaway"].map((tab) => (
            <TabGroup
              key={tab}
              tab={tab}
              categories={grouped[tab]}
              editingId={editingId}
              editLabel={editLabel}
              setEditLabel={setEditLabel}
              onStartEdit={startEdit}
              onSaveEdit={saveEdit}
              onCancelEdit={() => setEditingId(null)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <CategoryList
            categories={filtered}
            editingId={editingId}
            editLabel={editLabel}
            setEditLabel={setEditLabel}
            onStartEdit={startEdit}
            onSaveEdit={saveEdit}
            onCancelEdit={() => setEditingId(null)}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}

type ListProps = {
  categories: LocalCategory[];
  editingId: string | null;
  editLabel: string;
  setEditLabel: (v: string) => void;
  onStartEdit: (cat: LocalCategory) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
};

function TabGroup({
  tab, categories, editingId, editLabel, setEditLabel, onStartEdit, onSaveEdit, onCancelEdit, onDelete,
}: { tab: string } & ListProps) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        <span className={cn("text-xs font-bold px-2 py-0.5 rounded", TAB_COLORS[tab])}>{TAB_LABELS[tab]}</span>
        <span className="text-sm text-muted-foreground">{categories.length} categories</span>
      </button>
      {open && (
        <CategoryList
          categories={categories}
          editingId={editingId}
          editLabel={editLabel}
          setEditLabel={setEditLabel}
          onStartEdit={onStartEdit}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}

function CategoryList({
  categories, editingId, editLabel, setEditLabel, onStartEdit, onSaveEdit, onCancelEdit, onDelete,
}: ListProps) {
  return (
    <div className="divide-y divide-border">
      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center gap-3 px-4 py-3 group hover:bg-muted/30">
          <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab shrink-0" />
          <div className="flex-1 min-w-0">
            {editingId === cat.id ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") onSaveEdit(cat.id); if (e.key === "Escape") onCancelEdit(); }}
                  className="px-2 py-1 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button onClick={() => onSaveEdit(cat.id)} className="p-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200"><Check className="w-3.5 h-3.5" /></button>
                <button onClick={onCancelEdit} className="p-1 rounded bg-muted text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground truncate">{cat.label}</p>
                <p className="text-xs text-muted-foreground">{cat.dishCount} dishes</p>
              </>
            )}
          </div>
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded shrink-0", TAB_COLORS[cat.tab])}>{TAB_LABELS[cat.tab]}</span>
          {editingId !== cat.id && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onStartEdit(cat)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(cat.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ))}
      {categories.length === 0 && (
        <div className="text-center py-10 text-sm text-muted-foreground">No categories</div>
      )}
    </div>
  );
}
