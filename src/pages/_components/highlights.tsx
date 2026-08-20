import { motion } from "motion/react";
import { ArrowRight, IceCreamCone, Cake, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useLanguage } from "@/hooks/use-language.ts";
import { highlightsText } from "@/lib/i18n/home.ts";

const ICONS = [IceCreamCone, Cake, Coffee];
const IMAGES = [
  "https://hercules-cdn.com/file_pufuhQShef4uFjB7yOwT4cM8",
  "https://hercules-cdn.com/file_VKPbNpeYeiy5CmAhJ20YwDHt",
  "https://hercules-cdn.com/file_c9jJ1YCm3AMZ6M4kB4c9FIEZ",
];

export default function Highlights() {
  const { lang } = useLanguage();
  const t = highlightsText[lang];

  return (
    <section id="menu" className="bg-secondary/40 py-24">
      <div className="mx-auto max-w-[1140px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-semibold tracking-[0.3em] text-accent uppercase">
            {t.eyebrow}
          </p>
          <h2 className="text-balance font-serif text-4xl font-bold text-foreground sm:text-5xl">
            {t.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t.subtitle}
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {t.items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
              >
                <Card className="h-full overflow-hidden border-border/60 pt-0 shadow-sm transition-shadow hover:shadow-lg">
                  <img
                    src={IMAGES[i]}
                    alt={item.title}
                    className="aspect-4/3 w-full object-cover"
                  />
                  <CardHeader className="pt-6">
                    <div className="mb-1 flex items-center gap-2">
                      <Icon className="size-5 text-accent" />
                      <CardTitle className="font-serif text-xl">
                        {item.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-14 flex justify-center">
          <Button
            size="lg"
            className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            asChild
          >
            <a
              href="https://oddmenu.com/p/mado-restaurant"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.viewMenuBtn} <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
