import { useState } from "react";
import { Plus, Edit2, Trash2, Calendar, X, Save, Upload } from "lucide-react";
import { cn } from "@/lib/utils.ts";

type PromoStatus = "active" | "scheduled" | "draft" | "expired";

type Promotion = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: PromoStatus;
  image: string;
  pages: string[];
};

const STATUS_META: Record<PromoStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  draft: { label: "Draft", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-500 dark:bg-gray-800" },
};

const SAMPLE: Promotion[] = [
  { id: "1", title: "Summer Breakfast", description: "Special breakfast set for summer mornings — enjoy our signature MADO Breakfast at a special price.", startDate: "2026-06-01", endDate: "2026-08-31", status: "active", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=60", pages: ["Home", "Menu"] },
  { id: "2", title: "Weekend Brunch", description: "Extended brunch menu every Saturday and Sunday with special weekend-only dishes.", startDate: "2026-09-01", endDate: "2026-09-30", status: "scheduled", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=60", pages: ["Home"] },
  { id: "3", title: "MADO Dessert Week", description: "Special discounts on all desserts during our annual dessert week celebration.", startDate: "2026-07-20", endDate: "2026-07-27", status: "expired", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=60", pages: ["Menu"] },
];

const ALL_PAGES = ["Home", "Menu", "Catering", "Careers"];

type ModalMode = "add" | "edit" | null;

export default function PromotionsPage() {
  const [promos, setPromos] = useState<Promotion[]>(SAMPLE);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [target, setTarget] = useState<Promotion | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | PromoStatus>("all");

  const filtered = statusFilter === "all" ? promos : promos.filter((p) => p.status === statusFilter);

  const emptyPromo = (): Promotion => ({
    id: "", title: "", description: "",
    startDate: "", endDate: "",
    status: "draft", image: "", pages: [],
  });

  const openAdd = () => { setTarget(emptyPromo()); setModalMode("add"); };
  const openEdit = (p: Promotion) => { setTarget({ ...p }); setModalMode("edit"); };

  const handleSave = () => {
    if (!target) return;
    if (modalMode === "add") setPromos([...promos, { ...target, id: Date.now().toString() }]);
    else setPromos(promos.map((p) => p.id === target.id ? target : p));
    setModalMode(null);
  };

  const handleDelete = (id: string) => setPromos(promos.filter((p) => p.id !== id));

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Promotions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {promos.filter((p) => p.status === "active").length} active \u00b7 {promos.filter((p) => p.status === "scheduled").length} scheduled
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> Create Promotion
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {(["all", "active", "scheduled", "draft", "expired"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize",
              statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {s === "all" ? "All" : STATUS_META[s].label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((promo) => (
          <div key={promo.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:border-accent/50 transition-colors">
            <div className="relative">
              {promo.image ? (
                <img src={promo.image} alt={promo.title} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-muted flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground/40" />
                </div>
              )}
              <span className={cn("absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full", STATUS_META[promo.status].color)}>
                {STATUS_META[promo.status].label}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-foreground">{promo.title || "Untitled"}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{promo.description}</p>
              {(promo.startDate || promo.endDate) && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {promo.startDate} {promo.endDate ? `\u2013 ${promo.endDate}` : ""}
                </div>
              )}
              {promo.pages.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {promo.pages.map((p) => (
                    <span key={p} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{p}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={() => openEdit(promo)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => handleDelete(promo.id)}
                className="p-2 border border-border rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-muted-foreground">
            <p className="text-sm">No promotions</p>
          </div>
        )}
      </div>

      {/* Form modal */}
      {(modalMode === "add" || modalMode === "edit") && target && (
        <PromoFormModal
          mode={modalMode}
          promo={target}
          onChange={setTarget}
          onSave={handleSave}
          onClose={() => setModalMode(null)}
        />
      )}
    </div>
  );
}

function PromoFormModal({
  mode, promo, onChange, onSave, onClose,
}: {
  mode: "add" | "edit";
  promo: Promotion;
  onChange: (p: Promotion) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const set = <K extends keyof Promotion>(key: K, value: Promotion[K]) => onChange({ ...promo, [key]: value });

  const togglePage = (p: string) => {
    const has = promo.pages.includes(p);
    set("pages", has ? promo.pages.filter((x) => x !== p) : [...promo.pages, p]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-card border-b border-border flex items-center justify-between px-6 py-4">
          <h2 className="font-serif font-bold text-lg">{mode === "add" ? "Create Promotion" : "Edit Promotion"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Title</label>
            <input value={promo.title} onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Summer Breakfast Special"
              className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Description</label>
            <textarea rows={3} value={promo.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Short description of the promotion..."
              className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Start Date</label>
              <input type="date" value={promo.startDate} onChange={(e) => set("startDate", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">End Date</label>
              <input type="date" value={promo.endDate} onChange={(e) => set("endDate", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Image URL</label>
            <input value={promo.image} onChange={(e) => set("image", e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none" />
            {promo.image && (
              <img src={promo.image} alt="Preview" className="mt-2 h-24 w-full object-cover rounded-lg" />
            )}
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Show on Pages</label>
            <div className="flex gap-2 flex-wrap">
              {ALL_PAGES.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePage(p)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                    promo.pages.includes(p) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {(["active", "scheduled", "draft", "expired"] as PromoStatus[]).map((s) => (
                <label key={s} className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors",
                  promo.status === s ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                )}>
                  <input type="radio" name="pstatus" value={s} checked={promo.status === s} onChange={() => set("status", s)} className="w-3.5 h-3.5" />
                  <span className="text-sm">{STATUS_META[s].label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-card border-t border-border flex gap-3 px-6 py-4">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg">Cancel</button>
          <button onClick={onSave} className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
