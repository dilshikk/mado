import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, AlertCircle, Loader2, ArrowUp, ArrowDown, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";

type Section = {
  id: number;
  slug: string;
  label: string;
  label_ru: string | null;
  label_uz: string | null;
  label_en: string | null;
  label_tr: string | null;
  position: number;
  categoryCount?: number;
};

type SectionFormData = {
  slug: string;
  label_ru: string;
  label_uz: string;
  label_en: string;
  label_tr: string;
};

const LANGS = [
  { code: "ru" as const, flag: "🇷🇺", label: "Русский" },
  { code: "uz" as const, flag: "🇺🇿", label: "Ўзбек" },
  { code: "en" as const, flag: "🇬🇧", label: "English" },
  { code: "tr" as const, flag: "🇹🇷", label: "Türkçe" },
];

const DEFAULT_FORM: SectionFormData = { slug: "", label_ru: "", label_uz: "", label_en: "", label_tr: "" };

function getDisplayLabel(section: Section): string {
  return [section.label_ru, section.label_uz, section.label_en, section.label_tr].find(
    (v): v is string => typeof v === "string" && v.trim() !== ""
  ) ?? section.label ?? "Без названия";
}

// ─── Section form ───────────────────────────────────────────────────────────────

function SectionForm({
  initialData, onSubmit, onCancel, saving,
}: {
  initialData?: Partial<SectionFormData>;
  onSubmit: (data: SectionFormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<SectionFormData>({ ...DEFAULT_FORM, ...initialData });
  const [activeLang, setActiveLang] = useState<"ru" | "uz" | "en" | "tr">("ru");

  const set = (key: keyof SectionFormData, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const hasAnyLabel = [form.label_ru, form.label_uz, form.label_en, form.label_tr].some((v) => v.trim() !== "");
  const labelKey = `label_${activeLang}` as keyof SectionFormData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAnyLabel) { alert("Заполните название хотя бы на одном языке"); return; }
    if (!form.slug.trim()) { alert("Укажите короткий идентификатор (slug), например food"); return; }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-accent/50 rounded-xl p-4 space-y-4">
      {/* Language tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {LANGS.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setActiveLang(l.code)}
            disabled={saving}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
              activeLang === l.code ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <span>{l.flag}</span> {l.label}
          </button>
        ))}
      </div>

      {/* Name input */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Название вкладки ({activeLang.toUpperCase()})
        </label>
        <input
          autoFocus
          value={form[labelKey]}
          onChange={(e) => set(labelKey, e.target.value)}
          placeholder="например, Еда"
          disabled={saving}
          className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Идентификатор (латиницей, без пробелов)
        </label>
        <input
          value={form.slug}
          onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
          placeholder="food"
          disabled={saving}
          className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 font-mono"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <Loader2 className="w-3 h-3 animate-spin" />}
          Сохранить
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm disabled:opacity-50"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────────

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | "new" | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => { void loadSections(); }, []);

  const loadSections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSections();
      setSections(Array.isArray(data) ? (data as Section[]) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить разделы меню");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (data: SectionFormData) => {
    try {
      setSavingId("new");
      await api.createSection(data);
      setAdding(false);
      await loadSections();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать раздел");
    } finally {
      setSavingId(null);
    }
  };

  const saveEdit = async (id: number, data: SectionFormData) => {
    try {
      setSavingId(id);
      await api.updateSection(id, data);
      setEditingId(null);
      await loadSections();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить раздел");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить раздел? Категории, привязанные к нему, останутся без раздела.")) return;
    try {
      setDeletingId(id);
      await api.deleteSection(id);
      await loadSections();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить раздел");
    } finally {
      setDeletingId(null);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const reordered = [...sections];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setSections(reordered);

    try {
      setReordering(true);
      await api.reorderSections(reordered.map((s) => s.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось изменить порядок");
      await loadSections();
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Разделы меню</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Главные вкладки меню (ЕДА / НАПИТКИ / ДЕСЕРТЫ / НАВЫНОС). Категории привязываются к ним как дочерние.
          </p>
        </div>
        <button
          onClick={() => { setEditingId(null); setAdding(true); }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 shrink-0"
        >
          <Plus className="w-4 h-4" /> Добавить раздел
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-700 font-medium">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-sm underline">Закрыть</button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && (
        <>
          {adding && (
            <SectionForm onSubmit={handleAdd} onCancel={() => setAdding(false)} saving={savingId === "new"} />
          )}

          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            {sections.map((section, index) => (
              <div key={section.id} className="group">
                {editingId === section.id ? (
                  <div className="p-3">
                    <SectionForm
                      initialData={{
                        slug: section.slug,
                        label_ru: section.label_ru ?? "",
                        label_uz: section.label_uz ?? "",
                        label_en: section.label_en ?? "",
                        label_tr: section.label_tr ?? "",
                      }}
                      onSubmit={(data) => saveEdit(section.id, data)}
                      onCancel={() => setEditingId(null)}
                      saving={savingId === section.id}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30">
                    <LayoutGrid className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{getDisplayLabel(section)}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {section.slug}
                        {typeof section.categoryCount === "number" && ` · ${section.categoryCount} категорий`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => move(index, -1)}
                        disabled={index === 0 || reordering}
                        className="p-1.5 rounded hover:bg-muted disabled:opacity-30"
                        title="Переместить выше"
                      >
                        <ArrowUp className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => move(index, 1)}
                        disabled={index === sections.length - 1 || reordering}
                        className="p-1.5 rounded hover:bg-muted disabled:opacity-30"
                        title="Переместить ниже"
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => { setAdding(false); setEditingId(section.id); }}
                        disabled={savingId !== null || deletingId !== null}
                        className="p-1.5 rounded hover:bg-muted disabled:opacity-50"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(section.id)}
                        disabled={deletingId === section.id || savingId !== null}
                        className="p-1.5 rounded hover:bg-destructive/10 disabled:opacity-50 flex items-center gap-1"
                      >
                        {deletingId === section.id
                          ? <Loader2 className="w-3.5 h-3.5 text-destructive animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {sections.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">Нет разделов. Создайте первый!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
