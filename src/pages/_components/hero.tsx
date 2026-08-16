import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

export default function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-primary">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-90"
        src="https://mado.ae/wp-content/uploads/2025/12/Video-for-Website_1-1.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/15 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/10 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-[1140px] px-6 py-24">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-4 text-sm font-semibold tracking-[0.3em] text-accent uppercase"
        >
          Настоящий праздник вкуса
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="max-w-3xl text-balance font-serif text-5xl font-bold leading-tight text-primary-foreground sm:text-6xl md:text-7xl"
        >
          Аутентичная турецкая кухня
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.22 }}
          className="mt-6 max-w-xl text-balance text-lg text-primary-foreground/85"
        >
          Настоящий праздник вкуса. Откройте для себя вековые традиции,
          десерты, приготовленные вручную, и легендарные турецкие блюда,
          созданные с любовью и уважением к традициям.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.34 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Button
            size="lg"
            className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90"
            asChild
          >
            <a href="#menu">
              Смотреть меню <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button
            size="lg"
            className="cursor-pointer border border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            asChild
          >
            <a href="#locations">Наши рестораны</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
