// components/home/HomeHero.tsx
import { type CSSProperties, type PointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  motion,
  MotionConfig,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionStyle,
  type MotionValue,
  type Variants,
} from "motion/react";
import { ArrowDown, Check, ShoppingBag } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { BRUSH, KIDOOS_ADVANCE, mouthwash, toothpaste, type HomeProduct } from "@/data/home";
import { AMAZON_STORE, EXTERNAL } from "@/data/links";

const EASE = [0.22, 1, 0.36, 1] as const;
const NAVY = "#24467A";
const TEAL = "#178AA0";

/** Where the hero ends: the next section starts from this. */
export const HOME_HERO_END = "#E8F1FA";

const TICKS = ["SLS free", "Clinically tested", "100% vegetarian"];

/** A spot for a floating product: its centre (% across, % down), height and lean (degrees). */
type Spot = { x: number; y: number; h: number; rotate: number };

/**
 * The products floating round the headline. wide: on desktop, over the whole hero, clear of the
 * words in the middle (height in svh). narrow: on phones and tablets, in a band under the words
 * (height in % of that band); left out, it shows on desktop only. depth: how far it drifts with
 * the mouse (nearer ones drift more). bob: seconds for its gentle float up and down.
 */
const COLLAGE: { product: HomeProduct; wide: Spot; narrow?: Spot; depth: number; bob: number }[] = [
  {
    product: mouthwash("mintfresh"),
    wide: { x: 12, y: 36, h: 32, rotate: -8 },
    narrow: { x: 14, y: 46, h: 78, rotate: -6 },
    depth: 1,
    bob: 6,
  },
  {
    product: toothpaste("advance"),
    wide: { x: 21, y: 74, h: 30, rotate: 14 },
    narrow: { x: 37, y: 54, h: 70, rotate: 10 },
    depth: 0.85,
    bob: 7,
  },
  { product: KIDOOS_ADVANCE, wide: { x: 5, y: 76, h: 21, rotate: -14 }, depth: 0.55, bob: 5.5 },
  { product: mouthwash("neem"), wide: { x: 24, y: 26, h: 19, rotate: 10 }, depth: 0.45, bob: 8 },
  {
    product: BRUSH,
    wide: { x: 89, y: 42, h: 48, rotate: 18 },
    narrow: { x: 87, y: 46, h: 92, rotate: 16 },
    depth: 1,
    bob: 6.5,
  },
  {
    product: toothpaste("sensitive"),
    wide: { x: 77, y: 75, h: 29, rotate: -14 },
    narrow: { x: 63, y: 54, h: 70, rotate: -10 },
    depth: 0.85,
    bob: 7.5,
  },
  { product: mouthwash("turmeric"), wide: { x: 77, y: 26, h: 20, rotate: 8 }, depth: 0.5, bob: 5 },
  { product: mouthwash("kidoos"), wide: { x: 95, y: 83, h: 21, rotate: -8 }, depth: 0.6, bob: 6 },
];

/** Products arrive one after another, from a little smaller and lower, after the headline. */
const arrive: Variants = {
  hidden: { opacity: 0, scale: 0.7, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.35 + i * 0.08, ease: EASE },
  }),
};

const words: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const word: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/**
 * One floating product: placed at its spot, drifting with the mouse by its depth and bobbing
 * gently; it grows a little and shows its name on hover, and opens its page.
 */
