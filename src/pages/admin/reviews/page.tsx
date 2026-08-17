import { useEffect, useMemo, useState } from "react";
import { Star, Check, EyeOff, Trash2, Search, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";

type ReviewStatus = "new" | "approved" | "hidden";

type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  source: string;
  date: string;
  status: ReviewStatus;
  location: string;
};

const STATUS_META: Record<ReviewStatus, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  hidden: { label: "Hidden", color: "bg-gray-100 text-gray-500 dark:bg-gray-800" },
};

const SOURCE_COLORS: Record<string, string> = {
  Google: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  Website: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
  Yandex: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"all" | ReviewStatus>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getReviews({});
      const mapped = Array.isArray(result)
        ? result.map((item: any) => ({
            id: String(item.id),
            author: item.author_name || "Anonymous",
            rating: Number(item.rating) || 0,
            text: item.text || "",
            source: item.source || "Website",
            date: new Date(item.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            }),
            status: (item.status as ReviewStatus) || "new",
            location: item.location_id ? `Location #${item.location_id}` : "General",
          }))
        : [];
      setReviews(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const filtered = useMemo(() => reviews.filter((r) => {
    const matchFilter = filter === "all" || r.status === filter;
    const q = search.toLowerCase();
    const matchSearch = r.author.toLowerCase().includes(q) || r.text.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  }), [reviews, filter, search]);

  const setStatus = async (id: string, status: ReviewStatus) => {
    try {
      await api.updateReviewStatus(id, status);
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update review status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete review");
    }
  };

  const approved = reviews.filter((r) => r.status === "approved");
  const avg = approved.length
    ? (approved.reduce((a, r) => a + r.rating, 0) / approved.length).toFixed(1)
    : "—";

  const dist = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: approved.filter((r) => r.rating === n).length,
  }));

  return (
    <div className="space-y-5 max-w-4xl">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span className="mt-0.5 text-base">⚠</span>
          <div className="flex-1">{error}</div>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">✕</button>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {reviews.filter((r) => r.status === "new").length} new \u00b7 {approved.length} published
          </p>
        </div>
        {/* Rating summary */}
        <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
          <div className="text-center">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-3xl font-bold">{avg}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{approved.length} reviews</p>
          </div>
          <div className="space-y-1 min-w-[100px]">
            {dist.map(({ n, count }) => (
              <div key={n} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-3">{n}</span>
                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: approved.length ? `${(count / approved.length) * 100}%` : "0%" }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-3">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search + filter */}
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
        <div className="flex gap-2">
          {(["all", "new", "approved", "hidden"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize",
                filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {s === "all" ? `All (${reviews.length})` : `${STATUS_META[s].label} (${reviews.filter((r) => r.status === s).length})`}
            </button>
          ))}
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
          <div key={rev.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary-foreground">{rev.author[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{rev.author}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("w-3 h-3", i < rev.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30")} />
                        ))}
                      </div>
                      <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", SOURCE_COLORS[rev.source])}>{rev.source}</span>
                      <span className="text-xs text-muted-foreground">{rev.location} \u00b7 {rev.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{rev.text}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", STATUS_META[rev.status].color)}>
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
              <button
                onClick={() => handleDelete(rev.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 font-medium ml-auto"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Star className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No reviews</p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
