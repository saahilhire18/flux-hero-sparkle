// components/home/HomeHero.tsx
import { type PointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  motion,
  MotionConfig,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { ArrowDown, ShieldCheck, ShoppingBag } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { mouthwash, type HomeProduct } from "@/data/home";
import { AMAZON_STORE, EXTERNAL } from "@/data/links";
import { ORALBRUSH } from "@/data/oralbrush";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const NAVY = "#24467A";
const TEAL = "#178AA0";

/** Where the hero ends: the next section starts from this. */
export const HOME_HERO_END = "#E8F1FA";

const GLASS =
  "border border-white/80 bg-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_30px_-16px_rgba(20,60,120,0.4)] backdrop-blur-md";

/**
 * The toothpaste range's studio photo with its backdrop cut away (public/toothpaste-boxes.webp,
 * made from the "All View" snapshot; the boxes' soft shadows are kept, see-through).
 */
const BOXES: HomeProduct = {
  name: "The toothpaste range",
  kind: "Toothpaste",
  image: { src: "/toothpaste-boxes.webp", width: 1400, height: 980 },
  ink: "#1F5E48",
  to: "/toothpaste",
};

/**
 * The photo's bottom 11% is only the boxes' soft shadow: they stand that far up from its
 * edge. It's lowered by as much, so the boxes stand on the platform like the rest.
 */
const BOXES_SINK = "translate-y-[11%]";

/** The Oralbrush opened up, its handle swung round on the hinge so the tongue scraper shows. */
const BRUSH_OPEN: HomeProduct = {
  name: "Oralbrush",
  kind: "Oralbrush",
  image: ORALBRUSH.images.open,
  ink: ORALBRUSH.colors.ink,
  to: "/oralbrush",
};

/** The mouthwash bottles' height: all three the same (in the stage's container units). */
const BOTTLE_H = "h-[26cqw] lg:h-[min(78cqh,17cqw)]";

/**
 * The range standing together on the platform, left to right, each in its own space: what it
 * is, its height (in the stage's container units; phones size by the width, so the row fits
 * across), how wide its shadow is, and whether phones leave it out (there's room for one bottle
 * there). The toothpaste boxes are the centrepiece.
 */
const LINEUP: {
  product: HomeProduct;
  height: string;
  shadow: string;
  alt: string;
  wideOnly?: boolean;
}[] = [
  {
    product: mouthwash("kidoos"),
    height: BOTTLE_H,
    shadow: "w-[125%]",
    alt: "Totalflux Kidoos mouthwash",
    wideOnly: true,
  },
  {
    product: mouthwash("mintfresh"),
    height: BOTTLE_H,
    shadow: "w-[125%]",
    alt: "Totalflux Mintfresh mouthwash",
  },
  {
    product: BOXES,
    height: "h-[42cqw] lg:h-[min(100cqh,38cqw)]",
    shadow: "w-[96%]",
    alt: "The Totalflux toothpaste range: Essential, Sensitive, Kidoos and Advance, with their boxes",
  },
  {
    product: BRUSH_OPEN,
    height: "h-[29cqw] lg:h-[min(86cqh,26cqw)]",
    shadow: "w-[85%]",
    alt: "The Totalflux Oralbrush, opened up to show its tongue scraper",
  },
  {
    product: mouthwash("neem"),
    height: BOTTLE_H,
    shadow: "w-[125%]",
    alt: "Totalflux Neem mouthwash",
    wideOnly: true,
  },
];

const words: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const word: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

/**
 * The home page's hero, in the same calm style as the mouthwash and toothpaste pages': the
 * promise centred at the top, and the whole range standing together on a glass platform below
 * (mouthwashes, the toothpaste range in its boxes, the Oralbrush), each going to its page. The
 * range drifts gently with the mouse.
 */
export function HomeHero() {
  const reduceMotion = useReducedMotion();
  // The mouse across the hero, -1..1, eased
  const rawX = useMotionValue(0);
  const pointerX = useSpring(rawX, { stiffness: 60, damping: 18, mass: 0.6 });
  const stageX = useTransform(pointerX, (v) => v * -12);

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    rawX.set(((event.clientX - box.left) / box.width) * 2 - 1);
  };
  const onPointerLeave = () => rawX.set(0);

  return (
    <MotionConfig reducedMotion="user">
      {/* Outside the hero, so it stays above every section as the page scrolls (inside, the
          hero's own layering would let the sections below paint over it) */}
      <Navbar />
      <section
        id="top"
        aria-labelledby="home-title"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="relative isolate flex min-h-svh flex-col overflow-hidden lg:h-svh lg:min-h-[40rem]"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% -8%, #ffffff 0%, rgba(255,255,255,0) 70%), linear-gradient(180deg, #E8F2FA 0%, #F4F8FD 42%, ${HOME_HERO_END} 100%)`,
        }}
      >
        {/* Soft colour in the top corners, from the ranges */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-[12%] -top-[18%] size-[42rem] rounded-full bg-[radial-gradient(circle,rgba(103,182,195,0.3)_0%,transparent_65%)]" />
          <div className="absolute -right-[10%] -top-[14%] size-[38rem] rounded-full bg-[radial-gradient(circle,rgba(169,201,234,0.4)_0%,transparent_65%)]" />
        </div>

        <div className="relative mx-auto flex w-full max-w-[90rem] flex-1 flex-col justify-center px-5 pb-6 pt-[5.25rem] lg:justify-start sm:px-8 lg:min-h-0 lg:px-12 lg:pb-4">
          {/* The words */}
          <motion.div
            variants={words}
            initial="hidden"
            animate="show"
            className="relative z-20 mx-auto flex max-w-4xl flex-col items-center text-center"
          >
            {/* The promise, a shine sweeping across it every few seconds (styles.css) */}
            <motion.p
              variants={word}
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
              SLS Free | Clinically Tested
            </motion.p>
            <motion.h1
              variants={word}
              id="home-title"
              className="mt-3 text-[clamp(2rem,min(3.4vw,6vh),3.25rem)] font-black leading-[1.03] tracking-tight"
              style={{ color: NAVY }}
            >
              Your journey to a
              <span
                className="block bg-clip-text pb-[0.08em] text-transparent"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${TEAL} 0%, #2B6CB0 55%, ${NAVY} 100%)`,
                  filter: "drop-shadow(0 6px 10px rgba(23,110,140,0.22))",
                }}
              >
                better smile.
              </span>
            </motion.h1>
            <motion.p
              variants={word}
              className="mt-2 max-w-4xl text-base text-slate-600 sm:text-lg"
            >
              Toothpaste, Mouthwash and the Oralbrush: everything for a healthy mouth, for every
              age.
            </motion.p>
            <motion.div
              variants={word}
              className="mt-4 flex flex-wrap items-center justify-center gap-3"
            >
              <a
                href="#ranges"
                className="inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-base font-semibold text-white shadow-[0_14px_28px_-14px_rgba(15,40,80,0.6)] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                style={{ backgroundColor: NAVY }}
              >
                Explore the range
                <ArrowDown className="size-4" aria-hidden="true" />
              </a>
              <a
                href={AMAZON_STORE}
                {...EXTERNAL}
                className={cn(
                  GLASS,
                  "inline-flex items-center gap-2 rounded-full px-5 py-3 text-base font-semibold transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
                style={{ color: NAVY }}
              >
                <ShoppingBag className="size-4" aria-hidden="true" />
                Where to Buy
                <span className="sr-only"> (Amazon, opens in a new tab)</span>
              </a>
            </motion.div>
          </motion.div>

          {/* The range on its platform. A size container: the products size themselves from it */}
          <div className="relative mt-6 h-[15rem] [container-type:size] sm:h-[24rem] lg:mt-1 lg:h-auto lg:min-h-0 lg:flex-1">
            {/* Glass platform under their bases */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[10%] bottom-[2%] h-[16%] lg:inset-x-[22%]"
            >
              <div className="absolute inset-x-[0.6%] bottom-0 top-[26%] rounded-[50%] border border-white/60 bg-linear-to-b from-white/45 to-[#a9cdf0]/25 shadow-[0_28px_48px_-26px_rgba(30,80,150,0.5)]" />
              <div className="absolute inset-x-0 bottom-[26%] top-0 rounded-[50%] border border-white/90 bg-linear-to-br from-white/80 via-white/50 to-white/25 shadow-[inset_0_2px_8px_rgba(255,255,255,0.95),inset_0_-10px_24px_rgba(130,180,235,0.25)] backdrop-blur-md" />
            </div>

            {/* The range, standing together on the platform */}
            <motion.ul
              aria-label="The Totalflux range"
              style={{ x: stageX }}
              className="absolute inset-x-0 bottom-[6%] flex items-end justify-center gap-[2.5cqw] lg:gap-[2.2cqw]"
            >
              {LINEUP.map((item, i) => {
                const fromCentre = Math.abs(i - (LINEUP.length - 1) / 2);
                const { image } = item.product;
                return (
                  <motion.li
                    key={image.src}
                    initial={{ opacity: 0, y: 70 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.45 + fromCentre * 0.14, ease: EASE }}
                    className={cn("relative", item.wideOnly && "hidden lg:block")}
                  >
                    {/* A soft shadow where it stands (first, so the product stands over it) */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none absolute -bottom-2 left-1/2 h-4 -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse,rgba(20,40,80,0.4)_0%,rgba(20,40,80,0.16)_45%,transparent_72%)] lg:h-5",
                        item.shadow,
                      )}
                    />
                    <Link
                      to={item.product.to}
                      aria-label={item.alt}
                      className={cn(
                        "group relative block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        item.product === BOXES && BOXES_SINK,
                      )}
                    >
                      <img
                        src={image.src}
                        width={image.width}
                        height={image.height}
                        alt=""
                        draggable={false}
                        className={cn(
                          item.height,
                          "w-auto max-w-none select-none object-contain transition-[translate] duration-500 ease-out group-hover:-translate-y-2",
                          // The boxes carry their own soft shadows
                          item.product !== BOXES && "drop-shadow-[0_22px_22px_rgba(20,50,90,0.22)]",
                        )}
                        style={{ aspectRatio: `${image.width} / ${image.height}` }}
                      />
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
