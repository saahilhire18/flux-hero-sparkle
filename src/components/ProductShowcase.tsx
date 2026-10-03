// components/ProductShowcase.tsx
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useInView,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionStyle,
  type Variants,
} from "motion/react";
import { ChevronDown, X } from "lucide-react";
import { BrandName } from "@/components/BrandName";
import { OrbitCircles, OrbitFrame, type OrbitItem } from "@/components/Orbit";
import { useStepGestures } from "@/hooks/use-step-gestures";
import { useWideScreen } from "@/hooks/use-wide-screen";

/*
 * A product range, one product at a time, shared by the mouthwash and toothpaste pages: its
 * photo in a slowly turning glass orbit (a bottle stands on a podium, a tube floats at a lean),
 * its key points in glass circles around it and its name huge behind it, while the words
 * beside it give its family, benefit and description. The background blends between each
 * product's own soft colour. On desktop the stage is pinned and each scroll gesture brings in
 * the next product, with a rail to jump between them; on smaller screens they follow one
 * another down the page.
 */

export type ShowcaseItem = {
  /** Also the id of its place on the page, which links (e.g. the hero's products) scroll to. */
  id: string;
  /** The big name (and the giant word behind). */
  name: string;
  /** Printed beside the name where two share it, e.g. "No Alcohol". */
  variant?: string | undefined;
  /** For the rail and screen readers, e.g. "Turmeric No Alcohol". */
  fullName: string;
  /** Its family: a badge, with a dot in `accent`. */
  family?: { label: string; accent: string } | undefined;
  benefit: string;
  /** A lead before the first ": " is shown in bold. */
  description: string;
  highlights: readonly OrbitItem[];
  /** A list behind a button, e.g. the ingredients. */
  details?: { label: string; text: string } | undefined;
  image: { src: string; width: number; height: number };
  alt: string;
  /** glow: behind it in the orbit; ink: its name, icons, marks; backdrop: the stage's colour. */
  colors: { glow: string; ink: string; backdrop: string };
};

/** For the rail: the products in groups (each a label and its products' ids). */
export type ShowcaseGroup = { label: string; ids: readonly string[] };

type Pose = "stand" | "float";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * On desktop, how far the page scrolls (in vh) from one product to the next while the stage is
 * pinned. One wheel notch, swipe or key press moves a whole step (useStepGestures); this is how
 * far that glide goes (and what dragging the scrollbar covers per product).
 */
const STEP_VH = 60;

/**
 * The band along the pinned stage's bottom kept for the giant name (the largest it gets): the
 * words and the product stand above it, so the name neither covers them nor runs off the edge.
 */
const NAME_BAND = "min(15rem, 14vw, 18svh)";

/** How far a floating tube leans (degrees, top to the right). */
const FLOAT_LEAN = 18;

/** A hex colour mixed with white: `amount` of the colour (0–1), the rest white. */
export function tint(hex: string, amount: number) {
  const value = parseInt(hex.slice(1), 16);
  const mix = (channel: number) => Math.round(channel * amount + 255 * (1 - amount));
  const rgb = (mix((value >> 16) & 255) << 16) | (mix((value >> 8) & 255) << 8) | mix(value & 255);
  return `#${rgb.toString(16).padStart(6, "0")}`;
}

/** A solid 3D extrusion for text: `depth` stacked 1px shadows in `color`, down and to the right. */
const extrude = (depth: number, color: string) =>
  Array.from({ length: depth }, (_, i) => `${i + 1}px ${i + 1}px 0 ${color}`).join(", ");

const twoDigits = (n: number) => String(n).padStart(2, "0");

/** Glides the page to a product's place in the section (its element with its id). */
function goTo(item: ShowcaseItem | undefined) {
  if (!item) return;
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document
    .getElementById(item.id)
    ?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
}

/* ------------------------------------------------------------------------------------------ */
/* The product's stage: the orbit, the product and the circles around it                       */
/* ------------------------------------------------------------------------------------------ */

/** What stays in place while the products change, in the colours of the one shown. */
function Orbit({ item, pose }: { item: ShowcaseItem; pose: Pose }) {
  return (
    <OrbitFrame
      glow={item.colors.glow}
      ink={item.colors.ink}
      podium={pose === "stand"}
      discTop={pose === "stand" ? "44%" : "50%"}
    />
  );
}

