// components/home/MatchFinder.tsx
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, MotionConfig, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";
import { BrandName } from "@/components/BrandName";
import { OrbitFrame } from "@/components/Orbit";
import { NEEDS, type HomeProduct, type Need } from "@/data/home";

const EASE = [0.22, 1, 0.36, 1] as const;
const NAVY = "#24467A";

/** Where the section's background ends, for the next section to start from. */
export const MATCH_END = "#EDF3FA";

/**
 * Where the needs sit on the ring (% of the orbit box): three down its left side, then three
 * down its right (degrees round from the right, clockwise), so the middle stays clear for the
 * products and their podium.
 */
const RING = 43;
const ANGLES = [220, 180, 140, -40, 0, 40];
const SPOTS = ANGLES.map((degrees) => {
  const angle = (degrees * Math.PI) / 180;
  // Rounded, so the server's HTML and the browser's first render agree
  const round = (value: number) => Math.round(value * 100) / 100;
  return {
    left: `${round(50 + RING * Math.cos(angle))}%`,
    top: `${round(50 + RING * Math.sin(angle))}%`,
  };
});

/** The pair on the podium: the outgoing one sinks away as the new one rises into place. */
const productVariants: Variants = {
  hidden: { opacity: 0, y: 70 },
  show: (delay: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: EASE } }),
  exit: { opacity: 0, y: 40, transition: { duration: 0.3, ease: "easeIn" } },
};

const words: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};
const line: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/** One product of the pair, in the words: a small photo, what it is and why it suits, and a link to it. */
function PickRow({ product, why }: { product: HomeProduct; why: string }) {
  return (
    <motion.li
      variants={line}
      className="group flex items-center gap-4 rounded-[1.75rem] border border-white/85 bg-white/55 p-3 pr-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_16px_36px_-26px_rgba(20,60,120,0.5)] backdrop-blur-md"
    >
      <span className="relative h-24 w-16 shrink-0 rounded-2xl bg-white/70">
        <img
          src={product.image.src}
          width={product.image.width}
          height={product.image.height}
          alt=""
          loading="lazy"
          draggable={false}
          className="absolute inset-0 m-auto h-[86%] w-auto select-none object-contain drop-shadow-[0_8px_8px_rgba(20,50,90,0.25)]"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500">
          {product.kind}
        </span>
        <span
          className="block text-lg font-black leading-tight tracking-tight"
          style={{ color: product.ink }}
        >
          <BrandName className="text-[0.8em] font-bold text-slate-600" /> {product.name}
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-slate-600">{why}</span>
        <Link
          to={product.to}
          {...(product.hash ? { hash: product.hash } : {})}
          className="mt-1.5 inline-flex items-center gap-1.5 rounded-full text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ color: product.ink }}
        >
          See {product.name}
          <ArrowRight
            className="size-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </span>
    </motion.li>
  );
}

/**
 * The need's pair, as one group centred on the middle of the orbit (and so of the six needs
 * around it), across and up and down: the toothpaste leaning in front of the mouthwash's lower
 * left, with a soft shadow under them. Sized in cqw (the orbit is a size container).
 */
