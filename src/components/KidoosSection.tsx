// components/KidoosSection.tsx
import { useRef } from "react";
import { Check } from "lucide-react";
import { motion, MotionConfig, useScroll, useTransform } from "motion/react";
import { BrandName } from "@/components/BrandName";
import { useHoverTilt } from "@/hooks/use-hover-tilt";

const EASE = [0.22, 1, 0.36, 1] as const;

type Kidoo = {
  id: "kidoos-advance" | "kidoos-plus";
  name: string;
  age: string;
  tag: string;
  summary: string;
  actives: [string, string][];
  perks: string[];
  image: { src: string; width: number; height: number };
  /** The card's gradient, and a deep shade of it for text (readable on every part of it). */
  gradient: string;
  ink: string;
};

/** From the Totalflux product sheets and the Kidoos packs. */
const KIDOOS: Kidoo[] = [
  {
    id: "kidoos-advance",
    name: "Kidoos Advance",
    age: "6+",
    tag: "Reduced-dose fluoride",
    summary:
      "A pediatric-calibrated step between fluoride-free and adult-strength paste, for reduced-dose fluoride protection as teeth grow.",
    actives: [
      ["Sodium Fluoride", "498 ppm"],
      ["Xylitol", "3%"],
    ],
    perks: ["SLS free · Non-cariogenic", "Cavity protection with fluoride", "Fresh breath all day"],
    image: { src: "/kidoos-advance.webp", width: 232, height: 729 },
    gradient: "linear-gradient(135deg, #FFD1DC 0%, #FFE3EC 45%, #FFE9D6 100%)",
    ink: "#8E2442",
  },
  {
    id: "kidoos-plus",
    name: "Kidoos Plus",
    age: "3+",
    tag: "Fluoride-free first years",
    summary:
      "A genuinely fluoride-free formula with hydroxyapatite for remineralization, for zero fluoride ingestion risk.",
    actives: [
      ["Hydroxyapatite", "3%"],
      ["Xylitol", "3%"],
    ],
    perks: ["No SLS · No fluoride", "Enamel protection", "Strawberry Bliss flavour"],
    image: { src: "/kidoos-plus.webp", width: 213, height: 697 },
    gradient: "linear-gradient(135deg, #CDEBFF 0%, #DCE4FF 50%, #EBDDFF 100%)",
    ink: "#23498A",
  },
];

/** Soft floating dots, like bubbles, in the card's corners (clipped to the card). */
function Dots() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]"
    >
      <span className="absolute right-[8%] top-[10%] size-12 rounded-full bg-white/50 blur-[1px]" />
      <span className="absolute right-[20%] top-[26%] size-4 rounded-full bg-white/70" />
      <span className="absolute bottom-[12%] left-[6%] size-20 rounded-full bg-white/35" />
      <span className="absolute bottom-[30%] left-[18%] size-3 rounded-full bg-white/70" />
    </div>
  );
}

/**
 * On hover the card tilts towards the mouse (useHoverTilt) and its layers come apart in depth:
 * the badge nearest, then the tube, then the words (px towards you), so they shift against
 * each other as it turns. A soft glare follows the mouse.
 */
const DEPTH = { badge: 85, tube: 60, words: 30 };

/**
 * One Kidoos card: a gradient panel with the age badge, the tube (rising and swaying as the
 * page scrolls) and the product's key points. In 3D on hover.
 */
