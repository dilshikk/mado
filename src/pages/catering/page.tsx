import { motion } from "motion/react";
import { Users, PartyPopper, Gem, IceCreamCone } from "lucide-react";
import Navbar from "../_components/navbar.tsx";
import Footer from "../_components/footer.tsx";
import HowItWorks from "./_components/how-it-works.tsx";
import FaqAccordion from "./_components/faq-accordion.tsx";
import QuoteForm from "./_components/quote-form.tsx";
import PageMeta from "@/components/page-meta.tsx";
import { useLanguage } from "@/hooks/use-language.ts";
import { cateringPageText } from "@/lib/i18n/catering.ts";

const OCCASION_ICONS = [Users, PartyPopper, Gem, IceCreamCone];

export default function Catering() {
  const { lang } = useLanguage();
  const t = cateringPageText[lang];

  return (
    <div className="min-h-screen bg-background">
      <PageMeta slug="catering" lang={lang} />
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
            {t.heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="mt-4 text-sm text-primary-foreground/80 sm:text-base"
          >
            {t.heroSub}
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
                {t.introTitle}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t.introText}
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
            {t.howItWorksTitle}
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
            {t.occasionsTitle}
          </motion.h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {t.occasions.map((occasion, i) => {
              const Icon = OCCASION_ICONS[i];
              return (
                <motion.div
                  key={occasion.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                  className="flex flex-col items-center rounded-xl border border-border/60 bg-background px-5 py-8 text-center shadow-sm"
                >
                  <Icon className="size-8 text-accent" />
                  <h3 className="mt-4 font-serif text-lg font-bold text-foreground">
                    {occasion.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {occasion.text}
                  </p>
                </motion.div>
              );
            })}
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
                {t.faqTitle}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {t.faqSub}
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
              {t.quoteTitle}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              {t.quoteSub}
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