function Pair({ need }: { need: Need }) {
  const tube = need.toothpaste.product;
  const bottle = need.mouthwash.product;
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={need.id}
        initial="hidden"
        animate="show"
        exit="exit"
        className="absolute inset-0 flex items-center justify-center"
      >
        {/* Nudged right: the leaning tube reaches further left than its box, so this centres what you see */}
        <div className="relative flex h-[56cqw] translate-x-[3.3cqw] items-end">
          {/* Their shadow */}
          <span
            aria-hidden="true"
            className="absolute -bottom-[2cqw] left-1/2 h-[5cqw] w-[120%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse,rgba(20,50,90,0.28),transparent_70%)]"
          />
          {/* In front of the bottle, overlapping its lower left */}
          <motion.img
            custom={0}
            variants={productVariants}
            src={tube.image.src}
            width={tube.image.width}
            height={tube.image.height}
            alt={`Totalflux ${tube.name} toothpaste`}
            draggable={false}
            className="relative z-10 -mr-[5cqw] h-[76%] w-auto shrink-0 origin-bottom -rotate-[9deg] select-none object-contain drop-shadow-[0_22px_22px_rgba(20,50,90,0.35)]"
            style={{ aspectRatio: `${tube.image.width} / ${tube.image.height}` }}
          />
          <motion.img
            custom={0.15}
            variants={productVariants}
            src={bottle.image.src}
            width={bottle.image.width}
            height={bottle.image.height}
            alt={`Totalflux ${bottle.name} mouthwash`}
            draggable={false}
            className="relative h-full w-auto shrink-0 select-none object-contain drop-shadow-[0_24px_24px_rgba(20,50,90,0.28)]"
            style={{ aspectRatio: `${bottle.image.width} / ${bottle.image.height}` }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * "What does your smile need?", in the glass orbit of the rest of the site: the six needs in
 * glass circles around the ring, and the toothpaste and mouthwash for the one chosen standing
 * on the podium in the middle (each new pair rises into place, the glow taking its mouthwash's
 * colour). Beside it, the need and its pair in words: what each is, why it suits, a link to it.
 * topColor: the colour above it, which its background starts from.
 */
export function MatchFinder({ topColor }: { topColor: string }) {
  const [needId, setNeedId] = useState(NEEDS[0]?.id ?? "");
  const need = NEEDS.find((each) => each.id === needId) ?? NEEDS[0];
  if (!need) return null;
  const NeedIcon = need.icon;

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="match"
        aria-labelledby="match-title"
        className="relative overflow-hidden px-5 pb-24 pt-16 sm:px-8 lg:px-12"
        style={{ background: `linear-gradient(180deg, ${topColor} 0%, ${MATCH_END} 100%)` }}
      >
        {/* Phones: heading, orbit, then the pair in words. Wide screens: the orbit on the left
            across both rows, the heading over the pair on the right. */}
        <div className="mx-auto grid max-w-[90rem] gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-8">
          {/* The orbit: the needs around it, the pair on its podium */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="relative row-start-2 mx-auto aspect-square w-full max-w-[26rem] self-center [container-type:inline-size] sm:max-w-[34rem] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:w-[min(100%,78svh,42rem)] lg:max-w-none"
          >
            <OrbitFrame
              glow={need.mouthwash.product.glow ?? "#A9CFEA"}
              ink={NAVY}
              podium={false}
              discTop="50%"
            />
            <Pair need={need} />

            <div role="group" aria-label="Your need" className="absolute inset-0">
              {NEEDS.map(({ id, label, icon: Icon }, i) => {
                const current = id === need.id;
                const spot = SPOTS[i] ?? { left: "50%", top: "50%" };
                return (
                  <motion.button
                    key={id}
                    type="button"
                    aria-pressed={current}
                    onClick={() => setNeedId(id)}
                    animate={{ scale: current ? 1.12 : 1 }}
                    whileHover={{ scale: current ? 1.12 : 1.06 }}
                    transition={{ type: "spring", stiffness: 320, damping: 22 }}
                    className={`absolute flex size-[22cqw] max-h-[8.5rem] max-w-[8.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full border px-2 text-center transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      current
                        ? "z-10 border-transparent text-white shadow-[0_18px_36px_-14px_rgba(15,40,80,0.75)]"
                        : "border-white/85 bg-white/60 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_36px_-20px_rgba(15,40,80,0.45)] backdrop-blur-md hover:bg-white/85"
                    }`}
                    style={{
                      left: spot.left,
                      top: spot.top,
                      ...(current ? { backgroundColor: NAVY } : {}),
                    }}
                  >
                    <span
                      className={`grid size-[34%] place-items-center rounded-full transition-colors duration-300 ${current ? "bg-white/20" : "text-white"}`}
                      style={current ? {} : { backgroundColor: NAVY }}
                    >
                      <Icon className="size-[55%]" strokeWidth={1.9} aria-hidden="true" />
                    </span>
                    <span className="text-[clamp(0.6rem,2.6cqw,0.8rem)] font-bold leading-tight">
                      {label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="row-start-1 text-center lg:col-start-2 lg:self-end lg:text-left"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#178AA0] sm:text-sm">
              Find your match
            </p>
            <h2
              id="match-title"
              className="mt-3 text-[clamp(2rem,4vw,3.4rem)] font-black leading-[1.05] tracking-tight text-primary"
            >
              What does your smile need?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base text-slate-600 sm:text-lg lg:mx-0">
              Choose a need around the circle to see the toothpaste and mouthwash made for it.
            </p>
          </motion.div>

          {/* The need's pair, in words */}
          <div className="relative z-10 row-start-3 text-center lg:col-start-2 lg:row-start-2 lg:self-start lg:text-left">
            <div aria-live="polite" className="lg:min-h-[22rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={need.id}
                  variants={words}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  <motion.h3
                    variants={line}
                    className="flex items-center justify-center gap-3 lg:justify-start"
                  >
                    <span
                      className="grid size-11 place-items-center rounded-2xl text-white shadow-[0_12px_24px_-12px_rgba(15,40,80,0.7)]"
                      style={{ backgroundColor: NAVY }}
                    >
                      <NeedIcon className="size-5" strokeWidth={1.9} aria-hidden="true" />
                    </span>
                    <span className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
                      {/^for /i.test(need.label) ? need.label : `For ${need.label.toLowerCase()}`}
                    </span>
                  </motion.h3>
                  <ul className="mx-auto mt-5 flex max-w-lg flex-col gap-3 lg:mx-0">
                    <PickRow product={need.toothpaste.product} why={need.toothpaste.why} />
                    <PickRow product={need.mouthwash.product} why={need.mouthwash.why} />
                  </ul>
                  <motion.p
                    variants={line}
                    className="mx-auto mt-4 max-w-lg text-sm text-slate-600 lg:mx-0"
                  >
                    {need.note && (
                      <span className="mr-1 font-semibold text-primary">{need.note}</span>
                    )}
                    Suggestions only: for lasting problems, see your dentist.
                  </motion.p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
