// components/OralHealthSection.tsx
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  animate,
  motion,
  MotionConfig,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, Laugh, Wind } from "lucide-react";
import { ToothSparkle } from "@/components/icons/Tooth";
import { OrbitCircles, OrbitFrame, type OrbitItem } from "@/components/Orbit";
import { MOUTHWASHES } from "@/data/mouthwash";

const EASE = [0.22, 1, 0.36, 1] as const;

/** The page's navy and teal: the figures' gradient and the orbit's colours. */
const NAVY = "#2B4270";
const TEAL = "#178AA0";
const GRADIENT = `linear-gradient(100deg, ${TEAL} 0%, #2B6CB0 50%, ${NAVY} 100%)`;

const reveal = (delay = 0) =>
  ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.4 },
    transition: { duration: 0.7, delay, ease: EASE },
  }) as const;

type Figure = { value: number; text: string; source: string };

/**
 * The two figures. The booklet's (90% and 48%+) are withdrawn: the website content audit of
 * 17 October 2026 found them contradicted or unsourced. Its replacements, from Totalflux's
 * Scientific Detailer, wait for their full citations (audit Q-06):
 * - main: 54, "of people in India have tooth decay."
 * - second: 64.9, "of Indian adults aged 35–44 have experienced tooth decay."
 * Until then there are none, and the orbit shows the alcohol-free rinses instead.
 */
const FIGURES = null as { main: Figure; second: Figure } | null;

/** In the orbit while there are no figures: three of the alcohol-free rinses. */
const TRIO = ["neem", "sensitive", "kidoos"].flatMap((id) => {
  const found = MOUTHWASHES.find((each) => each.id === id);
  return found ? [found] : [];
});

/** The range's promises (the booklet's back cover, as the audit words them), around the orbit. */
const PROMISES: OrbitItem[] = [
  { label: "Made for daily use", icon: CalendarCheck, color: "#2B6CB0" },
  { label: "Gently reduces bad breath", icon: Wind, color: TEAL },
  { label: "Sensitive-teeth formula", icon: ToothSparkle, color: "#2E8B57" },
  { label: "Kids’ rinse for ages 6+", icon: Laugh, color: "#B83B72" },
];

/**
 * Bubbles rising behind everything, as in the hero: [left %, size px, seconds per rise,
 * seconds already risen]. Fixed values, so the server and the browser render the same.
 */
const BUBBLES = [
  [6, 10, 11, 0],
  [18, 6, 9, 3.5],
  [31, 14, 13, 6],
  [44, 8, 10, 1.5],
  [58, 12, 12, 7.5],
  [71, 7, 9, 4],
  [84, 16, 14, 2],
  [94, 9, 10, 8],
] as const;

const BUBBLE_STYLE: CSSProperties = {
  background:
    "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0 10%, rgba(255,255,255,0.4) 26%, rgba(150,200,235,0.35) 60%, rgba(90,150,210,0.5) 100%)",
  border: "1px solid rgba(110,165,215,0.45)",
};

/** Counts up from 0 to `to` once `start` is true (straight to it when motion is reduced). */
function CountUp({ to, start }: { to: number; start: boolean }) {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (reduceMotion) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.8,
      ease: EASE,
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [start, to, reduceMotion]);
  return <>{value}</>;
}

/** A ring (in a 100 × 100 box) that fills to `value`% from the top once `start` is true. */
function ProgressRing({
  value,
  start,
  radius,
  width,
  id,
}: {
  value: number;
  start: boolean;
  radius: number;
  width: number;
  id: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={TEAL} />
          <stop offset="100%" stopColor={NAVY} />
        </linearGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="rgba(43,66,112,0.1)"
        strokeWidth={width}
      />
      <motion.circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth={width}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: start ? value / 100 : 0 }}
        transition={{ duration: 1.8, ease: EASE }}
      />
    </svg>
  );
}

