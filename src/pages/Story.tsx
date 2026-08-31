import { motion } from "motion/react";
import { ArrowRight, IceCreamCone, Bike, UtensilsCrossed, Wine } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import Navbar from "./_components/navbar.tsx";
import Footer from "./_components/footer.tsx";
import PageMeta from "@/components/page-meta.tsx";
import { useLanguage } from "@/hooks/use-language.ts";
import { storyPageText } from "@/lib/i18n/story.ts";

const HISTORY_PHOTOS = [
  {
    src: "https://hercules-cdn.com/file_IUbrA2y7LoDS590BCXoZDMXC",
    alt: "Мехмет Саит Канбур готовит традиционное мороженое MADO",
  },
  {
    src: "https://hercules-cdn.com/file_yZgdagcUptsyh3vAhJ1PW2mL",
    alt: "Старинный способ взбивания мороженого maras dondurma",
  },
  {
    src: "https://hercules-cdn.com/file_n7Thyh5sztIT3wyuOTrqmKOT",
    alt: "Мороженое растягивается как тесто вручную",
  },
  {
    src: "https://hercules-cdn.com/file_UtqAtW60KCa6eusilKYLKX1H",
    alt: "Мороженое MADO нарезают ножом по традиционной технологии",
  },
] as const;

const FEATURE_ICONS = [UtensilsCrossed, Bike, Wine, IceCreamCone];

const GALLERY_STRIP = [
  {
    src: "https://hercules-cdn.com/file_zHFz2EjzlyoLPkp7dFOxyIOI",
    alt: "Дондурма с мёдом и миндалём",
  },
  {
    src: "https://hercules-cdn.com/file_bRWtS51R48M2E98BBZ26KGhN",
    alt: "Пахлава с фисташками и каймаком",
  },
  {
    src: "https://hercules-cdn.com/file_quDvQLQZKt3c9ZiCW05PUT2S",
    alt: "Пахлава со шпинатом, политая мёдом",
  },
  {
    src: "https://hercules-cdn.com/file_MMxOPjlxQUlhpQrks4PZJQlj",
    alt: "Фисташковое мороженое в вафельном рожке",
  },
] as const;

export default function Story() {
  const { lang } = useLanguage();
  const t = storyPageText[lang];

  return (
    <div>
      <PageMeta slug="story" lang={lang} />
      <Navbar />

      <section
        className="relative flex h-[280px] items-center justify-center overflow-hidden bg-primary bg-cover bg-center sm:h-[340px]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1759756312579-fa70a9667c8c?auto=format&fit=crop&w=1600&q=80)",
        }}
      >
        <div className="absolute inset-0 bg-primary/60" />
        <div className="relative z-10 px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-serif text-4xl font-bold tracking-wide text-primary-foreground sm:text-5xl"
          >
            {t.heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="mt-3 text-xs font-semibold tracking-[0.3em] text-primary-foreground/85 uppercase sm:text-sm"
          >
            {t.heroSub}
          </motion.p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-secondary/50 py-20">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1784651169392-0460eee0bbb6?auto=format&fit=crop&w=1600&q=80)",
          }}
        />
        <div className="relative mx-auto max-w-[1140px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid grid-cols-1 gap-12 rounded-2xl bg-background/80 p-8 shadow-sm lg:grid-cols-2 lg:p-12"
          >
            <div className="space-y-4 text-muted-foreground">
              {t.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <p className="font-serif text-xl font-bold text-foreground">
                {t.sinceLabel}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {HISTORY_PHOTOS.map((photo) => (
                <div key={photo.src} className="overflow-hidden rounded-lg shadow-md">
                  <img src={photo.src} alt={photo.alt}
                    className="aspect-square w-full object-cover object-top grayscale" />
                </div>
              ))}
            </div>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.map((feature, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <motion.div key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                  className="rounded-xl border border-border/60 bg-background px-5 py-8 text-center shadow-sm">
                  <Icon className="mx-auto size-7 text-accent" />
                  <h3 className="mt-4 font-serif text-lg font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden bg-primary bg-cover bg-center py-16"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1679867646687-3a7cb8cbfb81?auto=format&fit=crop&w=1600&q=80)" }}
      >
        <div className="absolute inset-0 bg-primary/75" />
        <div className="relative mx-auto grid max-w-[1140px] grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: "easeOut" }}>
            <p className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">{t.ctaLabel}</p>
            <h2 className="mt-3 text-balance font-serif text-3xl font-bold text-primary-foreground sm:text-4xl">
              {t.ctaTitle}
            </h2>
            <p className="mt-4 max-w-md text-primary-foreground/80">
              {t.ctaSub}
            </p>
            <Button className="mt-6 cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90" asChild>
              <a href="#contact">{t.ctaBtn} <ArrowRight className="size-4" /></a>
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: "easeOut" }}
            className="overflow-hidden rounded-xl shadow-xl">
            <img src="https://mado.uz/uploads/orig-1788210437120.jpg"
              alt="" className="aspect-4/3 w-full object-cover" />
          </motion.div>
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4">
        {GALLERY_STRIP.map((photo) => (
          <div key={photo.src} className="aspect-square overflow-hidden">
            <img src={photo.src} alt={photo.alt}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
}
