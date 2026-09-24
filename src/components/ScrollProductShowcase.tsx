import {
  Suspense,
  lazy,
  useRef,
  useState,
} from "react";

import {
  MotionConfig,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

import { PRODUCTS } from "@/data/products";

const ProductScene = lazy(
  () => import("@/components/ScrollProductScene")
);

const EASE = [0.22, 1, 0.36, 1] as const;

export function ScrollProductShowcase() {
  const showcaseRef = useRef<HTMLElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  /*
   * Track the scroll progress of THIS section only.
   */
  const { scrollYProgress } = useScroll({
    target: showcaseRef,
    offset: ["start start", "end end"],
  });

  /*
   * Smooth the scroll movement.
   */
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 25,
    mass: 0.4,
  });

  /*
   * Decide which product chapter is active.
   *
   * 0.00 - 0.20 → Product 1
   * 0.20 - 0.40 → Product 2
   * 0.40 - 0.60 → Product 3
   * 0.60 - 0.80 → Product 4
   * 0.80 - 1.00 → Product 5
   */
  useMotionValueEvent(
    smoothProgress,
    "change",
    (progress) => {
      const index = Math.min(
        PRODUCTS.length - 1,
        Math.floor(progress * PRODUCTS.length)
      );

      setActiveIndex(index);
    }
  );

  /*
   * Progress inside the current product chapter.
   *
   * Always returns 0 → 1.
   */
  const chapterProgress = useTransform(
    smoothProgress,
    (progress) => {
      if (progress >= 1) {
        return 1;
      }

      const chapterSize = 1 / PRODUCTS.length;

      const rawProgress =
        progress / chapterSize;

      return (
        rawProgress -
        Math.floor(rawProgress)
      );
    }
  );

  /*
   * Convert chapter progress into 0 → 360 degrees.
   */
  const rotationMotionValue = useTransform(
    chapterProgress,
    [0, 1],
    [0, Math.PI * 2]
  );

  /*
   * React state receives the current rotation value
   * and passes it to React Three Fiber.
   */
  const [rotation, setRotation] = useState(0);

  useMotionValueEvent(
    rotationMotionValue,
    "change",
    (value) => {
      setRotation(value);
    }
  );

  /*
   * IMPORTANT:
   *
   * PRODUCTS[activeIndex] can technically be undefined
   * according to TypeScript.
   *
   * The fallback guarantees that product always exists.
   */
  const product =
    PRODUCTS[activeIndex] ?? PRODUCTS[0];

  /*
   * Safety check in case PRODUCTS is accidentally empty.
   */
  if (!product) {
    return null;
  }

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={showcaseRef}
        id="toothpaste"
        className="relative h-[500vh]"
      >
        {/* ============================================
            STICKY VIEWPORT
        ============================================ */}

        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="relative mx-auto h-full w-full max-w-[1600px]">

            {/* ========================================
                3D PRODUCT SCENE
            ======================================== */}

            <div className="absolute inset-0">
              <Suspense fallback={null}>
                <ProductScene
                  products={PRODUCTS}
                  activeIndex={activeIndex}
                  rotation={rotation}
                />
              </Suspense>
            </div>

            {/* ========================================
                INFORMATION OVERLAY
            ======================================== */}

            <div className="pointer-events-none absolute inset-0 z-10">

              {/* Product information */}

              <motion.div
                key={product.id}
                initial={{
                  opacity: 0,
                  x: -40,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.6,
                  ease: EASE,
                }}
                className="absolute left-[8%] top-1/2 w-[360px] -translate-y-1/2"
              >
                {/* Accent line */}

                <div
                  className="mb-5 h-1 w-12 rounded-full"
                  style={{
                    backgroundColor:
                      product.accent,
                  }}
                />

                {/* Subtitle */}

                <p
                  className="mb-4 text-xs font-semibold uppercase tracking-[0.25em]"
                  style={{
                    color: product.accent,
                  }}
                >
                  {product.subtitle}
                </p>

                {/* Product name */}

                <h2 className="text-5xl font-extrabold leading-[1.05] text-primary">
                  {product.name}
                </h2>

                {/* Description */}

                <p className="mt-6 max-w-[340px] text-base leading-7 text-muted-foreground">
                  {product.description}
                </p>

                {/* Product callouts */}

                <div className="mt-8 flex flex-wrap gap-3">
                  {product.callouts.map(
                    (callout) => (
                      <div
                        key={`${product.id}-${callout.value}`}
                        className="rounded-full border border-black/10 bg-white/70 px-4 py-2 backdrop-blur-md"
                      >
                        <span className="mr-2 text-xs text-muted-foreground">
                          {callout.label}
                        </span>

                        <span className="text-sm font-semibold text-primary">
                          {callout.value}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </motion.div>

              {/* ========================================
                  CHAPTER INDICATOR
              ======================================== */}

              <div className="absolute right-[6%] top-1/2 flex -translate-y-1/2 flex-col gap-3">
                {PRODUCTS.map(
                  (item, index) => (
                    <div
                      key={item.id}
                      className="h-8 w-[2px] overflow-hidden bg-black/10"
                    >
                      <motion.div
                        className="h-full w-full origin-top"
                        animate={{
                          scaleY:
                            activeIndex === index
                              ? 1
                              : 0,
                        }}
                        transition={{
                          duration: 0.4,
                          ease: EASE,
                        }}
                        style={{
                          backgroundColor:
                            item.accent,
                        }}
                      />
                    </div>
                  )
                )}
              </div>

              {/* ========================================
                  SCROLL INDICATOR
              ======================================== */}

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Scroll to explore
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}