function KidooCard({ kidoo, index }: { kidoo: Kidoo; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const tubeY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const tubeRotate = useTransform(scrollYProgress, [0, 1], index % 2 ? [-14, 6] : [14, -6]);
  const badgeRotate = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  const { handlers, style: tiltStyle, hover, glare } = useHoverTilt();
  const badgeZ = useTransform(hover, [0, 1], [0, DEPTH.badge]);
  const tubeZ = useTransform(hover, [0, 1], [0, DEPTH.tube]);
  const wordsZ = useTransform(hover, [0, 1], [0, DEPTH.words]);
  const { rotateX, rotateY, scale } = tiltStyle;

  return (
    <motion.article
      ref={ref}
      id={kidoo.id}
      aria-labelledby={`${kidoo.id}-title`}
      initial={{ opacity: 0, y: 50, rotate: index % 2 ? 1.5 : -1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: EASE }}
      {...handlers}
      // preserve-3d (and no overflow clipping here) lets the layers inside sit at their depths
      className="relative rounded-[2rem] border border-white/70 p-6 shadow-[0_30px_70px_-35px_rgba(60,40,90,0.45)] transition-shadow duration-300 [transform-style:preserve-3d] hover:shadow-[0_50px_90px_-35px_rgba(60,40,90,0.55)] sm:p-7"
      style={{
        background: kidoo.gradient,
        color: kidoo.ink,
        scrollMarginTop: "6rem",
        rotateX,
        rotateY,
        scale,
      }}
    >
      <Dots />

      <div className="relative grid items-center gap-5 [transform-style:preserve-3d] sm:grid-cols-[auto_1fr] sm:gap-x-10">
        {/* Tube with its age badge */}
        <div className="relative mx-auto h-60 w-28 [transform-style:preserve-3d] sm:h-72 sm:w-32">
          <motion.img
            src={kidoo.image.src}
            width={kidoo.image.width}
            height={kidoo.image.height}
            alt={`Totalflux ${kidoo.name} toothpaste`}
            draggable={false}
            className="h-full w-auto select-none object-contain drop-shadow-[0_24px_30px_rgba(60,40,90,0.3)]"
            style={{ y: tubeY, rotate: tubeRotate, z: tubeZ }}
          />
          <motion.span
            style={{ rotate: badgeRotate, z: badgeZ, backgroundColor: kidoo.ink }}
            className="absolute -right-5 top-1 grid size-16 place-items-center rounded-full text-center text-white shadow-lg ring-4 ring-white/70"
          >
            <span className="leading-none">
              <span className="block text-xl font-black">{kidoo.age}</span>
              <span className="text-[0.58rem] font-semibold uppercase tracking-wider">years</span>
            </span>
          </motion.span>
        </div>

        <motion.div style={{ z: wordsZ }}>
          <p className="inline-flex rounded-full bg-white/60 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] backdrop-blur">
            {kidoo.tag}
          </p>
          <h3
            id={`${kidoo.id}-title`}
            className="mt-2.5 text-2xl font-black leading-tight tracking-tight sm:text-3xl"
          >
            <BrandName className="block text-sm font-bold tracking-normal opacity-70" />
            {kidoo.name}
          </h3>
          <p className="mt-2 text-sm leading-6 opacity-90">{kidoo.summary}</p>

          <ul className="mt-3 flex flex-wrap gap-2">
            {kidoo.actives.map(([name, amount]) => (
              <li key={name} className="rounded-full bg-white/65 px-3 py-1 text-xs backdrop-blur">
                {name} <span className="font-bold">{amount}</span>
              </li>
            ))}
          </ul>

          <ul className="mt-3 space-y-1.5">
            {kidoo.perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2 text-[0.82rem] font-semibold">
                <span
                  className="grid size-5 shrink-0 place-items-center rounded-full text-white"
                  style={{ backgroundColor: kidoo.ink }}
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Glare following the mouse, only while hovered */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[2rem]"
        style={{ background: glare, opacity: hover }}
      />
    </motion.article>
  );
}

/**
 * The Kidoos range: a playful gradient heading and a gradient card per product, below the
 * adult sections. `topColor`: the colour above it, which its background starts from.
 */
export function KidoosSection({ topColor = "#DDE4F2" }: { topColor?: string }) {
  return (
    <MotionConfig reducedMotion="user">
      <section
        id="kidoos"
        aria-labelledby="kidoos-title"
        className="relative overflow-hidden px-5 pb-24 pt-20 sm:px-8 lg:px-12"
        style={{
          background: `linear-gradient(180deg, ${topColor} 0%, #FBF4FB 30%, #F4F6FF 100%)`,
          scrollSnapAlign: "start",
        }}
      >
        <div className="mx-auto max-w-[90rem]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="text-center"
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-600">
              For little smiles
            </p>
            <h2
              id="kidoos-title"
              className="mt-3 bg-clip-text text-[clamp(2.8rem,6vw,5.5rem)] font-black leading-none tracking-tight text-transparent"
              style={{
                backgroundImage: "linear-gradient(90deg, #E0506A 0%, #B35CC9 50%, #3F7BD9 100%)",
              }}
            >
              <BrandName className="tracking-normal" /> Kidoos
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
              Gentle, SLS-free care made for children&apos;s teeth, with a Strawberry Bliss taste
              they&apos;ll love.
            </p>
          </motion.div>

          {/* At most about 1220px across, centred, the two cards close together */}
          <div className="mx-auto mt-10 grid max-w-[76rem] gap-4 [perspective:1400px] lg:grid-cols-2">
            {KIDOOS.map((kidoo, i) => (
              <KidooCard key={kidoo.id} kidoo={kidoo} index={i} />
            ))}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
