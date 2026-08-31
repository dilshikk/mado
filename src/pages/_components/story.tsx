import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useLanguage } from "@/hooks/use-language.ts";
import { storyText } from "@/lib/i18n/home.ts";

type Slide = {
  src: string;
  alt: string;
};

const KITCHEN_SLIDES: Slide[] = [
  {
    src: "https://mado.uz/uploads/breakfast.jpg",
    alt: "Деревенский завтрак",
  },
  {
    src: "https://mado.uz/uploads/dolama.jpg",
    alt: "Фисташковая долама",
  },
  {
    src: "https://mado.uz/uploads/kunefe.jpg",
    alt: "Кюнефе",
  },
];

const HERITAGE_SLIDES: Slide[] = [
  {
    src: "https://mado.uz/uploads/orig-1788208854976.jpg",
    alt: "",
  },
  {
    src: "https://mado.uz/uploads/orig-1788208854980.jpg",
    alt: "",
  },
  {
    src: "https://mado.uz/uploads/orig-1788208854978.jpg",
    alt: "",
  },
  {
    src: "https://mado.uz/uploads/orig-1788208854979.jpg",
    alt: "",
  },
];

function Slider({ slides, borderSide }: { slides: Slide[]; borderSide: "left" | "right" }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative">
      <div
        className={`absolute -top-6 hidden h-full w-full rounded-2xl border-2 border-accent/50 sm:block ${
          borderSide === "left" ? "-left-6" : "-right-6"
        }`}
      />
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl shadow-xl">
        <AnimatePresence mode="wait">
          <motion.img
            key={slides[index].src}
            src={slides[index].src}
            alt={slides[index].alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
      </div>
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            aria-label={`Перейти к слайду ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 cursor-pointer rounded-full transition-all ${
              i === index ? "w-6 bg-accent" : "w-2 bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Story() {
  const { lang } = useLanguage();
  const t = storyText[lang];

  return (
    <section id="story" className="overflow-hidden bg-background py-24">
      <div className="mx-auto grid max-w-[1140px] grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Slider slides={KITCHEN_SLIDES} borderSide="left" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="mb-3 text-sm font-semibold tracking-[0.3em] text-accent uppercase">
            {t.storyLabel}
          </p>
          <h2 className="text-balance font-serif text-4xl font-bold text-foreground sm:text-5xl">
            {t.storyTitleL1}
            <br />
            {t.storyTitleL2}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            {t.storyText}
          </p>
          <Button
            size="lg"
            className="mt-8 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            asChild
          >
            <a href="#menu">
              {t.storyBtn} <ArrowRight className="size-4" />
            </a>
          </Button>
        </motion.div>
      </div>

      <div className="mx-auto mt-24 grid max-w-[1140px] grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="order-2 lg:order-1"
        >
          <p className="mb-3 text-sm font-semibold tracking-[0.3em] text-accent uppercase">
            {t.heritageLabel}
          </p>
          <h2 className="text-balance font-serif text-4xl font-bold text-foreground sm:text-5xl">
            {t.heritageTitleL1}
            <br />
            {t.heritageTitleL2}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            {t.heritageText}
          </p>
          <Button
            size="lg"
            className="mt-8 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            asChild
          >
            <a href="#locations">
              {t.heritageBtn} <ArrowRight className="size-4" />
            </a>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="order-1 lg:order-2"
        >
          <Slider slides={HERITAGE_SLIDES} borderSide="right" />
        </motion.div>
      </div>
    </section>
  );
}
