import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, MapPin, Briefcase, Users, X, Save, Globe, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";

type VacancyStatus = "published" | "draft" | "closed";

type Vacancy = {
  id: string;
  position: string;
  position_ru: string;
  position_uz: string;
  position_en: string;
  position_tr: string;
  department: string;
  branch: string;
  employment_type: string;
  salary: string;
  status: VacancyStatus;
  applicationCount: number;
  description_ru: string;
  description_uz: string;
  description_en: string;
  description_tr: string;
  requirements_ru: string;
  requirements_uz: string;
  requirements_en: string;
  requirements_tr: string;
};

const STATUS_META: Record<VacancyStatus, { label: string; color: string }> = {
  published: { label: "Published", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  draft: { label: "Draft", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

// Language labels with flags
const LANG_TABS = [
  { key: "ru", label: "RU", flag: "🇷🇺", name: "Русский" },
  { key: "uz", label: "UZ", flag: "🇺🇿", name: "O'zbek" },
  { key: "en", label: "EN", flag: "🇬🇧", name: "English" },
  { key: "tr", label: "TR", flag: "🇹🇷", name: "Türkçe" },
] as const;
type LangKey = "ru" | "uz" | "en" | "tr";

const DEPARTMENTS = ["Service", "Kitchen", "Bar", "Management", "Delivery", "Cleaning"];
const BRANCHES = ["Tashkent — Chilanzar", "Tashkent — Yunusabad", "Tashkent — Mirzo Ulugbek", "All branches"];
const TYPES = ["Full Time", "Part Time", "Internship", "Seasonal"];

type ModalMode = "add" | "edit" | "view" | null;

function emptyVacancy(): Vacancy {
  return {
    id: "", position: "", position_ru: "", position_uz: "", position_en: "", position_tr: "",
    department: "Service", branch: "All branches", employment_type: "Full Time",
    status: "published", applicationCount: 0, salary: "",
    description_ru: "", description_uz: "", description_en: "", description_tr: "",
    requirements_ru: "", requirements_uz: "", requirements_en: "", requirements_tr: "",
  };
}

/** Returns how many of the 4 language position fields are filled */
function langFillCount(v: Vacancy): number {
  return [v.position_ru, v.position_uz, v.position_en, v.position_tr].filter(Boolean).length;
}

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [target, setTarget] = useState<Vacancy | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | VacancyStatus>("all");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setError(null);
      const data = await api.getVacancies();
      const rows = Array.isArray(data) ? data : [];
      setVacancies(rows.map((v: Record<string, unknown>) => ({
        id: String(v.id ?? ""),
        position: String(v.position ?? ""),
        position_ru: String(v.position_ru ?? ""),
        position_uz: String(v.position_uz ?? ""),
        position_en: String(v.position_en ?? ""),
        position_tr: String(v.position_tr ?? ""),
        department: String(v.department ?? ""),
        branch: String(v.branch ?? ""),
        employment_type: String(v.employment_type ?? "Full Time"),
        salary: String(v.salary ?? ""),
        status: (v.status as VacancyStatus) ?? "published",
        applicationCount: Number(v.applicationCount ?? v.application_count ?? 0),
        description_ru: String(v.description_ru ?? ""),
        description_uz: String(v.description_uz ?? ""),
        description_en: String(v.description_en ?? ""),
        description_tr: String(v.description_tr ?? ""),
        requirements_ru: String(v.requirements_ru ?? ""),
        requirements_uz: String(v.requirements_uz ?? ""),
        requirements_en: String(v.requirements_en ?? ""),
        requirements_tr: String(v.requirements_tr ?? ""),
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vacancies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = statusFilter === "all" ? vacancies : vacancies.filter((v) => v.status === statusFilter);

  const openAdd = () => { setTarget(emptyVacancy()); setModalMode("add"); };
  const openEdit = (v: Vacancy) => { setTarget({ ...v }); setModalMode("edit"); };
  const openView = (v: Vacancy) => { setTarget(v); setModalMode("view"); };

  const handleSave = async () => {
    if (!target) return;
    setSaving(true);
    try {
      const payload = {
        position: target.position || target.position_en || target.position_ru || "Untitled",
        position_ru: target.position_ru,
        position_uz: target.position_uz,
        position_en: target.position_en,
        position_tr: target.position_tr,
        department: target.department,
        branch: target.branch,
        employment_type: target.employment_type,
        salary: target.salary,
        status: target.status,
        description_ru: target.description_ru,
        description_uz: target.description_uz,
        description_en: target.description_en,
        description_tr: target.description_tr,
        requirements_ru: target.requirements_ru,
        requirements_uz: target.requirements_uz,
        requirements_en: target.requirements_en,
        requirements_tr: target.requirements_tr,
      };
      if (modalMode === "add") {
        await api.createVacancy(payload);
      } else {
        await api.updateVacancy(target.id, payload);
      }
      await load();
      setModalMode(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save vacancy");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vacancy? All applications will also be removed.")) return;
    try {
      await api.deleteVacancy(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete vacancy");
    }
  };

  const publishedCount = vacancies.filter((v) => v.status === "published").length;
  const totalApps = vacancies.reduce((s, v) => s + v.applicationCount, 0);

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Vacancies</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {publishedCount} active · {totalApps} total applications
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> Add Vacancy
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "published", "draft", "closed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize",
              statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {s === "all" ? "All" : STATUS_META[s].label}
            <span className="ml-1.5 text-xs opacity-70">
              {s === "all" ? vacancies.length : vacancies.filter((v) => v.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))
        ) : filtered.map((vac) => {
          const filled = langFillCount(vac);
          return (
            <div
              key={vac.id}
              className="group bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4 hover:border-accent/50 transition-colors"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">
                      {vac.position_ru || vac.position_en || vac.position}
                    </p>
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", STATUS_META[vac.status].color)}>
                      {STATUS_META[vac.status].label}
                    </span>
                    {/* Language fill indicator */}
                    <span className={cn(
                      "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border",
                      filled === 4
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : filled > 0
                        ? "border-yellow-200 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                        : "border-border bg-muted text-muted-foreground"
                    )}>
                      <Globe className="w-3 h-3" />
                      {filled}/4 langs
                    </span>
                  </div>
                  {/* Secondary names row */}
                  {(vac.position_uz || vac.position_en || vac.position_tr) && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {vac.position_uz && <span className="text-[11px] text-muted-foreground">UZ: {vac.position_uz}</span>}
                      {vac.position_en && <span className="text-[11px] text-muted-foreground">EN: {vac.position_en}</span>}
                      {vac.position_tr && <span className="text-[11px] text-muted-foreground">TR: {vac.position_tr}</span>}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {vac.branch}</span>
                    <span>{vac.department}</span>
                    <span>{vac.employment_type}</span>
                    {vac.salary && <span>{vac.salary}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-sm font-bold text-foreground">{vac.applicationCount}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">applicants</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openView(vac)} className="p-2 rounded-lg hover:bg-muted" title="View">
                    <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => openEdit(vac)} className="p-2 rounded-lg hover:bg-muted" title="Edit">
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDelete(vac.id)} className="p-2 rounded-lg hover:bg-destructive/10" title="Delete">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No vacancies</p>
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      {(modalMode === "add" || modalMode === "edit") && target && (
        <VacancyFormModal
          mode={modalMode}
          vacancy={target}
          onChange={setTarget}
          onSave={handleSave}
          onClose={() => setModalMode(null)}
          saving={saving}
        />
      )}

      {/* View modal */}
      {modalMode === "view" && target && (
        <VacancyViewModal
          vacancy={target}
          onEdit={() => setModalMode("edit")}
          onClose={() => setModalMode(null)}
        />
      )}
    </div>
  );
}

// ── Form Modal ────────────────────────────────────────────────────────────────

function VacancyFormModal({
  mode, vacancy, onChange, onSave, onClose, saving,
}: {
  mode: "add" | "edit";
  vacancy: Vacancy;
  onChange: (v: Vacancy) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [activeLang, setActiveLang] = useState<LangKey>("ru");
  const set = <K extends keyof Vacancy>(key: K, value: Vacancy[K]) => onChange({ ...vacancy, [key]: value });

  const inputCls = "w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring";
  const textareaCls = `${inputCls} resize-none`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border flex items-center justify-between px-6 py-4 z-10">
          <h2 className="font-serif font-bold text-lg">{mode === "add" ? "Add Vacancy" : "Edit Vacancy"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* ── Section: Multilingual position names ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold">Position titles by language</span>
            </div>

            {/* Lang tabs */}
            <div className="flex gap-1 mb-3 border border-border rounded-lg p-1 w-fit">
              {LANG_TABS.map(({ key, label, flag, name }) => {
                const filled = Boolean(vacancy[`position_${key}` as keyof Vacancy]);
                return (
                  <button
                    key={key}
                    onClick={() => setActiveLang(key)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      activeLang === key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                    title={name}
                  >
                    <span>{flag}</span>
                    <span>{label}</span>
                    {filled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />}
                  </button>
                );
              })}
            </div>

            {LANG_TABS.map(({ key, name }) => (
              <div key={key} className={activeLang === key ? "block" : "hidden"}>
                <label className="text-sm font-medium mb-1.5 block">
                  Position name — {name}
                </label>
                <input
                  value={String(vacancy[`position_${key}` as keyof Vacancy] ?? "")}
                  onChange={(e) => set(`position_${key}` as keyof Vacancy, e.target.value as Vacancy[keyof Vacancy])}
                  placeholder={`Position name in ${name}...`}
                  className={inputCls}
                />
              </div>
            ))}
          </section>

          {/* ── Section: Core fields ── */}
          <section>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Department</label>
                <select value={vacancy.department} onChange={(e) => set("department", e.target.value)}
                  className={inputCls}>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Branch</label>
                <select value={vacancy.branch} onChange={(e) => set("branch", e.target.value)}
                  className={inputCls}>
                  {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Employment Type</label>
                <select value={vacancy.employment_type} onChange={(e) => set("employment_type", e.target.value)}
                  className={inputCls}>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Salary</label>
                <input value={vacancy.salary} onChange={(e) => set("salary", e.target.value)}
                  placeholder="e.g. 4,000,000 UZS"
                  className={inputCls} />
              </div>
            </div>
          </section>

          {/* ── Section: Multilingual description & requirements ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold">Description & Requirements by language</span>
            </div>

            {/* Reuse same lang tabs for description */}
            <div className="flex gap-1 mb-3 border border-border rounded-lg p-1 w-fit">
              {LANG_TABS.map(({ key, label, flag, name }) => (
                <button
                  key={key}
                  onClick={() => setActiveLang(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    activeLang === key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  title={name}
                >
                  <span>{flag}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {LANG_TABS.map(({ key, name }) => (
              <div key={key} className={cn("space-y-3", activeLang === key ? "block" : "hidden")}>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Description — {name}</label>
                  <textarea rows={3} value={String(vacancy[`description_${key}` as keyof Vacancy] ?? "")}
                    onChange={(e) => set(`description_${key}` as keyof Vacancy, e.target.value as Vacancy[keyof Vacancy])}
                    placeholder={`Role description in ${name}...`}
                    className={textareaCls} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Requirements — {name}</label>
                  <textarea rows={3} value={String(vacancy[`requirements_${key}` as keyof Vacancy] ?? "")}
                    onChange={(e) => set(`requirements_${key}` as keyof Vacancy, e.target.value as Vacancy[keyof Vacancy])}
                    placeholder={`• Requirement 1\n• Requirement 2`}
                    className={textareaCls} />
                </div>
              </div>
            ))}
          </section>

          {/* ── Status ── */}
          <section>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <div className="flex gap-2">
              {(["published", "draft", "closed"] as VacancyStatus[]).map((s) => (
                <label key={s} className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors",
                  vacancy.status === s ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                )}>
                  <input type="radio" name="vstatus" value={s} checked={vacancy.status === s}
                    onChange={() => set("status", s)} className="w-3.5 h-3.5" />
                  <span className="text-sm">{STATUS_META[s].label}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border flex gap-3 px-6 py-4">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg">Cancel</button>
          <button onClick={onSave} disabled={saving} className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2 disabled:opacity-60">
            <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Vacancy"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── View Modal ────────────────────────────────────────────────────────────────

function VacancyViewModal({
  vacancy, onEdit, onClose,
}: { vacancy: Vacancy; onEdit: () => void; onClose: () => void }) {
  const [activeLang, setActiveLang] = useState<LangKey>("ru");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="font-serif font-bold">
              {vacancy.position_ru || vacancy.position_en || vacancy.position}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{vacancy.department} · {vacancy.employment_type}</p>
          </div>
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", STATUS_META[vacancy.status].color)}>
            {STATUS_META[vacancy.status].label}
          </span>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> {vacancy.branch}</span>
            <span className="flex items-center gap-1 text-muted-foreground"><Users className="w-3.5 h-3.5" /> {vacancy.applicationCount} applicants</span>
          </div>
          {vacancy.salary && (
            <div className="bg-muted/50 rounded-xl px-4 py-3">
              <p className="text-xs text-muted-foreground">Salary</p>
              <p className="text-sm font-semibold mt-0.5">{vacancy.salary}</p>
            </div>
          )}

          {/* Position names all languages */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Position names</p>
            <div className="grid grid-cols-2 gap-2">
              {LANG_TABS.map(({ key, flag, label }) => {
                const val = String(vacancy[`position_${key}` as keyof Vacancy] ?? "");
                return (
                  <div key={key} className={cn("rounded-lg px-3 py-2 text-sm border", val ? "border-border bg-muted/30" : "border-dashed border-border/50 opacity-50")}>
                    <span className="text-xs text-muted-foreground">{flag} {label}</span>
                    <p className="font-medium mt-0.5">{val || "—"}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lang tabs for description */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Content</p>
            <div className="flex gap-1 mb-3 border border-border rounded-lg p-1 w-fit">
              {LANG_TABS.map(({ key, label, flag }) => (
                <button key={key} onClick={() => setActiveLang(key)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                    activeLang === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  )}>
                  {flag} {label}
                </button>
              ))}
            </div>
            {LANG_TABS.map(({ key }) => {
              const desc = String(vacancy[`description_${key}` as keyof Vacancy] ?? "");
              const req = String(vacancy[`requirements_${key}` as keyof Vacancy] ?? "");
              return (
                <div key={key} className={activeLang === key ? "space-y-3" : "hidden"}>
                  {desc ? (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Description</p>
                      <p className="text-sm leading-relaxed text-foreground/80">{desc}</p>
                    </div>
                  ) : <p className="text-sm text-muted-foreground italic">No description</p>}
                  {req && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Requirements</p>
                      <p className="text-sm whitespace-pre-line leading-relaxed text-foreground/80">{req}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="sticky bottom-0 bg-card border-t border-border flex gap-3 px-6 py-4">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg">Close</button>
          <button onClick={onEdit} className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2">
            <Edit2 className="w-4 h-4" /> Edit
          </button>
        </div>
      </div>
    </div>
  );
}
