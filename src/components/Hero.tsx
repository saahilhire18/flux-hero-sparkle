// components/Hero.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, MotionConfig, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeroArt } from "@/components/HeroArt";
import { Navbar } from "@/components/Navbar";
import { BrandName } from "@/components/BrandName";
import { RollText, WaveText } from "@/components/TextEffects";
import { HERO_PRODUCTS, HERO_STEPS, type HeroStep } from "@/data/hero-range";
import { useStepGestures } from "@/hooks/use-step-gestures";

const EASE = [0.22, 1, 0.36, 1] as const;

/** How close to the top of the page still counts as "the hero fills the screen", in pixels. */
const TOP_SLOP = 4;

/** The hero is the top of the page, so it fills the screen while the page is at its top. */
const heroFillsScreen = () => window.scrollY <= TOP_SLOP;

/** Whether the page is at its top (the hero fills the screen), kept up to date as it scrolls. */
function useAtTop() {
  const [atTop, setAtTop] = useState(true);
  useEffect(() => {
    const update = () => setAtTop(heroFillsScreen());
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return atTop;
}

// The chips and the button come in while the heading's letters are still landing.
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.8,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: EASE,
    },
  },
};

/**
 * A step's text: the outgoing step fades out while the new one starts, then eyebrow, heading
 * and description play their entrances one after another.
 */
const stepText: Variants = {
  hidden: {
    opacity: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  show: {
    opacity: 1,
    transition: { duration: 0.2, delayChildren: 0.2, staggerChildren: 0.18 },
  },
};

/** The brand's name: in a heading, lettered like the logo (font-brand). */
const BRAND = "Totalflux";

/**
 * A piece of a step's text rising into place, a whole line at a time. When its step is left,
 * it snaps back down once the step has faded out (0.3s), ready to rise again.
 */
const rise: Variants = {
  hidden: { opacity: 0, y: "0.45em", transition: { duration: 0, delay: 0.35 } },
  show: { opacity: 1, y: "0em", transition: { duration: 0.75, ease: EASE } },
};

/** The heading's lines rise one after the other. */
const lines: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

/**
 * Eyebrow, heading and description for every step, stacked in one grid cell: the
 * block is always as tall as its longest step, so switching steps changes the text in
 * place and nothing around it moves. Each time a step comes up its text rises in, line by
 * line, as the text does across the site. On a product step the eyebrow and the product's
 * name are in its colour, and "Totalflux" is lettered like the logo.
 */
function HeroText({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="grid w-full">
      {HERO_STEPS.map((step, index) => {
        const active = index === activeIndex;
        const Heading = index === 0 ? motion.h1 : motion.h2;
        const ink = step.product?.colors.ink;
        return (
          <motion.div
            key={step.id}
            variants={stepText}
            initial="hidden"
            animate={active ? "show" : "hidden"}
            className="flex flex-col items-center [grid-area:1/1] lg:items-start"
            aria-hidden={!active}
          >
            {/* Eyebrow */}
            <motion.p
              variants={rise}
              className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.25em] text-accent sm:text-xs lg:mb-5 lg:text-sm"
              style={{ color: ink }}
            >
              {step.eyebrow}
            </motion.p>

            {/* Heading */}
            <Heading
              variants={lines}
              className="max-w-2xl text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[1.02] tracking-[0] text-primary"
            >
              {step.title.map((line, i) => (
                <motion.span
                  key={line}
                  variants={rise}
                  className="block pb-[0.12em]"
                  style={i === 1 && ink ? { color: ink } : {}}
                >
                  {i === 0 && line === BRAND ? <BrandName className="font-bold" /> : line}
                </motion.span>
              ))}
            </Heading>

            {/* Description */}
            <motion.p
              variants={rise}
              className="mt-2 max-w-[28rem] text-base leading-7 text-muted-foreground sm:text-lg lg:mt-4"
            >
              {step.description}
            </motion.p>
          </motion.div>
        );
      })}
    </div>
  );
}

/*
 * Glass look for the pills: a see-through fill over a strong backdrop blur, a bright top
 * edge and faint bottom edge, a sheen over the upper half (the ::before, kept behind the
 * content by `isolate`), and a soft blue drop shadow. Each has a small disc at its start.
 */