/**
 * The close of the mouthwash page, staged like the showcase above it: the same turning orbit
 * and glass disc, with the headline figure inside (its ring filling and the number counting
 * up as it comes into view) or, while there are no figures, three of the rinses; the range's
 * four promises in glass circles around it. Beside it: why daily oral care matters, the second
 * figure (when there is one), "Let's change the stats!" and a link to "What does your smile
 * need?" on the home page. Bubbles rise behind.
 * topColor: the colour above it, which it starts from. promises and closing: the range's own
 * (the mouthwash booklet's back cover by default).
 */
export function OralHealthSection({
  topColor = "#E4F1F8",
  promises = PROMISES,
  closing,
}: {
  topColor?: string;
  promises?: readonly OrbitItem[];
  closing?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const orbitSeen = useInView(orbitRef, { once: true, amount: 0.45 });
  const figureSeen = useInView(figureRef, { once: true, amount: 0.8 });
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const orbitY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [60, -60]);

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={ref}
        id="oral-health"
        aria-labelledby="oral-health-title"
        className="relative isolate overflow-hidden px-5 py-20 sm:px-8 lg:flex lg:min-h-svh lg:items-center lg:px-12"
        style={{ background: `linear-gradient(180deg, ${topColor} 0%, #E6F1F9 45%, #DCEAF6 100%)` }}
      >
        {/* Soft light and colour, as on the stages above */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 65% at 22% 45%, rgba(255,255,255,0.65), transparent 70%)",
            }}
          />
          <div className="absolute -right-[10%] top-[10%] size-[40rem] rounded-full bg-[radial-gradient(circle,rgba(120,196,204,0.28)_0%,transparent_65%)]" />
          <div className="absolute -left-[12%] bottom-[-14%] size-[36rem] rounded-full bg-[radial-gradient(circle,rgba(240,175,202,0.2)_0%,transparent_65%)]" />
        </div>

        {/* Bubbles rising */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[20%] -z-10 overflow-hidden"
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

        <div className="mx-auto grid w-full max-w-[90rem] items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
          {/* Words */}
          <div className="relative z-10 text-center lg:text-left">
            <motion.p
              {...reveal(0)}
              className="inline-flex items-center gap-2 rounded-full border border-white/85 bg-white/60 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-primary shadow-[0_8px_18px_-14px_rgba(15,40,80,0.5)] backdrop-blur-md"
            >
              <span className="size-2 rounded-full bg-[#D7263D]" />
              Oral health in India
            </motion.p>
            <motion.h2
              {...reveal(0.08)}
              id="oral-health-title"
              className="mt-5 text-[clamp(2.2rem,4.4vw,4rem)] font-black leading-[1] tracking-tight text-primary"
            >
              Why daily oral care{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: GRADIENT,
                  filter: "drop-shadow(0 6px 10px rgba(23,110,140,0.22))",
                }}
              >
                matters.
              </span>
            </motion.h2>
            <motion.p
              {...reveal(0.16)}
              className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-700 sm:text-lg lg:mx-0"
            >
              Healthy habits start at home: brush twice a day, keep up regular dental check-ups, and
              choose products that suit your needs.
            </motion.p>

            {/* The second figure (when there is one): a small ring, in a glass pill */}
            {FIGURES && (
              <motion.div
                ref={figureRef}
                {...reveal(0.22)}
                className="mx-auto mt-6 flex max-w-md items-center gap-4 rounded-[1.75rem] border border-white/85 bg-white/55 p-3 pr-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_40px_-26px_rgba(20,60,120,0.45)] backdrop-blur-md lg:mx-0"
              >
                <div className="relative size-20 shrink-0">
                  <ProgressRing
                    value={FIGURES.second.value}
                    start={figureSeen}
                    radius={40}
                    width={9}
                    id="second-stat-ring"
                  />
                  <p className="absolute inset-0 grid place-items-center text-lg font-black tracking-tight text-primary">
                    <span aria-hidden="true">
                      <CountUp to={FIGURES.second.value} start={figureSeen} />
                      %+
                    </span>
                    <span className="sr-only">More than {FIGURES.second.value}%</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold leading-snug text-slate-800">
                    {FIGURES.second.text}
                  </p>
                  <p className="mt-1 text-[0.65rem] leading-snug text-slate-500">
                    Source: {FIGURES.second.source}
                  </p>
                </div>
              </motion.div>
            )}

            <motion.p
              {...reveal(0.3)}
              className="mt-6 bg-clip-text pb-[0.06em] text-3xl font-black tracking-tight text-transparent sm:text-4xl"
              style={{
                backgroundImage: GRADIENT,
                filter: "drop-shadow(0 6px 10px rgba(23,110,140,0.22))",
              }}
            >
              Let’s change the stats!
            </motion.p>

            {/* The closing line, and on to "What does your smile need?" on the home page */}
            <motion.div
              {...reveal(0.38)}
              className="mt-5 flex flex-col items-center gap-4 sm:flex-row lg:items-center"
            >
              <p className="max-w-sm text-base font-semibold leading-snug text-slate-700">
                {closing ?? "Find the toothpaste and mouthwash that suit your needs."}
              </p>
              <Link
                to="/"
                hash="match"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_16px_32px_-14px_rgba(15,40,80,0.55)] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Find your match
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </motion.div>
          </div>

          {/* The headline figure in the orbit, the promises around it */}
          <motion.div
            ref={orbitRef}
            style={{ y: orbitY }}
            initial="hidden"
            animate={orbitSeen ? "show" : "hidden"}
            // A size container: the figure inside scales with the orbit (cqw)
            className="relative mx-auto aspect-square w-full max-w-[26rem] [container-type:inline-size] sm:max-w-[32rem] lg:w-[min(100%,70svh,42rem)] lg:max-w-none"
          >
            <OrbitFrame glow="#9BD3DC" ink={NAVY} podium={false} discTop="50%" />
            {FIGURES ? (
              <>
                {/* The figure's ring, just inside the glass disc */}
                <div className="absolute inset-[19%]">
                  <ProgressRing
                    value={FIGURES.main.value}
                    start={orbitSeen}
                    radius={47}
                    width={2.6}
                    id="main-stat-ring"
                  />
                </div>
                <div className="absolute inset-[22%] flex flex-col items-center justify-center text-center">
                  <p
                    className="bg-clip-text font-black leading-none tracking-tight text-transparent"
                    style={{
                      backgroundImage: GRADIENT,
                      filter: `drop-shadow(0 8px 12px rgba(23,110,140,0.28))`,
                      fontSize: "clamp(2.5rem, 16cqw, 6.5rem)",
                    }}
                  >
                    <span aria-hidden="true">
                      <CountUp to={FIGURES.main.value} start={orbitSeen} />%
                    </span>
                    <span className="sr-only">{FIGURES.main.value}%</span>
                  </p>
                  <p className="mt-2 max-w-[85%] text-[0.8rem] font-semibold leading-snug text-slate-800 sm:text-sm">
                    {FIGURES.main.text}
                  </p>
                  <p className="mt-1.5 max-w-[80%] text-[0.6rem] leading-snug text-slate-500 sm:text-[0.65rem]">
                    Source: {FIGURES.main.source}
                  </p>
                </div>
              </>
            ) : (
              // Three of the alcohol-free rinses, standing in the glass disc
              <div
                aria-hidden="true"
                className="absolute inset-[24%] flex items-end justify-center gap-[2%] pb-[6%]"
              >
                {TRIO.map((rinse, i) => (
                  <img
                    key={rinse.id}
                    src={rinse.image.src}
                    width={rinse.image.width}
                    height={rinse.image.height}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className={`w-auto select-none object-contain drop-shadow-[0_18px_18px_rgba(20,50,90,0.28)] ${i === 1 ? "relative z-10 h-[88%]" : "h-[74%]"}`}
                    style={{ aspectRatio: `${rinse.image.width} / ${rinse.image.height}` }}
                  />
                ))}
              </div>
            )}
            <OrbitCircles items={promises} ink={NAVY} label="Our promises" />
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}
