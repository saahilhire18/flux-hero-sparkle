// components/Hero.tsx
import { lazy, Suspense, useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import {
  motion,
  MotionConfig,
  useScroll,
  useTransform,
} from "motion/react";
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Sprout,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { FeatureBadge } from "@/components/FeatureBadge";
import { HeroRibbon, type StageFraming } from "@/components/HeroRibbon";
import { Navbar } from "@/components/Navbar";

const HeroProductScene = lazy(
  () => import("@/components/ProductScene")
);

const EASE = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},

  show: {
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 20,
  },

  show: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.6,
      ease: EASE,
    },
  },
};

const line = {
  hidden: {
    y: "115%",
  },

  show: {
    y: 0,

    transition: {
      duration: 0.85,
      ease: EASE,
    },
  },
};

const badges = {
  hidden: {},

  show: {
    transition: {
      staggerChildren: 0.13,
      delayChildren: 0.1,
    },
  },
};

const badge = {
  hidden: {
    opacity: 0,
    scale: 0.55,
    y: 16,
  },

  show: {
    opacity: 1,
    scale: 1,
    y: 0,

    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 15,
    },
  },
};

const features = [
  {
    icon: Sprout,
    label: "SLS FREE",
  },

  {
    icon: ShieldCheck,
    label: "CAVITY PROTECTION",
  },

  {
    icon: Leaf,
    label: "FRESH BREATH",
  },
];

/**
 * Frames bg.png so the 3D products appear to stand in the centre of the podium.
 * - scale / originX / originY: bg.png zooms about this point (fractions of the stage
 *   box), chosen so the centre of the podium's top face lands on the products' base
 *   line. The 3D canvas is not scaled. Change `scale` freely, but keep the origin, or
 *   the podium drifts off-centre (recompute it if ProductScene's placement changes).
 * - shiftX: slides the podium AND the products together (fraction of stage width,
 *   negative = left). Desktop only; phones crop the stage around the podium already.
 *   Keep it within ±0.05 at scale 1.2, or the zoomed image stops covering the edge.
 */
const FRAMING: StageFraming = { scale: 1.2, originX: 0.742, originY: 0.581, shiftX: -0.04 };

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return desktop;
}

/**
 * Hero 3D stage.
 *
 * This remains separate from the scroll-driven product showcase.
 */
function Stage() {
  const desktop = useIsDesktop();
  const framing = { ...FRAMING, shiftX: desktop ? FRAMING.shiftX : 0 };
  const shift = `translateX(${framing.shiftX * 100}%)`;

  return (
    <div className="relative h-[101.3vw] w-full overflow-hidden lg:pointer-events-none lg:absolute lg:inset-0 lg:z-0 lg:h-auto">
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 1,
          delay: 0.05,
        }}
        className="absolute left-[-72.4%] top-0 aspect-[1672/941] w-[180%] lg:left-auto lg:right-0 lg:top-auto lg:-bottom-[8vh] lg:w-[max(100%,177.78vh)]"
        role="img"
        aria-label="Five Totalflux toothpaste products displayed on a marble studio podium"
      >
        <img
          src="/bg.png"
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full select-none"
          style={{
            transform: `${shift} scale(${framing.scale})`,
            transformOrigin: `${framing.originX * 100}% ${framing.originY * 100}%`,
          }}
        />

        {/* Paint order inside this box: bg.png → ribbon → 3D products (DOM order). */}
        <HeroRibbon framing={framing} />

        <div className="absolute inset-0" style={{ transform: shift }}>
          <ClientOnly fallback={null}>
            <Suspense fallback={null}>
              <HeroProductScene />
            </Suspense>
          </ClientOnly>
        </div>
      </motion.div>
    </div>
  );
}