const GLASS_PILL =
  "relative isolate flex items-center gap-2 rounded-full border border-white/60 bg-white/15 py-1 pl-1 pr-3.5 text-sm font-medium text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),inset_0_-1px_1px_rgba(255,255,255,0.3),0_10px_30px_-10px_rgba(31,90,160,0.3)] backdrop-blur-xl backdrop-saturate-150 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-linear-to-b before:from-white/60 before:to-transparent before:to-60% sm:gap-2.5 sm:text-[0.95rem]";
const GLASS_DISC =
  "flex size-7 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/35 shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_4px_10px_-4px_rgba(31,90,160,0.35)]";

/** A step's pills: the outgoing set drops away, then the new one comes up pill by pill (after its heading). */
const pillSet: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.5, staggerChildren: 0.07 } },
};

const pill: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.92, transition: { duration: 0.25, ease: "easeOut" } },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
};

/** The intro's pills: one per product, with a dot in its pack colour; each goes to that product's step. */
function ProductPills({ onSelect }: { onSelect: (stepIndex: number) => void }) {
  return HERO_PRODUCTS.map((product) => (
    <motion.li key={product.id} variants={pill}>
      <button
        type="button"
        onClick={() => onSelect(product.stepIndex)}
        className={`${GLASS_PILL} letter-fx transition-colors duration-300 hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
      >
        <span className={GLASS_DISC}>
          <span
            className="size-3 rounded-full"
            style={{
              backgroundColor: product.colors.brand,
              boxShadow: `0 0 0 3px ${product.colors.brand}33`,
            }}
          />
        </span>
        <WaveText text={product.name} />
      </button>
    </motion.li>
  ));
}

/** A product's pills: what's in it and what it does, each icon on a disc in the product's colour. */
function DetailPills({ product }: { product: NonNullable<HeroStep["product"]> }) {
  const { ink } = product.colors;
  return product.details.map(({ label, icon: Icon, stat }) => (
    <motion.li key={label} variants={pill} className={GLASS_PILL}>
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: ink, boxShadow: `0 4px 12px -3px ${ink}8c` }}
      >
        <Icon className="size-4" strokeWidth={1.8} />
      </span>
      {label}
      {stat && (
        <span
          className="rounded-full bg-white/70 px-1.5 text-[0.7rem] font-semibold leading-5"
          style={{ color: ink }}
        >
          {stat}
        </span>
      )}
    </motion.li>
  ));
}

/**
 * The pills under the text: on the intro, the products (each goes to its step); on a product
 * step, its details. Separate frosted-glass pills that wrap freely, no panel around them.
 * Every step's set is stacked in one grid cell, like HeroText, so the block keeps the height
 * of the tallest set and nothing below it moves; only the current set shows (and can be used).
 */
function StepPills({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (stepIndex: number) => void;
}) {
  return (
    <div className="grid w-full">
      {HERO_STEPS.map((step, index) => {
        const active = index === activeIndex;
        return (
          <motion.ul
            key={step.id}
            variants={pillSet}
            initial="hidden"
            animate={active ? "show" : "hidden"}
            aria-label={step.product ? `${step.product.name} highlights` : "Our toothpastes"}
            aria-hidden={!active}
            inert={!active}
            className="flex max-w-[36rem] flex-wrap content-start justify-center gap-2 justify-self-center [grid-area:1/1] sm:gap-2.5 lg:justify-start lg:justify-self-start"
          >
            {step.product ? (
              <DetailPills product={step.product} />
            ) : (
              <ProductPills onSelect={onSelect} />
            )}
          </motion.ul>
        );
      })}
    </div>
  );
}

/**
 * The top of the home page. While it fills the screen, each scroll gesture moves one step
 * through HERO_STEPS: first the whole range, then one product at a time (its tube zooms in
 * and leans, the others fade back, and the text names it with its details). Scrolling on
 * past the last step moves the page down to what follows the hero (the product sections),
 * and once back at the top, scrolling up steps back through the products.
 * transitionColor: the next section's background, which the hero's bottom edge fades into.
 */
export function Hero({ transitionColor }: { transitionColor?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const atTop = useAtTop();

  const move = useCallback((direction: 1 | -1) => {
    setActiveIndex((index) => Math.min(Math.max(index + direction, 0), HERO_STEPS.length - 1));
  }, []);
  // Past the last step: glide down to whatever follows the hero
  const leave = useCallback(() => {
    const hero = sectionRef.current;
    if (!hero) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: hero.getBoundingClientRect().bottom + window.scrollY,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);
  useStepGestures({
    index: activeIndex,
    count: HERO_STEPS.length,
    active: heroFillsScreen,
    onStep: move,
    onExit: leave,
  });

  const step = HERO_STEPS[activeIndex];

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        id="top"
        className="relative"
        style={{
          // While the hero fills the screen, swipes step through it (useStepGestures), so the
          // browser gets no panning here, only pinch-zoom: a swipe down never pulls the page
          // to refresh. Once the page has moved on, it pans as usual.
          touchAction: atTop ? "pinch-zoom" : "pan-y pinch-zoom",
          scrollSnapAlign: "start",
        }}
      >
        {/* Transparent over the hero; frosted glass once the page scrolls */}
        <Navbar />

        <div className="relative h-svh overflow-hidden bg-[linear-gradient(115deg,#f8fbff_0%,#edf4fc_42%,#dde9f7_100%)]">
          {/* bg.png: sunlit room, soft light rays behind the text and a fluted panel at the right edge.
              Desktop keeps the right edge (the panel) in frame; phones show the plain middle of the wall. */}
          <img
            src="/bg.webp"
            alt=""
            aria-hidden="true"
            width={1855}
            height={848}
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-[70%_center] lg:object-right"
          />

          {/* Frosted veil behind the text: blurs the room's details there (such as the floor
              edge between the chips and the button) so the text, chips and button sit on one
              smooth surface. It fades out before the products (downwards on phones). */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-white/10 backdrop-blur-2xl [mask-image:linear-gradient(to_bottom,#000_45%,transparent_70%)] lg:right-auto lg:w-[62%] lg:[mask-image:linear-gradient(to_right,#000_55%,transparent),linear-gradient(to_bottom,#000_70%,transparent)] lg:[mask-composite:intersect]"
          />

          {/* The bottom edge fades into the next section's background (behind the content) */}
          {transitionColor && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[24vh]"
              style={{ background: `linear-gradient(to bottom, transparent, ${transitionColor})` }}
            />
          )}

          <div className="relative mx-auto flex h-full w-full max-w-[90rem] flex-col px-5 pb-5 pt-20 sm:px-8 lg:flex-row lg:items-center lg:gap-6 lg:px-12 lg:pb-6 lg:pt-24">
            {/* Text column */}
            <div className="relative isolate w-full shrink-0 lg:w-[41%]">
              {/* Soft glows in the logo's blue (#38598C) behind the chips and button, so the
                  glass has colour to frost over; kept below the heading so the text stays clear */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                {/* Kept well above the hero's bottom edge, or the edge cuts it off in a visible line */}
                <div className="absolute bottom-[14%] left-[-12%] size-[min(24rem,80vw)] rounded-full bg-[radial-gradient(circle,rgba(56,89,140,0.72)_0%,rgba(56,89,140,0.28)_45%,transparent_70%)] blur-2xl" />
                <div className="absolute bottom-[12%] left-[38%] size-[min(20rem,60vw)] rounded-full bg-[radial-gradient(circle,rgba(86,132,196,0.62)_0%,rgba(86,132,196,0.22)_45%,transparent_70%)] blur-2xl" />
              </div>

              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="flex w-full flex-col items-center text-center lg:items-start lg:text-left"
              >
                <HeroText activeIndex={activeIndex} />

                {/* The products (intro) or the product's details */}
                <div className="mt-5 w-full lg:mt-9">
                  <StepPills activeIndex={activeIndex} onSelect={setActiveIndex} />
                </div>

                {/* CTA */}
                <motion.div variants={item} className="mt-5 lg:mt-10">
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  >
                    <Button asChild variant="glass" size="hero" className="btn-shine letter-fx">
                      <a href="#toothpaste">
                        <RollText text="Explore Our Range" />
                        <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
                      </a>
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            {/* Artwork: fills the rest (below the text on phones, to its right on desktop, where it
                may grow out into the right margin) */}
            <div className="flex min-h-0 w-full flex-1 items-center justify-center [container-type:size] lg:h-full lg:justify-start">
              <HeroArt focus={step?.product?.id} />
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
