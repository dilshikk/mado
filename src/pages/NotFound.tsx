import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { IceCreamCone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import Navbar from "./_components/navbar.tsx";
import Footer from "./_components/footer.tsx";
import { useLanguage } from "@/hooks/use-language.ts";
import { notFoundText } from "@/lib/i18n/home.ts";

export default function NotFound() {
  const location = useLocation();
  const { lang } = useLanguage();
  const t = notFoundText[lang];

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="max-w-lg text-center">
          {/* Decorative icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-8 flex justify-center"
          >
            <div className="flex size-24 items-center justify-center rounded-full bg-primary/10">
              <IceCreamCone className="size-12 text-primary" />
            </div>
          </motion.div>

          {/* 404 number */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="text-xs font-semibold tracking-[0.3em] text-accent uppercase"
          >
            {t.errorLabel}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="mt-4 font-serif text-5xl font-bold text-primary sm:text-6xl"
          >
            {t.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="mt-4 text-base leading-relaxed text-muted-foreground"
          >
            {t.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.27 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <Button
              asChild
              className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/">
                <ArrowLeft className="mr-2 size-4" />
                {t.homeBtn}
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="cursor-pointer text-foreground/70 hover:text-primary"
            >
              <Link to="/menu">{t.menuBtn}</Link>
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
