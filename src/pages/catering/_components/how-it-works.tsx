import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils.ts";
import { useLanguage } from "@/hooks/use-language.ts";
import { howItWorksText } from "@/lib/i18n/catering.ts";

const IMAGES = [
  "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
];

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const { lang } = useLanguage();
  const { steps } = howItWorksText[lang];
  const current = steps[active];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
      {/* Main image */}
      <div className="relative flex-1 overflow-hidden rounded-2xl shadow-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative h-[320px] sm:h-[420px]"
          >
            <img
              src={IMAGES[active]}
              alt={current.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <p className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">
                {current.step}
              </p>
              <h3 className="mt-2 max-w-md font-serif text-2xl font-bold text-primary-foreground sm:text-3xl">
                {current.title}
              </h3>
              <p className="mt-3 max-w-md text-sm text-primary-foreground/80">
                {current.text}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto sm:w-16 sm:flex-col sm:overflow-visible">
        {steps.map((s, i) => (
          <button
            key={s.step}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "relative shrink-0 cursor-pointer overflow-hidden rounded-lg transition-all",
              "h-16 w-24 sm:h-24 sm:w-16 sm:flex-1",
              active === i
                ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
                : "opacity-60 hover:opacity-100",
            )}
            aria-label={s.title}
          >
            <img src={IMAGES[i]} alt="" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-primary/40 font-serif text-sm font-bold text-primary-foreground">
              {i + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
