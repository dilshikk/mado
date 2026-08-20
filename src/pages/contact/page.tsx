import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  Mail, Phone, MessageSquare, MapPin, ArrowRight, Send, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form.tsx";
import Navbar from "../_components/navbar.tsx";
import Footer from "../_components/footer.tsx";
import api from "@/lib/api.ts";
import PageMeta from "@/components/page-meta.tsx";
import { useLanguage } from "@/hooks/use-language.ts";
import { contactPageText } from "@/lib/i18n/contact.ts";

// ─── Contact details ───────────────────────────────────────────────────────
const CONTACT_ICONS = [Phone, Mail, MessageSquare, MapPin];
const CONTACT_HREFS = [
  "tel:+998900080040",
  "mailto:madotashkent@gmail.com",
  "mailto:hr@madotashkent.uz",
  "/locations",
];

const selectCls =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { lang } = useLanguage();
  const t = contactPageText[lang];

  const contactSchema = z.object({
    fullName: z.string().min(1, t.nameRequired),
    email: z.string().email(t.emailInvalid),
    phone: z.string().min(1, t.phoneRequired),
    subject: z.string().min(1, t.subjectRequired),
    message: z.string().min(1, t.messageRequired),
  });

  type ContactFormValues = z.infer<typeof contactSchema>;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: "", email: "", phone: "", subject: "", message: "" },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      await api.createRequest({
        type: "contact",
        name: values.fullName,
        phone: values.phone,
        email: values.email,
        message: `[${values.subject}] ${values.message}`,
      });
      toast.success(t.successTitle, {
        description: t.successDesc(values.fullName),
      });
      form.reset();
    } catch (error) {
      toast.error(t.errorTitle, {
        description: error instanceof Error ? error.message : t.errorDesc,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageMeta slug="contact" lang={lang} />
      <Navbar />

      {/* Hero */}
      <section
        className="relative flex h-[260px] items-center justify-center overflow-hidden bg-primary bg-cover bg-center sm:h-[340px]"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80)" }}
      >
        <div className="absolute inset-0 bg-primary/72" />
        <div className="relative z-10 max-w-2xl px-6 text-center">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">{t.heroEyebrow}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
            className="mt-3 text-balance font-serif text-4xl font-bold text-primary-foreground sm:text-5xl">
            {t.heroTitle}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="mt-4 text-sm text-primary-foreground/80 sm:text-base">
            {t.heroSub}
          </motion.p>
        </div>
      </section>

      {/* Main contact section */}
      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: "easeOut" }} className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-bold text-primary sm:text-4xl">{t.mainTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              {t.mainSub}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[380px_1fr]">
            {/* Left: contact details */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: "easeOut" }} className="flex flex-col gap-4">
              {t.contactItems.map((item, i) => {
                const Icon = CONTACT_ICONS[i];
                return (
                  <a key={item.label} href={CONTACT_HREFS[i]}
                    className="group flex items-start gap-4 rounded-xl border border-border/60 bg-secondary/40 p-5 transition-all hover:border-accent/40 hover:bg-secondary/70">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/15 transition-colors group-hover:bg-accent/25">
                      <Icon className="size-4 text-accent" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold tracking-[0.15em] text-accent uppercase">{item.label}</p>
                      <p className="mt-0.5 truncate text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  </a>
                );
              })}

              {/* Map preview */}
              <div className="mt-2 overflow-hidden rounded-xl border border-border/60">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2995.4!2d69.2785!3d41.2995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b0cc379e9c3%3A0xa5boabcdef!2sTashkent!5e0!3m2!1sru!2s!4v1"
                  width="100%" height="200" style={{ border: 0 }}
                  allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  title="MADO Ташкент" className="w-full"
                />
              </div>
            </motion.div>

            {/* Right: form */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="rounded-2xl border border-border/60 bg-secondary/30 p-6 sm:p-10">
              <h3 className="font-serif text-2xl font-bold text-primary">{t.formTitle}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.formSub}</p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>{t.formFullName}</FormLabel><FormControl><Input placeholder={t.fullNamePlaceholder} {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>{t.formPhone}</FormLabel><FormControl><Input placeholder={t.phonePlaceholder} {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>{t.formEmail}</FormLabel><FormControl><Input placeholder="example@gmail.com" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem><FormLabel>{t.formSubject}</FormLabel><FormControl>
                      <select className={selectCls} {...field} disabled={isSubmitting}>
                        <option value="">{t.selectSubject}</option>
                        {t.subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem className="sm:col-span-2"><FormLabel>{t.formMessage}</FormLabel><FormControl>
                      <Textarea rows={5} placeholder={t.messagePlaceholder} {...field} disabled={isSubmitting} />
                    </FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="submit" size="lg" disabled={isSubmitting}
                    className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90 sm:col-span-2">
                    {isSubmitting ? <><Loader2 className="size-4 animate-spin" /> {t.sendingBtn}</> : <>{t.submitBtn} <Send className="size-4" /></>}
                  </Button>
                </form>
              </Form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Visit Locations CTA */}
      <section className="bg-secondary/40 py-16 sm:py-20">
        <div className="mx-auto max-w-[1140px] px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid grid-cols-1 items-center gap-8 overflow-hidden rounded-2xl bg-background shadow-sm lg:grid-cols-2">
            <div className="overflow-hidden">
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80" alt="Ресторан MADO"
                className="aspect-video w-full object-cover lg:aspect-auto lg:h-full" />
            </div>
            <div className="px-8 py-10 lg:px-10">
              <p className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">{t.visitLabel}</p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-primary sm:text-4xl">{t.visitTitle}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {t.visitText}
              </p>
              <Button size="lg" className="mt-6 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <a href="/locations">{t.visitBtn} <ArrowRight className="size-4" /></a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Catering CTA */}
      <section className="relative overflow-hidden bg-primary py-20 sm:py-28"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=1600&q=80)", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-primary/80" />
        <div className="relative mx-auto max-w-[1140px] px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: "easeOut" }} className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">{t.cateringLabel}</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-primary-foreground sm:text-4xl">{t.cateringTitle}</h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-primary-foreground/80">
              {t.cateringText}
            </p>
            <Button size="lg" variant="secondary" className="mt-6 cursor-pointer" asChild>
              <a href="/catering">{t.cateringBtn} <ArrowRight className="size-4" /></a>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
