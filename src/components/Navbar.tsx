// components/Navbar.tsx
import { useEffect, useRef, useState } from "react";
import { Link, useRouterState, type LinkProps } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RollText } from "@/components/TextEffects";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  /** A page of this site (a router link)… */
  to?: LinkProps["to"];
  /** …or, until that section has its own page, an in-page link. */
  href?: string;
  /** The pages this item belongs to: there its link sits in a glass pill. */
  pages: string[];
};

const NAV_ITEMS: NavItem[] = [
  // The home page is the toothpaste page for now, so Toothpaste (not Home) is highlighted there.
  { label: "Home", to: "/", pages: [] },
  // The toothpaste page (the home page), opening at its hero
  { label: "Toothpaste", to: "/", pages: ["/"] },
  { label: "Mouthwash", to: "/mouthwash", pages: ["/mouthwash"] },
  { label: "Oralbrush", to: "/oralbrush", pages: ["/oralbrush"] },
];
const EASE = [0.22, 1, 0.36, 1] as const;

const GLASS_PILL =
  "border border-white/70 bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_-14px_rgba(20,60,120,0.45)] backdrop-blur-md";

const links = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
};

const linkItem = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

function NavLink({
  item,
  current,
  className,
  onClick,
}: {
  item: NavItem;
  current: boolean;
  className: string;
  onClick?: () => void;
}) {
  const props = {
    "aria-current": current ? ("page" as const) : undefined,
    className,
    onClick,
    children: item.label,
  };
  return item.to ? <Link to={item.to} {...props} /> : <a href={item.href} {...props} />;
}

/**
 * transparent: keep the bar fully see-through (no glass, blur or edge) so it merges with
 * what's behind it — the home hero passes this (it fills the page). The bar still turns to
 * glass while the phone menu is open.
 */
/** glass: frosted from the start (for pages whose top is a dark colour the links would not read on). */
export function Navbar({ transparent = false, glass = false }: { transparent?: boolean; glass?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isCurrent = (item: NavItem) => item.pages.includes(pathname);

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
  "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300",
  // Frosted glass once scrolled (or while the menu is open). No border — the bottom edge
  // is a very diffuse, low-opacity shadow, so it reads as depth, not a crisp line.
  // Otherwise nothing at all, not even blur, so no band or line shows over the page.
  open || glass || (scrolled && !transparent)
    ? "bg-white/55 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.14)] backdrop-blur-xl"
    : "bg-transparent",
)}
    >
      <nav className="mx-auto flex h-19 max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12" aria-label="Main navigation">
        <Link to="/" className="shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {/* logo-transparent.png: public/logo.png with its white background made transparent */}
          <img
            src="/logo-transparent.png"
            alt="Totalflux — Complete Oral Care"
            width={1626}
            height={515}
            draggable={false}
            className="h-11 w-auto select-none lg:h-12"
          />
        </Link>

        <motion.div variants={links} initial="hidden" animate="show" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const current = isCurrent(item);
            return (
              <motion.div key={item.label} variants={linkItem}>
                <NavLink
                  item={item}
                  current={current}
                  className={cn(
                    // Hover: a soft background and a little zoom
                    "block rounded-full border px-4 py-2 text-sm text-primary transition-[background-color,scale] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-safe:hover:scale-[1.08] motion-safe:active:scale-[0.97]",
                    current ? cn(GLASS_PILL, "font-semibold") : "border-transparent font-medium hover:bg-white/30",
                  )}
                />
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="hidden lg:block"
        >
          <Button asChild variant="glass" size="default" className="letter-fx px-5">
            <a href="#where-to-buy">
              <RollText text="Where to Buy" />
            </a>
          </Button>
        </motion.div>

        <Button variant="ghost" size="icon" className="rounded-full text-primary lg:hidden" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? <X /> : <Menu />}
        </Button>
      </nav>

      <div className={cn("overflow-hidden border-t border-white/50 transition-[max-height,opacity] duration-300 lg:hidden", open ? "max-h-96 opacity-100" : "max-h-0 border-transparent opacity-0")}>
        <div className="flex flex-col gap-1 px-5 pb-6 pt-3 sm:px-8">
          {NAV_ITEMS.map((item) => {
            const current = isCurrent(item);
            return (
              <NavLink
                key={item.label}
                item={item}
                current={current}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl border px-3 py-3 text-base text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  current ? cn(GLASS_PILL, "font-semibold") : "border-transparent font-medium hover:bg-white/40",
                )}
              />
            );
          })}
          <Button asChild variant="glass" size="hero" className="mt-3 self-start">
            <a href="#where-to-buy" onClick={() => setOpen(false)}>Where to Buy</a>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}