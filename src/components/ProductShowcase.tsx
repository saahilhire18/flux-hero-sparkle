// components/ProductShowcase.tsx
import { lazy, Suspense, useRef, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { MotionConfig, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";

import { PRODUCTS } from "@/data/products";

const ScrollProductScene = lazy(() => import("./ScrollProductScene"));

const EASE = [0.22, 1, 0.36, 1] as const;

export function ProductShowcase() {
  const showcaseRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: showcaseRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 24,
    mass: 0.65,
  });

  useMotionValueEvent(smoothProgress, "change", (progress) => {
    const productCount = PRODUCTS.length;
    if (productCount === 0) return;

    const index = Math.min(productCount - 1, Math.floor(progress * productCount));
    setActiveIndex((current) => (current === index ? current : index));
  });

  const chapterProgress = useTransform(smoothProgress, (progress) => {
    if (progress >= 1) return 1;
    if (progress <= 0) return 0;

    const chapterSize = 1 / PRODUCTS.length;
    const raw = progress / chapterSize;
    return raw - Math.floor(raw);
  });

  const product = PRODUCTS[activeIndex] ?? PRODUCTS[0];
  if (!product) return null;

  return (
    <MotionConfig reducedMotion="never">
      <section ref={showcaseRef} id="toothpaste" className="relative h-[500vh] w-full">
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="relative mx-auto h-full w-full max-w-[1600px]">
            <div className="absolute inset-0 z-20">
              <ClientOnly fallback={null}>
                <Suspense fallback={null}>
                  <ScrollProductScene products={PRODUCTS} activeIndex={activeIndex} rotation={chapterProgress} />
                </Suspense>
              </ClientOnly>
            </div>

            <div className="pointer-events-none absolute inset-0 z-30">
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -35 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="absolute left-[8%] top-1/2 w-[360px] -translate-y-1/2"
              >
                <div className="mb-5 h-1 w-12 rounded-full" style={{ backgroundColor: product.accent }} />
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: product.accent }}>
                  {product.subtitle}
                </p>
                <h2 className="text-5xl font-extrabold leading-[1.05] text-primary">{product.name}</h2>
                <p className="mt-6 max-w-[340px] text-base leading-7 text-muted-foreground">{product.description}</p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {product.callouts.map((callout) => (
                    <div key={`${product.id}-${callout.value}`} className="rounded-full border border-black/10 bg-white/70 px-4 py-2 backdrop-blur-md">
                      <span className="mr-2 text-xs text-muted-foreground">{callout.label}</span>
                      <span className="text-sm font-semibold text-primary">{callout.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <div className="absolute right-[6%] top-1/2 flex -translate-y-1/2 flex-col gap-3">
                {PRODUCTS.map((item, index) => (
                  <div key={item.id} className="h-8 w-[2px] overflow-hidden bg-black/10">
                    <motion.div
                      className="h-full w-full origin-top"
                      animate={{ scaleY: activeIndex === index ? 1 : 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      style={{ backgroundColor: item.accent }}
                    />
                  </div>
                ))}
              </div>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Scroll to explore</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}