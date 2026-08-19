import { useCallback, useEffect, useState } from "react";
import {
  FileText, Plus, Edit2, Trash2, Eye, Search,
  Loader2, Globe, AlertCircle, X, ExternalLink, Download,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils.ts";
import api from "@/lib/api.ts";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";

// ─── Types ────────────────────────────────────────────────────────────────────

type PageStatus = "published" | "draft";

type Page = {
  id: number;
  title: string;
  title_ru: string | null;
  title_uz: string | null;
  title_en: string | null;
  title_tr: string | null;
  slug: string;
  status: PageStatus;
  sections: number;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  // Multilingual meta
  meta_title_ru: string | null;
  meta_title_uz: string | null;
  meta_title_en: string | null;
  meta_title_tr: string | null;
  meta_description_ru: string | null;
  meta_description_uz: string | null;
  meta_description_en: string | null;
  meta_description_tr: string | null;
  updated_at: string;
};

type DefaultPageDef = {
  title: string;
  title_ru: string;
  title_uz: string;
  title_en: string;
  title_tr: string;
  slug: string;
  status: PageStatus;
  meta_title: string;
  meta_description: string;
  meta_title_ru?: string;
  meta_title_uz?: string;
  meta_title_en?: string;
  meta_title_tr?: string;
  meta_description_ru?: string;
  meta_description_uz?: string;
  meta_description_en?: string;
  meta_description_tr?: string;
};

// ─── Default pages seed data ──────────────────────────────────────────────────

const DEFAULT_PAGES: DefaultPageDef[] = [
  {
    title: "Главная", slug: "",
    title_ru: "Главная", title_uz: "Bosh sahifa", title_en: "Home", title_tr: "Ana Sayfa",
    status: "published",
    meta_title: "MADO — Турецкий ресторан в Ташкенте",
    meta_description: "Аутентичная турецкая кухня, десерты и мороженое MADO в Ташкенте. Зал, доставка, кейтеринг и мероприятия.",
    meta_title_ru: "MADO — Турецкий ресторан в Ташкенте",
    meta_title_uz: "MADO — Toshkentdagi turk restorani",
    meta_title_en: "MADO — Turkish Restaurant in Tashkent",
    meta_title_tr: "MADO — Taşkent'teki Türk Restoranı",
    meta_description_ru: "Аутентичная турецкая кухня, десерты и мороженое MADO в Ташкенте. Зал, доставка, кейтеринг и мероприятия.",
    meta_description_uz: "Toshkentda MADO ning haqiqiy turk taomlari, desertlar va muzqaymoq. Zal, yetkazib berish, keytering.",
    meta_description_en: "Authentic Turkish cuisine, desserts and MADO ice cream in Tashkent. Dine-in, delivery, catering and events.",
    meta_description_tr: "Taşkent'te otantik Türk mutfağı, tatlılar ve MADO dondurması. Salon, teslimat, catering ve etkinlikler.",
  },
  {
    title: "Наша история", slug: "story",
    title_ru: "Наша история", title_uz: "Bizning tariximiz", title_en: "Our Story", title_tr: "Hikayemiz",
    status: "published",
    meta_title: "Наша история — MADO Ташкент",
    meta_description: "История бренда MADO: от традиционного мараш-дондурмы до международной ресторанной сети.",
    meta_title_ru: "Наша история — MADO Ташкент",
    meta_title_uz: "Bizning tarixiyimiz — MADO Toshkent",
    meta_title_en: "Our Story — MADO Tashkent",
    meta_title_tr: "Hikayemiz — MADO Taşkent",
    meta_description_ru: "История бренда MADO: от традиционного мараш-дондурмы до международной ресторанной сети.",
    meta_description_uz: "MADO brendining tarixi: an'anaviy maraş muzqaymoqidan xalqaro restoran tarmog'igacha.",
    meta_description_en: "The MADO story: from traditional Maraş ice cream to an international restaurant chain.",
    meta_description_tr: "MADO'nun hikayesi: geleneksel Maraş dondurmasından uluslararası bir restoran zincirine.",
  },
  {
    title: "Меню", slug: "menu",
    title_ru: "Меню", title_uz: "Menyu", title_en: "Menu", title_tr: "Menü",
    status: "published",
    meta_title: "Меню — MADO Ташкент",
    meta_description: "Полное меню ресторана MADO: турецкие блюда, десерты, мороженое дондурма, напитки.",
    meta_title_ru: "Меню — MADO Ташкент",
    meta_title_uz: "Menyu — MADO Toshkent",
    meta_title_en: "Menu — MADO Tashkent",
    meta_title_tr: "Menü — MADO Taşkent",
    meta_description_ru: "Полное меню ресторана MADO: турецкие блюда, десерты, мороженое дондурма, напитки.",
    meta_description_uz: "MADO restoranining to'liq menyusi: turk taomlari, desertlar, don durma muzqaymoq.",
    meta_description_en: "Full MADO restaurant menu: Turkish dishes, desserts, dondurma ice cream, drinks.",
    meta_description_tr: "MADO restoranı tam menüsü: Türk yemekleri, tatlılar, dondurma, içecekler.",
  },
  {
    title: "Кейтеринг", slug: "catering",
    title_ru: "Кейтеринг", title_uz: "Keytering", title_en: "Catering", title_tr: "Catering",
    status: "published",
    meta_title: "Кейтеринг — MADO Ташкент",
    meta_description: "Организуйте незабываемое мероприятие с кейтерингом от MADO.",
    meta_title_ru: "Кейтеринг — MADO Ташкент",
    meta_title_uz: "Keytering — MADO Toshkent",
    meta_title_en: "Catering — MADO Tashkent",
    meta_title_tr: "Catering — MADO Taşkent",
    meta_description_ru: "Организуйте незабываемое мероприятие с кейтерингом от MADO. Свадьбы, корпоративы, торжества.",
    meta_description_uz: "MADO keyteringi bilan unutilmas tadbir uyushtiring. To'ylar, korporativlar, bayramlar.",
    meta_description_en: "Organise an unforgettable event with MADO catering. Weddings, corporate events, celebrations.",
    meta_description_tr: "MADO catering ile unutulmaz bir etkinlik düzenleyin. Düğünler, kurumsal etkinlikler.",
  },
  {
    title: "Филиалы", slug: "locations",
    title_ru: "Филиалы", title_uz: "Filiallar", title_en: "Locations", title_tr: "Şubelerimiz",
    status: "published",
    meta_title: "Филиалы MADO в Ташкенте",
    meta_description: "Найдите ближайший ресторан MADO в Ташкенте. Адреса, время работы и контакты.",
    meta_title_ru: "Филиалы MADO в Ташкенте",
    meta_title_uz: "Toshkentdagi MADO filiallari",
    meta_title_en: "MADO Locations in Tashkent",
    meta_title_tr: "Taşkent'teki MADO Şubeleri",
    meta_description_ru: "Найдите ближайший ресторан MADO в Ташкенте. Адреса, время работы и контакты всех филиалов.",
    meta_description_uz: "Toshkentda eng yaqin MADO restoranini toping. Barcha filiallarning manzillari va ish vaqtlari.",
    meta_description_en: "Find your nearest MADO restaurant in Tashkent. Addresses, opening hours and contacts.",
    meta_description_tr: "Taşkent'teki en yakın MADO restoranını bulun. Adresler, çalışma saatleri ve iletişim.",
  },
  {
    title: "Карьера", slug: "careers",
    title_ru: "Карьера", title_uz: "Karyera", title_en: "Careers", title_tr: "Kariyer",
    status: "published",
    meta_title: "Карьера в MADO — Вакансии в Ташкенте",
    meta_description: "Присоединяйтесь к команде MADO. Открытые вакансии в ресторанах MADO в Ташкенте.",
    meta_title_ru: "Карьера в MADO — Вакансии в Ташкенте",
    meta_title_uz: "MADO da karyera — Toshkentdagi vakansiyalar",
    meta_title_en: "Careers at MADO — Vacancies in Tashkent",
    meta_title_tr: "MADO'da Kariyer — Taşkent'teki Pozisyonlar",
    meta_description_ru: "Присоединяйтесь к команде MADO. Открытые вакансии в ресторанах Ташкента.",
    meta_description_uz: "MADO jamoasiga qo'shiling. Toshkentdagi restoranlarda ochiq vakansiyalar.",
    meta_description_en: "Join the MADO team. Open positions at MADO restaurants in Tashkent.",
    meta_description_tr: "MADO ekibine katılın. Taşkent'teki MADO restoranlarında açık pozisyonlar.",
  },
  {
    title: "Контакты", slug: "contact",
    title_ru: "Контакты", title_uz: "Aloqa", title_en: "Contact", title_tr: "İletişim",
    status: "published",
    meta_title: "Контакты — MADO Ташкент",
    meta_description: "Свяжитесь с рестораном MADO в Ташкенте. Телефон, email, адреса.",
    meta_title_ru: "Контакты — MADO Ташкент",
    meta_title_uz: "Aloqa — MADO Toshkent",
    meta_title_en: "Contact — MADO Tashkent",
    meta_title_tr: "İletişim — MADO Taşkent",
    meta_description_ru: "Свяжитесь с рестораном MADO в Ташкенте. Телефон, email, адреса и форма обратной связи.",
    meta_description_uz: "Toshkentdagi MADO restorani bilan bog'laning. Telefon, email va manzillar.",
    meta_description_en: "Contact MADO restaurant in Tashkent. Phone, email, addresses and contact form.",
    meta_description_tr: "Taşkent'teki MADO restoranı ile iletişime geçin. Telefon, e-posta, adresler.",
  },
  {
    title: "Отзывы", slug: "reviews",
    title_ru: "Отзывы", title_uz: "Sharhlar", title_en: "Reviews", title_tr: "Yorumlar",
    status: "published",
    meta_title: "Отзывы о MADO Ташкент",
    meta_description: "Читайте отзывы гостей ресторана MADO в Ташкенте и оставьте свой отзыв.",
    meta_title_ru: "Отзывы о MADO Ташкент",
    meta_title_uz: "MADO Toshkent haqida sharhlar",
    meta_title_en: "MADO Tashkent Reviews",
    meta_title_tr: "MADO Taşkent Yorumları",
    meta_description_ru: "Читайте отзывы гостей ресторана MADO в Ташкенте. Узнайте, за что нас любят, и оставьте свой отзыв.",
    meta_description_uz: "Toshkentdagi MADO restorani mehmonlarining sharhlarini o'qing va o'z sharhingizni qoldiring.",
    meta_description_en: "Read guest reviews of MADO restaurant in Tashkent. See why guests love us and leave your review.",
    meta_description_tr: "Taşkent MADO restoranının misafir yorumlarını okuyun ve kendi yorumunuzu bırakın.",
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META: Record<PageStatus, { label: string; color: string; dot: string }> = {
  published: {
    label: "Опубликована",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  draft: {
    label: "Черновик",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
    dot: "bg-yellow-400",
  },
};

// ─── Form schema ──────────────────────────────────────────────────────────────

const pageSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  title_ru: z.string().optional(),
  title_uz: z.string().optional(),
  title_en: z.string().optional(),
  title_tr: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9\-/]*$/, "Slug: только a-z, 0-9, дефисы, слеши"),
  status: z.enum(["published", "draft"]),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  og_image: z.string().optional(),
  meta_title_ru: z.string().optional(),
  meta_title_uz: z.string().optional(),
  meta_title_en: z.string().optional(),
  meta_title_tr: z.string().optional(),
  meta_description_ru: z.string().optional(),
  meta_description_uz: z.string().optional(),
  meta_description_en: z.string().optional(),
  meta_description_tr: z.string().optional(),
});

