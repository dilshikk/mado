import { useState } from "react";
import { motion } from "motion/react";
import { Menu, X, IceCreamCone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { toast } from "sonner";

const NAV_LINKS = [
  { label: "\u0413\u043b\u0430\u0432\u043d\u0430\u044f", href: "/" },
  { label: "\u041d\u0430\u0448\u0430 \u0438\u0441\u0442\u043e\u0440\u0438\u044f", href: "/story" },
  { label: "\u041c\u0435\u043d\u044e", href: "/menu" },
  { label: "\u041a\u0435\u0439\u0442\u0435\u0440\u0438\u043d\u0433", href: "/catering" },
  { label: "\u0420\u0435\u0441\u0442\u043e\u0440\u0430\u043d\u044b", href: "/locations" },
  { label: "\u041e\u0442\u0437\u044b\u0432\u044b", href: "/reviews" },
  { label: "\u041a\u0430\u0440\u044c\u0435\u0440\u0430", href: "/careers" },
  { label: "\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b", href: "/contact" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1140px] items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <IceCreamCone className="size-6 text-primary" />
          <span className="font-serif text-2xl font-bold tracking-wide text-primary">
            MADO
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium tracking-wide text-foreground/80 transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button
            className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() =>
              toast("\u0421\u043a\u043e\u0440\u043e \u0431\u0443\u0434\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e!", {
                description: "\u041e\u043d\u043b\u0430\u0439\u043d-\u0437\u0430\u043a\u0430\u0437 \u0443\u0436\u0435 \u0432 \u043f\u0443\u0442\u0438.",
              })
            }
          >
            {"\u0417\u0430\u043a\u0430\u0437\u0430\u0442\u044c"}
          </Button>
        </div>

        <button
          className="cursor-pointer text-foreground md:hidden"
          aria-label="\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043c\u0435\u043d\u044e"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="overflow-hidden border-t border-border/60 md:hidden"
        >
          <nav className="flex flex-col gap-1 px-6 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-primary"
              >
                {link.label}
              </a>
            ))}
            <Button
              className="mt-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                setOpen(false);
                toast("\u0421\u043a\u043e\u0440\u043e \u0431\u0443\u0434\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e!", {
                  description: "\u041e\u043d\u043b\u0430\u0439\u043d-\u0437\u0430\u043a\u0430\u0437 \u0443\u0436\u0435 \u0432 \u043f\u0443\u0442\u0438.",
                });
              }}
            >
              {"\u0417\u0430\u043a\u0430\u0437\u0430\u0442\u044c"}
            </Button>
          </nav>
        </motion.div>
      )}
    </header>
  );
}
