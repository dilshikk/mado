import { useEffect, useState } from "react";
import { Eye, Clock, Search, FileText, AlertCircle, MapPin } from "lucide-react";
import api from "@/lib/api.ts";
import { cn } from "@/lib/utils.ts";

type AppStatus = "new" | "reviewing" | "interview" | "accepted" | "rejected";

type Application = {
  id: string;
  name: string;
  position: string;
  position_ru: string;
  branch: string;
  locationName: string;
  phone: string;
  email: string;
  experience: string;
  message: string;
  note: string;
  status: AppStatus;
  date: string;
};

const STATUS_META: Record<AppStatus, { label: string; color: string; next: AppStatus[] }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400", next: ["reviewing", "rejected"] },
  reviewing: { label: "Reviewing", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400", next: ["interview", "rejected"] },
  interview: { label: "Interview", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400", next: ["accepted", "rejected"] },
  accepted: { label: "Accepted", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400", next: [] },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400", next: ["reviewing"] },
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [filter, setFilter] = useState<"all" | AppStatus>("all");
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<Application | null>(null);
  const [note, setNote] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getApplications({});
      const mapped = Array.isArray(data)
        ? data.map((item: Record<string, unknown>) => ({
            id: String(item.id ?? ""),
            name: String(item.name ?? "Unknown"),
            position: String(item.position_ru || item.position || "General position"),
            position_ru: String(item.position_ru ?? ""),
            branch: String(item.branch ?? ""),
            // Prefer location from DB; fallback to vacancy branch field
            locationName: String(
              item.location_name_ru || item.location_name || item.branch || "—"
            ),
            phone: String(item.phone ?? "N/A"),
            email: String(item.email ?? "N/A"),
            experience: String(item.experience ?? "Not provided"),
            message: String(item.message ?? ""),
            note: String(item.note ?? ""),
            status: (item.status ?? "new") as AppStatus,
            date: new Date(String(item.created_at ?? Date.now())).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          }))
        : [];
      setApps(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const filtered = apps.filter((a) => {
    const matchFilter = filter === "all" || a.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      a.name.toLowerCase().includes(q) ||
      a.position.toLowerCase().includes(q) ||
      a.locationName.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const updateStatus = async (id: string, status: AppStatus) => {
    try {
      await api.updateApplicationStatus(id, status);
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      if (viewing?.id === id) setViewing((v) => (v ? { ...v, status } : v));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const saveNote = async () => {
    if (!viewing) return;
    setNoteSaving(true);
    try {
      await api.updateApplicationNote(viewing.id, note);
      setApps((prev) => prev.map((a) => (a.id === viewing.id ? { ...a, note } : a)));
      setViewing((v) => (v ? { ...v, note } : v));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setNoteSaving(false);
    }
  };

  const openViewing = (app: Application) => {
    setViewing(app);
    setNote(app.note ?? "");
  };

  const counts = (Object.keys(STATUS_META) as AppStatus[]).map((s) => ({
    status: s,
    count: apps.filter((a) => a.status === s).length,
  }));

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-serif font-bold">Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {apps.filter((a) => a.status === "new").length} new ·{" "}
          {apps.filter((a) => a.status === "interview").length} in interview
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Status count cards */}
      <div className="grid grid-cols-5 gap-2">
        {counts.map(({ status, count }) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "rounded-xl p-3 text-center border transition-all",
              filter === status
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-accent/50"
            )}
          >
            <p className="text-xl font-bold">{count}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {STATUS_META[status].label}
            </p>
          </button>
        ))}
      </div>

      {/* Search + filter tabs */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, position or restaurant..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {(["all", ...Object.keys(STATUS_META)] as ("all" | AppStatus)[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                filter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {s === "all" ? "All" : STATUS_META[s as AppStatus].label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="divide-y divide-border">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-4">
                  <div className="w-9 h-9 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-2 w-48 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))
            : filtered.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between px-4 py-4 hover:bg-muted/30 group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary-foreground">
                        {app.name[0]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{app.name}</p>
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                            STATUS_META[app.status].color
                          )}
                        >
                          {STATUS_META[app.status].label}
                        </span>
                        {app.note && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent font-medium">
                            has note
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">{app.position}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {app.locationName}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {app.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openViewing(app)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="w-3 h-3" /> Review
                  </button>
                </div>
              ))}
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No applications</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewing(null)} />
          <div className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border flex items-center justify-between px-6 py-4">
              <div>
                <h2 className="font-serif font-bold">{viewing.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {viewing.position} · {viewing.locationName}
                </p>
              </div>
              <span
                className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full",
                  STATUS_META[viewing.status].color
                )}
              >
                {STATUS_META[viewing.status].label}
              </span>
            </div>
            <div className="p-6 space-y-5">
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Contact
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <InfoField label="Phone" value={viewing.phone} />
                  <InfoField label="Email" value={viewing.email} />
                  <InfoField label="Applied" value={viewing.date} />
                  <InfoField label="Experience" value={viewing.experience} />
                  <InfoField label="Restaurant" value={viewing.locationName} />
                </div>
              </section>
              {viewing.message && (
                <section>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Cover Message
                  </p>
                  <p className="text-sm bg-muted rounded-xl p-4 leading-relaxed">
                    {viewing.message}
                  </p>
                </section>
              )}
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Internal Note
                </p>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add HR notes about this candidate..."
                  className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                {note !== (viewing.note ?? "") && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Unsaved changes — click Save & Close to persist
                  </p>
                )}
              </section>
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Update Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(STATUS_META) as AppStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(viewing.id, s)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                        viewing.status === s
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted"
                      )}
                    >
                      {STATUS_META[s].label}
                    </button>
                  ))}
                </div>
              </section>
            </div>
            <div className="sticky bottom-0 bg-card border-t border-border flex gap-3 px-6 py-4">
              <button
                onClick={() => setViewing(null)}
                className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  await saveNote();
                  setViewing(null);
                }}
                disabled={noteSaving}
                className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg disabled:opacity-60"
              >
                {noteSaving ? "Saving…" : "Save & Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
