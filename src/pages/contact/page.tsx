import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  ArrowRight,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import Navbar from "../_components/navbar.tsx";
import Footer from "../_components/footer.tsx";
import api from "@/lib/api.ts";

// ─── Contact details ───────────────────────────────────────────────────────
const CONTACT_ITEMS = [
  {
    icon: Phone,
    label: "Позвоните нам",
    value: "+998 90 008 00 40",
    href: "tel:+998900080040",
  },
  {
    icon: Mail,
    label: "Напишите нам",
    value: "madotashkent@gmail.com",
    href: "mailto:madotashkent@gmail.com",
  },
  {
    icon: MessageSquare,
    label: "Карьера",
    value: "hr@madotashkent.uz",
    href: "mailto:hr@madotashkent.uz",
  },
  {
    icon: MapPin,
    label: "Наши рестораны",
    value: "Ташкент, Узбекистан",
    href: "/locations",
  },
] as const;

// ─── Form schema ────────────────────────────────────────────────────────────────
const contactSchema = z.object({
  fullName: z.string().min(1, "Введите ваше имя"),
  email: z.string().email("Введите корректный email"),
  phone: z.string().min(1, "Введите номер телефона"),
  subject: z.string().min(1, "Выберите тему"),
  message: z.string().min(1, "Введите сообщение"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const SUBJECTS = [
  "Общий вопрос",
  "Бронирование стола",
  "Кейтеринг",
  "Отзыв / Предложение",
  "Карьера",
  "Партнёрство",
] as const;

// Shared native select styles
const selectCls =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
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
      toast.success("Сообщение отправлено!", {
        description: `Спасибо, ${values.fullName}! Мы свяжемся с вами в ближайшее время.`,
      });
      form.reset();
    } catch (error) {
      toast.error("Не удалось отправить сообщение", {
        description:
          error instanceof Error
            ? error.message
            : "Пожалуйста, попробуйте ещё раз или свяжитесь с нами по телефону.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section
        className="relative flex h-[260px] items-center justify-center overflow-hidden bg-primary bg-cover bg-center sm:h-[340px]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80)",
        }}
      >
        <div className="absolute inset-0 bg-primary/72" />
        <div className="relative z-10 max-w-2xl px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-xs font-semibold tracking-[0.3em] text-accent uppercase"
          >
            Свяжитесь с нами
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
            className="mt-3 text-balance font-serif text-4xl font-bold text-primary-foreground sm:text-5xl"
          >
            Мы рады ответить
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="mt-4 text-sm text-primary-foreground/80 sm:text-base"
          >
            Есть вопрос? Планируете мероприятие? Хотите забронировать стол? Мы
            здесь, чтобы помочь.
          </motion.p>
        </div>
      </section>

      {/* Main contact section: details + form */}
      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-12 text-center"
          >
            <h2 className="font-serif text-3xl font-bold text-primary sm:text-4xl">
              Рады услышать вас
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Обращайтесь по любому вопросу — будь то кейтеринг,
              бронирование, отзыв или просто предложение. Мы
              всегда рады помочь.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[380px_1fr]">
            {/* Left: contact details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col gap-4"
            >
              {CONTACT_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="group flex items-start gap-4 rounded-xl border border-border/60 bg-secondary/40 p-5 transition-all hover:border-accent/40 hover:bg-secondary/70"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/15 transition-colors group-hover:bg-accent/25">
                    <item.icon className="size-4 text-accent" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.15em] text-accent uppercase">
                      {item.label}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                      {item.value}
                    </p>
                  </div>
                </a>
              ))}

              {/* Map preview */}
              <div className="mt-2 overflow-hidden rounded-xl border border-border/60">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2995.4!2d69.2785!3d41.2995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b0cc379e9c3%3A0xa5boabcdef!2sTashkent!5e0!3m2!1sru!2s!4v1"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="MADO Ташкент"
                  className="w-full"
                />
              </div>
            </motion.div>

            {/* Right: form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="rounded-2xl border border-border/60 bg-secondary/30 p-6 sm:p-10"
            >
              <h3 className="font-serif text-2xl font-bold text-primary">
                Отправьте сообщение
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Ответим в течение рабочего дня
              </p>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Полное имя</FormLabel>
                        <FormControl>
                          <Input placeholder="Иван Иванов" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Номер телефона</FormLabel>
                        <FormControl>
                          <Input placeholder="+998 90 000 00 00" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="example@gmail.com" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Тема обращения</FormLabel>
                        <FormControl>
                          <select className={selectCls} {...field} disabled={isSubmitting}>
                            <option value="">Выберите тему</option>
                            {SUBJECTS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Сообщение</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={5}
                            placeholder="Как мы можем вам помочь?"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90 sm:col-span-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Отправка...
                      </>
                    ) : (
                      <>
                        Отправить сообщение <Send className="size-4" />
                      </>
                    )}
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid grid-cols-1 items-center gap-8 overflow-hidden rounded-2xl bg-background shadow-sm lg:grid-cols-2"
          >
            <div className="overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80"
                alt="Ресторан MADO"
                className="aspect-video w-full object-cover lg:aspect-auto lg:h-full"
              />
            </div>
            <div className="px-8 py-10 lg:px-10">
              <p className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">
                Найдите нас
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-primary sm:text-4xl">
                Посетите наш ресторан
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                MADO расположен в нескольких торговых центрах Ташкента.
                Найдите ближайший ресторан и насладитесь настоящей
                турецкой кухней.
              </p>
              <Button
                size="lg"
                className="mt-6 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                asChild
              >
                <a href="/locations">
                  Посмотреть рестораны <ArrowRight className="size-4" />
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Catering CTA */}
      <section
        className="relative overflow-hidden bg-primary py-20 sm:py-28"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=1600&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-primary/80" />
        <div className="relative mx-auto max-w-[1140px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">
              Планируете что-то особенное?
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-primary-foreground sm:text-4xl">
              Кейтеринг MADO
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-primary-foreground/80">
              От корпоративных мероприятий до частных торжеств — MADO
              предлагает премиумный турецкий кейтеринг для
              любого особого случая.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-6 cursor-pointer"
              asChild
            >
              <a href="/catering">
                Узнать о кейтеринге <ArrowRight className="size-4" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
