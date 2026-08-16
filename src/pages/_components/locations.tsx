import { motion } from "motion/react";
import { MapPin, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";

type Location = {
  name: string;
  phone: string;
  address: string;
  timings: string;
  mapUrl: string;
};

const LOCATIONS: Location[] = [
  {
    name: "MADO Сити Молл",
    phone: "+998 90 008 00 40",
    address: "ул. Батыра Закирова, 7, ташкент, узбекистан",
    timings: "ежедневно (08:00 – 02:00)",
    mapUrl: "https://maps.google.com/?q=Batyra+Zakirova+7+Tashkent",
  },
  {
    name: "MADO Парк ин Молл",
    phone: "+998 90 008 00 40",
    address: "Ukchi ko'chasi, ташкент, узбекистан",
    timings: "ежедневно (08:00 – 01:00)",
    mapUrl: "https://maps.google.com/?q=Ukchi+kochasi+Tashkent",
  },
];

export default function Locations() {
  return (
    <section id="locations" className="bg-background py-24">
      <div className="mx-auto max-w-[1140px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-semibold tracking-[0.3em] text-accent uppercase">
            Найдите нас
          </p>
          <h2 className="text-balance font-serif text-4xl font-bold text-foreground sm:text-5xl">
            Наши рестораны
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">ташкент, узбекистан</p>
        </motion.div>

        <div className="mx-auto mt-14 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
          {LOCATIONS.map((loc, i) => (
            <motion.div
              key={loc.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
            >
              <Card className="h-full border-border/60 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-3">
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    {loc.name}
                  </h3>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Phone className="mt-0.5 size-4 shrink-0 text-accent" />
                    <a href={`tel:${loc.phone.replace(/\s/g, "")}`} className="hover:text-accent">
                      {loc.phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span>{loc.address}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Clock className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span>{loc.timings}</span>
                  </div>
                  <Button
                    size="sm"
                    className="mt-auto cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    asChild
                  >
                    <a href={loc.mapUrl} target="_blank" rel="noopener noreferrer">
                      Показать на карте
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