function FloatingProduct({
  item,
  index,
  pointerX,
  pointerY,
}: {
  item: (typeof COLLAGE)[number];
  index: number;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
}) {
  const { product, wide, narrow, depth, bob } = item;
  const x = useTransform(pointerX, (v) => v * depth * -26);
  const y = useTransform(pointerY, (v) => v * depth * -18);
  const name = `Totalflux ${product.name}`;
  const label = `${name}${product.kind === "Oralbrush" ? "" : ` ${product.kind.toLowerCase()}`}`;

  return (
    <motion.div
      custom={index}
      variants={arrive}
      className={`absolute left-[var(--nx)] top-[var(--ny)] h-[var(--nh)] -translate-x-1/2 -translate-y-1/2 lg:left-[var(--wx)] lg:top-[var(--wy)] lg:h-[var(--wh)] ${narrow ? "" : "hidden lg:block"}`}
      style={
        {
          "--wx": `${wide.x}%`,
          "--wy": `${wide.y}%`,
          "--wh": `${wide.h}svh`,
          "--nx": `${narrow?.x ?? 50}%`,
          "--ny": `${narrow?.y ?? 50}%`,
          "--nh": `${narrow?.h ?? 0}%`,
          // Nearer products in front
          zIndex: Math.round(depth * 10),
        } as MotionStyle
      }
    >
      {/* Drifting with the mouse */}
      <motion.div style={{ x, y }} className="h-full">
        <Link
          to={product.to}
          {...(product.hash ? { hash: product.hash } : {})}
          aria-label={label}
          className="float-bob group relative block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={
            {
              aspectRatio: `${product.image.width} / ${product.image.height}`,
              "--bob-duration": `${bob}s`,
              "--bob-delay": `-${(index * 1.7) % bob}s`,
            } as CSSProperties
          }
        >
          <img
            src={product.image.src}
            width={product.image.width}
            height={product.image.height}
            alt=""
            draggable={false}
            className="size-full select-none object-contain drop-shadow-[0_26px_24px_rgba(20,50,90,0.28)] transition-[scale] duration-300 ease-out group-hover:scale-105"
            style={{ rotate: `${(narrow ?? wide).rotate}deg` }}
          />
          {/* Its name, on hover */}
          <span
            className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-xs font-bold opacity-0 shadow-[0_8px_20px_-10px_rgba(15,40,80,0.5)] transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
            style={{ color: product.ink }}
          >
            {name}
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

/**
 * The home page's hero: the headline centred, with the range floating round it (toothpastes,
 * mouthwashes and the Oralbrush, at different sizes and depths), each drifting with the mouse
 * by its depth (parallax) and bobbing gently, and opening its page when clicked. On phones the
 * products gather in a band under the words.
 */
export function HomeHero() {
  const reduceMotion = useReducedMotion();
  // The mouse across the hero, -1..1, eased
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const pointerX = useSpring(rawX, { stiffness: 50, damping: 16, mass: 0.6 });
  const pointerY = useSpring(rawY, { stiffness: 50, damping: 16, mass: 0.6 });

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    rawX.set(((event.clientX - box.left) / box.width) * 2 - 1);
    rawY.set(((event.clientY - box.top) / box.height) * 2 - 1);
  };
  const onPointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="top"
        aria-labelledby="home-title"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="relative isolate flex min-h-svh flex-col overflow-hidden lg:h-svh lg:min-h-[44rem]"
        style={{
          background: `linear-gradient(180deg, #F7FAFE 0%, #EEF4FB 55%, ${HOME_HERO_END} 100%)`,
        }}
      >
        <Navbar />

        {/* Soft colour in the corners, from the ranges */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-[10%] -top-[15%] size-[36rem] rounded-full bg-[radial-gradient(circle,rgba(103,182,195,0.28)_0%,transparent_65%)]" />
          <div className="absolute -right-[8%] -top-[10%] size-[34rem] rounded-full bg-[radial-gradient(circle,rgba(240,175,202,0.24)_0%,transparent_65%)]" />
          <div className="absolute -bottom-[20%] left-1/2 size-[44rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(169,207,234,0.35)_0%,transparent_65%)]" />
        </div>

        {/* The floating range: over the whole hero on desktop */}
        <motion.ul
          aria-label="The Totalflux range"
          initial="hidden"
          animate="show"
          className="pointer-events-none absolute inset-0 hidden lg:block [&_a]:pointer-events-auto"
        >
          {COLLAGE.map((item, i) => (
            <li key={item.product.name + item.product.kind}>
              <FloatingProduct item={item} index={i} pointerX={pointerX} pointerY={pointerY} />
            </li>
          ))}
        </motion.ul>

        {/* The words, centred */}
        <div className="relative z-20 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 pb-6 pt-28 text-center sm:px-8 lg:pb-10 lg:pt-20">
          <motion.div
            variants={words}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center"
          >
            <motion.p
              variants={word}
              className="text-xs font-bold uppercase tracking-[0.28em] sm:text-sm"
              style={{ color: TEAL }}
            >
              Complete Oral Care
            </motion.p>
            <motion.h1
              variants={word}
              id="home-title"
              className="mt-4 text-[clamp(2.4rem,min(5.4vw,9.5vh),5.4rem)] font-black leading-[1.02] tracking-tight text-balance"
              style={{ color: NAVY }}
            >
              Your journey to a
              <span
                className="block bg-clip-text pb-[0.06em] text-transparent"
                style={{
                  backgroundImage: `linear-gradient(100deg, ${TEAL} 0%, #2B6CB0 60%, ${NAVY} 100%)`,
                }}
              >
                better smile.
              </span>
            </motion.h1>
            <motion.p
              variants={word}
              className="mt-4 max-w-md text-base leading-7 text-slate-600 sm:text-lg"
            >
              Toothpaste, mouthwash and the Oralbrush: everything for a healthy mouth, for every
              age.
            </motion.p>
            <motion.div
              variants={word}
              className="mt-7 flex flex-wrap items-center justify-center gap-3"
            >
              <a
                href="#ranges"
                className="inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-base font-semibold text-white shadow-[0_14px_28px_-14px_rgba(15,40,80,0.6)] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                style={{ backgroundColor: NAVY }}
              >
                Explore the range
                <ArrowDown className="size-4" aria-hidden="true" />
              </a>
              <a
                href={AMAZON_STORE}
                {...EXTERNAL}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-base font-semibold transition-colors hover:border-slate-400 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ color: NAVY }}
              >
                <ShoppingBag className="size-4" aria-hidden="true" />
                Where to Buy
                <span className="sr-only"> (Amazon, opens in a new tab)</span>
              </a>
            </motion.div>
            <motion.ul
              variants={word}
              className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-600"
            >
              {TICKS.map((tick) => (
                <li key={tick} className="inline-flex items-center gap-2">
                  <span
                    className="grid size-5 place-items-center rounded-full text-white"
                    style={{ backgroundColor: TEAL }}
                  >
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {tick}
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </div>

        {/* The floating range: in a band under the words on phones and tablets */}
        <motion.ul
          aria-label="The Totalflux range"
          initial="hidden"
          animate="show"
          className="relative mx-auto h-[19rem] w-full max-w-xl sm:h-[22rem] lg:hidden"
        >
          {COLLAGE.filter((item) => item.narrow).map((item, i) => (
            <li key={item.product.name + item.product.kind}>
              <FloatingProduct item={item} index={i} pointerX={pointerX} pointerY={pointerY} />
            </li>
          ))}
        </motion.ul>
      </section>
    </MotionConfig>
  );
}
