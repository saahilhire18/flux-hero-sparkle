// components/Hero.tsx
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { motion, MotionConfig, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";

import { BrandName } from "@/components/BrandName";
import { Navbar } from "@/components/Navbar";
import { RollText, WaveText } from "@/components/TextEffects";
import { Button } from "@/components/ui/button";
import { HERO_PRODUCTS, HERO_STEPS, type HeroStep } from "@/data/hero-range";
import { useStepGestures } from "@/hooks/use-step-gestures";
import { cn } from "@/lib/utils";

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

/** Scrolls the page to a product's section. */
function openSection(id: string) {
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
}

/** The tubes left to right: the Kidoos at the ends, Essential in the middle, so the row rises and falls evenly. */
const ROW_ORDER = ["kidoos-advance", "advance", "essential", "sensitive", "kidoos-plus"];
const ROW = ROW_ORDER.flatMap((id) => HERO_PRODUCTS.filter((product) => product.id === id));
type RowProduct = (typeof HERO_PRODUCTS)[number];

/** Big soft patches of colour drifting slowly behind the hero (transform only, so it's cheap). */
const AURORA = [
  {
    left: "-14%",
    top: "-22%",
    size: "46rem",
    color: "rgba(126,205,190,0.3)",
    duration: 28,
    delay: 0,
  },
  {
    left: "62%",
    top: "-26%",
    size: "44rem",
    color: "rgba(240,175,202,0.24)",
    duration: 32,
    delay: 10,
  },
  {
    left: "24%",
    top: "8%",
    size: "52rem",
    color: "rgba(130,185,235,0.22)",
    duration: 36,
    delay: 18,
  },
];

const GLASS =
  "border border-white/80 bg-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_30px_-16px_rgba(20,60,120,0.4)] backdrop-blur-md";

/** The intro's second line: a soft teal-to-blue gradient. */
const HEADLINE_GRADIENT: CSSProperties = {
  backgroundImage: "linear-gradient(90deg, #2A9D8F 0%, #2B7BB9 55%, #2B4270 100%)",
  filter: "drop-shadow(0 6px 10px rgba(23,110,140,0.2))",
};

// The pills and the button come in while the heading is still rising.
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.8 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/**
 * A step's text: the outgoing step fades out while the new one starts, then eyebrow, heading
 * and description play their entrances one after another.
 */
const stepText: Variants = {
  hidden: { opacity: 0, transition: { duration: 0.3, ease: "easeOut" } },
  show: { opacity: 1, transition: { duration: 0.2, delayChildren: 0.2, staggerChildren: 0.18 } },
};

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
 * Eyebrow, heading and description for every step, stacked in one grid cell: the block is
 * always as tall as its longest step, so switching steps changes the text in place and
 * nothing around it moves. On a product step the eyebrow's dot and the product's name are in
 * its colour, and "Totalflux" is lettered like the logo; the intro's second line is a gradient.
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
            // Centred in the block: the intro, with no eyebrow, is shorter than the product steps
            className="flex flex-col items-center justify-center [grid-area:1/1]"
            aria-hidden={!active}
          >
            {/* Eyebrow: a product step's (the intro has none) */}
            {step.product && (
              <motion.p
                variants={rise}
                className={cn(
                  GLASS,
                  "mb-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-primary sm:text-xs",
                )}
              >
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: ink }}
                />
                {step.eyebrow}
              </motion.p>
            )}

            {/* Heading */}
            <Heading
              variants={lines}
              id={index === 0 ? "hero-title" : undefined}
              className="text-[clamp(2rem,min(3.4vw,6vh),3.25rem)] font-black leading-[1.03] tracking-tight text-primary"
            >
              <motion.span variants={rise} className="block pb-[0.06em]">
                {!step.product ? (
                  `${step.title[0]},`
                ) : step.title[0] === "Totalflux" ? (
                  <BrandName className="font-bold" />
                ) : (
                  step.title[0]
                )}
              </motion.span>
              <motion.span variants={rise} className="block pb-[0.08em]">
                {step.product ? (
                  <span style={{ color: ink }}>{step.title[1]}</span>
                ) : (
                  <span className="bg-clip-text text-transparent" style={HEADLINE_GRADIENT}>
                    {step.title[1]}.
                  </span>
                )}
              </motion.span>
            </Heading>

            {/* Description */}
            <motion.p
              variants={rise}
              className="mt-1 max-w-2xl text-base text-slate-600 sm:text-lg"
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
 * step, its details. Every step's set is stacked in one grid cell, like HeroText, so the block
 * keeps the height of the tallest set and nothing below it moves; only the current set shows
 * (and can be used).
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
            className="mx-auto flex max-w-6xl flex-wrap content-start justify-center gap-2 [grid-area:1/1] sm:gap-2.5"
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

