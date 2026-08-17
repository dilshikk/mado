import { useEffect, useState } from "react";
import { Eye, Clock, Search, Download } from "lucide-react";
import { cn } from "@/lib/utils.ts";

type RequestStatus = "new" | "in_progress" | "contacted" | "confirmed" | "completed" | "cancelled";

type CateringRequest = {
  id: string;
  name: string;
  phone: string;
  email: string;
  event: string;
  date: string;
  guests: number;
  budget: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
  note?: string;
};

const STATUS_META: Record<RequestStatus, { label: string; color: string; next?: RequestStatus[] }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400", next: ["in_progress", "cancelled"] },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400", next: ["contacted", "cancelled"] },
  contacted: { label: "Contacted", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400", next: ["confirmed", "cancelled"] },
  confirmed: { label: "Confirmed", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400", next: ["completed", "cancelled"] },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" },
};

const STORAGE_KEY = "mado_catering_requests";

const SAMPLE: CateringRequest[] = [
  { id: "124", name: "John Smith", phone: "+998 90 123 45 67", email: "john@company.com", event: "Corporate", date: "24 Aug 2026", guests: 120, budget: "5,000,000 UZS", message: "Need catering for annual corporate event. Prefer Turkish menu. Need full service setup.", status: "new", createdAt: "16 Aug 06:30", note: "Awaiting pricing confirmation." },
  { id: "123", name: "Sarah Jones", phone: "+998 93 456 78 90", email: "sarah@gmail.com", event: "Wedding", date: "10 Sep 2026", guests: 200, budget: "12,000,000 UZS", message: "Traditional Turkish menu preferred. Need both indoor and outdoor setup.", status: "contacted", createdAt: "15 Aug 14:20", note: "Sent menu options." },
  { id: "122", name: "Alex Kim", phone: "+998 91 789 01 23", email: "alex@mail.ru", event: "Birthday", date: "5 Sep 2026", guests: 50, budget: "2,500,000 UZS", message: "Kids friendly menu needed. Birthday cake not included.", status: "confirmed", createdAt: "14 Aug 09:15", note: "Deposit received." },
  { id: "121", name: "Maria Brown", phone: "+998 99 234 56 78", email: "maria@corp.uz", event: "Workshop", date: "28 Aug 2026", guests: 30, budget: "1,200,000 UZS", message: "Business lunch setup with coffee breaks.", status: "completed", createdAt: "10 Aug 11:00", note: "Completed successfully." },
  { id: "120", name: "Bobur Toshmatov", phone: "+998 94 567 89 01", email: "bobur@uz.com", event: "Private Party", date: "20 Aug 2026", guests: 80, budget: "4,000,000 UZS", message: "Evening garden party. Need outdoor setup.", status: "cancelled", createdAt: "8 Aug 18:00", note: "Client postponed." },
];

const loadRequests = (): CateringRequest[] => {
  if (typeof window === "undefined") return SAMPLE;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SAMPLE;

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE;
  } catch {
    return SAMPLE;
  }
};

