// components/Navbar.tsx
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = ["Toothpaste", "Mouthwash", "Oralbrush", "About Us"];
const EASE = [0.22, 1, 0.36, 1] as const;

const links = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
};

const linkItem = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Measures the real rendered navbar height (whatever it actually resolves to,
  // responsive breakpoint included) and exposes it as a CSS var so any section
  // below can align to it exactly — no hardcoded pixel guess to keep in sync.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const setVar = () => document.documentElement.style.setProperty("--nav-h", `${el.offsetHeight}px`);
    setVar();
    const observer = new ResizeObserver(setVar);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      ref={headerRef}
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
className={cn(
  "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300",
  // No border at all — separation comes only from the soft shadow + blur,
  // so there's no crisp line at any opacity. Shadow kept very diffuse and
  // low-opacity so it reads as depth, not an edge.
  scrolled || open
    ? "bg-white/55 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.14)] backdrop-blur-xl"
    : "bg-transparent",
)}
    >
      <nav className="mx-auto flex h-19 max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12" aria-label="Main navigation">
        <a href="#top" className="rounded-sm text-[1.65rem] font-extrabold leading-none tracking-[0] text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Totalflux<sup className="ml-0.5 align-super text-[0.48rem] font-semibold">®</sup>
        </a>

        <motion.div variants={links} initial="hidden" animate="show" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 lg:flex">
          {navItems.map((navItem) => (
            <motion.a
              key={navItem}
              variants={linkItem}
              href={`#${navItem.toLowerCase().replaceAll(" ", "-")}`}
              className="nav-link text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {navItem}
            </motion.a>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="hidden lg:block"
        >
          <Button asChild variant="hero" size="default" className="px-5">
            <a href="#where-to-buy">Where to Buy</a>
          </Button>
        </motion.div>

        <Button variant="ghost" size="icon" className="rounded-full text-primary lg:hidden" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? <X /> : <Menu />}
        </Button>
      </nav>

      <div className={cn("overflow-hidden border-t border-border/60 transition-[max-height,opacity] duration-300 lg:hidden", open ? "max-h-96 opacity-100" : "max-h-0 border-transparent opacity-0")}>
        <div className="flex flex-col gap-1 px-5 pb-6 pt-3 sm:px-8">
          {navItems.map((navItem) => (
            <a key={navItem} href={`#${navItem.toLowerCase().replaceAll(" ", "-")}`} onClick={() => setOpen(false)} className="rounded-md px-2 py-3 text-base font-medium text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {navItem}
            </a>
          ))}
          <Button asChild variant="hero" size="hero" className="mt-3 self-start">
            <a href="#where-to-buy" onClick={() => setOpen(false)}>Where to Buy</a>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}