import { useState } from "react";
import { Eye, Clock, Search, FileText } from "lucide-react";
import { cn } from "@/lib/utils.ts";

type AppStatus = "new" | "reviewing" | "interview" | "accepted" | "rejected";

type Application = {
  id: string;
  name: string;
  position: string;
  branch: string;
  phone: string;
  email: string;
  experience: string;
  message: string;
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

const SAMPLE: Application[] = [
  { id: "1", name: "Dilshod Shomuratov", position: "Waiter", branch: "Tashkent — Chilanzar", phone: "+998 90 123 45 67", email: "dilshod@mail.ru", experience: "2 years in Cafe Plov", message: "I am a friendly and hardworking person, eager to join MADO team.", status: "new", date: "16 Aug 2026" },
  { id: "2", name: "Kamola Yusupova", position: "Barista", branch: "Tashkent — Chilanzar", phone: "+998 93 456 78 90", email: "kamola@gmail.com", experience: "3 years at Coffee House", message: "Passionate about specialty coffee and Turkish tea culture.", status: "interview", date: "15 Aug 2026" },
  { id: "3", name: "Jasur Mirzayev", position: "Chef de Partie", branch: "All branches", phone: "+998 91 789 01 23", email: "jasur@mail.uz", experience: "5 years at Silk Road Kitchen", message: "Experienced in Turkish and Middle Eastern cuisine. HACCP certified.", status: "reviewing", date: "14 Aug 2026" },
  { id: "4", name: "Nodira Khasanova", position: "Cashier", branch: "Tashkent — Mirzo Ulugbek", phone: "+998 99 234 56 78", email: "nodira@mail.uz", experience: "1 year at supermarket", message: "Accurate and responsible. Quick learner with POS systems.", status: "accepted", date: "12 Aug 2026" },
  { id: "5", name: "Bobur Toshmatov", position: "Runner", branch: "Tashkent — Yunusabad", phone: "+998 94 567 89 01", email: "bobur@mail.ru", experience: "No prior experience", message: "Ready to work hard and learn fast.", status: "rejected", date: "10 Aug 2026" },
];

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>(SAMPLE);
  const [filter, setFilter] = useState<"all" | AppStatus>("all");
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<Application | null>(null);
  const [note, setNote] = useState("");

  const filtered = apps.filter((a) => {
    const matchFilter = filter === "all" || a.status === filter;
    const q = search.toLowerCase();
    const matchSearch = a.name.toLowerCase().includes(q) || a.position.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const updateStatus = (id: string, status: AppStatus) => {
    setApps(apps.map((a) => a.id === id ? { ...a, status } : a));
    if (viewing?.id === id) setViewing((v) => v ? { ...v, status } : v);
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
          {apps.filter((a) => a.status === "new").length} new · {apps.filter((a) => a.status === "interview").length} in interview
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-5 gap-2">
        {counts.map(({ status, count }) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "rounded-xl p-3 text-center border transition-all",
              filter === status ? "border-primary bg-primary/5" : "border-border bg-card hover:border-accent/50"
            )}
          >
            <p className="text-xl font-bold">{count}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{STATUS_META[status].label}</p>
          </button>
        ))}
      </div>

      {/* Search + filter pills */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or position..."
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
                filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
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
          {filtered.map((app) => (
            <div key={app.id} className="flex items-center justify-between px-4 py-4 hover:bg-muted/30 group">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary-foreground">{app.name[0]}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{app.name}</p>
                    <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", STATUS_META[app.status].color)}>
                      {STATUS_META[app.status].label}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">{app.position}</span>
                    <span className="text-xs text-muted-foreground">{app.branch}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {app.date}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setViewing(app); setNote(""); }}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Eye className="w-3 h-3" /> Review
              </button>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
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
                <p className="text-xs text-muted-foreground mt-0.5">{viewing.position} · {viewing.branch}</p>
              </div>
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", STATUS_META[viewing.status].color)}>
                {STATUS_META[viewing.status].label}
              </span>
            </div>
            <div className="p-6 space-y-5">
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Contact</p>
                <div className="grid grid-cols-2 gap-3">
                  <InfoField label="Phone" value={viewing.phone} />
                  <InfoField label="Email" value={viewing.email} />
                  <InfoField label="Applied" value={viewing.date} />
                  <InfoField label="Experience" value={viewing.experience} />
                </div>
              </section>
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Cover Message</p>
                <p className="text-sm bg-muted rounded-xl p-4 leading-relaxed">{viewing.message}</p>
              </section>
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Internal Note</p>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add notes about this candidate..."
                  className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </section>
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Update Status</p>
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
              <button onClick={() => setViewing(null)} className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg">Close</button>
              <button onClick={() => setViewing(null)} className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg">Save & Close</button>
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
