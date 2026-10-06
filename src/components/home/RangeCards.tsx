// components/home/RangeCards.tsx
import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion, MotionConfig, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { BrandName } from "@/components/BrandName";
import { useHoverTilt } from "@/hooks/use-hover-tilt";
import { MOUTHWASHES } from "@/data/mouthwash";
import { ORALBRUSH } from "@/data/oralbrush";

const EASE = [0.22, 1, 0.36, 1] as const;

/** The studio photo of the toothpaste range (public/toothpaste-range.webp) and its backdrop's grey. */
const RANGE_PHOTO = {
  src: "/toothpaste-range.webp",
  width: 1400,
  height: 977,
  backdrop: "#E3DEDE",
};

/** The mouthwashes fanned out on the card, middle one nearest. */
const FAN_IDS = ["mintfresh", "turmeric", "kidoos", "sensitive", "neem"];
const FAN = FAN_IDS.map((id) => MOUTHWASHES.find((each) => each.id === id)).filter(
  (each) => !!each,
);

type Range = {
  id: string;
  name: string;
  to: "/toothpaste" | "/mouthwash" | "/oralbrush";
  badge: string;
  text: string;
  link: string;
  /** The card's soft colour, top to bottom, and a deep shade for its marks. */
  background: string;
  ink: string;
  visual: ReactNode;
};

/** The toothpaste range's studio photo, its grey running into the card's colour below. */
function ToothpasteVisual() {
  return (
    <img
      src={RANGE_PHOTO.src}
      width={RANGE_PHOTO.width}
      height={RANGE_PHOTO.height}
      alt="The Totalflux toothpaste range: Essential, Sensitive, Advance and Kidoos Plus, each tube with its box"
      loading="lazy"
      draggable={false}
      className="absolute inset-x-0 top-0 h-full w-full select-none object-cover object-center [mask-image:linear-gradient(to_bottom,#000_70%,transparent)]"
    />
  );
}

/** The mouthwashes, fanned out on a glass podium. */
function MouthwashVisual() {
  const middle = (FAN.length - 1) / 2;
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-[9%]">
      <div
        aria-hidden="true"
        className="absolute bottom-[6%] left-1/2 h-[12%] w-[78%] -translate-x-1/2 rounded-[50%] border border-white/90 bg-linear-to-b from-white/85 to-white/30 shadow-[0_18px_30px_-18px_rgba(20,60,120,0.5)]"
      />
      {FAN.map((bottle, i) => {
        const away = Math.abs(i - middle);
        return (
          <img
            key={bottle.id}
            src={bottle.image.src}
            width={bottle.image.width}
            height={bottle.image.height}
            alt={i === Math.round(middle) ? "The Totalflux mouthwash range" : ""}
            loading="lazy"
            draggable={false}
            className="relative -mx-[3%] w-auto origin-bottom select-none object-contain drop-shadow-[0_18px_18px_rgba(20,50,90,0.25)]"
            style={{
              height: `${78 - away * 9}%`,
              zIndex: 10 - away,
              rotate: `${(i - middle) * 5}deg`,
            }}
          />
        );
      })}
    </div>
  );
}

/** The Oralbrush, open to show its tongue scraper. */
function OralbrushVisual() {
  const { open } = ORALBRUSH.images;
  return (
    <div className="absolute inset-0 flex items-center justify-center p-[6%]">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 aspect-square h-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 bg-white/35 shadow-[inset_0_2px_14px_rgba(255,255,255,0.9)]"
      />
      <img
        src={open.src}
        width={open.width}
        height={open.height}
        alt="The Totalflux Oralbrush, open to show its tongue scraper"
        loading="lazy"
        draggable={false}
        className="relative h-full w-auto select-none object-contain drop-shadow-[0_22px_22px_rgba(20,50,90,0.25)]"
      />
    </div>
  );
}

const RANGES: Range[] = [
  {
    id: "toothpaste",
    name: "Toothpaste",
    to: "/toothpaste",
    badge: "5 formulas",
    text: "SLS free from first teeth to grown-up care: Advance, Sensitive, Essential and the Kidoos range.",
    link: "Explore toothpaste",
    background: `linear-gradient(180deg, ${RANGE_PHOTO.backdrop} 0%, ${RANGE_PHOTO.backdrop} 46%, #EEF1F6 100%)`,
    ink: "#2B4270",
    visual: <ToothpasteVisual />,
  },
  {
    id: "mouthwash",
    name: "Mouthwash",
    to: "/mouthwash",
    badge: "7 formulas",
    text: "Kills 99.9% of oral germs, in alcohol-based, alcohol-free and medicinal formulas.",
    link: "Explore mouthwash",
    background: "linear-gradient(180deg, #D3EDF2 0%, #E4F3F6 50%, #EFF5F9 100%)",
    ink: "#1B6A7E",
    visual: <MouthwashVisual />,
  },
  {
    id: "oralbrush",
    name: "Oralbrush",
    to: "/oralbrush",
    badge: "New",
    text: "A sustainable brush for teeth and gums that slides open into a gentle tongue scraper.",
    link: "Meet the Oralbrush",
    background: "linear-gradient(180deg, #D9E7F6 0%, #E6EFF9 50%, #F0F4FA 100%)",
    ink: ORALBRUSH.colors.ink,
    visual: <OralbrushVisual />,
  },
];

