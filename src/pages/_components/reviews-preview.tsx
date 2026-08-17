import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Star, ArrowRight, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";
import { Button } from "@/components/ui/button.tsx";

type ApiReviewItem = {
  id: string | number;
  author_name?: string;
  rating?: number;
  text?: string;
  source?: string;
  created_at: string;
  status?: string;
};

type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  source: string;
};

/** Fisher-Yates shuffle, returns first `n` items */
function randomPick<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export default function ReviewsPreview() {
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getReviews({})
      .then((result: unknown) => {
        const items = Array.isArray(result) ? (result as ApiReviewItem[]) : [];
        const approved = items
          .filter((r) => r.status === "approved")
          .map((r) => ({
            id: String(r.id),
            author: r.author_name ?? "Guest",
            rating: Number(r.rating) || 5,
            text: r.text ?? "",
            source: r.source ?? "Website",
          }));
        setAllReviews(approved);
      })
      .catch(() => setAllReviews([]))
      .finally(() => setLoading(false));
  }, []);

  // Pick 3 random on every page load (memo keeps them stable during the session)
  const picked = useMemo(() => randomPick(allReviews, 3), [allReviews]);

  if (!loading && allReviews.length === 0) return null;

  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-[1140px] px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="mx-auto max-w-2xl text-center mb-14"
        >
          <p className="mb-3 text-sm font-semibold tracking-[0.3em] text-accent uppercase">
            Что говорят гости
          </p>
          <h2 className="text-balance font-serif text-4xl font-bold sm:text-5xl">
            Отзывы наших гостей
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Мы гордимся каждым гостем — читайте, что они говорят о нас.
          </p>
        </motion.div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-52 rounded-2xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {picked.map((rev, i) => (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1, ease: "easeOut" as const }}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <Quote className="w-7 h-7 text-accent/50 mb-3" />
                  <p className="text-sm text-foreground/80 leading-relaxed line-clamp-5">
                    {rev.text}
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary-foreground">
                        {rev.author[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-semibold">{rev.author}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={cn(
                          "w-3.5 h-3.5",
                          idx < rev.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-muted-foreground/25",
                        )}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 flex justify-center">
          <Button
            size="lg"
            variant="secondary"
            className="cursor-pointer gap-2"
            asChild
          >
            <Link to="/reviews">
              Все отзывы <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
