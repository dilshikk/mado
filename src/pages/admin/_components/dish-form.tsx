import { useEffect, useState } from "react";
import { X } from "lucide-react";
import ImageUploadCrop from "@/components/image-upload-crop.tsx";

type Category = {
  id: number;
  label: string;
  label_ru?: string | null;
  label_uz?: string | null;
  label_en?: string | null;
  label_tr?: string | null;
};

function getCategoryLabel(cat: Category): string {
  return [cat.label_ru, cat.label_uz, cat.label_en, cat.label_tr].find(
    (v): v is string => typeof v === "string" && v.trim() !== ""
  ) ?? cat.label ?? "Без названия";
}

type DishFormData = {
  category_id: number;
  name_ru: string;
  name_uz: string;
  name_en: string;
  name_tr: string;
  description_ru: string;
  description_uz: string;
  description_en: string;
  description_tr: string;
  price: string;
  image_url: string;
  status: "published" | "draft" | "hidden" | "archived";
  is_new: boolean;
  is_signature: boolean;
  is_vegetarian: boolean;
  is_spicy: boolean;
};

type Props = {
  onClose: () => void;
  onSubmit: (data: DishFormData) => void;
  initialData?: Partial<DishFormData>;
  categories: Category[];
  loading?: boolean;
};

const LANGS = [
  { code: "ru", flag: "🇷🇺", label: "Русский" },
  { code: "uz", flag: "🇺🇿", label: "Ўзбек" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "tr", flag: "🇹🇷", label: "Türkçe" },
];

const DEFAULT_DATA: DishFormData = {
  category_id: 1,
  name_ru: "", description_ru: "",
  name_uz: "", description_uz: "",
  name_en: "", description_en: "",
  name_tr: "", description_tr: "",
  price: "",
  image_url: "",
  status: "published",
  is_new: false,
  is_signature: false,
  is_vegetarian: false,
  is_spicy: false,
};

export default function DishForm({ onClose, onSubmit, initialData, categories, loading }: Props) {
  const [activeLang, setActiveLang] = useState("ru");
  const [form, setForm] = useState<DishFormData>({ ...DEFAULT_DATA, ...initialData });

  useEffect(() => {
    const preferredLang = LANGS.find(({ code }) => {
      const key = `name_${code}` as keyof DishFormData;
      return typeof initialData?.[key] === "string" && String(initialData[key]).trim() !== "";
    })?.code ?? "ru";
    setActiveLang(preferredLang);
    setForm({ ...DEFAULT_DATA, ...initialData });
  }, [initialData]);

  const set = (key: keyof DishFormData, value: string | number | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const hasAnyNameTranslation = [form.name_ru, form.name_uz, form.name_en, form.name_tr].some(
    (v) => typeof v === "string" && v.trim() !== ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category_id || !form.price || !hasAnyNameTranslation) {
      alert("Заполните: Категория, Цена и хотя бы одно название");
      return;
    }
    onSubmit(form);
  };

  const nameLangKey = `name_${activeLang}` as keyof DishFormData;
  const descLangKey = `description_${activeLang}` as keyof DishFormData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white border border-gray-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Sticky header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between px-6 py-4 z-10">
          <h2 className="text-lg font-bold">
            {initialData?.name_ru ? "Редактировать блюдо" : "Добавить новое блюдо"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" disabled={loading}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category & Price */}
          <section>
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Основная информация
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Категория *</label>
                <select
                  value={form.category_id}
                  onChange={(e) => set("category_id", parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={loading}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{getCategoryLabel(c)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Цена (сум) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="45000"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={loading}
                />
              </div>
            </div>
          </section>

          <div className="border-t border-gray-200" />

          {/* Translations */}
          <section>
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Названия и описания
            </h3>
            <div className="flex gap-2 mb-4 flex-wrap">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setActiveLang(l.code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    activeLang === l.code
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                  disabled={loading}
                >
                  <span>{l.flag}</span> {l.label}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  Название ({activeLang.toUpperCase()}) *
                </label>
                <input
                  value={form[nameLangKey] as string}
                  onChange={(e) => set(nameLangKey, e.target.value)}
                  placeholder="Название блюда"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  Описание ({activeLang.toUpperCase()})
                </label>
                <textarea
                  rows={3}
                  value={form[descLangKey] as string}
                  onChange={(e) => set(descLangKey, e.target.value)}
                  placeholder="Описание блюда"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  disabled={loading}
                />
              </div>
            </div>
          </section>

          <div className="border-t border-gray-200" />

          {/* Image upload with crop */}
          <section>
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Изображение
            </h3>
            <ImageUploadCrop
              value={form.image_url}
              onChange={(url) => set("image_url", url)}
              disabled={loading}
              previewClass="w-20 h-20"
              label="Выбрать фото"
            />
          </section>

          <div className="border-t border-gray-200" />

          {/* Properties */}
          <section>
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Свойства
            </h3>
            <div className="space-y-2">
              {[
                { key: "is_new" as const, label: "🆕 Новое блюдо" },
                { key: "is_signature" as const, label: "⭐ Фирменное блюдо" },
                { key: "is_vegetarian" as const, label: "🥗 Вегетарианское" },
                { key: "is_spicy" as const, label: "🌶️ Острое" },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => set(key, e.target.checked)}
                    className="rounded w-4 h-4"
                    disabled={loading}
                  />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
          </section>

          <div className="border-t border-gray-200" />

          {/* Status */}
          <section>
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Статус
            </h3>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value as DishFormData["status"])}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={loading}
            >
              <option value="published">Опубликовано</option>
              <option value="draft">Черновик</option>
              <option value="hidden">Скрыто</option>
              <option value="archived">Архивировано</option>
            </select>
          </section>
        </form>

        {/* Sticky footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 flex gap-3 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            disabled={loading}
          >
            ✕ Отмена
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              const formEl = (e.target as HTMLElement).closest(".z-50")?.querySelector("form") as HTMLFormElement;
              formEl?.dispatchEvent(new Event("submit", { bubbles: true }));
            }}
            className="flex-1 px-4 py-2.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "⏳ Сохранение..." : "💾 Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}
