import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Phone, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import Navbar from "../_components/navbar.tsx";
import Footer from "../_components/footer.tsx";

type Schedule = {
  days: string;
  hours: string;
};

type Location = {
  name: string;
  city: string;
  phone: string;
  address: string;
  schedule: Schedule[];
  mapUrl: string;
  image: string;
  openHour: number;
  closeHour: number;
};

const LOCATIONS: Location[] = [
  {
    name: "MADO Сити Молл",
    city: "Ташкент",
    phone: "+998 90 008 00 40",
    address: "ул. Батыра Закирова, 7, Ташкент",
    schedule: [{ days: "Ежедневно", hours: "08:00 – 02:00" }],
    mapUrl: "https://maps.google.com/?q=Batyra+Zakirova+7+Tashkent",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    openHour: 8,
    closeHour: 2,
  },
  {
    name: "MADO Парк ин Молл",
    city: "Ташкент",
    phone: "+998 90 008 00 40",
    address: "Ukchi ko'chasi, Ташкент",
    schedule: [{ days: "Ежедневно", hours: "08:00 – 01:00" }],
    mapUrl: "https://maps.google.com/?q=Ukchi+kochasi+Tashkent",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    openHour: 8,
    closeHour: 1,
  },
];

function isOpenNow(openHour: number, closeHour: number): boolean {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const currentMins = h * 60 + m;
  const openMins = openHour * 60;
  // Close is past midnight
  const closeMins =
    closeHour < openHour ? (closeHour + 24) * 60 : closeHour * 60;
  const adjustedCurrent =
    h < openHour ? currentMins + 24 * 60 : currentMins;
  return adjustedCurrent >= openMins && adjustedCurrent <= closeMins;
}

export default function Locations() {
  const [filter, setFilter] = useState("all");

  const cities = [
    "all",
    ...Array.from(new Set(LOCATIONS.map((l) => l.city))),
  ];
  const filtered =
    filter === "all"
      ? LOCATIONS
      : LOCATIONS.filter((l) => l.city === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section
        className="relative flex h-[280px] items-center justify-center overflow-hidden bg-primary bg-cover bg-center sm:h-[360px]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80)",
        }}
      >
        <div className="absolute inset-0 bg-primary/75" />
        <div className="relative z-10 max-w-2xl px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-xs font-semibold tracking-[0.3em] text-accent uppercase"
          >
            Ташкент, Узбекистан
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
            className="mt-3 text-balance font-serif text-4xl font-bold text-primary-foreground sm:text-5xl"
          >
            Найдите ближайший MADO
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="mt-4 text-sm text-primary-foreground/80 sm:text-base"
          >
            Откройте для себя настоящую турецкую кухню в любом из наших
            ресторанов по всему Ташкенту.
          </motion.p>
        </div>
      </section>

      {/* Locations grid */}
      <section className="bg-secondary/40 py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center"
          >
            <h2 className="font-serif text-3xl font-bold text-primary sm:text-4xl">
              Наши рестораны
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Посетите нас в любом удобном месте
            </p>
          </motion.div>

          {/* City filter — shown only when there are 2+ cities */}
          {cities.length > 2 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
              className="mt-8 flex flex-wrap justify-center gap-2"
            >
              {cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setFilter(city)}
                  className={`cursor-pointer rounded-full border px-5 py-2 text-sm font-medium transition-all ${
                    filter === city
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/60 bg-background text-foreground/70 hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {city === "all" ? "Все" : city}
                </button>
              ))}
            </motion.div>
          )}

          {/* Cards grid */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
            {filtered.map((loc, i) => {
              const open = isOpenNow(loc.openHour, loc.closeHour);
              return (
                <motion.div
                  key={loc.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                  className="group overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Photo */}
                  <div className="overflow-hidden">
                    <img
                      src={loc.image}
                      alt={loc.name}
                      className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-xl font-bold text-foreground">
                        {loc.name}
                      </h3>
                      <span
                        className={`mt-1 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          open
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {open ? "● Открыто" : "● Закрыто"}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-col gap-3">
                      <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                        <span>{loc.address}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Phone className="size-4 shrink-0 text-accent" />
                        <a
                          href={`tel:${loc.phone.replace(/\s/g, "")}`}
                          className="transition-colors hover:text-accent"
                        >
                          {loc.phone}
                        </a>
                      </div>
                      <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <Clock className="mt-0.5 size-4 shrink-0 text-accent" />
                        <div className="flex flex-col gap-0.5">
                          {loc.schedule.map((s) => (
                            <span key={s.days}>
                              <span className="font-medium text-foreground/80">
                                {s.days}:
                              </span>{" "}
                              {s.hours}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="mt-5 w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                      asChild
                    >
                      <a
                        href={loc.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Показать на карте{" "}
                        <ArrowRight className="size-3.5" />
                      </a>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 sm:py-20">
        <div className="mx-auto max-w-[1140px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center"
          >
            <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase">
              Мы поможем
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-primary-foreground sm:text-4xl">
              Не можете найти ресторан?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-primary-foreground/75">
              Если вы не уверены, какой филиал вам ближе, или у вас есть
              вопросы о наших ресторанах, наша команда всегда готова помочь.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-6 cursor-pointer"
              asChild
            >
              <a href="/#contact">
                Связаться с нами <ArrowRight className="size-4" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
