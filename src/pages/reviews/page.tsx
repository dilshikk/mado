import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, Send, CheckCircle2, Quote, Loader2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form.tsx";
import Navbar from "@/pages/_components/navbar.tsx";
import Footer from "@/pages/_components/footer.tsx";
import PageMeta from "@/components/page-meta.tsx";
import { useLanguage } from "@/hooks/use-language.ts";

// ─── i18n ─────────────────────────────────────────────────────────────────────

type Lang = "ru" | "uz" | "en" | "tr";

const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "uz", label: "UZ" },
  { code: "en", label: "EN" },
  { code: "tr", label: "TR" },
];

const T: Record<Lang, Record<string, string>> = {
  ru: {
    title: "Отзывы гостей",
    subtitle: "Ваше мнение помогает нам становиться лучше. Оставьте отзыв — это займёт всего минуту.",
    listTitle: "Все отзывы",
    noReviews: "Отзывов пока нет",
    loadMore: "Показать ещё",
    formTitle: "Оставить отзыв",
    name: "Ваше имя",
    namePlaceholder: "Иван Иванов",
    rating: "Оценка",
    ratingRequired: "Пожалуйста, поставьте оценку",
    review: "Ваш отзыв",
    reviewPlaceholder: "Расскажите о своём визите...",
    reviewMin: "Отзыв должен содержать минимум 10 символов",
    submit: "Отправить отзыв",
    sending: "Отправка...",
    successTitle: "Спасибо за ваш отзыв!",
    successDesc: "Ваш отзыв получен и будет опубликован после проверки модератором.",
    sendAnother: "Оставить ещё один отзыв",
    nameMin: "Введите ваше имя",
    ratingLabel: (n: number) => ["", "Очень плохо", "Плохо", "Нормально", "Хорошо", "Отлично"][n] ?? "",
  },
  uz: {
    title: "Mehmonlar sharhlari",
    subtitle: "Sizning fikringiz bizni yaxshilashga yordam beradi. Sharh qoldiring — bu faqat bir daqiqa vaqt oladi.",
    listTitle: "Barcha sharhlar",
    noReviews: "Hali sharhlar yo'q",
    loadMore: "Yana ko'rsatish",
    formTitle: "Sharh qoldirish",
    name: "Ismingiz",
    namePlaceholder: "Ism Familiya",
    rating: "Baho",
    ratingRequired: "Iltimos, baho bering",
    review: "Sharhingiz",
    reviewPlaceholder: "Tashrif haqida gapirib bering...",
    reviewMin: "Sharh kamida 10 ta belgidan iborat bo'lishi kerak",
    submit: "Sharh yuborish",
    sending: "Yuborilmoqda...",
    successTitle: "Sharhingiz uchun rahmat!",
    successDesc: "Sharhingiz qabul qilindi va moderator tekshiruvidan so'ng e'lon qilinadi.",
    sendAnother: "Yana sharh qoldirish",
    nameMin: "Ismingizni kiriting",
    ratingLabel: (n: number) => ["", "Juda yomon", "Yomon", "O'rtacha", "Yaxshi", "A'lo"][n] ?? "",
  },
  en: {
    title: "Guest Reviews",
    subtitle: "Your opinion helps us improve. Leave a review — it only takes a minute.",
    listTitle: "All Reviews",
    noReviews: "No reviews yet",
    loadMore: "Show more",
    formTitle: "Leave a Review",
    name: "Your Name",
    namePlaceholder: "John Smith",
    rating: "Rating",
    ratingRequired: "Please select a rating",
    review: "Your Review",
    reviewPlaceholder: "Tell us about your visit...",
    reviewMin: "Review must be at least 10 characters",
    submit: "Submit Review",
    sending: "Submitting...",
    successTitle: "Thank you for your review!",
    successDesc: "Your review has been received and will be published after moderation.",
    sendAnother: "Leave another review",
    nameMin: "Please enter your name",
    ratingLabel: (n: number) => ["", "Terrible", "Poor", "Average", "Good", "Excellent"][n] ?? "",
  },
  tr: {
    title: "Misafir Yorumları",
    subtitle: "Görüşleriniz bizi daha iyi yapmamıza yardımcı oluyor. Yorum bırakın — yalnızca bir dakika sürer.",
    listTitle: "Tüm Yorumlar",
    noReviews: "Henüz yorum yok",
    loadMore: "Daha fazla göster",
    formTitle: "Yorum Bırak",
    name: "Adınız",
    namePlaceholder: "Ad Soyad",
    rating: "Puan",
    ratingRequired: "Lütfen bir puan seçin",
    review: "Yorumunuz",
    reviewPlaceholder: "Ziyaretiniz hakkında anlatın...",
    reviewMin: "Yorum en az 10 karakter içermelidir",
    submit: "Yorum Gönder",
    sending: "Gönderiliyor...",
    successTitle: "Yorumunuz için teşekkürler!",
    successDesc: "Yorumunuz alındı ve moderasyon sonrasında yayınlanacak.",
    sendAnother: "Başka bir yorum bırak",
    nameMin: "Lütfen adınızı girin",
    ratingLabel: (n: number) => ["", "Korkunç", "Kötü", "Ortalama", "İyi", "Mükemmel"][n] ?? "",
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

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
  date: string;
};

const PAGE_SIZE = 10;

// ─── Form schema ──────────────────────────────────────────────────────────────

const makeSchema = (lang: Lang) =>
  z.object({
    author: z.string().min(1, T[lang].nameMin),
    rating: z.number({ invalid_type_error: T[lang].ratingRequired }).min(1, T[lang].ratingRequired).max(5),
    text: z.string().min(10, T[lang].reviewMin),
  });

type FormValues = { author: string; rating: number; text: string };

// ─── Star selector ────────────────────────────────────────────────────────────

function StarSelector({ value, onChange, lang }: { value: number; onChange: (v: number) => void; lang: Lang }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button"
            onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(n)}
            className="cursor-pointer transition-transform hover:scale-110" aria-label={`${n} star`}>
            <Star className={cn("w-8 h-8 transition-colors", n <= active ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30")} />
          </button>
        ))}
      </div>
      {active > 0 && <p className="text-xs text-muted-foreground">{(T[lang].ratingLabel as (n: number) => string)(active)}</p>}
    </div>
  );
}

