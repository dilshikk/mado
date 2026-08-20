import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { useLanguage } from "@/hooks/use-language.ts";
import { faqAccordionText } from "@/lib/i18n/catering.ts";

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { lang } = useLanguage();
  const { faqs } = faqAccordionText[lang];

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={faq.question}
            className="overflow-hidden rounded-lg border border-border/60"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 bg-secondary/60 px-5 py-4 text-left transition-colors hover:bg-secondary"
            >
              <span className="font-medium text-foreground">
                {faq.question}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-accent transition-transform duration-300",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="bg-background px-5 py-4 text-sm text-muted-foreground">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