const persistRequests = (items: CateringRequest[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const FILTERS: { label: string; value: "all" | RequestStatus }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "In Progress", value: "in_progress" },
  { label: "Contacted", value: "contacted" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function CateringRequestsPage() {
  const [requests, setRequests] = useState<CateringRequest[]>([]);
  const [filter, setFilter] = useState<"all" | RequestStatus>("all");
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<CateringRequest | null>(null);
  const [note, setNote] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const data = loadRequests();
    setRequests(data);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      persistRequests(requests);
    }
  }, [requests, ready]);

  useEffect(() => {
    if (viewing) {
      setNote(viewing.note ?? "");
    }
  }, [viewing]);

  const filtered = requests.filter((r) => {
    const matchFilter = filter === "all" || r.status === filter;
    const q = search.toLowerCase();
    const matchSearch = r.name.toLowerCase().includes(q) || r.phone.includes(q) || r.event.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const updateStatus = (id: string, status: RequestStatus) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    if (viewing?.id === id) {
      setViewing((v) => (v ? { ...v, status } : v));
    }
  };

  const saveCurrentNote = () => {
    if (!viewing) return;

    setRequests((prev) =>
      prev.map((r) => (r.id === viewing.id ? { ...r, note } : r))
    );

    setViewing((v) => (v ? { ...v, note } : v));
  };

  const handleExport = () => {
    if (filtered.length === 0) return;

    const header = ["ID", "Name", "Phone", "Email", "Event", "Date", "Guests", "Budget", "Status", "Note"];
    const rows = filtered.map((r) => [
      r.id,
      r.name,
      r.phone,
      r.email,
      r.event,
      r.date,
      String(r.guests),
      r.budget,
      r.status,
      (r.note ?? "").replace(/\n/g, " "),
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `catering-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const counts = (FILTERS.slice(1) as { label: string; value: RequestStatus }[]).map((f) => ({
    ...f,
    count: requests.filter((r) => r.status === f.value).length,
  }));

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Catering Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {requests.filter((r) => r.status === "new").length} new · {requests.filter((r) => r.status === "confirmed").length} confirmed
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted"
        >
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {counts.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-xl p-3 text-center transition-all border",
              filter === f.value ? "border-primary bg-primary/5" : "border-border bg-card hover:border-accent/50"
            )}
          >
            <p className="text-xl font-bold text-foreground">{f.count}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{f.label}</p>
          </button>
        ))}
      </div>

      {/* Filter pills + search */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, event..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                filter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Request list */}
      <div className="space-y-3">
        {filtered.map((req) => (
          <div
            key={req.id}
            className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-4 hover:border-accent/50 transition-colors"
          >
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground font-mono">#{req.id}</span>
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", STATUS_META[req.status].color)}>
                  {STATUS_META[req.status].label}
                </span>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">{req.event}</span>
              </div>
              <p className="font-semibold text-foreground">{req.name}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                <span>{req.phone}</span>
                <span>{req.date} · {req.guests} guests</span>
                <span>{req.budget}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" /> {req.createdAt}
              </div>
            </div>
            <button
              onClick={() => { setViewing(req); setNote(""); }}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> Open
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No requests match your filters</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewing(null)} />
          <div className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-serif font-bold">Request #{viewing.id}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{viewing.event} · {viewing.createdAt}</p>
              </div>
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", STATUS_META[viewing.status].color)}>
                {STATUS_META[viewing.status].label}
              </span>
            </div>
            <div className="p-6 space-y-5">
              {/* Contact info */}
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Contact</p>
                <div className="grid grid-cols-2 gap-3">
                  <InfoField label="Name" value={viewing.name} />
                  <InfoField label="Phone" value={viewing.phone} />
                  <InfoField label="Email" value={viewing.email} />
                  <InfoField label="Submitted" value={viewing.createdAt} />
                </div>
              </section>

              {/* Event details */}
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Event Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <InfoField label="Event Type" value={viewing.event} />
                  <InfoField label="Date" value={viewing.date} />
                  <InfoField label="Guests" value={String(viewing.guests)} />
                  <InfoField label="Budget" value={viewing.budget} />
                </div>
              </section>

              {/* Message */}
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Message</p>
                <p className="text-sm bg-muted rounded-xl p-4 leading-relaxed">{viewing.message}</p>
              </section>

              {/* Note */}
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Internal Note</p>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note for your team..."
                  className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </section>

              {/* Status workflow */}
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(STATUS_META) as RequestStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(viewing.id, s)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                        viewing.status === s
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted text-foreground"
                      )}
                    >
                      {STATUS_META[s].label}
                    </button>
                  ))}
                </div>
              </section>
            </div>
            <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex gap-3">
              <button onClick={() => setViewing(null)} className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg">Close</button>
              <button
                onClick={() => {
                  saveCurrentNote();
                  setViewing(null);
                }}
                className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg"
              >
                Save & Close
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