type PageFormValues = z.infer<typeof pageSchema>;

// ─── Form modal ───────────────────────────────────────────────────────────────

function PageFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Page | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [tab, setTab] = useState<"basic" | "seo" | "seo_lang">("basic");
  const [saving, setSaving] = useState(false);

  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: initial?.title ?? "",
      title_ru: initial?.title_ru ?? "",
      title_uz: initial?.title_uz ?? "",
      title_en: initial?.title_en ?? "",
      title_tr: initial?.title_tr ?? "",
      slug: initial?.slug ?? "",
      status: (initial?.status ?? "published") as PageStatus,
      meta_title: initial?.meta_title ?? "",
      meta_description: initial?.meta_description ?? "",
      og_image: initial?.og_image ?? "",
      meta_title_ru: initial?.meta_title_ru ?? "",
      meta_title_uz: initial?.meta_title_uz ?? "",
      meta_title_en: initial?.meta_title_en ?? "",
      meta_title_tr: initial?.meta_title_tr ?? "",
      meta_description_ru: initial?.meta_description_ru ?? "",
      meta_description_uz: initial?.meta_description_uz ?? "",
      meta_description_en: initial?.meta_description_en ?? "",
      meta_description_tr: initial?.meta_description_tr ?? "",
    },
  });

  const onSubmit = async (values: PageFormValues) => {
    try {
      setSaving(true);
      const payload: Record<string, unknown> = {
        title: values.title,
        title_ru: values.title_ru || null,
        title_uz: values.title_uz || null,
        title_en: values.title_en || null,
        title_tr: values.title_tr || null,
        slug: values.slug,
        status: values.status,
        meta_title: values.meta_title || null,
        meta_description: values.meta_description || null,
        og_image: values.og_image || null,
        meta_title_ru: values.meta_title_ru || null,
        meta_title_uz: values.meta_title_uz || null,
        meta_title_en: values.meta_title_en || null,
        meta_title_tr: values.meta_title_tr || null,
        meta_description_ru: values.meta_description_ru || null,
        meta_description_uz: values.meta_description_uz || null,
        meta_description_en: values.meta_description_en || null,
        meta_description_tr: values.meta_description_tr || null,
      };
      if (initial) {
        await api.updatePage(initial.id, payload);
        toast.success("Страница обновлена");
      } else {
        await api.createPage(payload);
        toast.success("Страница создана");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  const TITLE_LANG_FIELDS: { name: "title_ru" | "title_uz" | "title_en" | "title_tr"; label: string; placeholder: string }[] = [
    { name: "title_ru", label: "Заголовок RU", placeholder: "Главная" },
    { name: "title_uz", label: "Заголовок UZ", placeholder: "Bosh sahifa" },
    { name: "title_en", label: "Заголовок EN", placeholder: "Home" },
    { name: "title_tr", label: "Заголовок TR", placeholder: "Ana Sayfa" },
  ];

  const META_TITLE_LANG_FIELDS: { name: "meta_title_ru" | "meta_title_uz" | "meta_title_en" | "meta_title_tr"; lang: string }[] = [
    { name: "meta_title_ru", lang: "RU" },
    { name: "meta_title_uz", lang: "UZ" },
    { name: "meta_title_en", lang: "EN" },
    { name: "meta_title_tr", lang: "TR" },
  ];

  const META_DESC_LANG_FIELDS: { name: "meta_description_ru" | "meta_description_uz" | "meta_description_en" | "meta_description_tr"; lang: string }[] = [
    { name: "meta_description_ru", lang: "RU" },
    { name: "meta_description_uz", lang: "UZ" },
    { name: "meta_description_en", lang: "EN" },
    { name: "meta_description_tr", lang: "TR" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-card px-6 py-4 border-b border-border flex items-center justify-between z-10">
          <h2 className="font-serif font-bold text-lg">
            {initial ? "Редактировать страницу" : "Новая страница"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6 overflow-x-auto">
          {(["basic", "seo", "seo_lang"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer",
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "basic" ? "Основная" : t === "seo" ? "SEO (общий)" : "SEO (по языкам)"}
            </button>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-6 space-y-4">

              {tab === "basic" && (
                <>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Заголовок (для адм.) <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input placeholder="Главная" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Slug <span className="text-muted-foreground font-normal text-xs">(пусто = главная /)</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">/</span>
                            <Input className="pl-6" placeholder="about-us" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Статус</FormLabel>
                        <FormControl>
                          <select
                            value={field.value}
                            onChange={field.onChange}
                            className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                          >
                            <option value="published">Опубликована</option>
                            <option value="draft">Черновик</option>
                          </select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="pt-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Многоязычные заголовки страницы (h1)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {TITLE_LANG_FIELDS.map(({ name, label, placeholder }) => (
                        <FormField
                          key={name}
                          control={form.control}
                          name={name}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{label}</FormLabel>
                              <FormControl>
                                <Input placeholder={placeholder} {...field} value={field.value ?? ""} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {tab === "seo" && (
                <>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-xl text-xs text-muted-foreground">
                    <Globe className="w-4 h-4 shrink-0" />
                    <span>Общие SEO-поля — используются как запасные, если поля по языкам не заполнены.</span>
                  </div>

                  <FormField
                    control={form.control}
                    name="meta_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Мета-заголовок (по умолчанию)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="MADO — Главная | Ресторан турецкой кухни"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Рекомендуется: 50–60 символов.{" "}
                          <span className={(field.value ?? "").length > 60 ? "text-destructive font-semibold" : ""}>
                            {(field.value ?? "").length}/60
                          </span>
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meta_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Мета-описание (по умолчанию)</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            placeholder="Описание страницы для поисковых систем (120–160 символов)"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Рекомендуется: 120–160 символов.{" "}
                          <span className={(field.value ?? "").length > 160 ? "text-destructive font-semibold" : ""}>
                            {(field.value ?? "").length}/160
                          </span>
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="og_image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL OG-изображения</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://madouz.uz/images/og-home.jpg"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Отображается при репосте в социальных сетях. Рекомендуется: 1200×630px.
                        </p>
                        {field.value && (
                          <img
                            src={field.value}
                            alt="OG preview"
                            className="mt-2 rounded-lg border border-border w-full max-h-40 object-cover"
                            onError={(e) => { (e.currentTarget).style.display = "none"; }}
                          />
                        )}
                      </FormItem>
                    )}
                  />
                </>
              )}

              {tab === "seo_lang" && (
                <>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-xl text-xs text-muted-foreground">
                    <Globe className="w-4 h-4 shrink-0" />
                    <span>SEO по языкам: используются в первую очередь. Если пусто — берётся общее поле.</span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Мета-заголовок по языкам
                    </p>
                    <div className="space-y-3">
                      {META_TITLE_LANG_FIELDS.map(({ name, lang }) => (
                        <FormField
                          key={name}
                          control={form.control}
                          name={name}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Meta Title — {lang}</FormLabel>
                              <FormControl>
                                <Input placeholder={`Мета-заголовок на ${lang}`} {...field} value={field.value ?? ""} />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">
                                <span className={(field.value ?? "").length > 60 ? "text-destructive font-semibold" : ""}>
                                  {(field.value ?? "").length}/60
                                </span>
                              </p>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Мета-описание по языкам
                    </p>
                    <div className="space-y-3">
                      {META_DESC_LANG_FIELDS.map(({ name, lang }) => (
                        <FormField
                          key={name}
                          control={form.control}
                          name={name}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Meta Description — {lang}</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={2}
                                  placeholder={`Мета-описание на ${lang}`}
                                  {...field}
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">
                                <span className={(field.value ?? "").length > 160 ? "text-destructive font-semibold" : ""}>
                                  {(field.value ?? "").length}/160
                                </span>
                              </p>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex gap-3">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1 cursor-pointer">
                Отмена
              </Button>
              <Button type="submit" disabled={saving} className="flex-1 gap-2 cursor-pointer">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Сохранение…" : initial ? "Сохранить" : "Создать"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

// ─── Seed confirm modal ───────────────────────────────────────────────────────

function SeedConfirmModal({
  existingCount,
  onConfirm,
  onClose,
  seeding,
}: {
  existingCount: number;
  onConfirm: () => void;
  onClose: () => void;
  seeding: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-primary/10">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-serif font-bold text-lg">Загрузить страницы по умолчанию?</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-3">
          Будет создано <strong className="text-foreground">{DEFAULT_PAGES.length} страниц</strong> на основе
          маршрутов сайта — с заголовками и SEO-мета на{" "}
          <strong className="text-foreground">4 языках (RU / UZ / EN / TR)</strong>:
        </p>

        <ul className="text-sm space-y-1 mb-4">
          {DEFAULT_PAGES.map((p) => (
            <li key={p.slug} className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground w-28 shrink-0">
                /{p.slug || ""}
              </span>
              <span className="text-foreground">{p.title}</span>
            </li>
          ))}
        </ul>

        {existingCount > 0 && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              В базе уже есть {existingCount} страниц. Дубликаты появятся при совпадении slug — проверьте после добавления.
            </span>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1 cursor-pointer" disabled={seeding}>
            Отмена
          </Button>
          <Button onClick={onConfirm} className="flex-1 gap-2 cursor-pointer" disabled={seeding}>
            {seeding && <Loader2 className="w-4 h-4 animate-spin" />}
            {seeding ? "Создание…" : "Загрузить"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PageStatus>("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Page | null>(null);
  const [showSeed, setShowSeed] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const loadPages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPages();
      setPages(Array.isArray(data) ? (data as Page[]) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить страницы");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadPages(); }, [loadPages]);

  const handleSeed = async () => {
    setSeeding(true);
    let created = 0;
    let failed = 0;
    try {
      for (const def of DEFAULT_PAGES) {
        try {
          await api.createPage({
            title: def.title,
            title_ru: def.title_ru,
            title_uz: def.title_uz,
            title_en: def.title_en,
            title_tr: def.title_tr,
            slug: def.slug,
            status: def.status,
            meta_title: def.meta_title,
            meta_description: def.meta_description,
            og_image: null,
            meta_title_ru: def.meta_title_ru ?? null,
            meta_title_uz: def.meta_title_uz ?? null,
            meta_title_en: def.meta_title_en ?? null,
            meta_title_tr: def.meta_title_tr ?? null,
            meta_description_ru: def.meta_description_ru ?? null,
            meta_description_uz: def.meta_description_uz ?? null,
            meta_description_en: def.meta_description_en ?? null,
            meta_description_tr: def.meta_description_tr ?? null,
          });
          created++;
        } catch {
          failed++;
        }
      }
      setShowSeed(false);
      await loadPages();
      if (failed === 0) {
        toast.success(`${created} страниц успешно создано`);
      } else {
        toast.warning(`Создано ${created}, ошибок ${failed}`);
      }
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (page: Page) => {
    try {
      await api.deletePage(page.id);
      setPages((prev) => prev.filter((p) => p.id !== page.id));
      toast.success(`Страница "${page.title}" удалена`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось удалить");
    }
  };

  const openEdit = (page: Page) => { setEditing(page); setShowForm(true); };
  const openNew = () => { setEditing(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("ru-RU", {
        day: "2-digit", month: "short", year: "numeric",
      });
    } catch { return iso; }
  };

  const filtered = pages.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.title.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      (p.title_ru ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const publishedCount = pages.filter((p) => p.status === "published").length;
  const draftCount = pages.filter((p) => p.status === "draft").length;

  return (
    <div className="space-y-5 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold">Страницы</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Загрузка страниц..." : `${publishedCount} опубликовано · ${draftCount} черновиков`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="secondary"
            onClick={() => setShowSeed(true)}
            className="gap-2 cursor-pointer"
            title="Создать все страницы сайта автоматически"
          >
            <Download className="w-4 h-4" /> Загрузить по умолчанию
          </Button>
          <Button onClick={openNew} className="gap-2 cursor-pointer">
            <Plus className="w-4 h-4" /> Новая страница
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="hover:opacity-70 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск страниц..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "published", "draft"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {s === "all"
                ? `Все (${pages.length})`
                : s === "published"
                  ? `Опубликованные (${publishedCount})`
                  : `Черновики (${draftCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Загрузка страниц...
        </div>
      )}

      {/* Pages list */}
      {!loading && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Страницы не найдены</p>
              {pages.length === 0 && !search && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-3">
                    База пустая — загрузите все страницы сайта одним кликом
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowSeed(true)}
                    className="gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Загрузить страницы по умолчанию
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((page) => {
                const sm = STATUS_META[page.status] ?? STATUS_META.draft;
                const hasSeo = !!(page.meta_title || page.meta_description || page.meta_title_ru);
                const langs = [
                  page.title_ru && "RU",
                  page.title_uz && "UZ",
                  page.title_en && "EN",
                  page.title_tr && "TR",
                ].filter(Boolean) as string[];

                return (
                  <div
                    key={page.id}
                    className="group flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground truncate">{page.title}</p>
                        <span className={cn(
                          "flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          sm.color
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", sm.dot)} />
                          {sm.label}
                        </span>
                        {hasSeo && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                            <Globe className="w-2.5 h-2.5" /> SEO
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <p className="text-xs text-muted-foreground font-mono">/{page.slug}</p>
                        {page.sections > 0 && (
                          <span className="text-xs text-muted-foreground">{page.sections} разделов</span>
                        )}
                        {langs.length > 0 && (
                          <span className="text-xs text-muted-foreground">{langs.join(" · ")}</span>
                        )}
                        <span className="text-xs text-muted-foreground">Обновлено {formatDate(page.updated_at)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted cursor-pointer"
                        title="Открыть страницу"
                      >
                        <Eye className="w-3 h-3" />
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      <button
                        onClick={() => openEdit(page)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" /> Редактировать
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 cursor-pointer">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить страницу?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Страница <strong>{page.title}</strong> (/{page.slug}) будет удалена безвозвратно.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(page)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <PageFormModal
          initial={editing}
          onClose={closeForm}
          onSaved={loadPages}
        />
      )}

      {/* Seed confirm modal */}
      {showSeed && (
        <SeedConfirmModal
          existingCount={pages.length}
          onConfirm={() => void handleSeed()}
          onClose={() => setShowSeed(false)}
          seeding={seeding}
        />
      )}
    </div>
  );
}