// ─── Review card ──────────────────────────────────────────────────────────────

function ReviewCard({ rev, index }: { rev: Review; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: (index % PAGE_SIZE) * 0.04, ease: "easeOut" as const }}
      className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div>
        <Quote className="w-6 h-6 text-accent/40 mb-3" />
        <p className="text-sm text-foreground/80 leading-relaxed">{rev.text}</p>
      </div>
      <div className="mt-5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary-foreground">{rev.author[0].toUpperCase()}</span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">{rev.author}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{rev.date}</p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star key={idx} className={cn("w-3.5 h-3.5", idx < rev.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/25")} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReviewsPublicPage() {
  // Use global lang — synced with navbar switcher
  const { lang, setLang } = useLanguage();

  // ── List state ──
  const [reviews, setReviews] = useState<Review[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // ── Form state ──
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const t = T[lang];

  useEffect(() => {
    api.getReviews({})
      .then((result: unknown) => {
        const items = Array.isArray(result) ? (result as ApiReviewItem[]) : [];
        const approved = items
          .filter((r) => r.status === "approved")
          .map((r) => ({
            id: String(r.id),
            author: r.author_name ?? "Guest",
            rating: Number(r.rating) || 5,
            text: r.text ?? "",
            date: new Date(r.created_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" }),
          }))
          .sort((a, b) => b.id.localeCompare(a.id));
        setReviews(approved);
      })
      .catch(() => setReviews([]))
      .finally(() => setListLoading(false));
  }, []);

  const schema = makeSchema(lang);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { author: "", rating: 0, text: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      await api.createReview({ author_name: values.author, rating: values.rating, text: values.text, source: "Website", status: "new" });
      setSubmitted(true);
    } catch {
      toast.error(
        lang === "ru" ? "Не удалось отправить отзыв. Попробуйте ещё раз."
        : lang === "uz" ? "Sharh yuborib bo'lmadi. Qayta urinib ko'ring."
        : lang === "tr" ? "Yorum gönderilemedi. Lütfen tekrar deneyin."
        : "Failed to submit review. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => { setSubmitted(false); form.reset(); };

  const shownReviews = reviews.slice(0, visible);
  const hasMore = visible < reviews.length;

  return (
    <div className="min-h-screen bg-background">
      <PageMeta slug="reviews" lang={lang} />
      <Navbar />

      {/* Hero */}
      <section className="bg-[#143968] text-primary-foreground py-20 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" as const }}>
            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />)}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
            <p className="text-primary-foreground/75 text-lg max-w-lg mx-auto">{t.subtitle}</p>
          </motion.div>
        </div>
      </section>

      {/* Language switcher */}
      <div className="flex justify-center gap-2 pt-10 px-6">
        {LANGUAGES.map(({ code, label }) => (
          <button key={code}
            onClick={() => { setLang(code); form.clearErrors(); }}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border cursor-pointer",
              lang === code
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary",
            )}>
            {label}
          </button>
        ))}
      </div>

      {/* Full reviews list */}
      <section className="py-12 px-6">
        <div className="mx-auto max-w-[1140px]">
          <h2 className="font-serif text-2xl font-bold mb-8">{t.listTitle}</h2>

          {listLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Star className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">{t.noReviews}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {shownReviews.map((rev, i) => <ReviewCard key={rev.id} rev={rev} index={i} />)}
              </div>
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <Button variant="secondary" size="lg" className="gap-2 cursor-pointer"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                    <ChevronDown className="w-4 h-4" />
                    {t.loadMore} ({Math.min(PAGE_SIZE, reviews.length - visible)})
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Submit form */}
      <section className="pb-20 px-6 border-t border-border pt-12">
        <div className="mx-auto max-w-xl">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" as const }}
                className="text-center py-16 px-6 bg-card border border-border rounded-2xl shadow-sm">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h2 className="font-serif text-2xl font-bold mb-2">{t.successTitle}</h2>
                <p className="text-muted-foreground mb-8">{t.successDesc}</p>
                <Button onClick={handleReset} variant="secondary">{t.sendAnother}</Button>
              </motion.div>
            ) : (
              <motion.div key="form"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: "easeOut" as const }}
                className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                <h2 className="font-serif text-xl font-bold mb-6">{t.formTitle}</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField control={form.control} name="author" render={({ field }) => (
                      <FormItem><FormLabel>{t.name}</FormLabel><FormControl><Input placeholder={t.namePlaceholder} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="rating" render={({ field }) => (
                      <FormItem><FormLabel>{t.rating}</FormLabel><FormControl>
                        <StarSelector value={field.value} onChange={field.onChange} lang={lang} />
                      </FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="text" render={({ field }) => (
                      <FormItem><FormLabel>{t.review}</FormLabel><FormControl>
                        <Textarea rows={5} placeholder={t.reviewPlaceholder} {...field} />
                      </FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" disabled={submitting} className="w-full gap-2">
                      {submitting ? (
                        <>
                          <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="inline-block w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full" />
                          {t.sending}
                        </>
                      ) : (
                        <><Send className="w-4 h-4" />{t.submit}</>
                      )}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </div>
  );
}
