// components/Hero.tsx
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useMotionValue,
  type MotionValue,
  type Variants,
} from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { BrandName } from "@/components/BrandName";
import { Navbar } from "@/components/Navbar";
import { RollText, WaveText } from "@/components/TextEffects";
import { Button } from "@/components/ui/button";
import { HERO_PRODUCTS, HERO_STEPS, type HeroStep } from "@/data/hero-range";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Hovering a tube shows its product once the mouse has rested on it for `dwell` ms, so
 * sweeping across the row doesn't flick through the range; once the mouse has been off every
 * tube for `linger` ms (time to cross the gap between two), it goes back. Hovers within
 * `afterScroll` ms of the page scrolling are ignored: that's the row sliding under a still
 * mouse, not the mouse moving.
 */
const HOVER = { dwell: 150, linger: 250, afterScroll: 300 };

/**
 * The mouse over the row (mice only: touch and keys pick by clicking). over: the tube it's on
 * (its step index), for the "Click to know more" hint; previewed: the step shown for it, back
 * to null once the mouse has left the tubes. enter(stepIndex, event) and leave(event) are each
 * tube's pointer handlers.
 */
function useHoverPreview() {
  const [over, setOver] = useState<number | null>(null);
  const [previewed, setPreviewed] = useState<number | null>(null);
  const showTimer = useRef<number | undefined>(undefined);
  const backTimer = useRef<number | undefined>(undefined);
  const lastScroll = useRef(-Infinity);
  useEffect(() => {
    const onScroll = () => {
      lastScroll.current = performance.now();
      window.clearTimeout(showTimer.current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(showTimer.current);
      window.clearTimeout(backTimer.current);
    };
  }, []);

  const enter = useCallback((stepIndex: number, event: ReactPointerEvent) => {
    if (event.pointerType !== "mouse") return;
    if (performance.now() - lastScroll.current < HOVER.afterScroll) return;
    window.clearTimeout(backTimer.current);
    window.clearTimeout(showTimer.current);
    setOver(stepIndex);
    showTimer.current = window.setTimeout(() => setPreviewed(stepIndex), HOVER.dwell);
  }, []);
  const leave = useCallback((event: ReactPointerEvent) => {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(showTimer.current);
    setOver(null);
    backTimer.current = window.setTimeout(() => setPreviewed(null), HOVER.linger);
  }, []);
  return { over, previewed, enter, leave };
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
              className="text-[clamp(2.2rem,min(3.7vw,6.4vh),3.5rem)] font-black leading-[1.03] tracking-tight text-primary"
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

/** On a product step, the way back to the whole range. */
function BackPill({ onBack }: { onBack: () => void }) {
  return (
    <motion.li variants={pill}>
      <button
        type="button"
        onClick={onBack}
        className={`${GLASS_PILL} transition-colors duration-300 hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
      >
        <span className={GLASS_DISC}>
          <ArrowLeft className="size-4" strokeWidth={1.8} />
        </span>
        All toothpastes
      </button>
    </motion.li>
  );
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
 * step, a way back to the whole range, then its details. Every step's set is stacked in one
 * grid cell, like HeroText, so the block keeps the height of the tallest set and nothing below
 * it moves; only the current set shows (and can be used).
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
              <>
                <BackPill onBack={() => onSelect(0)} />
                <DetailPills product={step.product} />
              </>
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
 * standing height, floating in the middle of the stage; a Kidoos tube stays standing, comes
 * forward (down) `forward` of the stage's height and grows `kids` times. The others shrink to
 * `dim.scale` and fade. A tap on the shown tube within `settleMs` of the tap that showed it is
 * a double tap, so it doesn't yet go down to its section.
 */
const FOCUS = {
  lie: 1.45,
  kids: 1.4,
  forward: 0.03,
  dim: { scale: 0.86, opacity: 0.38 },
  settleMs: 600,
};

/** Where a tube stands in the row, measured: how far its base is from the row's middle, and its size (px). */
type Spot = { toCentre: number; height: number; width: number };

/**
 * One tube in the row. On the intro every tube stands alike, a soft glow of its colour behind
 * it. When its product is shown it glides to the middle of the stage and lies down on its
 * side, cap to the left so its label reads left to right, growing as it goes (a Kidoos tube,
 * whose pack is printed upright, comes forward standing and just grows); the others shrink
 * and fade where they stand. Light falls across it and now and then a shine sweeps over it
 * (both masked by its photo, so only the tube catches them). The mouse resting on it shows its
 * product (onHoverStart / onHoverEnd); a click or tap on it calls onPress, saying whether it
 * came from the mouse.
 * spot: where it stands (null until measured); forward: how far a shown Kidoos tube comes
 * forward, and lift: how far up the row's base line the stage's middle is (px, negative).
 */
function Tube({
  product,
  order,
  focus,
  spot,
  forward,
  lift,
  onPress,
  onHoverStart,
  onHoverEnd,
}: {
  product: RowProduct;
  order: number;
  focus: string | undefined;
  spot: Spot | null;
  forward: number;
  lift: number;
  onPress: (product: RowProduct, viaMouse: boolean) => void;
  onHoverStart: (stepIndex: number, event: ReactPointerEvent) => void;
  onHoverEnd: (event: ReactPointerEvent) => void;
}) {
  // What pressed it last (a click from a key has no pointer, and detail 0)
  const pointerType = useRef("");
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
      // base line: so it moves left by half its length to sit in the middle, and up by `lift`
      // to float in the middle of the stage. Its shadow stays on the floor, fainter
      const length = spot.height * FOCUS.lie;
      pose = {
        x: spot.toCentre - length / 2,
        y: lift,
        rotate: 90,
        scale: FOCUS.lie,
        opacity: 1,
      };
      shadow = {
        x: spot.toCentre,
        y: forward,
        scaleX: (length * 0.7) / (spot.width * 0.9),
        opacity: 0.45,
      };
    }
  }

  return (
    // Hover and clicks are taken on the tube's place in the row, which doesn't move, as well as
    // on the tube: it gliding out from under the mouse doesn't count as leaving it, and a click
    // where it stood still counts. The button inside is for keys and screen readers; its
    // clicks come up to here.
    <li
      className="relative flex cursor-pointer flex-col items-center"
      style={{ zIndex: shown ? 20 : Math.round(10 - fromCentre * 2) }}
      onPointerEnter={(event) => onHoverStart(product.stepIndex, event)}
      onPointerLeave={onHoverEnd}
      onPointerDown={(event) => {
        pointerType.current = event.pointerType;
      }}
      onClick={(event) => onPress(product, event.detail > 0 && pointerType.current === "mouse")}
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
 * own moves don't change it) and again whenever the row resizes; how far a shown Kidoos tube
 * comes forward; and how far a lying tube rises from the row's base line to the middle of the
 * stage. Null until measured (on the server, and before the page has loaded).
 */
function useSpots() {
  const rowRef = useRef<HTMLUListElement>(null);
  const [measured, setMeasured] = useState<{
    spots: Spot[];
    forward: number;
    lift: number;
  } | null>(null);
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
      setMeasured({
        spots,
        forward: stage.clientHeight * FOCUS.forward,
        // The row sits at the stage's bottom (the stage is its offset parent)
        lift: stage.clientHeight / 2 - (row.offsetTop + row.offsetHeight),
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);
  return { rowRef, measured };
}

/**
 * "Click to know more", following the mouse (at x, y in the stage) while it's on a tube, with
 * an arrow on a disc in the tube's colour. product: the tube it's on, if any.
 */
function ClickHint({
  product,
  x,
  y,
}: {
  product: HeroStep["product"];
  x: MotionValue<number>;
  y: MotionValue<number>;
}) {
  return (
    <AnimatePresence>
      {product && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ x, y }}
          className="pointer-events-none absolute left-0 top-0 z-40"
        >
          {/* Down and to the right of the pointer, clear of it */}
          <span className={cn(GLASS_PILL, "ml-4 mt-5 whitespace-nowrap bg-white/60")}>
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-white transition-colors duration-300"
              style={{ backgroundColor: product.colors.ink }}
            >
              <ArrowRight className="size-4" strokeWidth={1.8} />
            </span>
            Click to know more
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * The top of the toothpaste page: the headline centred over the whole range standing in a
 * row, a giant word behind and soft colour drifting slowly behind that. Showing a product
 * floats its tube to the middle, lying down (the Kidoos grow standing), fades the others back
 * and names it above with its details. With a mouse, resting on a tube shows it until the
 * mouse moves off the tubes, and a click goes down to its section ("Click to know more"
 * follows the mouse); a tap (or a key) shows it and a second goes down. A product's pill
 * shows it too, until "All toothpastes". The page itself scrolls as usual: nothing here holds it.
 * transitionColor: the next section's background, which the hero's bottom edge fades into.
 */
export function Hero({ transitionColor }: { transitionColor?: string }) {
  // The step picked by a tap, key or pill (0, the intro, until then), and when
  const [pickedIndex, setPickedIndex] = useState(0);
  const picked = useRef({ index: 0, at: 0 });
  const pick = useCallback((stepIndex: number) => {
    if (stepIndex === picked.current.index) return;
    picked.current = { index: stepIndex, at: performance.now() };
    setPickedIndex(stepIndex);
  }, []);

  // A hovered tube's product shows over the picked one, until the mouse moves off
  const hover = useHoverPreview();
  const activeIndex = hover.previewed ?? pickedIndex;

  const press = useCallback(
    (product: RowProduct, viaMouse: boolean) => {
      // With a mouse, hovering has shown it: a click is to know more
      if (viaMouse) return openSection(product.id);
      // A tap or a key: the first shows it, the next goes down (unless it's a double tap)
      const { index, at } = picked.current;
      if (index === product.stepIndex && performance.now() - at > FOCUS.settleMs)
        openSection(product.id);
      else pick(product.stepIndex);
    },
    [pick],
  );

  // Where the mouse is in the stage, for the hint
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const trackPointer = (event: ReactPointerEvent<HTMLElement>) => {
    const stage = event.currentTarget.getBoundingClientRect();
    pointerX.set(event.clientX - stage.left);
    pointerY.set(event.clientY - stage.top);
  };

  const focus = HERO_STEPS[activeIndex]?.product?.id;
  const { rowRef, measured } = useSpots();

  return (
    <MotionConfig reducedMotion="user">
      {/* Outside the hero, so it stays above every section as the page scrolls (inside, the
          hero's own layering would let the sections below paint over it) */}
      <Navbar />
      <section
        id="top"
        aria-labelledby="hero-title"
        className="relative"
        style={{ scrollSnapAlign: "start" }}
      >
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

          <div className="relative mx-auto flex min-h-0 w-full max-w-[90rem] flex-1 flex-col px-5 pb-3 pt-[5.5rem] sm:px-8 lg:px-12">
            {/* The text, the pills and the button */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="relative z-30 flex flex-col items-center text-center"
            >
              <HeroText activeIndex={activeIndex} />

              <div className="mt-4 w-full">
                <StepPills activeIndex={activeIndex} onSelect={pick} />
              </div>

              <motion.div variants={item} className="mt-5">
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
            <div
              // Over: as it comes onto a tube, so the hint starts where the mouse is
              onPointerOver={trackPointer}
              onPointerMove={trackPointer}
              className="relative mt-2 min-h-0 flex-1 [--tube-h:min(84cqh,58cqw)] [container-type:size] lg:[--tube-h:min(88cqh,32cqw)]"
            >
              {/* A soft pool of light where they stand */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-[12%] bottom-0 h-[22cqh] rounded-[50%] bg-[radial-gradient(ellipse,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0)_70%)]"
              />
              <ul
                ref={rowRef}
                aria-label="The Totalflux toothpaste range"
                className="absolute inset-x-0 bottom-[4cqh] flex items-end justify-center gap-[3.5cqw] lg:gap-[2.4cqw]"
              >
                {ROW.map((product, order) => (
                  <Tube
                    key={product.id}
                    product={product}
                    order={order}
                    focus={focus}
                    spot={measured?.spots[order] ?? null}
                    forward={measured?.forward ?? 0}
                    lift={measured?.lift ?? 0}
                    onPress={press}
                    onHoverStart={hover.enter}
                    onHoverEnd={hover.leave}
                  />
                ))}
              </ul>
              <ClickHint
                product={HERO_STEPS[hover.over ?? -1]?.product}
                x={pointerX}
                y={pointerY}
              />
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
