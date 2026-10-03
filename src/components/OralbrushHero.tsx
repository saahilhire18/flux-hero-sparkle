// components/OralbrushHero.tsx
import { useRef, type CSSProperties, type PointerEvent } from "react";
import {
  motion,
  MotionConfig,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { ArrowDown, ShoppingBag } from "lucide-react";
import { BrandName } from "@/components/BrandName";
import { Navbar } from "@/components/Navbar";
import { OrbitCircles, OrbitFrame } from "@/components/Orbit";
import { BRUSH_HIGHLIGHTS, ORALBRUSH } from "@/data/oralbrush";

const EASE = [0.22, 1, 0.36, 1] as const;
const { colors, images } = ORALBRUSH;

/** The hero's bottom colour, which "How it works" below starts from. */
const SEAM_COLOR = "#DCEAF6";

/** A solid 3D extrusion for text: `depth` stacked 1px shadows in `color`, down and to the right. */
const extrude = (depth: number, color: string) =>
  Array.from({ length: depth }, (_, i) => `${i + 1}px ${i + 1}px 0 ${color}`).join(", ");

/**
 * Bubbles rising behind the brush: [left %, size px, seconds per rise, seconds already
 * risen]. Fixed values, so the server and the browser render the same.
 */
const BUBBLES = [
  [8, 10, 11, 0],
  [21, 6, 9, 3.5],
  [47, 12, 12, 7.5],
  [58, 8, 10, 1.5],
  [69, 14, 13, 6],
  [81, 7, 9, 4],
  [93, 11, 12, 2],
] as const;

const BUBBLE_STYLE: CSSProperties = {
  background:
    "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0 10%, rgba(255,255,255,0.4) 26%, rgba(150,200,235,0.35) 60%, rgba(90,150,210,0.5) 100%)",
  border: "1px solid rgba(110,165,215,0.45)",
};

const GLASS =
  "border border-white/85 bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_30px_-16px_rgba(20,60,120,0.4)] backdrop-blur-md";

const words: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const word: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

/**
 * The Oralbrush page's hero: "Introducing Oralbrush" and its promise beside the brush, which
 * floats at a slant inside the glass orbit with its features in glass circles around it. The
 * brush turns a little as the page scrolls and the layers drift with the mouse (parallax);
 * bubbles rise behind, and a giant 3D "Oralbrush" sits along the bottom.
 */
export function OralbrushHero() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  // Mouse parallax: -1..1 across the hero, eased
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const easedX = useSpring(pointerX, { stiffness: 60, damping: 18, mass: 0.6 });
  const easedY = useSpring(pointerY, { stiffness: 60, damping: 18, mass: 0.6 });
  const orbitX = useTransform(easedX, (v) => v * -12);
  const wordX = useTransform(easedX, (v) => v * -30);

  // Scroll: the brush turns and rises, the words leave faster than the orbit
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const depth = reduceMotion ? 0 : 1;
  const brushRotate = useTransform(scrollYProgress, [0, 1], [34, 34 - 16 * depth]);
  const brushY = useTransform(scrollYProgress, [0, 1], [0, -40 * depth]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -90 * depth]);
  const orbitY = useTransform(
    [easedY, scrollYProgress],
    ([pointer, scroll]: number[]) => (pointer ?? 0) * -8 + (scroll ?? 0) * 50 * depth,
  );

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
      <section
        ref={ref}
        id="top"
        aria-labelledby="oralbrush-title"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="relative isolate flex min-h-svh flex-col overflow-hidden lg:h-svh lg:min-h-[40rem]"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 70% 45%, rgba(255,255,255,0.75), transparent 70%), linear-gradient(180deg, #E8F2FB 0%, #F3F8FD 45%, #DCEAF6 100%)",
        }}
      >
        <Navbar />

        {/* Soft colour from the brush, far behind everything */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-[12%] -top-[16%] size-[40rem] rounded-full bg-[radial-gradient(circle,rgba(169,201,234,0.42)_0%,transparent_65%)]" />
          <div className="absolute -bottom-[20%] -right-[8%] size-[42rem] rounded-full bg-[radial-gradient(circle,rgba(120,180,230,0.28)_0%,transparent_65%)]" />
        </div>

        {/* Bubbles rising */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[18%] -z-10 overflow-hidden"
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

        {/* The bottom edge fades into the next section's colour, so the two run together
            without a line (the glow above would otherwise be cut off there) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[24vh]"
          style={{ background: `linear-gradient(to bottom, ${SEAM_COLOR}00, ${SEAM_COLOR})` }}
        />

        {/* Giant 3D word along the bottom, whole (it ends just above the edge) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-3 -z-10 flex justify-center overflow-hidden px-2 pb-3"
        >
          <motion.p
            style={{
              x: wordX,
              color: "rgba(255,255,255,0.65)",
              textShadow: extrude(10, "rgba(36,80,127,0.08)"),
            }}
            className="select-none whitespace-nowrap text-[min(10.5vw,11rem)] font-black uppercase leading-[0.8] tracking-[0.06em]"
          >
            Oralbrush
          </motion.p>
        </div>

        <div className="relative mx-auto grid w-full max-w-[90rem] flex-1 items-center gap-10 px-5 pb-14 pt-24 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:pb-10">
          {/* Words */}
          <motion.div
            style={{ y: textY }}
            variants={words}
            initial="hidden"
            animate="show"
            className="relative z-10 text-center lg:text-left"
          >
            <motion.p
              variants={word}
              className={`${GLASS} inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary`}
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: colors.sky }} />
              Introducing
            </motion.p>
            <motion.h1 variants={word} id="oralbrush-title" className="mt-5 leading-[0.95]">
              <BrandName className="block text-[clamp(1.3rem,2vw,2rem)] font-bold text-slate-800" />
              <span
                className="block text-[clamp(3.2rem,7vw,6.75rem)] font-black tracking-tight"
                style={{ color: colors.ink, filter: `drop-shadow(0 10px 14px ${colors.sky}aa)` }}
              >
                Oralbrush
              </span>
            </motion.h1>
            <motion.p
              variants={word}
              className="mx-auto mt-5 max-w-lg text-base leading-7 text-slate-700 sm:text-lg lg:mx-0"
            >
              {ORALBRUSH.tagline}
            </motion.p>
            <motion.div
              variants={word}
              className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            >
              <a
                href={ORALBRUSH.buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-base font-semibold text-white shadow-[0_16px_32px_-14px_rgba(15,40,80,0.55)] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                style={{ backgroundColor: colors.ink }}
              >
                <ShoppingBag className="size-4" aria-hidden="true" />
                Buy on Amazon
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <a
                href="#how-it-works"
                className={`${GLASS} inline-flex items-center gap-2 rounded-full px-5 py-3 text-base font-semibold text-primary transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
              >
                See how it opens
                <ArrowDown className="size-4" aria-hidden="true" />
              </a>
            </motion.div>
          </motion.div>

          {/* The brush in its orbit, its features around it */}
          <motion.div
            style={{ x: orbitX, y: orbitY }}
            initial="hidden"
            animate="show"
            className="relative mx-auto aspect-square w-full max-w-[26rem] sm:max-w-[32rem] lg:w-[min(100%,70svh,42rem)] lg:max-w-none"
          >
            <OrbitFrame glow={colors.sky} ink={colors.ink} podium={false} discTop="50%" />
            <motion.div
              initial={{ opacity: 0, y: 90, rotate: 18 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 1.1, delay: 0.25, ease: EASE }}
              className="absolute inset-[4%] flex items-center justify-center"
            >
              <motion.img
                src={images.front.src}
                width={images.front.width}
                height={images.front.height}
                alt="The Totalflux Oralbrush in sky blue"
                draggable={false}
                className="h-[92%] w-auto select-none object-contain drop-shadow-[0_30px_28px_rgba(20,50,90,0.3)]"
                style={{ rotate: brushRotate, y: brushY }}
              />
            </motion.div>
            <OrbitCircles items={BRUSH_HIGHLIGHTS} ink={colors.ink} label="Oralbrush highlights" />
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}
