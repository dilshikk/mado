import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils.ts";
import { useLanguage } from "@/hooks/use-language.ts";
import { statsText } from "@/lib/i18n/home.ts";

type Stat = {
  value: number;
  suffix?: string;
  className: string;
};

const STATS: Stat[] = [
  { value: 250, suffix: "+", className: "bg-primary text-primary-foreground" },
  { value: 300, suffix: "+", className: "bg-accent text-accent-foreground" },
  { value: 2, className: "bg-[#7a4a2b] text-white" },
];

function Counter({ value, suffix }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();

    let frameId: number;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(progress * value));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export default function Stats() {
  const { lang } = useLanguage();
  const t = statsText[lang];
  const labels = [t.dishes, t.years, t.restaurants];

  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 py-16 sm:grid-cols-3">
        {STATS.map((stat, i) => (
          <motion.div
            key={labels[i]}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
            className={cn(
              "rounded-xl px-6 py-10 text-center shadow-sm",
              stat.className,
            )}
          >
            <div className="font-serif text-5xl font-bold">
              <Counter value={stat.value} suffix={stat.suffix} />
            </div>
            <p className="mt-2 text-sm font-medium tracking-wide uppercase opacity-90">
              {labels[i]}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