/** How far the card's layers lift towards you while it's hovered (px). */
const DEPTH = { visual: 55, words: 28 };

/**
 * One range: its picture over its name, what it is and a link, the whole card leading to the
 * range's page. It tilts in 3D towards the mouse, its picture lifting off the card.
 */
function RangeCard({ range, index }: { range: Range; index: number }) {
  const { handlers, style, hover, glare } = useHoverTilt({ tilt: { x: 7, y: 10 } });
  const visualZ = useTransform(hover, [0, 1], [0, DEPTH.visual]);
  const wordsZ = useTransform(hover, [0, 1], [0, DEPTH.words]);

  return (
    <motion.article
      aria-labelledby={`${range.id}-card-title`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: EASE }}
      {...handlers}
      className="group relative flex flex-col rounded-[2rem] border border-white/80 shadow-[0_30px_70px_-35px_rgba(20,50,100,0.45)] transition-shadow duration-300 [transform-style:preserve-3d] hover:shadow-[0_50px_90px_-35px_rgba(20,50,100,0.55)]"
      style={{ background: range.background, ...style }}
    >
      {/* The picture (clipped to the card's rounded top) */}
      <motion.div
        style={{ z: visualZ }}
        className="relative aspect-[1.5] overflow-hidden rounded-t-[2rem]"
      >
        {range.visual}
      </motion.div>

      <motion.div style={{ z: wordsZ }} className="flex flex-1 flex-col px-6 pb-6 pt-1">
        <p
          className="w-fit rounded-full bg-white/70 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.16em]"
          style={{ color: range.ink }}
        >
          {range.badge}
        </p>
        <h3 id={`${range.id}-card-title`} className="mt-3 leading-[1]">
          <BrandName className="block text-base font-bold text-slate-700" />
          <span
            className="text-[clamp(1.6rem,2.2vw,2rem)] font-black tracking-tight"
            style={{ color: range.ink }}
          >
            {range.name}
          </span>
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">{range.text}</p>
        <span
          aria-hidden="true"
          className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-bold"
          style={{ color: range.ink }}
        >
          {range.link}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </motion.div>

      {/* Glare following the mouse, only while hovered */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[2rem]"
        style={{ background: glare, opacity: hover }}
      />

      {/* The link: the whole card, so anywhere on it opens the range */}
      <Link
        to={range.to}
        aria-label={`${range.link}: Totalflux ${range.name}`}
        className="absolute inset-0 z-10 rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    </motion.article>
  );
}

/** Where the section's background ends, for the next section to start from. */
export const RANGES_END = "#EAF2FA";

/**
 * The three ranges, each a card leading to its page. topColor: the colour above it (the
 * hero's bottom), which its background starts from; it ends at RANGES_END.
 */
export function RangeCards({ topColor }: { topColor: string }) {
  return (
    <MotionConfig reducedMotion="user">
      <section
        id="ranges"
        aria-labelledby="ranges-title"
        className="relative scroll-mt-16 px-5 pb-24 pt-16 sm:px-8 lg:px-12"
        style={{ background: `linear-gradient(180deg, ${topColor} 0%, ${RANGES_END} 100%)` }}
      >
        <div className="mx-auto max-w-[90rem]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#178AA0] sm:text-sm">
              The range
            </p>
            <h2
              id="ranges-title"
              className="mt-3 text-[clamp(2rem,4vw,3.4rem)] font-black leading-[1.05] tracking-tight text-primary"
            >
              Three ranges. One complete routine.
            </h2>
          </motion.div>
          {/* At most about 1100px across, centred, so the cards stay a comfortable size */}
          <div className="mx-auto mt-10 grid max-w-[69rem] gap-6 [perspective:1400px] md:grid-cols-2 lg:grid-cols-3">
            {RANGES.map((range, i) => (
              <RangeCard key={range.id} range={range} index={i} />
            ))}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
