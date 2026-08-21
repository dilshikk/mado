import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGS = [
  { code: "ru", flag: "🇷🇺", label: "Русский" },
  { code: "uz", flag: "🇺🇿", label: "Узбекский" },
  { code: "en", flag: "🇬🇧", label: "Английский" },
  { code: "tr", flag: "🇹🇷", label: "Турецкий" },
] as const;

type LangCode = "ru" | "uz" | "en" | "tr";

type LangContent = {
  headline: string;
  subheadline: string;
  description: string;
  cta: string;
};

const DEFAULTS: Record<LangCode, LangContent> = {
  ru: { headline: "Кейтеринг MADO", subheadline: "Для любых мероприятий", description: "Мы организуем кейтеринг для корпоративных мероприятий, свадеб, дней рождения и частных вечеринок.", cta: "Оставить заявку" },
  uz: { headline: "MADO Keytring", subheadline: "Har qanday tadbir uchun", description: "Biz korporativ tadbirlar, to'ylar, tug'ilgan kunlar va xususiy partiyalar uchun keytering tashkil qilamiz.", cta: "Ariza qoldirish" },
  en: { headline: "MADO Catering", subheadline: "For any occasion", description: "We organise catering for corporate events, weddings, birthdays and private parties.", cta: "Send a request" },
  tr: { headline: "MADO Catering", subheadline: "Her etkinlik için", description: "Kurumsal etkinlikler, düğünler, doğum günleri ve özel partiler için catering organize ediyoruz.", cta: "Talep gönderin" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CateringContentPage() {
  const [activeLang, setActiveLang] = useState<LangCode>("ru");
  const [content, setContent] = useState<Record<LangCode, LangContent>>(DEFAULTS);
  const [loadedLangs, setLoadedLangs] = useState<Set<LangCode>>(new Set());
  const [loadingLang, setLoadingLang] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loadedLangs.has(activeLang)) return;

    const load = async () => {
      try {
        setLoadingLang(true);
        const data = await api.getCateringContent(activeLang) as LangContent;
        setContent((c) => ({ ...c, [activeLang]: data }));
        setLoadedLangs((s) => new Set(s).add(activeLang));
      } catch {
        setLoadedLangs((s) => new Set(s).add(activeLang));
      } finally {
        setLoadingLang(false);
      }
    };

    void load();
  }, [activeLang]);

  const cur = content[activeLang];

  const set = (key: keyof LangContent, value: string) =>
    setContent((c) => ({ ...c, [activeLang]: { ...c[activeLang], [key]: value } }));

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateCateringContent(activeLang, content[activeLang]);
      toast.success(`Контент сохранён для ${LANGS.find((l) => l.code === activeLang)?.label}`);
    } catch {
      toast.error("Не удалось сохранить контент");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Контент страницы кейтеринга</h1>
          <p className="text-sm text-muted-foreground mt-1">Редактируйте текст страницы кейтеринга на всех языках</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loadingLang}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
      </div>

      {/* Language tabs */}
      <div className="flex gap-2 flex-wrap">
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => setActiveLang(l.code)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeLang === l.code
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <span>{l.flag}</span> {l.label}
          </button>
        ))}
      </div>

      {/* Fields or loader */}
      {loadingLang ? (
        <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <Field label="Заголовок"       value={cur.headline}    onChange={(v) => set("headline", v)} />
          <Field label="Подзаголовок"    value={cur.subheadline} onChange={(v) => set("subheadline", v)} />
          <Field label="Описание"        value={cur.description} onChange={(v) => set("description", v)} multiline />
          <Field label="Текст кнопки"    value={cur.cta}         onChange={(v) => set("cta", v)} />
        </div>
      )}

      {/* Live preview */}
      {!loadingLang && (
        <div className="bg-muted/50 border border-border rounded-xl p-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Предпросмотр</p>
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-bold">{cur.headline}</h2>
            <p className="text-base text-muted-foreground">{cur.subheadline}</p>
            <p className="text-sm mt-2 max-w-lg">{cur.description}</p>
            <div className="mt-3">
              <span className="inline-block px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg">
                {cur.cta}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, multiline = false,
}: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
      {multiline ? (
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )}
    </div>
  );
}
