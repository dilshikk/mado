import { useState } from "react";
import { Eye, Clock, MessageSquare, Briefcase, UtensilsCrossed, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils.ts";

type RequestType = "catering" | "career" | "contact";
type RequestStatus = "new" | "pending" | "in_progress" | "confirmed" | "completed" | "cancelled";

type Request = {
  id: string;
  type: RequestType;
  name: string;
  detail: string;
  phone: string;
  status: RequestStatus;
  date: string;
  href: string;
};

const TYPE_META: Record<RequestType, { label: string; icon: React.ElementType; color: string }> = {
  catering: { label: "Catering", icon: UtensilsCrossed, color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" },
  career: { label: "Career", icon: Briefcase, color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
  contact: { label: "Contact", icon: MessageSquare, color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
};

const STATUS_META: Record<RequestStatus, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
  in_progress: { label: "In Progress", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
  confirmed: { label: "Confirmed", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" },
};

const ALL_REQUESTS: Request[] = [
  { id: "124", type: "catering", name: "John Smith", detail: "Corporate event \u00b7 120 guests \u00b7 24 Aug", phone: "+998 90 123 45 67", status: "new", date: "16 Aug 06:30", href: "/admin/catering/requests" },
  { id: "A01", type: "career", name: "Dilshod Shomuratov", detail: "Waiter \u00b7 Tashkent \u2014 Chilanzar", phone: "+998 90 123 45 67", status: "new", date: "16 Aug 06:10", href: "/admin/careers/applications" },
  { id: "C01", type: "contact", name: "Maria Brown", detail: "General inquiry about group booking", phone: "+998 99 234 56 78", status: "pending", date: "15 Aug 14:20", href: "/admin/requests" },
  { id: "123", type: "catering", name: "Sarah Jones", detail: "Wedding \u00b7 200 guests \u00b7 10 Sep", phone: "+998 93 456 78 90", status: "in_progress", date: "15 Aug 12:00", href: "/admin/catering/requests" },
  { id: "A02", type: "career", name: "Kamola Yusupova", detail: "Barista \u00b7 Tashkent \u2014 Chilanzar", phone: "+998 93 456 78 90", status: "confirmed", date: "14 Aug 15:30", href: "/admin/careers/applications" },
  { id: "122", type: "catering", name: "Alex Kim", detail: "Birthday \u00b7 50 guests \u00b7 5 Sep", phone: "+998 91 789 01 23", status: "confirmed", date: "14 Aug 09:15", href: "/admin/catering/requests" },
  { id: "C02", type: "contact", name: "Rustam N.", detail: "Question about menu allergens", phone: "+998 97 111 22 33", status: "completed", date: "12 Aug 10:00", href: "/admin/requests" },
  { id: "121", type: "catering", name: "Maria Brown", detail: "Workshop \u00b7 30 guests \u00b7 28 Aug", phone: "+998 99 234 56 78", status: "completed", date: "10 Aug 11:00", href: "/admin/catering/requests" },
];

export default function RequestsPage() {
  const [typeFilter, setTypeFilter] = useState<"all" | RequestType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | RequestStatus>("all");
  const [search, setSearch] = useState("");

  const filtered = ALL_REQUESTS.filter((r) => {
    const matchType = typeFilter === "all" || r.type === typeFilter;
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = r.name.toLowerCase().includes(q) || r.detail.toLowerCase().includes(q);
    return matchType && matchStatus && matchSearch;
  });

  const newCount = ALL_REQUESTS.filter((r) => r.status === "new").length;

  // Stats per type
  const typeCounts = (["catering", "career", "contact"] as RequestType[]).map((t) => ({
    type: t,
    total: ALL_REQUESTS.filter((r) => r.type === t).length,
    new: ALL_REQUESTS.filter((r) => r.type === t && r.status === "new").length,
  }));

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-serif font-bold">All Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Unified inbox \u00b7 {newCount} new requests
        </p>
      </div>

      {/* Type stats */}
      <div className="grid grid-cols-3 gap-3">
        {typeCounts.map(({ type, total, new: n }) => {
          const meta = TYPE_META[type];
          const Icon = meta.icon;
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? "all" : type)}
              className={cn(
                "bg-card border rounded-xl p-4 text-left transition-all",
                typeFilter === type ? "border-primary ring-1 ring-primary/20" : "border-border hover:border-accent/50"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("p-1.5 rounded-lg", meta.color)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold">{meta.label}</span>
              </div>
              <p className="text-2xl font-bold">{total}</p>
              {n > 0 && <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{n} new</p>}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | RequestStatus)}
            className="px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none"
          >
            <option value="all">All statuses</option>
            {(Object.keys(STATUS_META) as RequestStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((req) => {
          const typeMeta = TYPE_META[req.type];
          const Icon = typeMeta.icon;
          return (
            <div key={req.id} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-4 hover:border-accent/50 transition-colors">
              <div className="flex items-start gap-4 min-w-0">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", typeMeta.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground font-mono">#{req.id}</span>
                    <span className="text-xs font-semibold text-muted-foreground">{typeMeta.label}</span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", STATUS_META[req.status].color)}>
                      {STATUS_META[req.status].label}
                    </span>
                  </div>
                  <p className="font-semibold text-foreground mt-0.5">{req.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{req.detail}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" /> {req.date}
                  </div>
                </div>
              </div>
              <Link
                to={req.href}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> View
              </Link>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No requests match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
