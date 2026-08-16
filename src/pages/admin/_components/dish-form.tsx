import { useState } from "react";
import { X, Upload } from "lucide-react";

type Props = { onClose: () => void; categories?: string[] };

const LANGS = [
  { code: "ru", flag: "🇷🇺", label: "Russian" },
  { code: "uz", flag: "🇺🇿", label: "Uzbek" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "tr", flag: "🇹🇷", label: "Turkish" },
];

const DEFAULT_CATEGORIES = [
  "Breakfast", "Soups", "Cold Mezza", "Hot Mezza",
  "From the Grill", "Specialties", "Sourdough Pizza",
  "Burger & Durum", "Hot Drinks", "Cold Drinks",
  "Ice Cream", "Turkish Desserts", "Combo Sets",
];

type FormState = {
  name_ru: string; desc_ru: string;
  name_uz: string; desc_uz: string;
  name_en: string; desc_en: string;
  name_tr: string; desc_tr: string;
  price: string;
  category: string;
  isNew: boolean;
  isSignature: boolean;
  isVeg: boolean;
  isSpicy: boolean;
};

export default function DishForm({ onClose, categories }: Props) {
  const [activeLang, setActiveLang] = useState("ru");
  const [status, setStatus] = useState("published");
  const [form, setForm] = useState<FormState>({
    name_ru: "", desc_ru: "",
    name_uz: "", desc_uz: "",
    name_en: "", desc_en: "",
    name_tr: "", desc_tr: "",
    price: "",
    category: "",
    isNew: false,
    isSignature: false,
    isVeg: false,
    isSpicy: false,
  });

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const catList = categories ?? DEFAULT_CATEGORIES;

  const nameLangKey = `name_${activeLang}` as keyof FormState;
  const descLangKey = `desc_${activeLang}` as keyof FormState;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-card border-b border-border flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-serif font-bold">Add New Dish</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Category */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Category</h3>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select category</option>
              {catList.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </section>

          <div className="border-t border-border" />

          {/* Translations */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Name & Description</h3>
            <div className="flex gap-2 mb-4 flex-wrap">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setActiveLang(l.code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    activeLang === l.code ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <span>{l.flag}</span> {l.label}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Name ({activeLang.toUpperCase()})</label>
                <input
                  value={form[nameLangKey] as string}
                  onChange={(e) => set(nameLangKey, e.target.value)}
                  placeholder="Dish name"
                  className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description ({activeLang.toUpperCase()})</label>
                <textarea
                  rows={3}
                  value={form[descLangKey] as string}
                  onChange={(e) => set(descLangKey, e.target.value)}
                  placeholder="Short description"
                  className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>
          </section>

          <div className="border-t border-border" />

          {/* Price */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Price</h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Amount (in thousands UZS)</label>
                <input
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="e.g. 69000"
                  type="number"
                  className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="shrink-0">
                <label className="text-xs text-muted-foreground mb-1 block">Currency</label>
                <div className="px-3 py-2 text-sm border border-input rounded-lg bg-muted text-muted-foreground">UZS</div>
              </div>
            </div>
          </section>

          <div className="border-t border-border" />

          {/* Photo */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Photo</h3>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 cursor-pointer transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5 MB</p>
            </div>
          </section>

          <div className="border-t border-border" />

          {/* Properties */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Properties</h3>
            <div className="grid grid-cols-2 gap-3">
              {(["isNew", "isSignature", "isVeg", "isSpicy"] as const).map((prop) => (
                <label key={prop} className="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg border border-border hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={form[prop]}
                    onChange={(e) => set(prop, e.target.checked)}
                    className="rounded w-4 h-4"
                  />
                  <span className="text-sm font-medium capitalize">{prop.replace("is", "")}</span>
                </label>
              ))}
            </div>
          </section>

          <div className="border-t border-border" />

          {/* Status */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Publication Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {(["published", "draft", "hidden", "out_of_stock"] as const).map((s) => (
                <label key={s} className={`flex items-center gap-2.5 cursor-pointer p-3 rounded-lg border transition-colors ${
                  status === s ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}>
                  <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} className="w-4 h-4" />
                  <span className="text-sm font-medium capitalize">{s.replace("_", " ")}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border flex gap-3 px-6 py-4">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg hover:bg-muted/80">Cancel</button>
          <button className="flex-1 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Add Dish</button>
        </div>
      </div>
    </div>
  );
}