/** The product: a bottle standing on the podium with its contact shadow, or a tube floating at a lean. */
function ProductImage({ item, pose }: { item: ShowcaseItem; pose: Pose }) {
  const { image } = item;
  if (pose === "float") {
    return (
      <div className="absolute inset-[6%] flex items-center justify-center">
        <img
          src={image.src}
          width={image.width}
          height={image.height}
          alt={item.alt}
          draggable={false}
          className="h-[86%] w-auto select-none object-contain drop-shadow-[0_34px_34px_rgba(15,40,80,0.3)]"
          style={{ rotate: `${FLOAT_LEAN}deg` }}
        />
      </div>
    );
  }
  return (
    <div className="absolute inset-x-0 bottom-[9.5%] top-[5%] flex items-end justify-center">
      <div className="relative h-full">
        <img
          src={image.src}
          width={image.width}
          height={image.height}
          alt={item.alt}
          draggable={false}
          className="h-full w-auto select-none object-contain drop-shadow-[0_26px_26px_rgba(20,50,90,0.28)]"
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-1 left-1/2 h-3 w-[70%] -translate-x-1/2 rounded-[50%] bg-slate-900/25 blur-[6px]"
        />
      </div>
    </div>
  );
}

/** Its key points, each in a glass circle around it. */
function HighlightCircles({ item }: { item: ShowcaseItem }) {
  return <OrbitCircles items={item.highlights} ink={item.colors.ink} label="Key points" />;
}

/* ------------------------------------------------------------------------------------------ */
/* The words: family, name, benefit, description, details                                      */
/* ------------------------------------------------------------------------------------------ */

const textContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, y: -14, transition: { duration: 0.25, ease: "easeIn" } },
};

const textItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/**
 * The details list behind a button. popover: it opens over the text (the pinned stage has no
 * room to grow); otherwise it opens in place.
 */