/** The move when a product is shown or left: easeInOutCubic, as the old hero's (seconds). */
const MOVE = { duration: 0.9, ease: [0.65, 0, 0.35, 1] as const };

/**
 * How a shown tube comes out: an adult tube lies on its side, as long as `lie` times its
 * standing height; a Kidoos tube stays standing and grows `kids` times. Both come forward
 * (down) `forward` of the stage's height. The others shrink to `dim.scale` and fade.
 */
const FOCUS = { lie: 1.45, kids: 1.4, forward: 0.03, dim: { scale: 0.86, opacity: 0.38 } };

/** Where a tube stands in the row, measured: how far its base is from the row's middle, and its size (px). */
type Spot = { toCentre: number; height: number; width: number };

/**
 * One tube in the row. On the intro every tube stands alike, a soft glow of its colour behind
 * it. When its product is shown it glides to the front of the row, in the middle, and lies
 * down on its side, cap to the left so its label reads left to right, growing as it goes (a
 * Kidoos tube, whose pack is printed upright, comes forward standing and just grows); the
 * others shrink and fade where they stand. Light falls across it and now and then a shine
 * sweeps over it (both masked by its photo, so only the tube catches them). Clicking it shows
 * its product, or, when it's already shown, goes down to its section.
 * spot: where it stands (null until measured); forward: how far the shown tube comes forward (px).
 */
function Tube({
  product,
  order,
  focus,
  spot,
  forward,
  onSelect,
}: {
  product: RowProduct;
  order: number;
  focus: string | undefined;
  spot: Spot | null;
  forward: number;
  onSelect: (stepIndex: number) => void;
}) {
  const shown = focus === product.id;
  const dimmed = !!focus && !shown;
  const fromCentre = Math.abs(order - (ROW.length - 1) / 2);
  const { image, colors } = product;
  const mask = `url(${image.src})`;

  // Its pose (turned about its base) and its shadow's
  let pose = { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 };
  let shadow = { x: 0, y: 0, scaleX: 1, opacity: 1 };
  if (dimmed) {
    pose = { ...pose, scale: FOCUS.dim.scale, opacity: FOCUS.dim.opacity };
    shadow = { ...shadow, scaleX: FOCUS.dim.scale, opacity: 0.4 };
  } else if (shown && spot) {
    if (product.upright) {
      pose = { ...pose, x: spot.toCentre, y: forward, scale: FOCUS.kids };
      shadow = { ...shadow, x: spot.toCentre, y: forward, scaleX: FOCUS.kids * 1.1 };
    } else {
      // Turned a quarter clockwise about its base it lies to the right of it, centred on the
      // base line: so it moves left by half its length to sit in the middle, and up by half its
      // thickness to rest on the line
      const length = spot.height * FOCUS.lie;
      const thickness = spot.width * FOCUS.lie;
      pose = {
        x: spot.toCentre - length / 2,
        y: forward - thickness / 2,
        rotate: 90,
        scale: FOCUS.lie,
        opacity: 1,
      };
      shadow = {
        x: spot.toCentre,
        y: forward,
        scaleX: (length * 0.92) / (spot.width * 0.9),
        opacity: 1,
      };
    }
  }

  return (
    <li
      className="relative flex flex-col items-center"
      style={{ zIndex: shown ? 20 : Math.round(10 - fromCentre * 2) }}
    >
      {/* Rises into place when the page opens, from the middle out */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.45 + fromCentre * 0.14, ease: EASE }}
        className="relative"
      >
        <motion.button
          type="button"
          onClick={() => (shown ? openSection(product.id) : onSelect(product.stepIndex))}
          aria-label={
            shown ? `Totalflux ${product.name}: see its section` : `Show Totalflux ${product.name}`
          }
          aria-current={shown ? "true" : undefined}
          animate={pose}
          whileHover={shown ? {} : { y: -8 }}
          transition={MOVE}
          style={{ transformOrigin: "50% 100%" }}
          className="relative block cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* Its glow: goes with it (round, so turning it doesn't show) */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[45%] -z-10 aspect-square w-[280%] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-700"
            style={{
              opacity: shown ? 1 : dimmed ? 0 : 0.45,
              background: `radial-gradient(circle, ${colors.brand}59 0%, ${colors.brand}1f 40%, transparent 68%)`,
            }}
          />
          <span className="relative block">
            <img
              src={image.src}
              width={image.width}
              height={image.height}
              alt=""
              draggable={false}
              className="block w-auto max-w-none select-none"
              style={{
                height: `calc(var(--tube-h) * ${product.height})`,
                aspectRatio: `${image.width} / ${image.height}`,
              }}
            />
            <span
              aria-hidden="true"
              className="tube-light"
              style={{ "--tube": mask } as CSSProperties}
            />
            {/* Shown, it shines as it steps forward; in the row, now and then, each in turn */}
            <span
              key={shown ? "shown" : "row"}
              aria-hidden="true"
              className="tube-shine"
              style={
                {
                  "--tube": mask,
                  "--shine-delay": shown ? "0.5s" : `${2.5 + order * 1.3}s`,
                } as CSSProperties
              }
            />
          </span>
        </motion.button>

        {/* Its shadow, under it wherever it is */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-1.5 left-1/2 h-3.5 w-[90%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse,rgba(28,58,102,0.42)_0%,rgba(28,58,102,0.16)_45%,transparent_72%)]"
          animate={shadow}
          transition={MOVE}
        />
      </motion.div>
    </li>
  );
}

