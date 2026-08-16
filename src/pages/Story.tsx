import { motion } from "motion/react";
import { ArrowRight, IceCreamCone, Bike, UtensilsCrossed, Wine } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import Navbar from "./_components/navbar.tsx";
import Footer from "./_components/footer.tsx";

const HISTORY_PHOTOS = [
  {
    src: "https://hercules-cdn.com/file_IUbrA2y7LoDS590BCXoZDMXC",
    alt: "Мехмет Саит Канбур готовит традиционное мороженое MADO",
  },
  {
    src: "https://hercules-cdn.com/file_yZgdagcUptsyh3vAhJ1PW2mL",
    alt: "Старинный способ взбивания мороженого maras dondurma",
  },
  {
    src: "https://hercules-cdn.com/file_n7Thyh5sztIT3wyuOTrqmKOT",
    alt: "Мороженое растягивается как тесто вручную",
  },
  {
    src: "https://hercules-cdn.com/file_UtqAtW60KCa6eusilKYLKX1H",
    alt: "Мороженое MADO нарезают ножом по традиционной технологии",
  },
] as const;

const FEATURES = [
  {
    icon: UtensilsCrossed,
    title: "Аутентичная турецкая кухня",
    text: "Почувствуйте настоящий вкус Турции благодаря проверенным временем рецептам и тщательно отобранным ингредиентам.",
  },
  {
    icon: Bike,
    title: "Доставка",
    text: "Насладитесь фирменными блюдами и десертами MADO у себя дома. Каждый заказ приезжает свежим и приготовленным с той же заботой.",
  },
  {
    icon: Wine,
    title: "Кейтеринг",
    text: "Сделайте ваше торжество незабываемым с кейтерингом от MADO — для корпоративных мероприятий, праздников и частных случаев.",
  },
  {
    icon: IceCreamCone,
    title: "Обеды весь день",
    text: "Наслаждайтесь атмосферой, где традиция встречается с современной элегантностью, в любое время дня.",
  },
] as const;

const GALLERY_STRIP = [
  {
    src: "https://hercules-cdn.com/file_zHFz2EjzlyoLPkp7dFOxyIOI",
    alt: "Дондурма с мёдом и миндалём",
  },
  {
    src: "https://hercules-cdn.com/file_bRWtS51R48M2E98BBZ26KGhN",
    alt: "Пахлава с фисташками и каймаком",
  },
  {
    src: "https://hercules-cdn.com/file_quDvQLQZKt3c9ZiCW05PUT2S",
    alt: "Пахлава со шпинатом, политая мёдом",
  },
  {
    src: "https://hercules-cdn.com/file_MMxOPjlxQUlhpQrks4PZJQlj",
    alt: "Фисташковое мороженое в вафельном рожке",
  },
] as const;

export default function Story() {
  return (
    <div>
      <Navbar />

      <section
        className="relative flex h-[280px] items-center justify-center overflow-hidden bg-primary bg-cover bg-center sm:h-[340px]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1759756312579-fa70a9667c8c?auto=format&fit=crop&w=1600&q=80)",
        }}
      >
        <div className="absolute inset-0 bg-primary/60" />
        <div className="relative z-10 px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-serif text-4xl font-bold tracking-wide text-primary-foreground sm:text-5xl"
          >
            НАША ИСТОРИЯ
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="mt-3 text-xs font-semibold tracking-[0.3em] text-primary-foreground/85 uppercase sm:text-sm"
          >
            Настоящий турецкий опыт. Настоящий праздник вкуса.
          </motion.p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-secondary/50 py-20">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1784651169392-0460eee0bbb6?auto=format&fit=crop&w=1600&q=80)",
          }}
        />
        <div className="relative mx-auto max-w-[1140px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid grid-cols-1 gap-12 rounded-2xl bg-background/80 p-8 shadow-sm lg:grid-cols-2 lg:p-12"
          >
            <div className="space-y-4 text-muted-foreground">
              <p>
                MADO означает <strong className="text-foreground">Maraş Dondurması</strong> —
                «Мараш» это регион Кахраманмараш, а «Дондурма» — мороженое,
                приготовленное из трёх главных ингредиентов: сахара, козьего
                молока и салепа.
              </p>
              <p>
                История MADO началась с Османа Аги, предка семьи Канбур,
                который собирал снег с горы Ахир в Кахраманмараше и смешивал
                его с ароматной патокой, превращая его в освежающий десерт.
                Опыт и секреты передавались из поколения в поколение, а вкус
                совершенствовался и раскрывался всё глубже с каждым новым
                поколением.
              </p>
              <p>
                В какой-то момент MADO пришлось модернизироваться и перейти от
                традиционного мороженого ручной работы к машинному
                производству, чтобы предлагать десерт круглый год и в больших
                объёмах. Команда MADO работала день и ночь, чтобы внести
                необходимые изменения и при этом сохранить тот самый
                неповторимый вкус.
              </p>
              <p>
                Сегодня MADO — это сеть турецких ресторанов с более чем 300
                филиалами по всему миру. MADO — это история успеха бренда,
                который начинался с простой цели — подарить как можно
                большему числу людей традиционную мараш-дондурму, а вырос до
                целой фабрики, рынка и международной ресторанной сети.
              </p>
              <p className="font-serif text-xl font-bold text-foreground">
                — С 1850 года
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {HISTORY_PHOTOS.map((photo) => (
                <div
                  key={photo.src}
                  className="overflow-hidden rounded-lg shadow-md"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="aspect-square w-full object-cover object-top grayscale"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                className="rounded-xl border border-border/60 bg-background px-5 py-8 text-center shadow-sm"
              >
                <feature.icon className="mx-auto size-7 text-accent" />
                <h3 className="mt-4 font-serif text-lg font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden bg-primary bg-cover bg-center py-16"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1679867646687-3a7cb8cbfb81?auto=format&fit=crop&w=1600&q=80)",
        }}
      >
        <div className="absolute inset-0 bg-primary/75" />
        <div className="relative mx-auto grid max-w-[1140px] grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">
              Восхитительный опыт
            </p>
            <h2 className="mt-3 text-balance font-serif text-3xl font-bold text-primary-foreground sm:text-4xl">
              Ужин, мероприятие или праздник?
            </h2>
            <p className="mt-4 max-w-md text-primary-foreground/80">
              Планируете уютный ужин, корпоративное мероприятие или особое
              торжество — MADO предлагает элегантную атмосферу в сочетании с
              аутентичными турецкими вкусами. Каждое событие создано так,
              чтобы стать незабываемым.
            </p>
            <Button
              className="mt-6 cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90"
              asChild
            >
              <a href="#contact">
                Узнать больше <ArrowRight className="size-4" />
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="overflow-hidden rounded-xl shadow-xl"
          >
            <img
              src="https://images.unsplash.com/photo-1773209928058-cfd3314acc7c?auto=format&fit=crop&w=1000&q=80"
              alt="Праздничный стол с турецкими блюдами"
              className="aspect-4/3 w-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4">
        {GALLERY_STRIP.map((photo) => (
          <div key={photo.src} className="aspect-square overflow-hidden">
            <img
              src={photo.src}
              alt={photo.alt}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
}
