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
  create:          { label: "Создание",          color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  update:          { label: "Обновление",         color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  delete:          { label: "Удаление",           color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  bulk_delete:     { label: "Массовое удаление",  color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  bulk_update:     { label: "Массовое обновление", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  upload:          { label: "Загрузка",           color: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400" },
  publish:         { label: "Публикация",         color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
  received:        { label: "Получено",           color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  reset_password:  { label: "Сброс пароля",       color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" },
  clear:           { label: "Очистка журнала",    color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  prune:           { label: "Авто-очистка",       color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

const TARGET_LABELS: Record<string, string> = {
  dish: "Блюдо", category: "Категория", location: "Филиал",
  promotion: "Акция", review: "Отзыв", request: "Заявка",
  catering_request: "Кейтеринг", vacancy: "Вакансия",
  application: "Отклик", faq: "FAQ", page: "Страница",
  media: "Медиа", user: "Пользователь", activity_log: "Журнал",
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
  const [entries, setEntries]   = useState<LogEntry[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const [search, setSearch]             = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterType, setFilterType]     = useState("");

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
      setError(e instanceof Error ? e.message : "Не удалось загрузить журнал");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterAction, filterType]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setPage(0); }, [search, filterAction, filterType]);

  const handleClear = async () => {
    setClearWorking(true);
    try {
      await api.request("/activity/clear", { method: "DELETE" });
      setConfirmClear(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось очистить журнал");
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
      setError(e instanceof Error ? e.message : "Не удалось удалить старые записи");
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
          <h1 className="text-2xl font-serif font-bold">Журнал действий</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total.toLocaleString()} записей · история всех действий администраторов
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => void load()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Обновить
          </button>
          <button
            onClick={() => setConfirmPrune(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
          >
            <CalendarClock className="w-3.5 h-3.5" /> Удалить старше 30 дней
          </button>
          <button
            onClick={() => setConfirmClear(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-300 text-red-700 dark:border-red-800 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Очистить всё
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
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по деталям или пользователю..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="">Все действия</option>
            {Object.entries(ACTION_META).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="">Все типы</option>
            {Object.entries(TARGET_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Log table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-[120px_130px_90px_1fr_140px] gap-3 px-4 py-2.5 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>Пользователь</span>
          <span>Действие</span>
          <span>Тип</span>
          <span>Детали</span>
          <span className="text-right">Время</span>
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
              <p className="text-sm">Нет записей</p>
              {(search || filterAction || filterType) && (
                <button
                  onClick={() => { setSearch(""); setFilterAction(""); setFilterType(""); }}
                  className="mt-2 text-xs underline text-muted-foreground hover:text-foreground"
                >
                  Сбросить фильтры
                </button>
              )}
            </div>
          ) : entries.map((entry) => {
            const meta = actionMeta(entry.action);
            const userName = entry.user_name ?? "Система";
            const initials = userName === "Система" ? "С" : userName[0]?.toUpperCase() ?? "?";
            const isSystem = !entry.user_id;

            return (
              <div
                key={entry.id}
                className="grid grid-cols-1 sm:grid-cols-[120px_130px_90px_1fr_140px] gap-1 sm:gap-3 px-4 py-3 hover:bg-muted/30 transition-colors items-start sm:items-center"
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                    isSystem ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
                  )}>
                    {initials}
                  </div>
                  <span className="text-xs font-medium text-foreground truncate">{userName}</span>
                </div>

                <div>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase", meta.color)}>
                    {meta.label}
                  </span>
                </div>

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

                <p className="text-sm text-foreground/80 truncate">{entry.details ?? "—"}</p>

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
            Показано {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} из {total.toLocaleString()}
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
              <h2 className="font-serif font-bold text-lg">Очистить весь журнал?</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Все {total.toLocaleString()} записей будут удалены безвозвратно. Это действие нельзя отменить.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg"
              >
                Отмена
              </button>
              <button
                onClick={() => void handleClear()}
                disabled={clearWorking}
                className="flex-1 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {clearWorking ? "Очистка…" : "Да, очистить всё"}
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
              <h2 className="font-serif font-bold text-lg">Удалить старые записи?</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Все записи старше <span className="font-semibold">30 дней</span> будут удалены безвозвратно. Новые записи останутся.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmPrune(false)}
                className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg"
              >
                Отмена
              </button>
              <button
                onClick={() => void handlePrune()}
                disabled={pruneWorking}
                className="flex-1 py-2.5 text-sm font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-60 transition-colors"
              >
                {pruneWorking ? "Удаление…" : "Удалить старые записи"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
