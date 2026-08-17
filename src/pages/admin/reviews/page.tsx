import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Star,
  Check,
  EyeOff,
  Trash2,
  Search,
  ExternalLink,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";

type ReviewStatus = "new" | "approved" | "hidden";
type SortKey = "date_desc" | "date_asc" | "rating_desc" | "rating_asc";

type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  source: string;
  date: string;
  rawDate: Date;
  status: ReviewStatus;
  location: string;
};

type ApiReviewItem = {
  id: string | number;
  author_name?: string;
  rating?: number;
  text?: string;
  source?: string;
  created_at: string;
  status?: string;
  location_id?: string | number;
};

const STATUS_META: Record<ReviewStatus, { label: string; color: string }> = {
  new: {
    label: "New",
    color:
      "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
  approved: {
    label: "Approved",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  hidden: {
    label: "Hidden",
    color: "bg-gray-100 text-gray-500 dark:bg-gray-800",
  },
};

const SOURCE_COLORS: Record<string, string> = {
  Google:
    "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  Website:
    "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
  Yandex:
    "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "date_desc", label: "Сначала новые" },
  { value: "date_asc", label: "Сначала старые" },
  { value: "rating_desc", label: "Высокий рейтинг" },
  { value: "rating_asc", label: "Низкий рейтинг" },
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"all" | ReviewStatus>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result: unknown = await api.getReviews({});
      const items = Array.isArray(result) ? (result as ApiReviewItem[]) : [];
      setReviews(
        items.map((item) => {
          const rawDate = new Date(item.created_at);
          return {
            id: String(item.id),
            author: item.author_name ?? "Anonymous",
            rating: Number(item.rating) || 0,
            text: item.text ?? "",
            source: item.source ?? "Website",
            date: rawDate.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            }),
            rawDate,
            status: (item.status as ReviewStatus) ?? "new",
            location: item.location_id
              ? `Location #${item.location_id}`
              : "General",
          };
        }),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load reviews",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // ─── Stats (memoised) ───────────────────────────────────────────────────
  const { approved, avg, dist } = useMemo(() => {
    const approved = reviews.filter((r) => r.status === "approved");
    const avg =
      approved.length
        ? (
            approved.reduce((a, r) => a + r.rating, 0) / approved.length
          ).toFixed(1)
        : "—";
    const dist = [5, 4, 3, 2, 1].map((n) => ({
      n,
      count: approved.filter((r) => r.rating === n).length,
    }));
    return { approved, avg, dist };
  }, [reviews]);

  // ─── Filtered + sorted list ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = reviews.filter((r) => {
      const matchFilter = filter === "all" || r.status === filter;
      const matchSearch =
        r.author.toLowerCase().includes(q) ||
        r.text.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });

    return [...list].sort((a, b) => {
      switch (sort) {
        case "date_asc":
          return a.rawDate.getTime() - b.rawDate.getTime();
        case "date_desc":
          return b.rawDate.getTime() - a.rawDate.getTime();
        case "rating_asc":
          return a.rating - b.rating;
        case "rating_desc":
          return b.rating - a.rating;
      }
    });
  }, [reviews, filter, search, sort]);

  // ─── Actions ─────────────────────────────────────────────────────────────
  const setStatus = async (id: string, status: ReviewStatus) => {
    try {
      await api.updateReviewStatus(id, status);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
      const labels: Record<ReviewStatus, string> = {
        approved: "Отзыв опубликован",
        hidden: "Отзыв скрыт",
        new: "Статус обновлён",
      };
      toast.success(labels[status]);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update review status",
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Отзыв удалён");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete review",
      );
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span className="mt-0.5 text-base">⚠</span>
          <div className="flex-1">{error}</div>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header + rating summary */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold">Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {reviews.filter((r) => r.status === "new").length} new ·{" "}
            {approved.length} published
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
          <div className="text-center">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-3xl font-bold">{avg}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {approved.length} reviews
            </p>
          </div>
          <div className="space-y-1 min-w-[100px]">
            {dist.map(({ n, count }) => (
              <div key={n} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-3">{n}</span>
                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{
                      width: approved.length
                        ? `${(count / approved.length) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-3">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search + filter + sort */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "new", "approved", "hidden"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize",
                filter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {s === "all"
                ? `All (${reviews.length})`
                : `${STATUS_META[s].label} (${reviews.filter((r) => r.status === s).length})`}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="pl-8 pr-4 py-1.5 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Review list */}
      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-border bg-card p-10 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading reviews...
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rev) => (
            <div
              key={rev.id}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary-foreground">
                        {rev.author[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{rev.author}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-3 h-3",
                                i < rev.rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-muted-foreground/30",
                              )}
                            />
                          ))}
                        </div>
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                            SOURCE_COLORS[rev.source] ??
                              "bg-muted text-muted-foreground",
                          )}
                        >
                          {rev.source}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {rev.location} · {rev.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {rev.text}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                      STATUS_META[rev.status].color,
                    )}
                  >
                    {STATUS_META[rev.status].label}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-border flex-wrap">
                {rev.status !== "approved" && (
                  <button
                    onClick={() => setStatus(rev.id, "approved")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 rounded-lg hover:opacity-80 font-medium"
                  >
                    <Check className="w-3 h-3" /> Approve
                  </button>
                )}
                {rev.status === "approved" && (
                  <button
                    onClick={() => setStatus(rev.id, "hidden")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 font-medium"
                  >
                    <EyeOff className="w-3 h-3" /> Hide
                  </button>
                )}
                {rev.status === "hidden" && (
                  <button
                    onClick={() => setStatus(rev.id, "approved")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 font-medium"
                  >
                    <ExternalLink className="w-3 h-3" /> Restore
                  </button>
                )}
                {rev.status === "new" && (
                  <button
                    onClick={() => setStatus(rev.id, "hidden")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 font-medium"
                  >
                    <EyeOff className="w-3 h-3" /> Ignore
                  </button>
                )}

                {/* Delete with confirmation */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 font-medium ml-auto">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удалить отзыв?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Отзыв от <strong>{rev.author}</strong> будет удалён
                        безвозвратно. Это действие нельзя отменить.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(rev.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Удалить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Star className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No reviews found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
