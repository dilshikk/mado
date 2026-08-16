import { motion } from "motion/react";
import { Users, PartyPopper, Gem, IceCreamCone } from "lucide-react";
import Navbar from "../_components/navbar.tsx";
import Footer from "../_components/footer.tsx";
import HowItWorks from "./_components/how-it-works.tsx";
import FaqAccordion from "./_components/faq-accordion.tsx";
import QuoteForm from "./_components/quote-form.tsx";

const OCCASIONS = [
  {
    icon: Users,
    title: "Корпоративные мероприятия",
    text: "Профессиональный кейтеринг для встреч, конференций и корпоративных праздников с изысканными вкусами и элегантной подачей.",
  },
  {
    icon: PartyPopper,
    title: "Частные торжества",
    text: "Идеально для дней рождения, юбилеев и семейных встреч — аутентичные блюда и тёплая, гостеприимная атмосфера.",
  },
  {
    icon: Gem,
    title: "Особые случаи",
    text: "От свадеб до эксклюзивных празднований — MADO создаёт незабываемые кулинарные впечатления для вашего события.",
  },
  {
    icon: IceCreamCone,
    title: "Десертные и мороженое станции",
    text: "Фирменная дондурма MADO и сладости, поданные свежими и красиво оформленными для ваших гостей.",
  },
] as const;

export default function Catering() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section
        className="relative flex h-[300px] items-center justify-center overflow-hidden bg-primary bg-cover bg-center sm:h-[380px]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1751651054990-a458fda33224?auto=format&fit=crop&w=1600&q=80)",
        }}
      >
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative z-10 max-w-2xl px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-balance font-serif text-4xl font-bold text-primary-foreground sm:text-5xl"
          >
            Кейтеринг с аутентичными турецкими вкусами
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="mt-4 text-sm text-primary-foreground/80 sm:text-base"
          >
            От душевных встреч до грандиозных торжеств — MADO приносит богатство
            турецкой кухни на ваше особое мероприятие.
          </motion.p>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-secondary/50 py-16 sm:py-20">
        <div className="mx-auto max-w-[1140px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid grid-cols-1 items-center gap-8 rounded-2xl bg-background p-6 shadow-sm sm:p-10 lg:grid-cols-2 lg:gap-14"
          >
            <div className="overflow-hidden rounded-xl">
              <img
                src="https://images.unsplash.com/photo-1751651054926-36ea440bb06c?auto=format&fit=crop&w=1000&q=80"
                alt="Стол с блюдами кейтеринга MADO"
                className="aspect-video w-full object-cover"
              />
            </div>
            <div>
              <h2 className="max-w-md text-balance font-serif text-3xl font-bold text-primary sm:text-4xl">
                Незабываемые вкусы для каждого случая
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Кейтеринг MADO объединяет вековые традиции турецкой кухни с
                современной подачей и сервисом. Мы создаём незабываемые
                кулинарные впечатления для любого мероприятия в Ташкенте —
                от небольших встреч до масштабных праздников, уделяя внимание
                каждой детали.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-6">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center font-serif text-3xl font-bold text-primary sm:text-4xl"
          >
            Как это работает?
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="mt-10"
          >
            <HowItWorks />
          </motion.div>
        </div>
      </section>

      {/* Occasions */}
      <section className="bg-secondary/50 py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-6">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center font-serif text-3xl font-bold text-primary sm:text-4xl"
          >
            Кейтеринг для разных мероприятий
          </motion.h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {OCCASIONS.map((occasion, i) => (
              <motion.div
                key={occasion.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                className="flex flex-col items-center rounded-xl border border-border/60 bg-background px-5 py-8 text-center shadow-sm"
              >
                <occasion.icon className="size-8 text-accent" />
                <h3 className="mt-4 font-serif text-lg font-bold text-foreground">
                  {occasion.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {occasion.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h2 className="font-serif text-3xl font-bold text-primary sm:text-4xl">
                Нужно больше деталей?
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Свяжитесь с нашей командой, чтобы получить персональную
                консультацию по кейтерингу.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            >
              <FaqAccordion />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quote form */}
      <section className="bg-secondary/50 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center"
          >
            <h2 className="font-serif text-3xl font-bold text-primary sm:text-4xl">
              Свяжитесь с MADO Catering
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Мы верим, что каждое мероприятие заслуживает исключительной еды и
              безупречного сервиса. Поделитесь деталями вашего мероприятия, и
              наша команда поможет создать кейтеринг, который идеально
              соответствует вашему случаю, предпочтениям и бюджету.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="mt-10 rounded-2xl bg-background p-6 shadow-sm sm:p-10"
          >
            <QuoteForm />
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
