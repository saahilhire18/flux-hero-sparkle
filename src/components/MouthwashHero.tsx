// components/MouthwashHero.tsx
import { useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from "react";
import {
  motion,
  MotionConfig,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "motion/react";
import { ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import {
  fullName,
  MOUTHWASHES,
  MOUTHWASH_GROUPS,
  type Mouthwash,
  type MouthwashGroup,
} from "@/data/mouthwash";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const GLASS =
  "border border-white/80 bg-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_30px_-16px_rgba(20,60,120,0.4)] backdrop-blur-md";

/**
 * On wider screens the bottles stand in a shallow arc on the platform: the middle nearest
 * (largest, lowest on screen), the outer ones further back. By position from the left, for
 * any number of bottles: lift (% of the bottle's own height) and scale. Phones show rows of
 * three instead.
 */
const ARC = MOUTHWASHES.map((_, i) => {
  const half = (MOUTHWASHES.length - 1) / 2;
  const out = ((i - half) / half) ** 2; // 0 in the middle, 1 at either end
  return { lift: `${(-7 * out).toFixed(2)}%`, scale: 1 - 0.14 * out };
});

/** A bottle photo's width over its height (all are the same shape). */
const BOTTLE_ASPECT = (MOUTHWASHES[0]?.image.width ?? 408) / (MOUTHWASHES[0]?.image.height ?? 1000);

/**
 * The tallest the bottles may be on desktop so the whole row fits across: the stage's width
 * (the screen less the page's side padding and the gaps) over the row's width per unit of
 * height, with a little to spare. (The arc's scale doesn't change the space a bottle takes.)
 */
const BOTTLE_MAX = `min(28rem, calc((100vw - 6rem - ${MOUTHWASHES.length - 1} * clamp(1.25rem, 2.4vw, 3rem)) / ${(
  MOUTHWASHES.length *
  BOTTLE_ASPECT *
  1.04
).toFixed(3)}))`;

/**
 * Bubbles rising through the stage: [left %, size px, seconds per rise, seconds already
 * risen on load]. Fixed values (not random) so the server and the browser render the same.
 */
const BUBBLES = [
  [7, 10, 11, 0],
  [14, 6, 9, 3.5],
  [22, 14, 13, 6],
  [30, 8, 10, 1.5],
  [39, 12, 12, 7.5],
  [48, 7, 9, 4],
  [56, 16, 14, 2],
  [65, 9, 10, 8],
  [73, 12, 12, 0.5],
  [82, 7, 9, 5.5],
  [91, 11, 13, 3],
] as const;

const BUBBLE_STYLE: CSSProperties = {
  background:
    "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0 10%, rgba(255,255,255,0.4) 26%, rgba(150,200,235,0.35) 60%, rgba(90,150,210,0.5) 100%)",
  border: "1px solid rgba(110,165,215,0.45)",
};

type Filter = "all" | MouthwashGroup;

/** All, or one group: the bottles outside it fade back and shrink where they stand. */
function FilterBar({ value, onChange }: { value: Filter; onChange: (filter: Filter) => void }) {
  const options: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "All", count: MOUTHWASHES.length },
    ...MOUTHWASH_GROUPS.map((group) => ({
      id: group.id,
      label: group.label,
      count: MOUTHWASHES.filter((mouthwash) => mouthwash.group === group.id).length,
    })),
  ];
  const shown = options.find((option) => option.id === value);

  return (
    <>
      <div
        role="group"
        aria-label="Show mouthwashes by type"
        className={cn(GLASS, "flex flex-wrap justify-center gap-1 rounded-3xl p-1 sm:rounded-full")}
      >
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.id)}
              className={cn(
                "relative isolate rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4",
                selected ? "text-primary-foreground" : "text-primary hover:bg-white/60",
              )}
            >
              {/* The selected pill slides between options */}
              {selected && (
                <motion.span
                  layoutId="mouthwash-filter"
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-full bg-primary shadow-[0_8px_18px_-8px_rgba(15,40,90,0.6)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              {option.label}
              <span
                className={cn(
                  "ml-1.5 text-xs tabular-nums",
                  selected ? "text-primary-foreground/70" : "text-slate-500",
                )}
              >
                {option.count}
              </span>
            </button>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        {value === "all" || !shown
          ? `Showing all ${MOUTHWASHES.length} mouthwashes`
          : `Highlighting ${shown.count} ${shown.label.toLowerCase()} mouthwash${shown.count === 1 ? "" : "es"}`}
      </p>
    </>
  );
}

/**
 * One bottle: a soft glow in its liquid's colour behind it, the bottle (rising in on load,
 * lifting on hover, fading back when the filter leaves it out) and its name tag below.
 */
function Bottle({
  mouthwash,
  index,
  active,
  glowX,
}: {
  mouthwash: Mouthwash;
  index: number;
  active: boolean;
  glowX: MotionValue<number>;
}) {
  const { colors, image } = mouthwash;
  const arc = ARC[index] ?? { lift: "0%", scale: 1 };
  // 0 in the middle, growing outwards: they rise in from the middle out
  const fromCentre = Math.max(0, Math.abs(index - (MOUTHWASHES.length - 1) / 2) - 0.5);

  // Clicking a bottle glides down to its details in the range section
  const openDetails = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(mouthwash.id);
    if (!target) return;
    event.preventDefault();
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  };

  return (
    // Phones: three to a row; tablets: four; desktop: one row
    <li
      className="relative flex basis-[calc((100%-1.5rem)/3)] flex-col items-center sm:basis-[calc((100%-3rem)/4)] lg:basis-auto"
      // The middle one on top (a whole number: with an odd count, fromCentre steps by halves)
      style={{ zIndex: Math.round(10 - fromCentre * 2) }}
    >
      {/* Its place in the arc (desktop) */}
      <div
        className="relative origin-bottom lg:[scale:var(--arc-scale)] lg:[translate:0_var(--arc-lift)]"
        style={{ "--arc-lift": arc.lift, "--arc-scale": arc.scale } as CSSProperties}
      >
        {/* The bottle's own box: --bottle-h tall or, on desktop, the stage's height (100cqh) less
            the name tag and some room to lift on hover, at most --bottle-max. Its width follows
            from the photo's shape, so each bottle's slot in the row is exactly as wide as it. */}
        <div
          className="relative h-[var(--bottle-h)] lg:h-[min(var(--bottle-max),calc(100cqh_-_var(--tag-h)_-_1.5rem))]"
          style={{ aspectRatio: `${image.width} / ${image.height}` }}
        >
          {/* Centred a little below the bottle's middle; wider than the bottle, it overflows both sides */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 top-[16%] flex items-center justify-center"
          >
            <motion.span
              className="aspect-square w-[210%] shrink-0 rounded-full transition-opacity duration-500"
              style={{
                x: glowX,
                opacity: active ? 1 : 0.25,
                background: `radial-gradient(circle, ${colors.liquid}8c 0%, ${colors.liquid}33 38%, transparent 66%)`,
              }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 90 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45 + fromCentre * 0.14, ease: EASE }}
            className="relative h-full"
          >
            <motion.a
              href={`#${mouthwash.id}`}
              onClick={openDetails}
              animate={{ opacity: active ? 1 : 0.32, scale: active ? 1 : 0.84 }}
              transition={{ duration: 0.5, ease: EASE }}
              whileHover={active ? { y: -12, scale: 1.04 } : {}}
              style={{ transformOrigin: "50% 100%" }}
              className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <img
                src={image.src}
                width={image.width}
                height={image.height}
                alt={`Totalflux ${fullName(mouthwash)} mouthwash`}
                draggable={false}
                className="size-full select-none object-contain drop-shadow-[0_22px_22px_rgba(20,50,90,0.22)]"
              />
            </motion.a>
          </motion.div>

          {/* Contact shadow where it stands */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-1 left-1/2 h-3 w-[70%] -translate-x-1/2 rounded-[50%] bg-slate-900/25 blur-[6px] transition-opacity duration-500"
            style={{ opacity: active ? 1 : 0.4 }}
          />
        </div>
      </div>

      {/* Name tag, in the pack's colour like the booklet's name bars. On desktop it takes no
          width of its own (a long name overhangs its bottle's slot into the gap), so the row
          is only as wide as the bottles. */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: active ? 1 : 0.45, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 + fromCentre * 0.14, ease: EASE }}
        className="flex h-[var(--tag-h)] flex-col items-center justify-end gap-1 whitespace-nowrap text-center lg:w-0 lg:min-w-full"
      >
        <span
          className="rounded-md px-2 py-1 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-white shadow-[0_6px_14px_-8px_rgba(15,40,80,0.6)] sm:px-2.5 sm:text-[0.68rem] sm:tracking-[0.2em]"
          style={{ backgroundColor: colors.ink }}
        >
          {mouthwash.name}
        </span>
        <span className="text-[0.68rem] font-medium leading-tight text-slate-600 sm:text-xs">
          {mouthwash.benefit}
        </span>
      </motion.div>
    </li>
  );
}

/**
 * The mouthwash page's hero: the booklet's promise ("Advanced oral care. Clinically proven.")
 * over the whole range, every bottle standing on a glass platform (clicking one goes to its
 * details in the range section below). A filter highlights the
 * alcohol-based, alcohol-free or medicinal ones. The layers move at different depths as the
 * mouse moves and as the page scrolls (parallax).
 */
export function MouthwashHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const reduceMotion = useReducedMotion();

  // Mouse parallax: -1..1 across the hero, eased
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const easedX = useSpring(pointerX, { stiffness: 60, damping: 18, mass: 0.6 });
  const easedY = useSpring(pointerY, { stiffness: 60, damping: 18, mass: 0.6 });
  const stageX = useTransform(easedX, (v) => v * -14);
  const glowX = useTransform(easedX, (v) => v * 20);

  // Scroll parallax: the text leaves faster than the bottles. The bottles scroll with the
  // page: they stand at the hero's bottom edge, which clips anything pushed down past it
  // (their name tags would be cut off on the way out).
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const depth = reduceMotion ? 0 : 1;
  const textY = useTransform(scrollYProgress, [0, 1], [0, -100 * depth]);
  const stageY = useTransform(easedY, (v) => v * -8);

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - box.left) / box.width) * 2 - 1);
    pointerY.set(((event.clientY - box.top) / box.height) * 2 - 1);
  };
  const onPointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <MotionConfig reducedMotion="user">
      {/* Outside the hero, so it stays above every section as the page scrolls (inside, the
          hero's own layering would let the sections below paint over it) */}
      <Navbar />
      <section
        ref={sectionRef}
        id="top"
        aria-labelledby="mouthwash-title"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        // Desktop: exactly one screen tall (at least 40rem), the bottles sized to what's left
        className="relative isolate flex min-h-svh flex-col overflow-hidden lg:h-svh lg:min-h-[40rem]"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% -8%, #ffffff 0%, rgba(255,255,255,0) 70%), linear-gradient(180deg, #E6F1FA 0%, #F3F8FD 42%, #DCEAF6 100%)",
        }}
      >
        {/* Soft colour in the top corners, from the range's liquids */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-[12%] -top-[18%] size-[42rem] rounded-full bg-[radial-gradient(circle,rgba(103,182,195,0.32)_0%,transparent_65%)]" />
          <div className="absolute -right-[10%] -top-[14%] size-[38rem] rounded-full bg-[radial-gradient(circle,rgba(240,175,202,0.3)_0%,transparent_65%)]" />
        </div>

        <div className="relative mx-auto flex w-full max-w-[90rem] flex-1 flex-col px-5 pb-8 pt-24 sm:px-8 lg:min-h-0 lg:px-12 lg:pb-5">
          {/* Headline */}
          <motion.div
            style={{ y: textY }}
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
            }}
            className="relative z-20 mx-auto flex max-w-3xl flex-col items-center text-center"
          >
            {/* The promise, highlighted like the home hero's: a shine sweeping across it every few
                seconds and a blinking blue ring (styles.css) */}
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
              }}
              className={cn(
                GLASS,
                // A soft teal-to-blue tint, so the white light shows as it passes
                "pill-shine inline-flex items-center gap-2 rounded-full bg-[linear-gradient(100deg,rgba(214,240,242,0.92)_0%,rgba(226,236,250,0.92)_100%)] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary",
              )}
            >
              <ShieldCheck
                className="pill-shine-icon size-4 text-accent"
                strokeWidth={2}
                aria-hidden="true"
              />
              100% Secure | Clinically Tested
            </motion.p>

            <motion.h1
              id="mouthwash-title"
              variants={{
                hidden: { opacity: 0, y: 26 },
                show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
              }}
              // Scales with the screen's width and, on short screens, its height
              className="mt-4 text-[clamp(2.2rem,min(3.9vw,7vh),3.75rem)] font-black leading-[1.03] tracking-tight text-primary"
            >
              <span className="block">Advanced Oral Care.</span>
              <span
                className="block bg-clip-text pb-[0.08em] text-transparent"
                style={{
                  backgroundImage: "linear-gradient(90deg, #178AA0 0%, #2B6CB0 55%, #2B4270 100%)",
                  filter: "drop-shadow(0 6px 10px rgba(23,110,140,0.22))",
                }}
              >
                Clinically Proven.
              </span>
            </motion.h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
              }}
              className="mt-2 max-w-xl text-base text-slate-600 sm:text-lg"
            >
              Kills <strong className="font-bold text-primary">99.9%</strong> of oral germs for a
              healthier mouth.
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
              }}
              className="mt-5"
            >
              <FilterBar value={filter} onChange={setFilter} />
            </motion.div>
          </motion.div>

          {/* The range, on its platform */}
          <div className="relative mt-10 flex flex-1 flex-col justify-end lg:mt-4 lg:min-h-0">
            {/* Bubbles rising behind the bottles */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-[10%] top-[18%] overflow-hidden"
            >
              {BUBBLES.map(([left, size, duration, delay]) => (
                <span
                  key={left}
                  className="mw-bubble absolute bottom-0 rounded-full"
                  style={
                    {
                      ...BUBBLE_STYLE,
                      left: `${left}%`,
                      width: size,
                      height: size,
                      "--rise-duration": `${duration}s`,
                      "--rise-delay": `-${delay}s`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>

            {/* On desktop this is a size container (100cqh = its height: the space the headline
                leaves), which the bottles size themselves from.
                --bottle-h: the bottles' height below desktop (on desktop they fill the space left,
                up to --bottle-max: 28rem, or less when the whole row side by side would be too wide).
                --tag-h: the name tags' height, which also places the platform: centred on the
                line where the bottles stand. */}
            <motion.div
              style={{ x: stageX, y: stageY, "--bottle-max": BOTTLE_MAX } as MotionStyle}
              className="relative [--bottle-h:13rem] [--tag-h:3.5rem] sm:[--bottle-h:15rem] md:[--bottle-h:16rem] lg:min-h-0 lg:flex-1 lg:[container-type:size] lg:[--tag-h:3.75rem]"
            >
              {/* Glass platform under the bottles' bases (desktop, where they stand in one row) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-[3%] hidden h-[4.75rem] lg:block"
                style={{ bottom: "calc(var(--tag-h) - 2.375rem)" }}
              >
                <div className="absolute inset-x-[0.6%] bottom-0 top-[26%] rounded-[50%] border border-white/60 bg-linear-to-b from-white/45 to-[#a9cdf0]/25 shadow-[0_28px_48px_-26px_rgba(30,80,150,0.5)]" />
                <div className="absolute inset-x-0 bottom-[26%] top-0 rounded-[50%] border border-white/90 bg-linear-to-br from-white/80 via-white/50 to-white/25 shadow-[inset_0_2px_8px_rgba(255,255,255,0.95),inset_0_-10px_24px_rgba(130,180,235,0.25)] backdrop-blur-md" />
              </div>

              <ul
                aria-label="The Totalflux mouthwash range"
                className="relative flex flex-wrap items-end justify-center gap-x-3 gap-y-8 sm:gap-x-4 lg:h-full lg:flex-nowrap lg:gap-x-[clamp(1.25rem,2.4vw,3rem)]"
              >
                {MOUTHWASHES.map((mouthwash, i) => (
                  <Bottle
                    key={mouthwash.id}
                    mouthwash={mouthwash}
                    index={i}
                    active={filter === "all" || mouthwash.group === filter}
                    glowX={glowX}
                  />
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
