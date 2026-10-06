// components/home/DailyRoutine.tsx
import { useRef, useState, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import {
  motion,
  MotionConfig,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowRight } from "lucide-react";
import { ROUTINE } from "@/data/home";
import { useWideScreen } from "@/hooks/use-wide-screen";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const NAVY = "#24467A";

/** Where the section's background ends, for the next section to start from. */
export const ROUTINE_END = "#E4EFF8";

/** How each product leans in its circle (degrees). */
const LEAN = [-8, 6, 0];

/** The line joining the steps: through the three circles' middles, the middle one exactly halfway along it. */
const LINE = "M0 50 C 100 0, 200 100, 300 50 S 500 0, 600 50";

/**
 * How much scrolling the section stays pinned for on wide screens (in screen heights), and how
 * much of that draws the line: it reaches the mouthwash a little before the pin ends, so the
 * finished line holds for a moment before the page moves on.
 */
const PIN_SCREENS = 1.1;
const DRAW_UNTIL = 0.85;

/** How far across the line is when it meets the second and third circles' edges. */
const REACH = [0.42, 0.9] as const;

/**
 * The daily routine in three steps (brush and scrape, brush with your toothpaste, rinse), each
 * product in a glass circle with a slowly turning dashed ring, joined by a line. On wide
 * screens the section pins once it fills the screen and scrolling draws the line from the
 * Oralbrush to the toothpaste to the mouthwash, each step lighting up as the line reaches it;
 * once the line is complete the page scrolls on. On phones the steps stack and scroll as usual.
 * Each step links to its range. topColor: the colour above it, which its background starts from.
 */
export function DailyRoutine({ topColor }: { topColor: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const wide = useWideScreen();

  // 0 → 1 while the section is pinned (it fills the screen from its top to its end)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const eased = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });
  const draw = useTransform(eased, (v) =>
    reduceMotion ? 1 : Math.min(1, Math.max(0, v / DRAW_UNTIL)),
  );

  // The line is revealed from the left (it only ever runs rightwards), up to `draw` of its width
  const revealWidth = useTransform(draw, (v) => v * 600);

  // How many steps the line has reached: the first from the start, the others as it meets
  // their circles (a little before their middles, at 50% and 100% across)
  const [reached, setReached] = useState(1);
  useMotionValueEvent(draw, "change", (v) => {
    const next = v >= REACH[1] ? 3 : v >= REACH[0] ? 2 : 1;
    setReached((current) => (current === next ? current : next));
  });
  const lit = (i: number) => !wide || reduceMotion || i < reached;

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={ref}
        id="routine"
        aria-labelledby="routine-title"
        // Wide screens: a screen tall plus the scrolling it stays pinned for
        className="relative overflow-x-clip lg:h-[var(--routine-h)]"
        style={
          {
            background: `linear-gradient(180deg, ${topColor} 0%, ${ROUTINE_END} 100%)`,
            "--routine-h": `${100 + PIN_SCREENS * 100}svh`,
          } as CSSProperties
        }
      >
        {/* Pinned on wide screens: the content fills the screen below the navbar, centred */}
        <div className="px-5 pb-24 pt-16 sm:px-8 lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:justify-center lg:px-12 lg:pb-6 lg:pt-[var(--nav-h,4.75rem)]">
          <div className="mx-auto w-full max-w-[90rem] [--circle:14rem] lg:[--circle:min(14rem,27svh)]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#178AA0] sm:text-sm">
                Your daily routine
              </p>
              <h2
                id="routine-title"
                className="mt-3 text-[clamp(2rem,min(4vw,7svh),3.4rem)] font-black leading-[1.05] tracking-tight text-primary"
              >
                Brush. Paste. Rinse.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-slate-600 sm:text-lg">
                Three steps, morning and night, for complete care of teeth, gums and tongue.
              </p>
            </motion.div>

            <div className="relative mt-14 lg:mt-[min(3rem,5svh)]">
              {/* The line joining the steps (wide screens), through the circles' middles: a faint
                  dashed guide, and over it the line drawn in as the section scrolls */}
              <svg
                aria-hidden="true"
                viewBox="0 0 600 100"
                preserveAspectRatio="none"
                className="pointer-events-none absolute left-[16.67%] top-[calc(var(--circle)/2_-_3rem)] hidden h-24 w-[66.66%] overflow-visible lg:block"
              >
                <path
                  d={LINE}
                  fill="none"
                  stroke={NAVY}
                  strokeOpacity="0.25"
                  strokeWidth="2"
                  strokeDasharray="5 9"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Revealed by a clip that widens from the left. (Not pathLength: on a line
                    stretched to fit like this one, browsers measure its dashes in the drawing's
                    own units and repeat them further along, so a stray piece shows early.) */}
                <path
                  d={LINE}
                  fill="none"
                  stroke="url(#routine-line)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  clipPath="url(#routine-reveal)"
                />
                <defs>
                  <linearGradient id="routine-line" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" stopColor="#178AA0" />
                    <stop offset="1" stopColor={NAVY} />
                  </linearGradient>
                  <clipPath id="routine-reveal">
                    <motion.rect x="0" y="-60" height="220" width={revealWidth} />
                  </clipPath>
                </defs>
              </svg>

              <ol className="relative grid gap-14 lg:grid-cols-3 lg:gap-8">
                {ROUTINE.map(({ step, title, text, product, link }, i) => {
                  const on = lit(i);
                  return (
                    <motion.li
                      key={step}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.8, delay: i * 0.15, ease: EASE }}
                      className="group flex flex-col items-center text-center"
                    >
                      {/* A step the line hasn't reached yet waits a little smaller, its product
                          and words faded (its glass circle stays solid, hiding the line) */}
                      <motion.div
                        animate={{ scale: on ? 1 : 0.93 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="flex flex-col items-center"
                      >
                        {/* The product in its glass circle */}
                        <div className="relative size-[var(--circle)]">
                          <div
                            className={cn(
                              "absolute inset-0 rounded-full border border-white/85 bg-white/45 shadow-[inset_0_2px_14px_rgba(255,255,255,0.9),0_24px_50px_-28px_rgba(20,60,120,0.5)] backdrop-blur-md transition-shadow duration-500",
                              on &&
                                wide &&
                                "shadow-[inset_0_2px_14px_rgba(255,255,255,0.9),0_24px_50px_-28px_rgba(20,60,120,0.5),0_0_0_6px_rgba(23,138,160,0.12)]",
                            )}
                          />
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 100 100"
                            className="absolute -inset-3 size-[calc(100%_+_1.5rem)] motion-safe:animate-[spin_50s_linear_infinite]"
                          >
                            <circle
                              cx="50"
                              cy="50"
                              r="48"
                              fill="none"
                              stroke={product.ink}
                              strokeOpacity="0.4"
                              strokeWidth="0.5"
                              strokeDasharray="1.5 2.5"
                            />
                            <circle cx="50" cy="2" r="1.3" fill={product.ink} />
                          </svg>
                          <img
                            src={product.image.src}
                            width={product.image.width}
                            height={product.image.height}
                            alt={`Totalflux ${product.name}${product.kind === "Oralbrush" ? "" : ` ${product.kind.toLowerCase()}`}`}
                            loading="lazy"
                            draggable={false}
                            className={cn(
                              "absolute left-1/2 top-1/2 h-[78%] w-auto -translate-x-1/2 -translate-y-1/2 select-none object-contain drop-shadow-[0_18px_18px_rgba(20,50,90,0.28)] transition-[translate,opacity,filter] duration-500 ease-out group-hover:-translate-y-[54%]",
                              !on && "opacity-40 grayscale",
                            )}
                            style={{
                              rotate: `${LEAN[i] ?? 0}deg`,
                              aspectRatio: `${product.image.width} / ${product.image.height}`,
                            }}
                          />
                          <span
                            className="absolute -left-1 top-3 grid size-11 place-items-center rounded-full font-mono text-sm font-bold text-white shadow-[0_10px_20px_-10px_rgba(15,40,80,0.7)] transition-colors duration-500"
                            style={{ backgroundColor: on ? NAVY : "#A3B3CB" }}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>

                        <div
                          className={cn(
                            "flex flex-col items-center transition-opacity duration-500",
                            !on && "opacity-45",
                          )}
                        >
                          <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-[#178AA0] lg:mt-[min(2rem,4svh)]">
                            {step}
                          </p>
                          <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-primary">
                            {title}
                          </h3>
                          <p className="mt-2 max-w-xs text-[0.95rem] leading-7 text-slate-600">
                            {text}
                          </p>
                        </div>
                      </motion.div>
                      <Link
                        to={product.to}
                        className="mt-4 inline-flex items-center gap-2 rounded-full px-1 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        style={{ color: product.ink }}
                      >
                        {link}
                        <ArrowRight
                          className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </Link>
                    </motion.li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
