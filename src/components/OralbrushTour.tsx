// components/OralbrushTour.tsx
import { useCallback, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useInView,
  useMotionValueEvent,
  useScroll,
  type Variants,
} from "motion/react";
import { ShoppingBag } from "lucide-react";
import { OrbitFrame } from "@/components/Orbit";
import { useStepGestures } from "@/hooks/use-step-gestures";
import { useWideScreen } from "@/hooks/use-wide-screen";
import { BRUSH_FEATURES, ORALBRUSH, type BrushFeature } from "@/data/oralbrush";

const EASE = [0.22, 1, 0.36, 1] as const;
const COUNT = BRUSH_FEATURES.length;
const { colors, images } = ORALBRUSH;

/** On desktop, how far the page scrolls (in vh) from one feature to the next (one gesture each). */
const STEP_VH = 60;

/** The hero's bottom colour, where this section starts. */
const SEAM_COLOR = "#DCEAF6";

/** How each photo stands in the orbit: the side view leans a little, to show off the bristles. */
const VIEW_TILT: Record<BrushFeature["view"], number> = { side: -10, front: 0, open: 0 };

const twoDigits = (n: number) => String(n).padStart(2, "0");

/** Glides the page to a feature's place in the tour. */
function goTo(feature: BrushFeature | undefined) {
  if (!feature) return;
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document
    .getElementById(feature.id)
    ?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
}

/** A dashed ring turning around the spot the feature is about, with a pulse going out from it. */
function Spot({ feature }: { feature: BrushFeature }) {
  const { x, y, size } = feature.spot;
  return (
    <motion.span
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
      className="pointer-events-none absolute aspect-square -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x * 100}%`, top: `${y * 100}%`, height: `${size * 100}%` }}
    >
      <motion.span
        className="absolute inset-0 rounded-full border-2 border-dashed bg-white/10"
        style={{ borderColor: colors.ink }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 14, ease: "linear" }}
      />
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ boxShadow: `0 0 0 2px ${colors.sky}` }}
        animate={{ scale: [1, 1.35], opacity: [0.8, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
      />
    </motion.span>
  );
}

/** The photo for a feature, standing in the orbit, with its spot pointed out. */
function BrushPhoto({ feature }: { feature: BrushFeature }) {
  const image = images[feature.view];
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="relative h-[86%]"
        style={{
          aspectRatio: `${image.width} / ${image.height}`,
          rotate: `${VIEW_TILT[feature.view]}deg`,
        }}
      >
        <img
          src={image.src}
          width={image.width}
          height={image.height}
          alt=""
          draggable={false}
          className="size-full select-none object-contain drop-shadow-[0_28px_26px_rgba(20,50,90,0.28)]"
        />
        <Spot feature={feature} />
      </div>
    </div>
  );
}

const textContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, y: -14, transition: { duration: 0.25, ease: "easeIn" } },
};
const textItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/** A feature's words: its number, icon, name and what it does. Its children animate with textItem. */
function FeatureText({ feature, index }: { feature: BrushFeature; index: number }) {
  const Icon = feature.icon;
  return (
    <>
      <motion.div
        variants={textItem}
        className="flex items-center justify-center gap-4 lg:justify-start"
      >
        <span
          className="grid size-12 place-items-center rounded-2xl text-white shadow-[0_12px_24px_-12px_rgba(15,40,80,0.6)]"
          style={{ backgroundColor: colors.ink }}
        >
          <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className="font-mono text-xs tracking-[0.2em] text-slate-600">
          {twoDigits(index + 1)} / {twoDigits(COUNT)}
        </span>
      </motion.div>
      <motion.h3
        variants={textItem}
        id={`${feature.id}-title`}
        className="mt-5 text-[clamp(2.3rem,4.6vw,4.4rem)] font-black leading-[1] tracking-tight"
        style={{ color: colors.ink, filter: `drop-shadow(0 8px 12px ${colors.sky}99)` }}
      >
        {feature.label}
      </motion.h3>
      <motion.p
        variants={textItem}
        className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-700 sm:text-lg lg:mx-0"
      >
        {feature.text}
      </motion.p>
    </>
  );
}

const photoVariants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    y: 90 * direction,
    rotate: 8 * direction,
    scale: 0.88,
  }),
  show: { opacity: 1, y: 0, rotate: 0, scale: 1, transition: { duration: 0.9, ease: EASE } },
  exit: (direction: number) => ({
    opacity: 0,
    y: -70 * direction,
    rotate: -6 * direction,
    scale: 0.92,
    transition: { duration: 0.45, ease: [0.4, 0, 1, 1] },
  }),
};

const BUY_BUTTON =
  "inline-flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_-14px_rgba(15,40,80,0.55)] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/** Desktop: one pinned stage, the features taking it in turn, one scroll gesture each. */
