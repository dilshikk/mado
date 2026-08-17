import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import Navbar from "@/pages/_components/navbar.tsx";
import Footer from "@/pages/_components/footer.tsx";

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
    subtitle:
      "Ваше мнение помогает нам становиться лучше. Оставьте отзыв — это займёт всего минуту.",
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
    successDesc:
      "Ваш отзыв получен и будет опубликован после проверки модератором.",
    sendAnother: "Оставить ещё один отзыв",
    nameMin: "Введите ваше имя",
    ratingLabel: (n: number) =>
      ["", "Очень плохо", "Плохо", "Нормально", "Хорошо", "Отлично"][n] ?? "",
  },
  uz: {
    title: "Mehmonlar sharhlari",
    subtitle:
      "Sizning fikringiz bizni yaxshilashga yordam beradi. Sharh qoldiring — bu faqat bir daqiqa vaqt oladi.",
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
    successDesc:
      "Sharhingiz qabul qilindi va moderator tekshiruvidan so'ng e'lon qilinadi.",
    sendAnother: "Yana sharh qoldirish",
    nameMin: "Ismingizni kiriting",
    ratingLabel: (n: number) =>
      ["", "Juda yomon", "Yomon", "O'rtacha", "Yaxshi", "A'lo"][n] ?? "",
  },
  en: {
    title: "Guest Reviews",
    subtitle:
      "Your opinion helps us improve. Leave a review — it only takes a minute.",
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
    successDesc:
      "Your review has been received and will be published after moderation.",
    sendAnother: "Leave another review",
    nameMin: "Please enter your name",
    ratingLabel: (n: number) =>
      ["", "Terrible", "Poor", "Average", "Good", "Excellent"][n] ?? "",
  },
  tr: {
    title: "Misafir Yorumları",
    subtitle:
      "Görüşleriniz bizi daha iyi yapmamıza yardımcı oluyor. Yorum bırakın — yalnızca bir dakika sürer.",
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
    successDesc:
      "Yorumunuz alındı ve moderasyon sonrasında yayınlanacak.",
    sendAnother: "Başka bir yorum bırak",
    nameMin: "Lütfen adınızı girin",
    ratingLabel: (n: number) =>
      ["", "Korkunç", "Kötü", "Ortalama", "İyi", "Mükemmel"][n] ?? "",
  },
};

// ─── Form schema (dynamic per lang) ──────────────────────────────────────────

const makeSchema = (lang: Lang) =>
  z.object({
    author: z.string().min(1, T[lang].nameMin),
    rating: z.number({ invalid_type_error: T[lang].ratingRequired }).min(1, T[lang].ratingRequired).max(5),
    text: z.string().min(10, T[lang].reviewMin),
  });

type FormValues = { author: string; rating: number; text: string };

// ─── Star selector component ──────────────────────────────────────────────────

function StarSelector({
  value,
  onChange,
  lang,
}: {
  value: number;
  onChange: (v: number) => void;
  lang: Lang;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(n)}
            className="cursor-pointer transition-transform hover:scale-110"
            aria-label={`${n} star`}
          >
            <Star
              className={cn(
                "w-8 h-8 transition-colors",
                n <= active
                  ? "text-amber-400 fill-amber-400"
                  : "text-muted-foreground/30",
              )}
            />
          </button>
        ))}
      </div>
      {active > 0 && (
        <p className="text-xs text-muted-foreground">
          {(T[lang].ratingLabel as (n: number) => string)(active)}
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReviewsPublicPage() {
  const [lang, setLang] = useState<Lang>("ru");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const t = T[lang];

  const schema = makeSchema(lang);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { author: "", rating: 0, text: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      await api.createReview({
        author_name: values.author,
        rating: values.rating,
        text: values.text,
        source: "Website",
        status: "new",
      });
      setSubmitted(true);
    } catch {
      toast.error(
        lang === "ru"
          ? "Не удалось отправить отзыв. Попробуйте ещё раз."
          : lang === "uz"
          ? "Sharh yuborib bo'lmadi. Qayta urinib ko'ring."
          : lang === "tr"
          ? "Yorum gönderilemedi. Lütfen tekrar deneyin."
          : "Failed to submit review. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#143968] text-primary-foreground py-20 px-6">
        <div className="relative mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" as const }}
          >
            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="w-6 h-6 text-amber-400 fill-amber-400"
                />
              ))}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              {t.title}
            </h1>
            <p className="text-primary-foreground/75 text-lg max-w-lg mx-auto">
              {t.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form section */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-xl">

          {/* Language switcher */}
          <div className="flex justify-center gap-2 mb-10">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => {
                  setLang(code);
                  form.clearErrors();
                }}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border",
                  lang === code
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" as const }}
                className="text-center py-16 px-6 bg-card border border-border rounded-2xl shadow-sm"
              >
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h2 className="font-serif text-2xl font-bold mb-2">
                  {t.successTitle}
                </h2>
                <p className="text-muted-foreground mb-8">{t.successDesc}</p>
                <Button onClick={handleReset} variant="secondary">
                  {t.sendAnother}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: "easeOut" as const }}
                className="bg-card border border-border rounded-2xl p-8 shadow-sm"
              >
                <h2 className="font-serif text-xl font-bold mb-6">
                  {t.formTitle}
                </h2>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <FormField
                      control={form.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.name}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t.namePlaceholder}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.rating}</FormLabel>
                          <FormControl>
                            <StarSelector
                              value={field.value}
                              onChange={field.onChange}
                              lang={lang}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.review}</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={5}
                              placeholder={t.reviewPlaceholder}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full gap-2"
                    >
                      {submitting ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{
                              repeat: Infinity,
                              duration: 1,
                              ease: "linear",
                            }}
                            className="inline-block w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full"
                          />
                          {t.sending}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {t.submit}
                        </>
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
