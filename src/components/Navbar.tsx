import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = ["Toothpaste", "Mouthwash", "Oralbrush", "About Us"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300",
        scrolled || open ? "bg-background/95 shadow-[var(--shadow-nav)] backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-19 max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12" aria-label="Main navigation">
        <a href="#top" className="rounded-sm text-[1.65rem] font-extrabold leading-none tracking-[0] text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Totalflux<sup className="ml-0.5 align-super text-[0.48rem] font-semibold">®</sup>
        </a>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 lg:flex">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`} className="nav-link text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {item}
            </a>
          ))}
        </div>

        <Button asChild variant="hero" size="default" className="hidden px-5 lg:inline-flex">
          <a href="#where-to-buy">Where to Buy</a>
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full text-primary lg:hidden" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? <X /> : <Menu />}
        </Button>
      </nav>

      <div className={cn("overflow-hidden border-t border-border/60 transition-[max-height,opacity] duration-300 lg:hidden", open ? "max-h-96 opacity-100" : "max-h-0 opacity-0 border-transparent")}>
        <div className="flex flex-col gap-1 px-5 pb-6 pt-3 sm:px-8">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`} onClick={() => setOpen(false)} className="rounded-md px-2 py-3 text-base font-medium text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {item}
            </a>
          ))}
          <Button asChild variant="hero" size="hero" className="mt-3 self-start">
            <a href="#where-to-buy" onClick={() => setOpen(false)}>Where to Buy</a>
          </Button>
        </div>
      </div>
    </header>
  );
}