import { useCallback, useEffect, useState } from "react";
import { Clock, Download, Eye, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";

// ─── Types ────────────────────────────────────────────────────────────────────

type RequestStatus = "new" | "in_progress" | "contacted" | "confirmed" | "completed" | "cancelled";

type CateringRequest = {
  id: number;
  name: string;
  phone: string;
  email: string;
  event_type: string;
  event_date: string;
  guest_count: number;
  budget: string | null;
  message: string | null;
  note: string | null;
  status: RequestStatus;
  created_at: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META: Record<RequestStatus, { label: string; color: string }> = {
  new:         { label: "Новая",        color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  in_progress: { label: "В работе",     color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
  contacted:   { label: "Связались",    color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
  confirmed:   { label: "Подтверждена", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  completed:   { label: "Завершена",    color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  cancelled:   { label: "Отменена",     color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" },
};

const FILTERS: { label: string; value: "all" | RequestStatus }[] = [
  { label: "Все",          value: "all" },
  { label: "Новая",        value: "new" },
  { label: "В работе",     value: "in_progress" },
  { label: "Связались",    value: "contacted" },
  { label: "Подтверждена", value: "confirmed" },
  { label: "Завершена",    value: "completed" },
  { label: "Отменена",     value: "cancelled" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CateringRequestsPage() {
  const [requests, setRequests]         = useState<CateringRequest[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState<"all" | RequestStatus>("all");
  const [search, setSearch]             = useState("");
  const [viewing, setViewing]           = useState<CateringRequest | null>(null);
  const [note, setNote]                 = useState("");
  const [savingNote, setSavingNote]     = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data: CateringRequest[] = await api.getCateringRequests();
      setRequests(data);
    } catch {
      toast.error("Не удалось загрузить заявки кейтеринга");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadRequests(); }, [loadRequests]);

  useEffect(() => {
    if (viewing) setNote(viewing.note ?? "");
  }, [viewing?.id]);

  const filtered = requests.filter((r) => {
    const matchFilter = filter === "all" || r.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      r.name.toLowerCase().includes(q) ||
      r.phone.includes(q) ||
      r.event_type.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const updateStatus = async (id: number, status: RequestStatus) => {
    try {
      setUpdatingStatus(true);
      await api.updateCateringRequestStatus(id, status);
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
      if (viewing?.id === id) setViewing((v) => v ? { ...v, status } : v);
    } catch {
      toast.error("Не удалось обновить статус");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const saveNote = async () => {
    if (!viewing) return;
    try {
      setSavingNote(true);
      await api.request(`/catering/requests/${viewing.id}/note`, {
        method: "PATCH",
        body: JSON.stringify({ note }),
      });
      setRequests((prev) => prev.map((r) => r.id === viewing.id ? { ...r, note } : r));
      setViewing((v) => v ? { ...v, note } : v);
      toast.success("Заметка сохранена");
    } catch {
      toast.error("Не удалось сохранить заметку");
    } finally {
      setSavingNote(false);
    }
  };

  const saveNoteAndClose = async () => {
    await saveNote();
    setViewing(null);
  };

  const handleExport = () => {
    if (filtered.length === 0) return;
    const header = ["ID", "Имя", "Телефон", "Email", "Мероприятие", "Дата", "Гостей", "Бюджет", "Статус", "Заметка"];
    const rows = filtered.map((r) => [
      String(r.id), r.name, r.phone, r.email, r.event_type,
      r.event_date, String(r.guest_count), r.budget ?? "",
      r.status, (r.note ?? "").replace(/\n/g, " "),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
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

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("ru-RU", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return iso; }
  };

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Заявки кейтеринга</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading
              ? "Загрузка…"
              : `${requests.filter((r) => r.status === "new").length} новых · ${requests.filter((r) => r.status === "confirmed").length} подтверждённых`}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted"
        >
          <Download className="w-4 h-4" /> Экспорт
        </button>
      </div>

      {/* Stats strip */}
      {!loading && (
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
      )}

      {/* Filter pills + search */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени, мероприятию..."
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

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && (
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
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">{req.event_type}</span>
                </div>
                <p className="font-semibold text-foreground">{req.name}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                  <span>{req.phone}</span>
                  <span>{req.event_date} · {req.guest_count} гостей</span>
                  {req.budget && <span>{req.budget}</span>}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {formatDate(req.created_at)}
                </div>
              </div>
              <button
                onClick={() => setViewing(req)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> Открыть
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-sm">Заявки не найдены</p>
            </div>
          )}
        </div>
      )}

      {/* Detail modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewing(null)} />
          <div className="relative z-10 bg-card border border-border rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">

            <div className="sticky top-0 bg-card px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-serif font-bold">Заявка #{viewing.id}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{viewing.event_type} · {formatDate(viewing.created_at)}</p>
              </div>
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", STATUS_META[viewing.status].color)}>
                {STATUS_META[viewing.status].label}
              </span>
            </div>

            <div className="p-6 space-y-5">
              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Контакт</p>
                <div className="grid grid-cols-2 gap-3">
                  <InfoField label="Имя"      value={viewing.name} />
                  <InfoField label="Телефон"  value={viewing.phone} />
                  <InfoField label="Email"    value={viewing.email} />
                  <InfoField label="Подано"   value={formatDate(viewing.created_at)} />
                </div>
              </section>

              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Детали мероприятия</p>
                <div className="grid grid-cols-2 gap-3">
                  <InfoField label="Тип мероприятия" value={viewing.event_type} />
                  <InfoField label="Дата"             value={viewing.event_date} />
                  <InfoField label="Гостей"           value={String(viewing.guest_count)} />
                  <InfoField label="Бюджет"           value={viewing.budget ?? "—"} />
                </div>
              </section>

              {viewing.message && (
                <section>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Сообщение</p>
                  <p className="text-sm bg-muted rounded-xl p-4 leading-relaxed">{viewing.message}</p>
                </section>
              )}

              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Внутренняя заметка</p>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Заметка для команды..."
                  className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <button
                  onClick={saveNote}
                  disabled={savingNote || note === (viewing.note ?? "")}
                  className="mt-2 px-4 py-1.5 text-xs font-medium bg-muted text-muted-foreground rounded-lg disabled:opacity-40 hover:bg-muted/80 flex items-center gap-1.5"
                >
                  {savingNote && <Loader2 className="w-3 h-3 animate-spin" />}
                  {savingNote ? "Сохранение…" : "Сохранить заметку"}
                </button>
              </section>

              <section>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Изменить статус</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(STATUS_META) as RequestStatus[]).map((s) => (
                    <button
                      key={s}
                      disabled={updatingStatus}
                      onClick={() => updateStatus(viewing.id, s)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50",
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
              <button
                onClick={() => setViewing(null)}
                className="flex-1 py-2.5 text-sm font-medium bg-muted text-muted-foreground rounded-lg"
              >
                Закрыть
              </button>
              <button
                onClick={saveNoteAndClose}
                disabled={savingNote}
                className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {savingNote && <Loader2 className="w-4 h-4 animate-spin" />}
                Сохранить и закрыть
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
