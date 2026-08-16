import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  Globe,
  TrendingUp,
  Users,
  Star,
  ArrowRight,
  ChevronRight,
  Send,
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

// ─── Why Work ────────────────────────────────────────────────────────────────
const WHY_ITEMS = [
  {
    icon: Globe,
    title: "Международный бренд",
    text: "Станьте частью глобально признанного турецкого бренда с историей более 70 лет.",
  },
  {
    icon: TrendingUp,
    title: "Возможности для роста",
    text: "Развивайте свои навыки и стройте карьеру в профессиональной среде.",
  },
  {
    icon: Users,
    title: "Командная культура",
    text: "Работайте в дружелюбной, уважительной и ориентированной на команду атмосфере.",
  },
  {
    icon: Star,
    title: "Страсть к качеству",
    text: "Готовьте исключительную еду и обеспечивайте безупречный сервис каждый день.",
  },
] as const;

// ─── Open Positions ───────────────────────────────────────────────────────────
const POSITIONS = [
  { title: "Официант / Официантка", type: "Полная занятость", city: "Ташкент" },
  { title: "Бариста", type: "Полная занятость", city: "Ташкент" },
  { title: "Раннер", type: "Полная занятость", city: "Ташкент" },
  { title: "Повар холодного цеха", type: "Полная занятость", city: "Ташкент" },
  { title: "Администратор зала", type: "Полная занятость", city: "Ташкент" },
  { title: "Кассир", type: "Полная занятость", city: "Ташкент" },
] as const;

// ─── Apply form ───────────────────────────────────────────────────────────────
const applySchema = z.object({
  fullName: z.string().min(1, "Введите ваше имя"),
  phone: z.string().min(1, "Введите номер телефона"),
  email: z.string().email("Введите корректный email"),
  position: z.string().min(1, "Выберите вакансию"),
  branch: z.string().min(1, "Выберите ресторан"),
  experience: z.string().optional(),
  message: z.string().optional(),
});

type ApplyFormValues = z.infer<typeof applySchema>;

// Shared select class
const selectCls =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function ApplyForm() {
  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      position: "",
      branch: "",
      experience: "",
      message: "",
    },
  });

  const onSubmit = (values: ApplyFormValues) => {
    toast.success("Заявка отправлена!", {
      description: `Спасибо, ${values.fullName}! Мы свяжемся с вами в ближайшее время.`,
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Полное имя</FormLabel>
              <FormControl>
                <Input placeholder="Иван Иванов" {...field} />
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
                <Input placeholder="+998 90 000 00 00" {...field} />
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
                <Input placeholder="example@gmail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Вакансия</FormLabel>
              <FormControl>
                <select className={selectCls} {...field}>
                  <option value="">Выберите вакансию</option>
                  {POSITIONS.map((p) => (
                    <option key={p.title} value={p.title}>
                      {p.title}
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
          name="branch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ресторан</FormLabel>
              <FormControl>
                <select className={selectCls} {...field}>
                  <option value="">Выберите ресторан</option>
                  <option value="city-mall">MADO Сити Молл</option>
                  <option value="park-in-mall">MADO Парк ин Молл</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Опыт работы</FormLabel>
              <FormControl>
                <Input placeholder="Например: 2 года официантом" {...field} />
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
              <FormLabel>Сопроводительное письмо (необязательно)</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Расскажите немного о себе и почему хотите работать в MADO..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="lg"
          className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90 sm:col-span-2"
        >
          Отправить заявку <Send className="size-4" />
        </Button>
      </form>
    </Form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Careers() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section
        className="relative flex h-[300px] items-center justify-center overflow-hidden bg-primary bg-cover bg-center sm:h-[380px]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1600&q=80)",
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
            Карьера в MADO
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
            className="mt-3 text-balance font-serif text-4xl font-bold text-primary-foreground sm:text-5xl"
          >
            Присоединяйтесь к семье MADO
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="mt-4 text-sm text-primary-foreground/80 sm:text-base"
          >
            Великая еда начинается с великих людей. Станьте частью нашей команды.
          </motion.p>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-[1140px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid grid-cols-1 items-center gap-10 rounded-2xl bg-secondary/50 p-8 sm:p-12 lg:grid-cols-2 lg:gap-16"
          >
            <div className="overflow-hidden rounded-xl">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80"
                alt="Команда MADO"
                className="aspect-video w-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">
                О нас
              </p>
              <h2 className="mt-3 max-w-md text-balance font-serif text-3xl font-bold text-primary sm:text-4xl">
                Великая еда начинается с великих людей
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                В MADO мы верим, что наши сотрудники — основа всего, что мы
                делаем. Мы ищем людей, которые разделяют страсть к гостеприимству,
                аутентичной турецкой кухне и высоким стандартам обслуживания.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Независимо от того, начинаете ли вы карьеру или ищете новые
                возможности роста — MADO предлагает среду, в которой вы сможете
                раскрыть свой потенциал.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why work */}
      <section className="bg-secondary/40 py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center"
          >
            <h2 className="font-serif text-3xl font-bold text-primary sm:text-4xl">
              Почему MADO?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Четыре причины начать карьеру с нами
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_ITEMS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                className="flex flex-col items-center rounded-xl border border-border/50 bg-background px-6 py-8 text-center shadow-sm"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-accent/15">
                  <item.icon className="size-5 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 font-serif text-lg font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open positions */}
      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">
              Вакансии
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-primary sm:text-4xl">
              Открытые позиции
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Ташкент, Узбекистан
            </p>
          </motion.div>

          <div className="mt-10 flex flex-col gap-3">
            {POSITIONS.map((pos, i) => (
              <motion.div
                key={pos.title}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
                className="group flex items-center justify-between rounded-xl border border-border/60 bg-secondary/40 px-5 py-4 transition-all hover:border-accent/40 hover:bg-secondary/70"
              >
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
                  <span className="font-medium text-foreground">{pos.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                      {pos.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {pos.city}
                    </span>
                  </div>
                </div>
                <a
                  href="#apply"
                  className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-accent"
                >
                  Откликнуться
                  <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply form */}
      <section id="apply" className="bg-secondary/40 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center"
          >
            <p className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">
              Подать заявку
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-primary sm:text-4xl">
              Готовы присоединиться к нам?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Заполните форму ниже, и наш HR-менеджер свяжется с вами в
              ближайшее время для обсуждения деталей.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="mt-10 rounded-2xl bg-background p-6 shadow-sm sm:p-10"
          >
            <ApplyForm />
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-primary py-16 sm:py-20">
        <div className="mx-auto max-w-[1140px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left"
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-accent uppercase">
                Вопросы?
              </p>
              <h2 className="mt-1 font-serif text-2xl font-bold text-primary-foreground sm:text-3xl">
                Свяжитесь с нашей HR-командой
              </h2>
              <p className="mt-2 max-w-md text-sm text-primary-foreground/75">
                Если у вас есть вопросы о вакансиях или процессе приёма на
                работу — мы рады помочь.
              </p>
            </div>
            <Button
              size="lg"
              variant="secondary"
              className="shrink-0 cursor-pointer"
              asChild
            >
              <a href="/contact">
                Написать нам <ArrowRight className="size-4" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