// transitionColor: the exact background color the next section opens with.
// Defaults to Essential's bg so nothing breaks if a caller forgets to pass it,
// but index.tsx should pass the real value so this never drifts out of sync
// if the first section's color ever changes.
export function Hero({ transitionColor = "#EAF2FB" }: { transitionColor?: string }) {
  /*
   * Hero text animation based on page scroll.
   */
  const { scrollY } = useScroll();

  const textY = useTransform(
    scrollY,
    [0, 500],
    [0, -70]
  );

  const textOpacity = useTransform(
    scrollY,
    [0, 420],
    [1, 0.15]
  );

  return (
    <MotionConfig reducedMotion="user">
      <main
        id="top"
        className="relative flex min-h-screen flex-col overflow-hidden bg-[#e3eefa]"
      >
        <Navbar />


<section className="pointer-events-none relative z-20 mx-auto flex w-full max-w-[90rem] flex-1 items-center px-5 pb-6 pt-28 sm:px-8 lg:min-h-screen lg:px-12 lg:pb-0 lg:pt-20">
          <motion.div
            style={{
              y: textY,
              opacity: textOpacity,
            }}
            className="pointer-events-auto w-full lg:w-[44%]"
          >
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="flex w-full flex-col items-center text-center lg:items-start lg:text-left"
            >
              {/* Eyebrow */}
              <motion.p
                variants={item}
                className="mb-5 text-[0.7rem] font-semibold tracking-[0.25em] text-accent sm:text-xs"
              >
                COMPLETE ORAL CARE
              </motion.p>

              {/* Heading */}
              <h1 className="max-w-2xl text-[clamp(2.75rem,5vw,4.5rem)] font-extrabold leading-[1.03] tracking-[0] text-primary">
                <span className="block overflow-hidden pb-[0.14em]">
                  <motion.span
                    variants={line}
                    className="block"
                  >
                    Healthy Smile
                  </motion.span>
                </span>

                <span className="block overflow-hidden pb-[0.14em]">
                  <motion.span
                    variants={line}
                    className="block"
                  >
                    Happier You
                  </motion.span>
                </span>
              </h1>

              {/* Description */}
              <motion.p
                variants={item}
                className="mt-6 max-w-[26rem] text-base leading-7 text-muted-foreground sm:text-lg"
              >
                A range of SLS free toothpastes for every
                mouth, every age.
              </motion.p>

              {/* Feature badges */}
              <motion.div
                variants={item}
                className="mt-8"
              >
                <motion.div
                  variants={badges}
                  className="flex items-start justify-center gap-1 sm:gap-5 lg:justify-start"
                >
                  {features.map((feature) => (
                    <motion.div
                      key={feature.label}
                      variants={badge}
                      whileHover={{
                        y: -6,
                        rotate: -2,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 14,
                        },
                      }}
                    >
                      <FeatureBadge
                        icon={feature.icon}
                        label={feature.label}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* CTA */}
              <motion.div
                variants={item}
                className="mt-8"
              >
                <motion.div
                  whileHover={{
                    scale: 1.04,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 20,
                  }}
                >
                  <Button
                    asChild
                    variant="hero"
                    size="hero"
                    className="btn-shine"
                  >
                    <a href="#toothpaste">
                      Explore Our Range

                      <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
                    </a>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Existing hero podium */}
        <Stage />

        {/* Blend zone: fades the marble into the next section's exact background color,
            so the boundary between Hero and FeatureShowcaseSection reads as one continuous
            scene instead of a hard cut. Sits above Stage (z-10), decorative only. */}
// components/Hero.tsx — replace the gradient div at the very bottom with this

{/* Blend zone: fades the marble into the next section's background color.
    Constrained to the RIGHT side only (matching Stage's lg:right-0 positioning)
    so it can never overlap the text column / badges / CTA on the left, at any
    screen height. Full-width was the actual bug — height alone couldn't fix it. */}
// components/Hero.tsx — replace the single radial gradient div with these two, stacked

{/* Full-width fade — covers the ENTIRE bottom edge so every part of the boundary
    (leaves on the left, podium on the right) blends into the next section,
    not just the podium side. */}
<div
  className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[35vh]"
  style={{
    background: `linear-gradient(to bottom, transparent, ${transitionColor}66 40%, ${transitionColor} 100%)`,
  }}
  aria-hidden="true"
/>

{/* Extra radial boost right at the podium base, layered on top, so that spot
    (which has the most visual weight/shadow) fades a little more decisively
    than the flatter areas either side of it. */}
<div
  className="pointer-events-none absolute inset-0 z-10"
  style={{
    background: `radial-gradient(ellipse 60% 40% at 78% 100%, ${transitionColor} 0%, transparent 70%)`,
  }}
  aria-hidden="true"
/>
      </main>
    </MotionConfig>
  );
}