function Details({ item, popover }: { item: ShowcaseItem; popover: boolean }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const { ink } = item.colors;

  useEffect(() => {
    if (!open || !popover) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, popover]);

  if (!item.details) return null;
  const { label, text } = item.details;
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-full border border-white/85 bg-white/60 px-4 py-2 text-sm font-semibold shadow-[0_10px_24px_-16px_rgba(15,40,80,0.5)] backdrop-blur-md transition-colors hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ color: ink }}
      >
        {label}
        <ChevronDown
          className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={popover ? { opacity: 0, y: 10, scale: 0.97 } : { height: 0, opacity: 0 }}
            animate={popover ? { opacity: 1, y: 0, scale: 1 } : { height: "auto", opacity: 1 }}
            exit={popover ? { opacity: 0, y: 10, scale: 0.97 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className={
              popover
                ? "absolute bottom-full left-0 z-20 mb-3 w-[min(30rem,80vw)] origin-bottom-left rounded-3xl border border-white/90 bg-white/85 p-5 shadow-[0_24px_50px_-24px_rgba(15,40,80,0.5)] backdrop-blur-xl"
                : "overflow-hidden"
            }
          >
            {popover && (
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-bold" style={{ color: ink }}>
                  {label}
                </p>
                <button
                  type="button"
                  aria-label={`Close ${label.toLowerCase()}`}
                  onClick={() => setOpen(false)}
                  className="grid size-7 place-items-center rounded-full text-slate-500 hover:bg-slate-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
            <p className={`text-xs leading-relaxed text-slate-700 ${popover ? "" : "pt-3"}`}>
              {text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** "Lead: rest" → the lead (shown in bold) and the rest; no lead if there's no ": ". */
function splitLead(text: string) {
  const at = text.indexOf(": ");
  return at < 0
    ? { lead: "", rest: text }
    : { lead: text.slice(0, at + 1), rest: text.slice(at + 2) };
}

/**
 * A product's words: its family and place in the range, "Totalflux" (lettered like the logo)
 * over its name in its pack colour, its benefit and description, and its details. Its children
 * animate with textItem, so the parent chooses when.
 */
function Words({
  item,
  index,
  count,
  popover,
}: {
  item: ShowcaseItem;
  index: number;
  count: number;
  popover: boolean;
}) {
  const { ink, glow } = item.colors;
  const { lead, rest } = splitLead(item.description);

  return (
    <>
      <motion.div
        variants={textItem}
        className="flex flex-wrap items-center justify-center gap-3 lg:justify-start"
      >
        {item.family && (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/85 bg-white/60 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-primary shadow-[0_8px_18px_-14px_rgba(15,40,80,0.5)] backdrop-blur-md">
            <span className="size-2 rounded-full" style={{ backgroundColor: item.family.accent }} />
            {item.family.label}
          </span>
        )}
        <span className="font-mono text-xs tracking-[0.2em] text-slate-600">
          {twoDigits(index + 1)} / {twoDigits(count)}
        </span>
      </motion.div>

      <motion.h3 variants={textItem} id={`${item.id}-name`} className="mt-5 leading-[0.95] lg:mt-6">
        <BrandName className="block text-[clamp(1.2rem,1.8vw,1.75rem)] font-bold text-slate-800" />
        {/* Solid in the pack's colour, with a soft glow under it */}
        <span
          className="inline-block pb-[0.06em] text-[clamp(2.8rem,6vw,6rem)] font-black tracking-tight"
          style={{ color: ink, filter: `drop-shadow(0 8px 12px ${glow}99)` }}
        >
          {item.name}
        </span>
        {item.variant && (
          <span
            className="ml-3 inline-block -translate-y-[0.6em] rounded-full px-3 py-1 align-middle text-xs font-bold uppercase tracking-[0.16em] text-white"
            style={{ backgroundColor: ink }}
          >
            {item.variant}
          </span>
        )}
      </motion.h3>

      <motion.p
        variants={textItem}
        className="mt-4 text-xl font-extrabold tracking-tight text-primary sm:text-2xl"
      >
        {item.benefit}
      </motion.p>

      <motion.p
        variants={textItem}
        className="mx-auto mt-3 max-w-md text-[0.95rem] leading-7 text-slate-700 sm:text-base lg:mx-0"
      >
        {lead && <strong className="font-semibold text-slate-900">{lead} </strong>}
        {rest}
      </motion.p>

      {item.details && (
        <motion.div variants={textItem} className="mt-6 flex justify-center lg:justify-start">
          <Details item={item} popover={popover} />
        </motion.div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Desktop: one pinned stage, the products taking it in turn as the page scrolls               */
/* ------------------------------------------------------------------------------------------ */

const productVariants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    y: 160 * direction,
    rotate: 12 * direction,
    scale: 0.82,
  }),
  show: { opacity: 1, y: 0, rotate: 0, scale: 1, transition: { duration: 0.95, ease: EASE } },
  exit: (direction: number) => ({
    opacity: 0,
    y: -130 * direction,
    rotate: -10 * direction,
    scale: 0.88,
    transition: { duration: 0.55, ease: [0.4, 0, 1, 1] },
  }),
};

const wordVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: `${22 * direction}%` }),
  show: { opacity: 1, x: "0%", transition: { duration: 1, ease: EASE } },
  exit: (direction: number) => ({
    opacity: 0,
    x: `${-22 * direction}%`,
    transition: { duration: 0.6, ease: "easeIn" },
  }),
};

/** The products, by group, at the stage's side: where you are, and a way to jump. */
function ProgressRail({
  items,
  groups,
  index,
  label,
}: {
  items: readonly ShowcaseItem[];
  groups: readonly ShowcaseGroup[];
  index: number;
  label: string;
}) {
  return (
    <nav aria-label={label} className="absolute right-5 top-1/2 z-10 -translate-y-1/2 xl:right-10">
      <ol className="flex flex-col gap-5">
        {groups.map((group) => (
          <li key={group.label}>
            {group.label && (
              <p className="mb-2 hidden text-[0.62rem] font-bold uppercase tracking-[0.22em] text-slate-500 xl:block">
                {group.label}
              </p>
            )}
            <ol className="flex flex-col gap-1">
              {items.map((item, i) =>
                !group.ids.includes(item.id) ? null : (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => goTo(item)}
                      aria-current={i === index ? "step" : undefined}
                      aria-label={item.fullName}
                      className="group flex items-center gap-2.5 rounded-full py-1 pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span
                        className="h-0.5 rounded-full transition-all duration-500"
                        style={{
                          width: i === index ? 30 : 12,
                          backgroundColor:
                            i === index ? item.colors.ink : "rgba(71, 85, 105, 0.45)",
                        }}
                      />
                      <span
                        className={`hidden text-sm transition-colors duration-300 xl:inline ${i === index ? "font-bold" : "font-medium text-slate-500 group-hover:text-slate-800"}`}
                        style={i === index ? { color: item.colors.ink } : undefined}
                      >
                        {item.fullName}
                      </span>
                    </button>
                  </li>
                ),
              )}
            </ol>
          </li>
        ))}
      </ol>
    </nav>
  );
}

type ShowcaseProps = {
  items: readonly ShowcaseItem[];
  /** The rail's groups; one plain list of every product if left out. */
  groups?: readonly ShowcaseGroup[] | undefined;
  pose: Pose;
  /** The section's id and its (screen reader) heading. */
  id: string;
  title: string;
  /** The colour above the section (the hero's bottom), which its top starts from. */
  seamColor: string;
};

function PinnedShowcase({ items, groups, pose, id, title, seamColor }: ShowcaseProps) {
  const count = items.length;
  const ref = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  // The first product plays in once the stage comes into view
  const seen = useInView(stageRef, { once: true, amount: 0.35 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [{ index, direction }, setStep] = useState({ index: 0, direction: 1 });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = Math.min(count - 1, Math.max(0, Math.round(progress * (count - 1))));
    setStep((step) =>
      step.index === next ? step : { index: next, direction: next > step.index ? 1 : -1 },
    );
  });

  // One gesture = one product while the stage is pinned (the section covers the screen).
  // Before the first and past the last, the page scrolls on as usual. Swipes scroll as usual.
  const pinned = useCallback(() => {
    const box = ref.current?.getBoundingClientRect();
    return !!box && box.top <= 2 && box.bottom >= window.innerHeight - 2;
  }, []);
  const step = useCallback(
    (by: 1 | -1) => {
      // From where the page actually is (the shown index can lag a glide still under way)
      const at = Math.round(scrollYProgress.get() * (count - 1));
      goTo(items[Math.min(count - 1, Math.max(0, at + by))]);
    },
    [scrollYProgress, count, items],
  );
  useStepGestures({ index, count, active: pinned, onStep: step, touch: false, minGapMs: 700 });

  const backgroundColor = useTransform(
    scrollYProgress,
    items.map((_, i) => i / Math.max(1, count - 1)),
    items.map((item) => item.colors.backdrop),
  );
  // Where the stage meets the hero, its top starts at the hero's colour; that fades once pinned
  const seamOpacity = useTransform(scrollYProgress, [0, 0.4 / Math.max(1, count - 1)], [1, 0]);
  const item = items[index] ?? items[0];
  if (!item) return null;

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={`${id}-title`}
      className="relative"
      style={{ height: `calc(100svh + ${(count - 1) * STEP_VH}vh)` }}
    >
      <h2 id={`${id}-title`} className="sr-only">
        {title}
      </h2>
      {/* Each product's place in the scroll: links and the rail glide here */}
      {items.map((each, i) => (
        <div
          key={each.id}
          id={each.id}
          aria-hidden="true"
          className="absolute left-0 h-px w-px"
          style={{ top: `${i * STEP_VH}vh` }}
        />
      ))}

      <motion.div
        ref={stageRef}
        className="sticky top-0 h-svh overflow-hidden"
        style={{ backgroundColor, "--name-band": NAME_BAND } as MotionStyle}
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[35vh]"
          style={{
            opacity: seamOpacity,
            background: `linear-gradient(to bottom, ${seamColor}, ${seamColor}00)`,
          }}
        />
        {/* Soft light across the stage */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 65% at 22% 45%, rgba(255,255,255,0.65), transparent 70%)",
          }}
        />

        {/* Giant 3D name behind everything, sliding through with each change (the leaving and
            the arriving name share one grid cell). In its own band along the bottom, below the
            words and the product. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-2 grid justify-items-center overflow-hidden"
        >
          <AnimatePresence initial={false} custom={direction}>
            {seen && (
              <motion.p
                key={item.id}
                custom={direction}
                variants={wordVariants}
                initial="enter"
                animate="show"
                exit="exit"
                className="col-start-1 row-start-1 select-none whitespace-nowrap font-black uppercase leading-none tracking-[0.06em]"
                style={{
                  // As big as fits across the screen (a capital here is about 0.8em wide), at
                  // most the band's height
                  fontSize: `min(var(--name-band), ${Math.min(14, 92 / (item.name.length * 0.8)).toFixed(2)}vw)`,
                  color: "rgba(255,255,255,0.6)",
                  textShadow: extrude(10, `${item.colors.ink}10`),
                }}
              >
                {item.name}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Above the name's band (1rem clear of it) */}
        <div className="relative mx-auto grid h-full w-full max-w-[90rem] grid-cols-[0.95fr_1.05fr] items-center gap-10 px-12 pb-[calc(var(--name-band)_+_1rem)] pt-24 pr-20 xl:pr-52">
          {/* Words */}
          <div className="relative z-10 max-w-xl">
            <AnimatePresence mode="wait" initial={false}>
              {seen && (
                <motion.div
                  key={item.id}
                  variants={textContainer}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  <Words item={item} index={index} count={count} popover />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* The product in its orbit: as tall as the space above the band (the screen less the
              top padding, the band and the 1rem clear of it) */}
          <div className="relative mx-auto aspect-square w-[min(100%,calc(100svh_-_7rem_-_var(--name-band)),44rem)]">
            <Orbit item={item} pose={pose} />
            <AnimatePresence initial={false} custom={direction}>
              {seen && (
                <motion.div
                  key={item.id}
                  custom={direction}
                  variants={productVariants}
                  initial="enter"
                  animate="show"
                  exit="exit"
                  className="absolute inset-0"
                >
                  <ProductImage item={item} pose={pose} />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence initial={false}>
              {seen && (
                <motion.div
                  key={item.id}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="absolute inset-0"
                >
                  <HighlightCircles item={item} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <ProgressRail
          items={items}
          groups={groups ?? [{ label: "", ids: items.map((each) => each.id) }]}
          index={index}
          label={title}
        />
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Phones and tablets: the same design, one product after another                              */
/* ------------------------------------------------------------------------------------------ */

function StackedShowcase({ items, pose, id, title, seamColor }: ShowcaseProps) {
  const count = items.length;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // The background blends from one product's colour to the next, each at its own mid-way
  const stops = [0, ...items.map((_, i) => (i + 1) / (count + 1)), 1];
  const backgroundColor = useTransform(scrollYProgress, stops, [
    seamColor,
    ...items.map((item) => item.colors.backdrop),
    items[count - 1]?.colors.backdrop ?? seamColor,
  ]);

  return (
    <motion.section
      ref={ref}
      id={id}
      aria-labelledby={`${id}-title`}
      className="relative overflow-hidden"
      style={{ backgroundColor }}
    >
      <h2 id={`${id}-title`} className="sr-only">
        {title}
      </h2>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[30vh]"
        style={{ background: `linear-gradient(to bottom, ${seamColor}, ${seamColor}00)` }}
      />
      {items.map((item, i) => (
        <article
          key={item.id}
          id={item.id}
          aria-labelledby={`${item.id}-name`}
          className="relative scroll-mt-16 px-5 py-14 sm:px-8"
        >
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="relative mx-auto aspect-square w-full max-w-[28rem]"
          >
            <Orbit item={item} pose={pose} />
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 80, rotate: 8 },
                show: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.9, ease: EASE } },
              }}
              className="absolute inset-0"
            >
              <ProductImage item={item} pose={pose} />
            </motion.div>
            <HighlightCircles item={item} />
          </motion.div>
          <motion.div
            variants={textContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="relative mx-auto mt-4 max-w-xl text-center"
          >
            <Words item={item} index={i} count={count} popover={false} />
          </motion.div>
        </article>
      ))}
    </motion.section>
  );
}

/**
 * pose: "stand" for bottles (on a podium), "float" for tubes (at a lean). id and title: the
 * section's id and its heading for screen readers. seamColor: the colour above it.
 */
export function ProductShowcase(props: ShowcaseProps) {
  const wide = useWideScreen();
  return (
    <MotionConfig reducedMotion="user">
      {wide ? <PinnedShowcase {...props} /> : <StackedShowcase {...props} />}
    </MotionConfig>
  );
}
