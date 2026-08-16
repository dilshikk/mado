import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { IceCreamCone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import Navbar from "./_components/navbar.tsx";
import Footer from "./_components/footer.tsx";

export default function NotFound() {
  const location = useLocation();

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
            {"\u041e\u0448\u0438\u0431\u043a\u0430 404"}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="mt-4 font-serif text-5xl font-bold text-primary sm:text-6xl"
          >
            {"\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="mt-4 text-base leading-relaxed text-muted-foreground"
          >
            {"\u041a \u0441\u043e\u0436\u0430\u043b\u0435\u043d\u0438\u044e, \u0442\u0430\u043a\u043e\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b \u043d\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442. \u0412\u043e\u0437\u043c\u043e\u0436\u043d\u043e, \u043e\u043d\u0430 \u0431\u044b\u043b\u0430 \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0435\u043d\u0430 \u0438\u043b\u0438 \u0443\u0434\u0430\u043b\u0435\u043d\u0430 \u2014 \u0432\u0435\u0440\u043d\u0438\u0442\u0435\u0441\u044c \u043d\u0430 \u0433\u043b\u0430\u0432\u043d\u0443\u044e \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443."}
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
                {"\u041d\u0430 \u0433\u043b\u0430\u0432\u043d\u0443\u044e"}
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="cursor-pointer text-foreground/70 hover:text-primary"
            >
              <Link to="/menu">{"\u041f\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u043c\u0435\u043d\u044e"}</Link>
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
