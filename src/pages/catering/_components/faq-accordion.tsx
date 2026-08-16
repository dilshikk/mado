import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils.ts";

const FAQS = [
  {
    question: "Какие типы мероприятий вы обслуживаете?",
    answer:
      "Мы обслуживаем самые разные мероприятия: от корпоративных встреч и офисных обедов до частных праздников, помолвок и масштабных торжеств. Будь то интимный ужин или крупное событие, наша команда готова создать незабываемый опыт.",
  },
  {
    question: "Можете ли вы учесть особые пищевые предпочтения?",
    answer:
      "Да, мы предлагаем варианты меню с учётом вегетарианских, безглютеновых и других диетических предпочтений. Сообщите нам о ваших требованиях при оформлении заявки, и мы подготовим подходящее меню.",
  },
  {
    question: "Предоставляете ли вы еду и напитки?",
    answer:
      "Мы предлагаем полный спектр кейтеринговых услуг, включая еду и напитки. От фирменных турецких блюд до десертов и мороженого MADO — мы позаботимся обо всём.",
  },
  {
    question: "Есть ли минимальное количество гостей?",
    answer:
      "Минимальное количество гостей зависит от типа мероприятия и выбранного меню. Свяжитесь с нашей командой, чтобы обсудить детали вашего события и получить точную информацию.",
  },
  {
    question: "Предоставляете ли вы сервировку и уборку?",
    answer:
      "Да, наша команда берёт на себя сервировку столов и уборку после мероприятия, чтобы вы могли полностью сосредоточиться на своих гостях.",
  },
  {
    question: "Можно ли настроить меню под моё мероприятие?",
    answer:
      "Конечно! Мы с радостью подберём меню в соответствии с тематикой вашего мероприятия, предпочтениями гостей и бюджетом.",
  },
] as const;

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {FAQS.map((faq, i) => {
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
