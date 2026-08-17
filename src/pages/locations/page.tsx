import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MapPin, Phone, Clock, ArrowRight, Loader2, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import Navbar from "../_components/navbar.tsx";
import Footer from "../_components/footer.tsx";
import api from "@/lib/api.ts";

// ─── Types ────────────────────────────────────────────────────────────────────

type ApiHour = { day_of_week: number; open_time: string; close_time: string; is_closed: boolean };

type ApiLocation = {
  id: number;
  name: string;
  name_ru: string | null;
  name_uz: string | null;
  name_en: string | null;
  name_tr: string | null;
  district: string;
  district_ru: string | null;
  district_uz: string | null;
  district_en: string | null;
  district_tr: string | null;
  address: string;
  address_ru: string | null;
  address_uz: string | null;
  address_en: string | null;
  address_tr: string | null;
  phone: string;
  email: string | null;
  maps_url: string | null;
  photo_url: string | null;
  status: string;
  hours: ApiHour[];
  services: string[];
};

type LangCode = "ru" | "uz" | "en" | "tr";

// ─── Language config ──────────────────────────────────────────────────────────

const LANG_OPTIONS: { code: LangCode; label: string; flag: string }[] = [
  { code: "ru", label: "RU", flag: "🇷🇺" },
  { code: "uz", label: "UZ", flag: "🇺🇿" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "tr", label: "TR", flag: "🇹🇷" },
];

// ─── Service translations ─────────────────────────────────────────────────────

const SERVICE_LABELS: Record<string, Record<LangCode, string>> = {
  "Dine-in":     { ru: "Зал",         uz: "Zal",            en: "Dine-in",     tr: "İçeride yemek" },
  "Takeaway":    { ru: "С собой",     uz: "Olib ketish",    en: "Takeaway",    tr: "Paket servis"  },
  "Delivery":    { ru: "Доставка",    uz: "Yetkazib berish", en: "Delivery",   tr: "Teslimat"      },
  "Reservation": { ru: "Бронь",       uz: "Bron",           en: "Reservation", tr: "Rezervasyon"  },
  "Events":      { ru: "Мероприятия", uz: "Tadbirlar",      en: "Events",      tr: "Etkinlikler"  },
};

function translateService(service: string, lang: LangCode): string {
  return SERVICE_LABELS[service]?.[lang] ?? service;
}

// ─── UI text ──────────────────────────────────────────────────────────────────

