import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Check, X, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils.ts";
// Use mock API for development (no database needed)
import { mockApiClient as api } from "@/lib/mock-api.ts";

type Category = {
  id: string | number;
  label: string;
  tab: string;
  dish_count?: number;
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newTab, setNewTab] = useState("food");
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [savingId, setSavingId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
      console.error('Load categories error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = activeTab === "all" ? categories : categories.filter((c) => c.tab === activeTab);

  const grouped = ["food", "beverage", "dessert", "takeaway"].reduce<Record<string, Category[]>>((acc, tab) => {
    acc[tab] = categories.filter((c) => c.tab === tab);
    return acc;
  }, {});

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    
    try {
      setSavingId('new');
      await api.createCategory(newLabel, newTab);
      setNewLabel("");
      setAdding(false);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      console.error('Add category error:', err);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Delete this category? Dishes in this category will not be deleted.')) return;
    
    try {
      setDeletingId(id);
      await api.deleteCategory(id);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      console.error('Delete category error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const saveEdit = async (id: string | number) => {
    if (!editLabel.trim()) return;
    
    try {
      setSavingId(id);
      await api.updateCategory(id, editLabel);
      setEditingId(null);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      console.error('Update category error:', err);
    } finally {
      setSavingId(null);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditLabel(cat.label);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Menu Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">{categories.length} categories</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-sm underline">Dismiss</button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Loading categories...</p>
          </div>
        </div>
      )}

      {!loading && (
        <>
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
                  disabled={savingId === 'new'}
                  className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Section</label>
                <select
                  value={newTab}
                  onChange={(e) => setNewTab(e.target.value)}
                  disabled={savingId === 'new'}
                  className="px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none disabled:opacity-50"
                >
                  {["food", "beverage", "dessert", "takeaway"].map((t) => (
                    <option key={t} value={t}>{TAB_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleAdd} 
                  disabled={savingId === 'new'}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {savingId === 'new' ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Add
                </button>
                <button 
                  onClick={() => setAdding(false)}
                  disabled={savingId === 'new'}
                  className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
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
                editLabel={editLabel}
                setEditLabel={setEditLabel}
                onStartEdit={startEdit}
                onSaveEdit={saveEdit}
                onCancelEdit={() => setEditingId(null)}
                onDelete={handleDelete}
                savingId={savingId}
                deletingId={deletingId}
              />
            </div>
          )}

          {/* Empty state */}
          {categories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No categories yet. Create one to get started!</p>
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
  editLabel: string;
  setEditLabel: (v: string) => void;
  onStartEdit: (cat: Category) => void;
  onSaveEdit: (id: string | number) => void;
  onCancelEdit: () => void;
  onDelete: (id: string | number) => void;
  savingId: string | number | null;
  deletingId: string | number | null;
};

function TabGroup({
  tab, categories, editingId, editLabel, setEditLabel, onStartEdit, onSaveEdit, onCancelEdit, onDelete, savingId, deletingId,
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
          savingId={savingId}
          deletingId={deletingId}
        />
      )}
    </div>
  );
}

function CategoryList({
  categories, editingId, editLabel, setEditLabel, onStartEdit, onSaveEdit, onCancelEdit, onDelete, savingId, deletingId,
}: ListProps) {
  return (
    <div className="divide-y divide-border">
      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center gap-3 px-4 py-3 group hover:bg-muted/30">
          <div className="flex-1 min-w-0">
            {editingId === cat.id ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") onSaveEdit(cat.id); if (e.key === "Escape") onCancelEdit(); }}
                  disabled={savingId === cat.id}
                  className="px-2 py-1 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
                <button 
                  onClick={() => onSaveEdit(cat.id)} 
                  disabled={savingId === cat.id}
                  className="p-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {savingId === cat.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                </button>
                <button 
                  onClick={onCancelEdit}
                  disabled={savingId === cat.id}
                  className="p-1 rounded bg-muted text-muted-foreground disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground truncate">{cat.label}</p>
              </>
            )}
          </div>
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded shrink-0", TAB_COLORS[cat.tab])}>{TAB_LABELS[cat.tab]}</span>
          {editingId !== cat.id && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onStartEdit(cat)}
                disabled={savingId !== null || deletingId !== null}
                className="p-1.5 rounded hover:bg-muted disabled:opacity-50"
              >
                <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button 
                onClick={() => onDelete(cat.id)}
                disabled={deletingId === cat.id || savingId !== null}
                className="p-1.5 rounded hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {deletingId === cat.id ? <Loader2 className="w-3.5 h-3.5 text-destructive animate-spin" /> : <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />}
              </button>
            </div>
          )}
        </div>
      ))}
      {categories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No categories in this section</p>
        </div>
      )}
    </div>
  );
}
