import { useState, useEffect, useCallback } from "react";
import {
  Clock, Search, Filter, Trash2, AlertTriangle,
  RefreshCw, ChevronLeft, ChevronRight, ShieldAlert,
  Layers, CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";

// ── Types ─────────────────────────────────────────────────────────────────────

type LogEntry = {
  id: number;
  user_id: number | null;
  user_name: string | null;
  action: string;
  target_type: string | null;
  target_id: number | null;
  details: string | null;
  created_at: string;
};

type ApiResponse = { data: LogEntry[]; total: number };

// ── Constants ─────────────────────────────────────────────────────────────────

const ACTION_META: Record<string, { label: string; color: string }> = {
  create:       { label: "Create",       color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  update:       { label: "Update",       color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  delete:       { label: "Delete",       color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  bulk_delete:  { label: "Bulk Delete",  color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  bulk_update:  { label: "Bulk Update",  color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  upload:       { label: "Upload",       color: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400" },
  publish:      { label: "Publish",      color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
  received:     { label: "Received",     color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  reset_password: { label: "Reset pwd", color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" },
  clear:        { label: "Clear log",   color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  prune:        { label: "Auto-prune",  color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

const TARGET_LABELS: Record<string, string> = {
  dish: "Dish", category: "Category", location: "Location",
  promotion: "Promotion", review: "Review", request: "Request",
  catering_request: "Catering", vacancy: "Vacancy",
  application: "Application", faq: "FAQ", page: "Page",
  media: "Media", user: "User", activity_log: "Log",
};

const PAGE_SIZE = 50;

function actionMeta(action: string) {
  return ACTION_META[action] ?? { label: action, color: "bg-muted text-muted-foreground" };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ActivityPage() {
  const [entries, setEntries]       = useState<LogEntry[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // Filters
  const [search, setSearch]             = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterType, setFilterType]     = useState("");

  // Modals
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmPrune, setConfirmPrune] = useState(false);
  const [pruneWorking, setPruneWorking] = useState(false);
  const [clearWorking, setClearWorking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit:  String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      });
      if (search)       params.set("search",      search);
      if (filterAction) params.set("action",       filterAction);
      if (filterType)   params.set("target_type",  filterType);

      const res = await api.request(`/activity?${params}`) as ApiResponse;
      setEntries(Array.isArray(res.data) ? res.data : []);
      setTotal(res.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load activity log");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterAction, filterType]);

  useEffect(() => { void load(); }, [load]);

  // Reset to first page when filters change
  useEffect(() => { setPage(0); }, [search, filterAction, filterType]);

  const handleClear = async () => {
    setClearWorking(true);
    try {
      await api.request("/activity/clear", { method: "DELETE" });
      setConfirmClear(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to clear log");
    } finally {
      setClearWorking(false);
    }
  };

  const handlePrune = async () => {
    setPruneWorking(true);
    try {
      await api.request("/activity/prune?days=30", { method: "DELETE" });
      setConfirmPrune(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to prune log");
    } finally {
      setPruneWorking(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold">Activity Log</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total.toLocaleString()} total entries · real-time history of all admin actions
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => void load()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => setConfirmPrune(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
          >
            <CalendarClock className="w-3.5 h-3.5" /> Delete older than 30 days
          </button>
          <button
            onClick={() => setConfirmClear(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-300 text-red-700 dark:border-red-800 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear all
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by details or user..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Action filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="">All actions</option>
            {Object.entries(ACTION_META).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        {/* Target type filter */}
        <div className="relative">
          <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="">All types</option>
            {Object.entries(TARGET_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Log table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[120px_100px_90px_1fr_140px] gap-3 px-4 py-2.5 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>User</span>
          <span>Action</span>
          <span>Type</span>
          <span>Details</span>
          <span className="text-right">Time</span>
        </div>

        <div className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-4 py-3 flex gap-3 items-center">
                <div className="w-7 h-7 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-1/3 bg-muted animate-pulse rounded" />
                  <div className="h-2.5 w-2/3 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))
          ) : entries.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No log entries found</p>
              {(search || filterAction || filterType) && (
                <button
                  onClick={() => { setSearch(""); setFilterAction(""); setFilterType(""); }}
                  className="mt-2 text-xs underline text-muted-foreground hover:text-foreground"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : entries.map((entry) => {
            const meta = actionMeta(entry.action);
            const userName = entry.user_name ?? "System";
            const initials = userName === "System" ? "S" : userName[0]?.toUpperCase() ?? "?";
            const isSystem = !entry.user_id;

            return (
              <div
                key={entry.id}
                className="grid grid-cols-1 sm:grid-cols-[120px_100px_90px_1fr_140px] gap-1 sm:gap-3 px-4 py-3 hover:bg-muted/30 transition-colors items-start sm:items-center"
              >
                {/* User */}
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                    isSystem ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
                  )}>
                    {initials}
                  </div>
                  <span className="text-xs font-medium text-foreground truncate">{userName}</span>
                </div>

                {/* Action badge */}
                <div>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase", meta.color)}>
                    {meta.label}
                  </span>
                </div>

                {/* Target type */}
                <div>
                  {entry.target_type ? (
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {TARGET_LABELS[entry.target_type] ?? entry.target_type}
                      {entry.target_id ? ` #${entry.target_id}` : ""}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/40">—</span>
                  )}
                </div>

                {/* Details */}
                <p className="text-sm text-foreground/80 truncate">
                  {entry.details ?? "—"}
                </p>

                {/* Time */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground sm:justify-end">
                  <Clock className="w-3 h-3 shrink-0" />
                  {formatDate(entry.created_at)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString()}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(7, totalPages) }).map((_, i) => {
              const pageNum = totalPages <= 7 ? i : Math.min(Math.max(i + page - 3, 0), totalPages - 1);
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    "w-8 h-8 text-sm rounded-lg border transition-colors",
                    page === pageNum
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Confirm: Clear all ───────────────────────────────────────────────── */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmClear(false)} />
          <div className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-950">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="font-serif font-bold text-lg">Clear entire log?</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              All {total.toLocaleString()} log entries will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleClear()}
                disabled={clearWorking}
                className="flex-1 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {clearWorking ? "Clearing…" : "Yes, clear all"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm: Prune old ───────────────────────────────────────────────── */}
      {confirmPrune && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmPrune(false)} />
          <div className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-950">
                <CalendarClock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="font-serif font-bold text-lg">Delete old entries?</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              All entries older than <span className="font-semibold">30 days</span> will be permanently deleted.
              Recent entries will be kept.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmPrune(false)}
                className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => void handlePrune()}
                disabled={pruneWorking}
                className="flex-1 py-2.5 text-sm font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-60 transition-colors"
              >
                {pruneWorking ? "Deleting…" : "Delete old entries"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