/**
 * Where each tube stands in the row (in ROW's order), measured from the layout (so the tubes'
 * own moves don't change it) and again whenever the row resizes, and how far a shown tube
 * comes forward. Null until measured (on the server, and before the page has loaded).
 */
function useSpots() {
  const rowRef = useRef<HTMLUListElement>(null);
  const [measured, setMeasured] = useState<{ spots: Spot[]; forward: number } | null>(null);
  useLayoutEffect(() => {
    const row = rowRef.current;
    const stage = row?.parentElement;
    if (!row || !stage) return;
    const measure = () => {
      const middle = row.clientWidth / 2;
      const spots = [...row.children].map((child) => {
        const item = child as HTMLElement;
        const img = item.querySelector("img");
        return {
          toCentre: middle - (item.offsetLeft + item.offsetWidth / 2),
          height: img?.offsetHeight ?? 0,
          width: img?.offsetWidth ?? 0,
        };
      });
      setMeasured({ spots, forward: stage.clientHeight * FOCUS.forward });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);
  return { rowRef, measured };
}

/**
 * The top of the toothpaste page: the headline centred over the whole range standing in a
 * row, a giant word behind and soft colour drifting slowly behind that. While it fills the screen, each
 * scroll gesture moves one step through HERO_STEPS: first the whole range, then one product
 * at a time (its tube comes to the front and lies down, or for the Kidoos grows standing; the
 * others fade back; and the text above names it with its details).
 * Scrolling on past the last step moves the page down to what follows the hero (the product
 * sections), and once back at the top, scrolling up steps back through the products.
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

  const focus = HERO_STEPS[activeIndex]?.product?.id;
  const { rowRef, measured } = useSpots();

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        id="top"
        aria-labelledby="hero-title"
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

        <div className="relative isolate flex h-svh flex-col overflow-hidden bg-[linear-gradient(180deg,#EDF5FB_0%,#F6FAFD_45%,#EAF4F9_100%)]">
          {/* Soft colour drifting behind */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          >
            {AURORA.map((blob) => (
              <div
                key={blob.left}
                className="aurora-drift absolute rounded-full"
                style={
                  {
                    left: blob.left,
                    top: blob.top,
                    width: blob.size,
                    height: blob.size,
                    background: `radial-gradient(circle, ${blob.color} 0%, transparent 65%)`,
                    "--drift-duration": `${blob.duration}s`,
                    "--drift-delay": `-${blob.delay}s`,
                  } as CSSProperties
                }
              />
            ))}
          </div>

          {/* The bottom edge fades into the next section's background (behind the content) */}
          {transitionColor && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[18vh]"
              style={{ background: `linear-gradient(to bottom, transparent, ${transitionColor})` }}
            />
          )}

          <div className="relative mx-auto flex min-h-0 w-full max-w-[90rem] flex-1 flex-col px-5 pb-3 pt-[5.25rem] sm:px-8 lg:px-12">
            {/* The text, the pills and the button */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="relative z-30 flex flex-col items-center text-center"
            >
              <HeroText activeIndex={activeIndex} />

              <div className="mt-3 w-full">
                <StepPills activeIndex={activeIndex} onSelect={setActiveIndex} />
              </div>

              <motion.div variants={item} className="mt-4">
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

            {/* The range. A size container: --tube-h, the adult tubes' height, follows the space
                the text leaves (and, on narrow screens, the width, so the row fits across) */}
            <div className="relative mt-1 min-h-0 flex-1 [--tube-h:min(84cqh,58cqw)] [container-type:size] lg:[--tube-h:min(94cqh,34cqw)]">
              {/* A soft pool of light where they stand */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-[12%] bottom-0 h-[22cqh] rounded-[50%] bg-[radial-gradient(ellipse,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0)_70%)]"
              />
              <ul
                ref={rowRef}
                aria-label="The Totalflux toothpaste range"
                className="absolute inset-x-0 bottom-[3cqh] flex items-end justify-center gap-[3.5cqw] lg:gap-[2.4cqw]"
              >
                {ROW.map((product, order) => (
                  <Tube
                    key={product.id}
                    product={product}
                    order={order}
                    focus={focus}
                    spot={measured?.spots[order] ?? null}
                    forward={measured?.forward ?? 0}
                    onSelect={setActiveIndex}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
