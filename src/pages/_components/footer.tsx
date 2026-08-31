import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Phone, Mail, IceCreamCone } from "lucide-react";
import { SiInstagram, SiTelegram } from "@icons-pack/react-simple-icons";
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
import { useLanguage } from "@/hooks/use-language.ts";
import { footerText } from "@/lib/i18n/home.ts";

const contactSchema = z.object({
  name: z.string().min(1, "Введите ваше имя"),
  email: z.string().email("Введите корректный email"),
  message: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const SOCIALS = [
  { icon: SiInstagram, href: "https://instagr.am/mado_uzbekistan", label: "Instagram" },
  { icon: SiTelegram, href: "https://t.me/mado_tcm", label: "Telegram" },
] as const;

export default function Footer() {
  const { lang } = useLanguage();
  const t = footerText[lang];

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = (values: ContactFormValues) => {
    toast.success(t.toastTitle, {
      description: t.toastDesc(values.name),
    });
    form.reset();
  };

  return (
    <footer
      id="contact"
      className="relative overflow-hidden border-t border-border bg-[#143968] text-primary-foreground bg-cover bg-center bg-no-repeat max-[1535px]:!bg-none"
      style={{
        backgroundImage:
          "url(https://mado.uz/uploads/orig-1788209747358.jpg)",
      }}
    >
      <div className="relative mx-auto max-w-[1140px] px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <IceCreamCone className="size-6 text-accent" />
              <span className="font-serif text-2xl font-bold">MADO</span>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/75">
              {t.description}
            </p>
            <div className="mt-4 flex items-start gap-2 text-sm text-primary-foreground/75">
              <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>
                <a href="mailto:madotashkent@gmail.com" className="hover:text-accent">
                  madotashkent@gmail.com
                </a>
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-primary-foreground/75">
              <Phone className="size-4 text-accent" />
              <a href="tel:+998900080040" className="hover:text-accent">
                +998 90 008 00 40
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-bold">{t.navTitle}</h3>
            <nav className="mt-4 flex flex-col gap-2">
              {t.quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-primary-foreground/75 transition-colors hover:text-accent"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="font-serif text-lg font-bold">{t.contactTitle}</h3>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-4 space-y-3"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary-foreground/80">
                        {t.nameLabel}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t.namePlaceholder}
                          className="border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground placeholder:text-primary-foreground/40"
                          {...field}
                        />
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
                      <FormLabel className="text-primary-foreground/80">
                        {t.emailLabel}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@mail.com"
                          className="border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground placeholder:text-primary-foreground/40"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary-foreground/80">
                        {t.messageLabel}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          className="border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground placeholder:text-primary-foreground/40"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {t.sendBtn}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/15 pt-6 sm:flex-row">
          <p className="text-sm text-primary-foreground/70">
            © {new Date().getFullYear()} MADO Tashkent
          </p>
          <div className="flex items-center gap-4">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-primary-foreground/75 transition-colors hover:text-accent"
              >
                <social.icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
