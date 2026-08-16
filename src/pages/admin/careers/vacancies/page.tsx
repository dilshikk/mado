import { useState } from "react";
import { Plus, Edit2, Trash2, MapPin, Briefcase, Users, X, Save } from "lucide-react";
import { cn } from "@/lib/utils.ts";

type VacancyStatus = "published" | "draft" | "closed";

type Vacancy = {
  id: string;
  position: string;
  department: string;
  branch: string;
  type: string;
  status: VacancyStatus;
  applications: number;
  description: string;
  requirements: string;
  salary: string;
};

const STATUS_META: Record<VacancyStatus, { label: string; color: string }> = {
  published: { label: "Published", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  draft: { label: "Draft", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

const DEPARTMENTS = ["Service", "Kitchen", "Bar", "Management", "Delivery", "Cleaning"];
const BRANCHES = ["Tashkent — Chilanzar", "Tashkent — Yunusabad", "Tashkent — Mirzo Ulugbek", "All branches"];
const TYPES = ["Full Time", "Part Time", "Internship", "Seasonal"];

const SAMPLE: Vacancy[] = [
  { id: "1", position: "Waiter", department: "Service", branch: "All branches", type: "Full Time", status: "published", applications: 5, salary: "3,500,000–4,500,000 UZS", description: "We are looking for a friendly and attentive waiter to join our team. You will take orders, serve food and beverages, and ensure guests have an excellent dining experience.", requirements: "\u2022 1+ year experience in a restaurant\n\u2022 Friendly attitude and good communication\n\u2022 Ability to work in a team\n\u2022 Knowledge of Russian or Uzbek required" },
  { id: "2", position: "Barista", department: "Bar", branch: "Tashkent — Chilanzar", type: "Full Time", status: "published", applications: 3, salary: "4,000,000–5,000,000 UZS", description: "Prepare and serve hot and cold beverages including various types of coffee and tea. Maintain clean and tidy bar area.", requirements: "\u2022 Experience with espresso machines\n\u2022 Knowledge of Turkish tea culture is a plus\n\u2022 Friendly and presentable" },
  { id: "3", position: "Runner", department: "Service", branch: "Tashkent — Yunusabad", type: "Part Time", status: "draft", applications: 0, salary: "2,500,000 UZS", description: "Assist waiters by delivering food and beverages from the kitchen to tables in a timely manner.", requirements: "\u2022 No prior experience required\n\u2022 Physical stamina\n\u2022 Ability to work evening shifts" },
  { id: "4", position: "Chef de Partie", department: "Kitchen", branch: "All branches", type: "Full Time", status: "published", applications: 2, salary: "7,000,000–900,000 UZS", description: "Manage a section of the kitchen and prepare dishes according to MADO recipes and standards.", requirements: "\u2022 3+ years experience in a professional kitchen\n\u2022 Knowledge of Turkish and Middle-Eastern cuisine\n\u2022 HACCP certification preferred" },
  { id: "5", position: "Cashier", department: "Service", branch: "Tashkent — Mirzo Ulugbek", type: "Full Time", status: "closed", applications: 8, salary: "3,000,000 UZS", description: "Process customer payments, handle cash and card transactions, and maintain accurate records.", requirements: "\u2022 Numeracy skills\n\u2022 Experience with POS systems preferred\n\u2022 Honesty and accuracy" },
];

type ModalMode = "add" | "edit" | "view" | null;

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>(SAMPLE);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [target, setTarget] = useState<Vacancy | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | VacancyStatus>("all");

  const filtered = statusFilter === "all" ? vacancies : vacancies.filter((v) => v.status === statusFilter);

  const emptyVacancy = (): Vacancy => ({
    id: "", position: "", department: "Service", branch: "All branches",
    type: "Full Time", status: "published", applications: 0,
    description: "", requirements: "", salary: "",
  });

  const openAdd = () => { setTarget(emptyVacancy()); setModalMode("add"); };
  const openEdit = (v: Vacancy) => { setTarget({ ...v }); setModalMode("edit"); };
  const openView = (v: Vacancy) => { setTarget(v); setModalMode("view"); };

  const handleSave = () => {
    if (!target) return;
    if (modalMode === "add") {
      setVacancies([...vacancies, { ...target, id: Date.now().toString() }]);
    } else {
      setVacancies(vacancies.map((v) => v.id === target.id ? target : v));
    }
    setModalMode(null);
  };

  const handleDelete = (id: string) => setVacancies(vacancies.filter((v) => v.id !== id));

  const publishedCount = vacancies.filter((v) => v.status === "published").length;
  const totalApps = vacancies.reduce((s, v) => s + v.applications, 0);

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
        {filtered.map((vac) => (
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
                  <p className="font-semibold text-foreground">{vac.position}</p>
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", STATUS_META[vac.status].color)}>
                    {STATUS_META[vac.status].label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {vac.branch}</span>
                  <span>{vac.department}</span>
                  <span>{vac.type}</span>
                  {vac.salary && <span>{vac.salary}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-sm font-bold text-foreground">{vac.applications}</p>
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
        ))}
        {filtered.length === 0 && (
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
        />
      )}

      {/* View modal */}
      {modalMode === "view" && target && (
        <VacancyViewModal
          vacancy={target}
          onEdit={() => { setModalMode("edit"); }}
          onClose={() => setModalMode(null)}
        />
      )}
    </div>
  );
}

function VacancyFormModal({
  mode, vacancy, onChange, onSave, onClose,
}: {
  mode: "add" | "edit";
  vacancy: Vacancy;
  onChange: (v: Vacancy) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const set = <K extends keyof Vacancy>(key: K, value: Vacancy[K]) => onChange({ ...vacancy, [key]: value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-card border-b border-border flex items-center justify-between px-6 py-4">
          <h2 className="font-serif font-bold text-lg">{mode === "add" ? "Add Vacancy" : "Edit Vacancy"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Position Title</label>
            <input value={vacancy.position} onChange={(e) => set("position", e.target.value)}
              placeholder="e.g. Senior Waiter"
              className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Department</label>
              <select value={vacancy.department} onChange={(e) => set("department", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none">
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Branch</label>
              <select value={vacancy.branch} onChange={(e) => set("branch", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none">
                {BRANCHES.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Employment Type</label>
              <select value={vacancy.type} onChange={(e) => set("type", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none">
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Salary</label>
              <input value={vacancy.salary} onChange={(e) => set("salary", e.target.value)}
                placeholder="e.g. 4,000,000 UZS"
                className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Description</label>
            <textarea rows={4} value={vacancy.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Role description..."
              className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Requirements</label>
            <textarea rows={4} value={vacancy.requirements} onChange={(e) => set("requirements", e.target.value)}
              placeholder="• Requirement 1&#10;• Requirement 2"
              className="w-full px-3 py-2.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
          <div>
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
          </div>
        </div>
        <div className="sticky bottom-0 bg-card border-t border-border flex gap-3 px-6 py-4">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg">Cancel</button>
          <button onClick={onSave} className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Save Vacancy
          </button>
        </div>
      </div>
    </div>
  );
}

function VacancyViewModal({
  vacancy, onEdit, onClose,
}: { vacancy: Vacancy; onEdit: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="font-serif font-bold">{vacancy.position}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{vacancy.department} · {vacancy.type}</p>
          </div>
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", STATUS_META[vacancy.status].color)}>
            {STATUS_META[vacancy.status].label}
          </span>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> {vacancy.branch}</span>
            <span className="flex items-center gap-1 text-muted-foreground"><Users className="w-3.5 h-3.5" /> {vacancy.applications} applicants</span>
          </div>
          {vacancy.salary && (
            <div className="bg-muted/50 rounded-xl px-4 py-3">
              <p className="text-xs text-muted-foreground">Salary</p>
              <p className="text-sm font-semibold mt-0.5">{vacancy.salary}</p>
            </div>
          )}
          {vacancy.description && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Description</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{vacancy.description}</p>
            </div>
          )}
          {vacancy.requirements && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Requirements</p>
              <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{vacancy.requirements}</p>
            </div>
          )}
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
