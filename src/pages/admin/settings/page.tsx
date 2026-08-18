import { useState, useEffect } from "react";
import { Save, Check, AlertCircle } from "lucide-react";
import api from "@/lib/api";

const TABS = ["Общие", "Контакт", "Соцсети", "Ресторан", "SEO"] as const;
type Tab = typeof TABS[number];

type Settings = {
  siteName: string;
  defaultLang: string;
  timezone: string;
  phone: string;
  phone2: string;
  email: string;
  whatsapp: string;
  address: string;
  instagram: string;
  telegram: string;
  facebook: string;
  youtube: string;
  currency: string;
  minGuests: string;
  maxGuests: string;
  reservationEnabled: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
};

const DEFAULT: Settings = {
  siteName: "MADO UZ",
  defaultLang: "Русский",
  timezone: "Asia/Tashkent (UTC+5)",
  phone: "+998 71 123 45 67",
  phone2: "+998 90 000 00 00",
  email: "hello@madouz.uz",
  whatsapp: "+998 90 000 00 00",
  address: "Ташкент, Узбекистан",
  instagram: "@mado.uz",
  telegram: "@madouz",
  facebook: "",
  youtube: "",
  currency: "UZS",
  minGuests: "2",
  maxGuests: "20",
  reservationEnabled: "да",
  metaTitle: "MADO — Турецкий ресторан в Ташкенте",
  metaDescription: "Аутентичная турецкая кухня в Ташкенте. Зал, навынос, кейтеринг и мероприятия.",
  ogImage: "",
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Общие");
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof Settings, value: string) => setSettings((s) => ({ ...s, [key]: value }));

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await api.getSettings();
        setSettings((prev) => ({ ...prev, ...data }));
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить настройки");
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Настройки</h1>
          <p className="text-sm text-muted-foreground mt-1">Управление конфигурацией сайта</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {loading ? "Сохранение..." : saved ? "Сохранено!" : "Сохранить"}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        {activeTab === "Общие" && (
          <>
            <Field label="Название сайта" value={settings.siteName} onChange={(v) => set("siteName", v)} />
            <SelectField label="Язык по умолчанию" value={settings.defaultLang} onChange={(v) => set("defaultLang", v)}
              options={["Русский", "Узбекский", "Английский", "Турецкий"]} />
            <SelectField label="Часовой пояс" value={settings.timezone} onChange={(v) => set("timezone", v)}
              options={["Asia/Tashkent (UTC+5)", "Asia/Samarkand (UTC+5)", "Europe/Moscow (UTC+3)"]} />
          </>
        )}
        {activeTab === "Контакт" && (
          <>
            <Field label="Основной телефон" value={settings.phone} onChange={(v) => set("phone", v)} placeholder="+998 71 ..." />
            <Field label="Доп. телефон" value={settings.phone2} onChange={(v) => set("phone2", v)} placeholder="+998 90 ..." />
            <Field label="Email" value={settings.email} onChange={(v) => set("email", v)} placeholder="hello@madouz.uz" />
            <Field label="WhatsApp" value={settings.whatsapp} onChange={(v) => set("whatsapp", v)} placeholder="+998 90 ..." />
            <Field label="Адрес" value={settings.address} onChange={(v) => set("address", v)} />
          </>
        )}
        {activeTab === "Соцсети" && (
          <>
            <Field label="Instagram" value={settings.instagram} onChange={(v) => set("instagram", v)} placeholder="@mado.uz" />
            <Field label="Telegram" value={settings.telegram} onChange={(v) => set("telegram", v)} placeholder="@madouz" />
            <Field label="Facebook" value={settings.facebook} onChange={(v) => set("facebook", v)} placeholder="facebook.com/madouz" />
            <Field label="YouTube" value={settings.youtube} onChange={(v) => set("youtube", v)} placeholder="youtube.com/@mado" />
          </>
        )}
        {activeTab === "Ресторан" && (
          <>
            <SelectField label="Валюта" value={settings.currency} onChange={(v) => set("currency", v)}
              options={["UZS", "USD", "EUR"]} />
            <Field label="Мин. гостей (бронирование)" value={settings.minGuests} onChange={(v) => set("minGuests", v)} />
            <Field label="Макс. гостей (бронирование)" value={settings.maxGuests} onChange={(v) => set("maxGuests", v)} />
            <SelectField label="Онлайн-бронирование" value={settings.reservationEnabled} onChange={(v) => set("reservationEnabled", v)}
              options={["да", "нет"]} />
          </>
        )}
        {activeTab === "SEO" && (
          <>
            <Field label="Мета-заголовок" value={settings.metaTitle} onChange={(v) => set("metaTitle", v)}
              placeholder="MADO — Турецкий ресторан в Ташкенте" />
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Мета-описание</label>
              <textarea
                rows={3}
                value={settings.metaDescription}
                onChange={(e) => set("metaDescription", e.target.value)}
                placeholder="Краткое описание для поисковых систем..."
                className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">{settings.metaDescription.length} / 160 символов</p>
            </div>
            <Field label="URL OG-изображения" value={settings.ogImage} onChange={(v) => set("ogImage", v)}
              placeholder="https://..." />
            {settings.ogImage && (
              <img src={settings.ogImage} alt="OG Preview" className="h-32 w-full object-cover rounded-lg" />
            )}
          </>
        )}
      </div>

      {/* Save reminder */}
      {saved && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Настройки успешно сохранены</span>
        </div>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function SelectField({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
