// components/Navbar.tsx
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, useRouterState, type LinkProps } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RollText } from "@/components/TextEffects";
import { AMAZON_STORE, EXTERNAL } from "@/data/links";
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
  { label: "Home", to: "/", pages: ["/"] },
  { label: "Toothpaste", to: "/toothpaste", pages: ["/toothpaste"] },
  { label: "Mouthwash", to: "/mouthwash", pages: ["/mouthwash"] },
  { label: "Oralbrush", to: "/oralbrush", pages: ["/oralbrush"] },
];

const GLASS_PILL =
  "border border-white/70 bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_-14px_rgba(20,60,120,0.45)] backdrop-blur-md";

/** The entrance (styles.css, .enter-rise): in CSS, so the bar shows before the scripts load. */
const enter = (delay: number, y: string, duration = "0.5s") =>
  ({ "--enter-delay": `${delay}s`, "--enter-y": y, "--enter-duration": duration }) as CSSProperties;

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
export function Navbar({
  transparent = false,
  glass = false,
}: {
  transparent?: boolean;
  glass?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isCurrent = (item: NavItem) => item.pages.includes(pathname);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // While the phone menu is open: Escape closes it (focus back on the menu button), the page
  // behind doesn't scroll, and focus starts on its first link
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuButtonRef.current?.focus();
    };
    const { overflow } = document.documentElement.style;
    document.documentElement.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = overflow;
    };
  }, [open]);

  // Measures the real rendered navbar height (whatever it actually resolves to,
  // responsive breakpoint included) and exposes it as a CSS var so any section
  // below can align to it exactly — no hardcoded pixel guess to keep in sync.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const setVar = () =>
      document.documentElement.style.setProperty("--nav-h", `${el.offsetHeight}px`);
    setVar();
    const observer = new ResizeObserver(setVar);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      ref={headerRef}
      style={enter(0, "-28px", "0.7s")}
      className={cn(
        "enter-rise fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300",
        // Frosted glass once scrolled (or while the menu is open). No border — the bottom edge
        // is a very diffuse, low-opacity shadow, so it reads as depth, not a crisp line.
        // Otherwise nothing at all, not even blur, so no band or line shows over the page.
        open || glass || (scrolled && !transparent)
          ? "bg-white/55 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.14)] backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <nav
        className="mx-auto flex h-19 max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          className="shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* The logo, with its navy wave, on a transparent background, at the sizes it's shown */}
          <img
            src="/logo-navbar-480.webp"
            srcSet="/logo-navbar-480.webp 480w, /logo-navbar-800.webp 800w"
            sizes="(min-width: 1024px) 166px, 152px"
            alt="Totalflux — Complete Oral Care"
            width={480}
            height={139}
            draggable={false}
            className="h-11 w-auto select-none lg:h-12"
          />
        </Link>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item, i) => {
            const current = isCurrent(item);
            return (
              <div key={item.label} className="enter-rise" style={enter(0.35 + i * 0.08, "-10px")}>
                <NavLink
                  item={item}
                  current={current}
                  className={cn(
                    // Hover: a soft background and a little zoom
                    "block rounded-full border px-4 py-2 text-sm text-primary transition-[background-color,scale] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-safe:hover:scale-[1.08] motion-safe:active:scale-[0.97]",
                    current
                      ? cn(GLASS_PILL, "font-semibold")
                      : "border-transparent font-medium hover:bg-white/30",
                  )}
                />
              </div>
            );
          })}
        </div>

        <div className="enter-rise hidden lg:block" style={enter(0.7, "0px")}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Button asChild variant="glass" size="default" className="letter-fx px-5">
              <a href={AMAZON_STORE} {...EXTERNAL}>
                <RollText text="Buy on Amazon" />
                <span className="sr-only"> (Amazon, opens in a new tab)</span>
              </a>
            </Button>
          </motion.div>
        </div>

        <Button
          ref={menuButtonRef}
          variant="ghost"
          size="icon"
          className="rounded-full text-primary lg:hidden"
          aria-controls="phone-menu"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </nav>

      {/* Closed, it's out of reach of the keyboard and screen readers as well as out of sight */}
      <div
        id="phone-menu"
        ref={menuRef}
        inert={!open}
        className={cn(
          "overflow-hidden border-t border-white/50 transition-[max-height,opacity] duration-300 lg:hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 border-transparent opacity-0",
        )}
      >
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
                  current
                    ? cn(GLASS_PILL, "font-semibold")
                    : "border-transparent font-medium hover:bg-white/40",
                )}
              />
            );
          })}
          <Button asChild variant="glass" size="hero" className="mt-3 self-start">
            <a href={AMAZON_STORE} {...EXTERNAL} onClick={() => setOpen(false)}>
              Buy on Amazon
              <span className="sr-only"> (Amazon, opens in a new tab)</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