function PinnedTour() {
  const ref = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const seen = useInView(stageRef, { once: true, amount: 0.35 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [{ index, direction }, setStep] = useState({ index: 0, direction: 1 });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = Math.min(COUNT - 1, Math.max(0, Math.round(progress * (COUNT - 1))));
    setStep((step) =>
      step.index === next ? step : { index: next, direction: next > step.index ? 1 : -1 },
    );
  });

  // One gesture = one feature while the stage is pinned; before the first and past the last
  // the page scrolls on as usual
  const pinned = useCallback(() => {
    const box = ref.current?.getBoundingClientRect();
    return !!box && box.top <= 2 && box.bottom >= window.innerHeight - 2;
  }, []);
  const step = useCallback(
    (by: 1 | -1) => {
      const at = Math.round(scrollYProgress.get() * (COUNT - 1));
      goTo(BRUSH_FEATURES[Math.min(COUNT - 1, Math.max(0, at + by))]);
    },
    [scrollYProgress],
  );
  useStepGestures({
    index,
    count: COUNT,
    active: pinned,
    onStep: step,
    touch: false,
    minGapMs: 700,
  });

  const feature = BRUSH_FEATURES[index] ?? BRUSH_FEATURES[0];
  if (!feature) return null;

  return (
    <section
      ref={ref}
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="relative"
      style={{ height: `calc(100svh + ${(COUNT - 1) * STEP_VH}vh)` }}
    >
      {/* Each feature's place in the scroll, for the step list and the hero's button */}
      {BRUSH_FEATURES.map((item, i) => (
        <div
          key={item.id}
          id={item.id}
          aria-hidden="true"
          className="absolute left-0 h-px w-px"
          style={{ top: `${i * STEP_VH}vh` }}
        />
      ))}

      <div
        ref={stageRef}
        className="sticky top-0 h-svh overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${SEAM_COLOR} 0%, #E9F2FB 45%, #E2EDF8 100%)`,
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 65% at 22% 45%, rgba(255,255,255,0.65), transparent 70%)",
          }}
        />

        <div className="relative mx-auto grid h-full w-full max-w-[90rem] grid-cols-[0.95fr_1.05fr] items-center gap-10 px-12 pb-8 pt-24">
          <div className="relative z-10 max-w-xl">
            <h2
              id="how-it-works-title"
              className="inline-flex items-center gap-2 rounded-full border border-white/85 bg-white/60 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary shadow-[0_8px_18px_-14px_rgba(15,40,80,0.5)] backdrop-blur-md"
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: colors.sky }} />
              How it works
            </h2>
            <div className="mt-7 min-h-[17rem]">
              <AnimatePresence mode="wait" initial={false}>
                {seen && (
                  <motion.div
                    key={feature.id}
                    variants={textContainer}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                  >
                    <FeatureText feature={feature} index={index} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* The three steps: where you are, and a way to jump */}
            <ol className="mt-8 flex flex-wrap gap-2" aria-label="Oralbrush features">
              {BRUSH_FEATURES.map((item, i) => {
                const current = i === index;
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => goTo(item)}
                      aria-current={current ? "step" : undefined}
                      className={`inline-flex items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 text-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        current
                          ? "border-white bg-white/85 font-bold shadow-[0_10px_22px_-14px_rgba(15,40,80,0.55)]"
                          : "border-white/70 bg-white/40 font-medium text-slate-600 hover:bg-white/70"
                      }`}
                      style={current ? { color: colors.ink } : undefined}
                    >
                      <span
                        className="grid size-7 place-items-center rounded-full transition-colors duration-300"
                        style={
                          current
                            ? { backgroundColor: colors.ink, color: "#fff" }
                            : { backgroundColor: "rgba(255,255,255,0.7)" }
                        }
                      >
                        <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
                      </span>
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ol>

            <a
              href={ORALBRUSH.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${BUY_BUTTON} mt-8`}
              style={{ backgroundColor: colors.ink }}
            >
              <ShoppingBag className="size-4" aria-hidden="true" />
              Buy on Amazon
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>

          {/* The brush in its orbit, posed for the feature */}
          <div className="relative mx-auto aspect-square w-[min(100%,72svh,44rem)]">
            <OrbitFrame glow={colors.sky} ink={colors.ink} podium={false} discTop="50%" />
            <AnimatePresence initial={false} custom={direction}>
              {seen && (
                <motion.div
                  key={feature.id}
                  custom={direction}
                  variants={photoVariants}
                  initial="enter"
                  animate="show"
                  exit="exit"
                  className="absolute inset-0"
                >
                  <BrushPhoto feature={feature} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Phones and tablets: the same features, one after another down the page. */
function StackedTour() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="relative overflow-hidden px-5 pb-16 pt-14 sm:px-8"
      style={{ background: `linear-gradient(180deg, ${SEAM_COLOR} 0%, #E9F2FB 50%, #E2EDF8 100%)` }}
    >
      <h2
        id="how-it-works-title"
        className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/85 bg-white/60 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary backdrop-blur-md"
      >
        <span className="size-2 rounded-full" style={{ backgroundColor: colors.sky }} />
        How it works
      </h2>
      {BRUSH_FEATURES.map((feature, i) => (
        <article
          key={feature.id}
          id={feature.id}
          aria-labelledby={`${feature.id}-title`}
          className="scroll-mt-16 pt-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative mx-auto aspect-square w-full max-w-[26rem]"
          >
            <OrbitFrame glow={colors.sky} ink={colors.ink} podium={false} discTop="50%" />
            <BrushPhoto feature={feature} />
          </motion.div>
          <motion.div
            variants={textContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="mx-auto mt-4 max-w-xl text-center"
          >
            <FeatureText feature={feature} index={i} />
          </motion.div>
        </article>
      ))}
      <div className="mt-12 flex justify-center">
        <a
          href={ORALBRUSH.buyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={BUY_BUTTON}
          style={{ backgroundColor: colors.ink }}
        >
          <ShoppingBag className="size-4" aria-hidden="true" />
          Buy on Amazon
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </section>
  );
}

/**
 * How the Oralbrush works, a feature at a time, staged like the mouthwash showcase: the photo
 * that shows it best stands in the glass orbit with the spot in question ringed, beside its
 * name and what it does: the bristles, then opening it, then the tongue scraper inside. On
 * desktop the stage is pinned and each scroll gesture moves one feature; on smaller screens
 * the features follow one another down the page.
 */
export function OralbrushTour() {
  const wide = useWideScreen();
  return (
    <MotionConfig reducedMotion="user">{wide ? <PinnedTour /> : <StackedTour />}</MotionConfig>
  );
}
