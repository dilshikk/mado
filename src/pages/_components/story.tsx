import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

type Slide = {
  src: string;
  alt: string;
};

const KITCHEN_SLIDES: Slide[] = [
  {
    src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80",
    alt: "Турецкое ассорти на гриле",
  },
  {
    src: "https://images.unsplash.com/photo-1598110750624-207050c4f28c?auto=format&fit=crop&w=1200&q=80",
    alt: "Ручная турецкая пахлава",
  },
  {
    src: "https://images.unsplash.com/photo-1765448856945-481569592cf3?auto=format&fit=crop&w=1200&q=80",
    alt: "Повар готовит в традиционной кухне",
  },
];

const HERITAGE_SLIDES: Slide[] = [
  {
    src: "https://images.unsplash.com/photo-1767796778449-33beb2bf89d6?auto=format&fit=crop&w=1200&q=80",
    alt: "Турецкие сладости лукум",
  },
  {
    src: "https://images.unsplash.com/photo-1776993298437-f07c40d2d94d?auto=format&fit=crop&w=1200&q=80",
    alt: "Праздничный стол в турецком ресторане",
  },
  {
    src: "https://images.unsplash.com/photo-1773209927920-2230d6a18614?auto=format&fit=crop&w=1200&q=80",
    alt: "Повар готовит блюда для гостей",
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
            Наша история
          </p>
          <h2 className="text-balance font-serif text-4xl font-bold text-foreground sm:text-5xl">
            Попробуйте настоящую
            <br />
            турецкую кухню!
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Откройте для себя многовековые вкусы, десерты ручной
            работы и культовые турецкие блюда, приготовленные с
            любовью и традицией. Почувствуйте неповторимый вкус MADO в
            каждом кусочке.
          </p>
          <Button
            size="lg"
            className="mt-8 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            asChild
          >
            <a href="#menu">
              Посмотреть меню <ArrowRight className="size-4" />
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
            Наследие MADO
          </p>
          <h2 className="text-balance font-serif text-4xl font-bold text-foreground sm:text-5xl">
            300 лет традиций.
            <br />
            Один мир вкуса.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            MADO, обладающий более чем 300-летней историей и более
            чем 300 заведениями по всему миру, предлагает аутентичный
            вкус турецкой кухни каждому посетителю. MADO — это не
            просто место, где можно купить мороженое, это полноценный
            гастрономический опыт: от фирменных десертов и
            насыщенного мороженого до тортов-мороженого,
            профитролей с начинкой и освежающих напитков — все
            приготовлено с любовью и вниманием к деталям.
          </p>
          <Button
            size="lg"
            className="mt-8 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            asChild
          >
            <a href="#locations">
              Узнать больше <ArrowRight className="size-4" />
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
