import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  Clock,
  MessageSquare,
  Briefcase,
  UtensilsCrossed,
  Search,
  Filter,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";

// ─── Types ──────────────────────────────────────────────────────────────────

type RequestType = "catering" | "career" | "contact";

type UnifiedRequest = {
  id: string;
  type: RequestType;
  name: string;
  detail: string;
  phone: string;
  email: string;
  message: string;
  status: string;
  statusLabel: string;
  statusColor: string;
  createdAt: string;
  date: string;
  href?: string;
};

// ─── Meta / styling ─────────────────────────────────────────────────────────

const TYPE_META: Record<RequestType, { label: string; icon: React.ElementType; color: string }> = {
  catering: { label: "Кейтеринг", icon: UtensilsCrossed, color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" },
  career:   { label: "Вакансия",  icon: Briefcase,       color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
  contact:  { label: "Обращение", icon: MessageSquare,   color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
};

const DEFAULT_STATUS_COLOR = "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";

const CATERING_STATUS_META: Record<string, { label: string; color: string }> = {
  new:         { label: "Новая",        color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  in_progress: { label: "В работе",     color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
  contacted:   { label: "Связались",    color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
  confirmed:   { label: "Подтверждена", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  completed:   { label: "Завершена",    color: DEFAULT_STATUS_COLOR },
  cancelled:   { label: "Отменена",     color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" },
};

const CAREER_STATUS_META: Record<string, { label: string; color: string }> = {
  new:       { label: "Новый",           color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  reviewing: { label: "Рассматривается", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
  interview: { label: "Собеседование",   color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
  accepted:  { label: "Принят",          color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  rejected:  { label: "Отклонён",        color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" },
};

const CONTACT_STATUS_META: Record<string, { label: string; color: string }> = {
  new:         { label: "Новое",    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  in_progress: { label: "В работе", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
  resolved:    { label: "Решено",   color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  closed:      { label: "Закрыто",  color: DEFAULT_STATUS_COLOR },
  cancelled:   { label: "Отменено", color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" },
};

const CONTACT_STATUS_OPTIONS = Object.keys(CONTACT_STATUS_META);

function humanizeStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getStatusMeta(type: RequestType, status: string): { label: string; color: string } {
  const map = type === "catering" ? CATERING_STATUS_META : type === "career" ? CAREER_STATUS_META : CONTACT_STATUS_META;
  return map[status] ?? { label: humanizeStatus(status), color: DEFAULT_STATUS_COLOR };
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ─── Raw → unified mapping ──────────────────────────────────────────────────

function mapContactRequest(item: Record<string, unknown>): UnifiedRequest {
  const status = String(item.status ?? "new");
  const meta = getStatusMeta("contact", status);
  const createdAt = String(item.created_at ?? new Date().toISOString());
  return {
    id: String(item.id ?? ""),
    type: "contact",
    name: String(item.name ?? "Unknown"),
    detail: String(item.message ?? "Нет сообщения"),
    phone: String(item.phone ?? "N/A"),
    email: String(item.email ?? "N/A"),
    message: String(item.message ?? ""),
    status,
    statusLabel: meta.label,
    statusColor: meta.color,
    createdAt,
    date: formatDate(createdAt),
  };
}

function mapCateringRequest(item: Record<string, unknown>): UnifiedRequest {
  const status = String(item.status ?? "new");
  const meta = getStatusMeta("catering", status);
  const createdAt = String(item.created_at ?? new Date().toISOString());
  const eventType = String(item.event_type ?? "Мероприятие");
  const guestCount = String(item.guest_count ?? "?");
  const eventDate = String(item.event_date ?? "");
  return {
    id: String(item.id ?? ""),
    type: "catering",
    name: String(item.name ?? "Unknown"),
    detail: `${eventType} · ${guestCount} гостей${eventDate ? ` · ${eventDate}` : ""}`,
    phone: String(item.phone ?? "N/A"),
    email: String(item.email ?? "N/A"),
    message: String(item.message ?? ""),
    status,
    statusLabel: meta.label,
    statusColor: meta.color,
    createdAt,
    date: formatDate(createdAt),
    href: "/admin/catering/requests",
  };
}

function mapApplication(item: Record<string, unknown>): UnifiedRequest {
  const status = String(item.status ?? "new");
  const meta = getStatusMeta("career", status);
  const createdAt = String(item.created_at ?? new Date().toISOString());
  const position = String(item.position_ru || item.position || "Общая должность");
  const locationName = String(item.location_name_ru || item.location_name || item.branch || "—");
  return {
    id: String(item.id ?? ""),
    type: "career",
    name: String(item.name ?? "Unknown"),
    detail: `${position} · ${locationName}`,
    phone: String(item.phone ?? "N/A"),
    email: String(item.email ?? "N/A"),
    message: String(item.message ?? ""),
    status,
    statusLabel: meta.label,
    statusColor: meta.color,
    createdAt,
    date: formatDate(createdAt),
    href: "/admin/careers/applications",
  };
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function RequestsPage() {
  const [requests, setRequests] = useState<UnifiedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | RequestType>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<UnifiedRequest | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [contactRaw, cateringRaw, applicationsRaw] = await Promise.all([
        api.getRequests({}),
        api.getCateringRequests(),
        api.getApplications({}),
      ]);

      const contactItems = Array.isArray(contactRaw)
        ? (contactRaw as Record<string, unknown>[]).map(mapContactRequest)
        : [];
      const cateringItems = Array.isArray(cateringRaw)
        ? (cateringRaw as Record<string, unknown>[]).map(mapCateringRequest)
        : [];
      const applicationItems = Array.isArray(applicationsRaw)
        ? (applicationsRaw as Record<string, unknown>[]).map(mapApplication)
        : [];

      const combined = [...contactItems, ...cateringItems, ...applicationItems].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setRequests(combined);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось загрузить заявки";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const filtered = requests.filter((r) => {
    const matchType = typeFilter === "all" || r.type === typeFilter;
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = r.name.toLowerCase().includes(q) || r.detail.toLowerCase().includes(q);
    return matchType && matchStatus && matchSearch;
  });

  const newCount = requests.filter((r) => r.status === "new").length;

  const typeCounts = (["catering", "career", "contact"] as RequestType[]).map((t) => ({
    type: t,
    total: requests.filter((r) => r.type === t).length,
    new: requests.filter((r) => r.type === t && r.status === "new").length,
  }));

  const statusOptions = Array.from(new Set(requests.map((r) => r.status))).sort();

  const updateContactStatus = async (id: string, status: string) => {
    try {
      setUpdatingStatus(true);
      await api.updateRequestStatus(id, status);
      const meta = getStatusMeta("contact", status);
      setRequests((prev) =>
        prev.map((r) => (r.id === id && r.type === "contact" ? { ...r, status, statusLabel: meta.label, statusColor: meta.color } : r))
      );
      setViewing((v) => (v && v.id === id ? { ...v, status, statusLabel: meta.label, statusColor: meta.color } : v));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось обновить статус");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-serif font-bold">Все заявки</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {loading ? "Загрузка…" : `Единый входящий · ${newCount} новых заявок`}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

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
              <p className="text-2xl font-bold">{loading ? "–" : total}</p>
              {!loading && n > 0 && <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{n} новых</p>}
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
            placeholder="Поиск заявок..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none"
          >
            <option value="all">Все статусы</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {humanizeStatus(s)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 h-24 animate-pulse" />
          ))}

        {!loading &&
          filtered.map((req) => {
            const typeMeta = TYPE_META[req.type];
            const Icon = typeMeta.icon;
            return (
              <div
                key={`${req.type}-${req.id}`}
                className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-4 hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", typeMeta.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground font-mono">#{req.id}</span>
                      <span className="text-xs font-semibold text-muted-foreground">{typeMeta.label}</span>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", req.statusColor)}>
                        {req.statusLabel}
                      </span>
                    </div>
                    <p className="font-semibold text-foreground mt-0.5">{req.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{req.detail}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" /> {req.date}
                    </div>
                  </div>
                </div>
                {req.type === "contact" ? (
                  <button
                    onClick={() => setViewing(req)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Просмотреть
                  </button>
                ) : (
                  <Link
                    to={req.href ?? "/admin/requests"}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Просмотреть
                  </Link>
                )}
              </div>
            );
          })}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Заявки не найдены</p>
          </div>
        )}
      </div>

      {/* Contact detail modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewing(null)} />
          <div className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border flex items-center justify-between px-6 py-4">
              <div>
                <h2 className="font-serif font-bold">{viewing.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Заявка #{viewing.id}</p>
              </div>
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", viewing.statusColor)}>
                {viewing.statusLabel}
              </span>
            </div>
            <div className="p-6 space-y-5">
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Контакт</p>
                <div className="grid grid-cols-2 gap-3">
                  <InfoField label="Телефон"  value={viewing.phone} />
                  <InfoField label="Email"    value={viewing.email} />
                  <InfoField label="Получено" value={viewing.date} />
                </div>
              </section>
              {viewing.message && (
                <section>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Сообщение</p>
                  <p className="text-sm bg-muted rounded-xl p-4 leading-relaxed">{viewing.message}</p>
                </section>
              )}
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Изменить статус</p>
                <div className="flex flex-wrap gap-2">
                  {CONTACT_STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      disabled={updatingStatus}
                      onClick={() => void updateContactStatus(viewing.id, s)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50",
                        viewing.status === s ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                      )}
                    >
                      {CONTACT_STATUS_META[s].label}
                    </button>
                  ))}
                </div>
              </section>
            </div>
            <div className="sticky bottom-0 bg-card border-t border-border flex gap-3 px-6 py-4">
              <button
                onClick={() => setViewing(null)}
                className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2"
              >
                {updatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
                Закрыть
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