const UI_TEXT: Record<LangCode, {
  heroLabel: string; heroTitle: string; heroSub: string;
  sectionTitle: string; sectionSub: string; allCities: string;
  openNow: string; closedNow: string; showMap: string;
  ctaLabel: string; ctaTitle: string; ctaSub: string; ctaBtn: string;
  closedWeek: string; variesByDay: string; daily: string;
  loading: string; error: string;
}> = {
  ru: {
    heroLabel: "Ташкент, Узбекистан",
    heroTitle: "Найдите ближайший MADO",
    heroSub: "Откройте для себя настоящую турецкую кухню в любом из наших ресторанов по всему Ташкенту.",
    sectionTitle: "Наши рестораны", sectionSub: "Посетите нас в любом удобном месте",
    allCities: "Все", openNow: "● Открыто", closedNow: "● Закрыто",
    showMap: "Показать на карте",
    ctaLabel: "Мы поможем", ctaTitle: "Не можете найти ресторан?",
    ctaSub: "Если вы не уверены, какой филиал вам ближе, наша команда всегда готова помочь.",
    ctaBtn: "Связаться с нами",
    closedWeek: "Закрыто всю неделю", variesByDay: "Часы различаются по дням", daily: "ежедневно",
    loading: "Загрузка…", error: "Не удалось загрузить рестораны",
  },
  uz: {
    heroLabel: "Toshkent, O'zbekiston",
    heroTitle: "Eng yaqin MADOni toping",
    heroSub: "Toshkent bo'ylab barcha restoranlarimizda haqiqiy turk taomlarini kashf eting.",
    sectionTitle: "Restoranlarimiz", sectionSub: "Qulay joyda tashrif buyuring",
    allCities: "Barchasi", openNow: "● Ochiq", closedNow: "● Yopiq",
    showMap: "Xaritada ko'rsatish",
    ctaLabel: "Yordam beramiz", ctaTitle: "Restoran topa olmayapsizmi?",
    ctaSub: "Qaysi filial yaqinroq ekanligiga ishonmasangiz, jamoamiz doim yordam berishga tayyor.",
    ctaBtn: "Biz bilan bog'laning",
    closedWeek: "Butun hafta yopiq", variesByDay: "Har kun boshqacha", daily: "har kuni",
    loading: "Yuklanmoqda…", error: "Restoranlarni yuklashda xato",
  },
  en: {
    heroLabel: "Tashkent, Uzbekistan",
    heroTitle: "Find Your Nearest MADO",
    heroSub: "Discover authentic Turkish cuisine at any of our restaurants across Tashkent.",
    sectionTitle: "Our Restaurants", sectionSub: "Visit us at your nearest location",
    allCities: "All", openNow: "● Open", closedNow: "● Closed",
    showMap: "View on Map",
    ctaLabel: "We can help", ctaTitle: "Can't find a restaurant?",
    ctaSub: "If you're unsure which branch is closest, our team is always ready to help.",
    ctaBtn: "Contact us",
    closedWeek: "Closed all week", variesByDay: "Varies by day", daily: "daily",
    loading: "Loading…", error: "Failed to load locations",
  },
  tr: {
    heroLabel: "Taşkent, Özbekistan",
    heroTitle: "En Yakın MADO'yu Bulun",
    heroSub: "Taşkent genelindeki restoranlarımızda otantik Türk mutfağını keşfedin.",
    sectionTitle: "Restoranlarımız", sectionSub: "En yakın şubeyi ziyaret edin",
    allCities: "Tümü", openNow: "● Açık", closedNow: "● Kapalı",
    showMap: "Haritada Göster",
    ctaLabel: "Yardımcı olabiliriz", ctaTitle: "Restoran bulamıyor musunuz?",
    ctaSub: "Hangi şubenin daha yakın olduğundan emin değilseniz ekibimiz her zaman yardımcı olmaya hazır.",
    ctaBtn: "Bize Ulaşın",
    closedWeek: "Tüm hafta kapalı", variesByDay: "Günlere göre değişir", daily: "her gün",
    loading: "Yükleniyor…", error: "Restoranlar yüklenemedi",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLocalized(loc: ApiLocation, field: "name" | "district" | "address", lang: LangCode): string {
  const key = `${field}_${lang}` as keyof ApiLocation;
  const val = loc[key];
  if (val && typeof val === "string" && val.trim()) return val;
  const ruKey = `${field}_ru` as keyof ApiLocation;
  const ruVal = loc[ruKey];
  if (ruVal && typeof ruVal === "string" && ruVal.trim()) return ruVal;
  return typeof loc[field] === "string" ? (loc[field] as string) : "";
}

function isOpenNow(hours: ApiHour[]): boolean {
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7;
  const h = hours.find((x) => x.day_of_week === dayOfWeek);
  if (!h || h.is_closed) return false;
  const [oh, om] = h.open_time.split(":").map(Number);
  const [ch, cm] = h.close_time.split(":").map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  const open = oh * 60 + om;
  let close = ch * 60 + cm;
  if (close < open) close += 24 * 60;
  const adj = cur < open ? cur + 24 * 60 : cur;
  return adj >= open && adj <= close;
}

function formatHours(hours: ApiHour[], t: typeof UI_TEXT[LangCode]): string {
  const open = hours.filter((h) => !h.is_closed);
  if (open.length === 0) return t.closedWeek;
  const first = open[0];
  const allSame = open.every((h) => h.open_time === first.open_time && h.close_time === first.close_time);
  if (allSame) return `${first.open_time.slice(0, 5)} – ${first.close_time.slice(0, 5)} (${t.daily})`;
  return t.variesByDay;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Locations() {
  const [locations, setLocations] = useState<ApiLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lang, setLang] = useState<LangCode>("ru");
  const [filter, setFilter] = useState("all");

  const t = UI_TEXT[lang];

  useEffect(() => {
    api.getLocations()
      .then((data: ApiLocation[]) => { setLocations(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const cities = ["all", ...Array.from(new Set(locations.map((l) => getLocalized(l, "district", lang))))];
  const filtered = filter === "all" ? locations : locations.filter((l) => getLocalized(l, "district", lang) === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section
        className="relative flex h-[280px] items-center justify-center overflow-hidden bg-primary bg-cover bg-center sm:h-[360px]"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80)" }}
      >
        <div className="absolute inset-0 bg-primary/75" />
        <div className="relative z-10 max-w-2xl px-6 text-center">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">{t.heroLabel}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
            className="mt-3 text-balance font-serif text-4xl font-bold text-primary-foreground sm:text-5xl">{t.heroTitle}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="mt-4 text-sm text-primary-foreground/80 sm:text-base">{t.heroSub}</motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
            className="mt-5 flex justify-center gap-2">
            {LANG_OPTIONS.map((l) => (
              <button key={l.code} onClick={() => setLang(l.code)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${lang === l.code ? "bg-accent text-accent-foreground shadow" : "bg-white/10 text-white/80 hover:bg-white/20"}`}>
                <span>{l.flag}</span> {l.label}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Locations */}
      <section className="bg-secondary/40 py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: "easeOut" }} className="text-center">
            <h2 className="font-serif text-3xl font-bold text-primary sm:text-4xl">{t.sectionTitle}</h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">{t.sectionSub}</p>
          </motion.div>

          {/* City filter */}
          {!loading && cities.length > 2 && (
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
              className="mt-8 flex flex-wrap justify-center gap-2">
              {cities.map((city) => (
                <button key={city} onClick={() => setFilter(city)}
                  className={`cursor-pointer rounded-full border px-5 py-2 text-sm font-medium transition-all ${filter === city ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border/60 bg-background text-foreground/70 hover:bg-secondary hover:text-foreground"}`}>
                  {city === "all" ? t.allCities : city}
                </button>
              ))}
            </motion.div>
          )}

          {loading && <div className="mt-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
          {!loading && error && <p className="mt-16 text-center text-muted-foreground">{t.error}</p>}

          {/* Cards */}
          {!loading && !error && (
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
              {filtered.map((loc, i) => {
                const open = isOpenNow(loc.hours);
                const name = getLocalized(loc, "name", lang);
                const address = getLocalized(loc, "address", lang);
                return (
                  <motion.div key={loc.id}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                    className="group overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Photo */}
                    {loc.photo_url ? (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={loc.photo_url}
                          alt={name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                        />
                        {/* Status badge over photo */}
                        <span className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow ${open ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                          {open ? t.openNow : t.closedNow}
                        </span>
                      </div>
                    ) : (
                      <div className="h-36 bg-muted flex items-center justify-center">
                        <ImageOff className="w-8 h-8 text-muted-foreground/25" />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-xl font-bold text-foreground">{name}</h3>
                        {/* Status badge when no photo */}
                        {!loc.photo_url && (
                          <span className={`mt-1 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${open ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                            {open ? t.openNow : t.closedNow}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex flex-col gap-3">
                        <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                          <MapPin className="mt-0.5 size-4 shrink-0 text-accent" /><span>{address}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <Phone className="size-4 shrink-0 text-accent" />
                          <a href={`tel:${loc.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-accent">{loc.phone}</a>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <Clock className="size-4 shrink-0 text-accent" />
                          <span>{formatHours(loc.hours, t)}</span>
                        </div>
                      </div>

                      {/* Services */}
                      {loc.services.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {loc.services.map((s) => (
                            <span key={s} className="rounded-full border border-border/60 bg-secondary/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                              {translateService(s, lang)}
                            </span>
                          ))}
                        </div>
                      )}

                      {loc.maps_url && (
                        <Button size="sm" className="mt-5 w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                          <a href={loc.maps_url} target="_blank" rel="noopener noreferrer">
                            {t.showMap} <ArrowRight className="size-3.5" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 sm:py-20">
        <div className="mx-auto max-w-[1140px] px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: "easeOut" }} className="text-center">
            <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase">{t.ctaLabel}</p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-primary-foreground sm:text-4xl">{t.ctaTitle}</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-primary-foreground/75">{t.ctaSub}</p>
            <Button size="lg" variant="secondary" className="mt-6 cursor-pointer" asChild>
              <a href="/#contact">{t.ctaBtn} <ArrowRight className="size-4" /></a>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
