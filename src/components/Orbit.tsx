// components/Orbit.tsx
import { motion, type Variants } from "motion/react";
import type { LucideIcon } from "lucide-react";

/*
 * The mouthwash page's orbit stage, shared by its sections so they look alike: a soft glow and
 * a frosted glass disc, a dashed ring turning slowly around them (optionally a glass podium at
 * the bottom), and glass circles set around the ring. Everything is laid out in % of a square
 * box, so it scales with it.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

/** The turning ring's radius, in % of the box (its centre is the box's). */
const RING = 44;

/** A point on the ring, `angle` degrees clockwise from its right-hand side, in % of the box. */
function onRing(angle: number) {
  const radians = (angle * Math.PI) / 180;
  return { x: 50 + RING * Math.cos(radians), y: 50 + RING * Math.sin(radians) };
}

/**
 * The frame: glow, disc, turning ring and (if `podium`) the podium. glow and ink: its colours
 * (they fade when they change). discTop: where the disc's centre sits, from the box's top.
 */
export function OrbitFrame({
  glow,
  ink,
  podium = true,
  discTop = "44%",
}: {
  glow: string;
  ink: string;
  podium?: boolean;
  discTop?: string;
}) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-[16%] rounded-full opacity-70 blur-3xl transition-colors duration-700"
        style={{ backgroundColor: glow }}
      />
      <div
        className="absolute left-1/2 size-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-white/30 shadow-[inset_0_2px_14px_rgba(255,255,255,0.9)] backdrop-blur-md"
        style={{ top: discTop }}
      />
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full overflow-visible transition-colors duration-700 motion-safe:animate-[spin_70s_linear_infinite]"
        style={{ color: ink }}
      >
        <circle
          cx="50"
          cy="50"
          r={RING}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
          strokeDasharray="1.1 1.7"
          opacity="0.5"
        />
        {[0, 60, 120, 180, 240, 300].map((angle) => {
          const dot = onRing(angle);
          return (
            <circle key={angle} cx={dot.x} cy={dot.y} r="0.9" fill="currentColor" opacity="0.7" />
          );
        })}
      </svg>
      {podium && (
        <div className="absolute bottom-[5%] left-1/2 h-[9%] w-[54%] -translate-x-1/2">
          <div className="absolute inset-x-[1%] bottom-0 top-[30%] rounded-[50%] border border-white/60 bg-linear-to-b from-white/50 to-white/20 shadow-[0_24px_40px_-22px_rgba(20,60,120,0.55)]" />
          <div className="absolute inset-x-0 bottom-[30%] top-0 rounded-[50%] border border-white/90 bg-linear-to-br from-white/90 via-white/60 to-white/30 shadow-[inset_0_2px_8px_rgba(255,255,255,0.95)] backdrop-blur-md" />
        </div>
      )}
    </div>
  );
}

/**
 * Where the glass circles sit, by how many there are: centred on the ring's line (it runs
 * through the middle of each), clear of the product. In degrees, as for onRing.
 */
const CIRCLE_ANGLES: Record<number, number[]> = {
  2: [205, 15],
  3: [208, 336, 34],
  4: [210, 330, 30, 150],
};

/** Each circle pops in after the one before; its parent sets "hidden" / "show" / "exit". */
const circleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay: 0.35 + i * 0.1, ease: EASE },
  }),
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.25 } },
};

/** stat: a figure shown under the label, e.g. a strength ("995 ppm"). */
export type OrbitItem = {
  label: string;
  icon: LucideIcon;
  color?: string;
  stat?: string | undefined;
};

/**
 * Up to four items, each in a glass circle around the ring: its icon on a disc in `ink` (or
 * the item's own colour) over its label (and its figure, if any). label: what the list is,
 * for screen readers.
 */
export function OrbitCircles({
  items,
  ink,
  label,
}: {
  items: readonly OrbitItem[];
  ink: string;
  label: string;
}) {
  const angles = CIRCLE_ANGLES[Math.min(items.length, 4)] ?? CIRCLE_ANGLES[4] ?? [];
  return (
    <ul aria-label={label} className="absolute inset-0">
      {items.slice(0, 4).map(({ label: text, icon: Icon, color, stat }, i) => {
        const angle = angles[i];
        const spot = angle === undefined ? { x: 50, y: 50 } : onRing(angle);
        return (
          <motion.li
            key={text}
            custom={i}
            variants={circleVariants}
            className="absolute flex size-[21%] max-h-[8.5rem] max-w-[8.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full border border-white/85 bg-white/55 px-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_36px_-20px_rgba(15,40,80,0.45)] backdrop-blur-md"
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
          >
            <span
              className="grid size-7 shrink-0 place-items-center rounded-full text-white transition-colors duration-500 sm:size-8"
              style={{ backgroundColor: color ?? ink }}
            >
              <Icon className="size-3.5 sm:size-4" strokeWidth={1.8} />
            </span>
            <span className="text-[0.6rem] font-semibold leading-tight text-slate-800 sm:text-[0.72rem]">
              {text}
            </span>
            {stat && (
              <span
                className="text-[0.62rem] font-bold leading-none transition-colors duration-500 sm:text-xs"
                style={{ color: color ?? ink }}
              >
                {stat}
              </span>
            )}
          </motion.li>
        );
      })}
    </ul>
  );
}
