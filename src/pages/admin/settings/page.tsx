import { useState } from "react";
import { Save, Check } from "lucide-react";

const TABS = ["General", "Contact", "Social", "Restaurant", "SEO"] as const;
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
  defaultLang: "Russian",
  timezone: "Asia/Tashkent (UTC+5)",
  phone: "+998 71 123 45 67",
  phone2: "+998 90 000 00 00",
  email: "hello@madouz.uz",
  whatsapp: "+998 90 000 00 00",
  address: "Tashkent, Uzbekistan",
  instagram: "@mado.uz",
  telegram: "@madouz",
  facebook: "",
  youtube: "",
  currency: "UZS",
  minGuests: "2",
  maxGuests: "20",
  reservationEnabled: "yes",
  metaTitle: "MADO \u2014 Turkish Restaurant in Tashkent",
  metaDescription: "Authentic Turkish cuisine in Tashkent. Dine-in, takeaway, catering and events.",
  ogImage: "",
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("General");
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof Settings, value: string) => setSettings((s) => ({ ...s, [key]: value }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage site configuration</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

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
        {activeTab === "General" && (
          <>
            <Field label="Site Name" value={settings.siteName} onChange={(v) => set("siteName", v)} />
            <SelectField label="Default Language" value={settings.defaultLang} onChange={(v) => set("defaultLang", v)}
              options={["Russian", "Uzbek", "English", "Turkish"]} />
            <SelectField label="Timezone" value={settings.timezone} onChange={(v) => set("timezone", v)}
              options={["Asia/Tashkent (UTC+5)", "Asia/Samarkand (UTC+5)", "Europe/Moscow (UTC+3)"]} />
          </>
        )}
        {activeTab === "Contact" && (
          <>
            <Field label="Primary Phone" value={settings.phone} onChange={(v) => set("phone", v)} placeholder="+998 71 ..." />
            <Field label="Secondary Phone" value={settings.phone2} onChange={(v) => set("phone2", v)} placeholder="+998 90 ..." />
            <Field label="Email" value={settings.email} onChange={(v) => set("email", v)} placeholder="hello@madouz.uz" />
            <Field label="WhatsApp" value={settings.whatsapp} onChange={(v) => set("whatsapp", v)} placeholder="+998 90 ..." />
            <Field label="Address" value={settings.address} onChange={(v) => set("address", v)} />
          </>
        )}
        {activeTab === "Social" && (
          <>
            <Field label="Instagram" value={settings.instagram} onChange={(v) => set("instagram", v)} placeholder="@mado.uz" />
            <Field label="Telegram" value={settings.telegram} onChange={(v) => set("telegram", v)} placeholder="@madouz" />
            <Field label="Facebook" value={settings.facebook} onChange={(v) => set("facebook", v)} placeholder="facebook.com/madouz" />
            <Field label="YouTube" value={settings.youtube} onChange={(v) => set("youtube", v)} placeholder="youtube.com/@mado" />
          </>
        )}
        {activeTab === "Restaurant" && (
          <>
            <SelectField label="Currency" value={settings.currency} onChange={(v) => set("currency", v)}
              options={["UZS", "USD", "EUR"]} />
            <Field label="Min. Reservation Guests" value={settings.minGuests} onChange={(v) => set("minGuests", v)} />
            <Field label="Max. Reservation Guests" value={settings.maxGuests} onChange={(v) => set("maxGuests", v)} />
            <SelectField label="Online Reservations" value={settings.reservationEnabled} onChange={(v) => set("reservationEnabled", v)}
              options={["yes", "no"]} />
          </>
        )}
        {activeTab === "SEO" && (
          <>
            <Field label="Meta Title" value={settings.metaTitle} onChange={(v) => set("metaTitle", v)}
              placeholder="MADO \u2014 Turkish Restaurant in Tashkent" />
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Meta Description</label>
              <textarea
                rows={3}
                value={settings.metaDescription}
                onChange={(e) => set("metaDescription", e.target.value)}
                placeholder="Short description for search engines..."
                className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">{settings.metaDescription.length} / 160 chars</p>
            </div>
            <Field label="OG Image URL" value={settings.ogImage} onChange={(v) => set("ogImage", v)}
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
          <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Settings saved successfully</span>
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
