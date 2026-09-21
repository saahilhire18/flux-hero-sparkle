import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Leaf, ShieldCheck, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FeatureBadge } from "@/components/FeatureBadge";
import { Navbar } from "@/components/Navbar";

const ProductScene = lazy(() => import("@/components/ProductScene"));

function ProductSkeleton() {
  return (
    <div className="flex h-full min-h-[22rem] items-end justify-center pb-8" aria-label="Loading product showcase">
      <div className="relative flex h-72 w-full max-w-xl items-end justify-center gap-3">
        {["h-44", "h-52", "h-56", "h-38", "h-36"].map((height, index) => (
          <Skeleton key={height + index} className={`${height} w-14 rounded-[1.5rem] bg-primary/8`} />
        ))}
        <Skeleton className="absolute bottom-0 h-12 w-4/5 rounded-[50%] bg-primary/8" />
      </div>
    </div>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] as const } },
};

export function Hero() {
  return (
    <main id="top" className="hero-surface relative min-h-screen overflow-hidden">
      <Navbar />
      <div aria-hidden="true" className="hero-ray absolute inset-0" />
      <div aria-hidden="true" className="hero-ring absolute right-[-12rem] top-[15%] size-[44rem] rounded-full lg:right-[-4rem]" />
      <div aria-hidden="true" className="foliage-shadow absolute -right-14 -top-20 h-80 w-96" />

      <section className="relative z-10 mx-auto grid min-h-screen max-w-[90rem] grid-cols-1 items-center gap-0 px-5 pb-8 pt-28 sm:px-8 lg:grid-cols-[44%_56%] lg:px-12 lg:pb-0 lg:pt-20">
        <motion.div variants={container} initial="hidden" animate="show" className="z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.p variants={item} className="mb-5 text-[0.7rem] font-semibold tracking-[0.25em] text-accent sm:text-xs">
            COMPLETE ORAL CARE
          </motion.p>
          <motion.h1 variants={item} className="max-w-2xl text-[clamp(2.75rem,5vw,4.5rem)] font-extrabold leading-[1.03] tracking-[0] text-primary">
            Healthy Smile<br />Happier You
          </motion.h1>
          <motion.p variants={item} className="mt-6 max-w-[26rem] text-base leading-7 text-muted-foreground sm:text-lg">
            A range of SLS free toothpastes for every mouth, every age.
          </motion.p>
          <motion.div variants={item} className="mt-8 flex items-start justify-center gap-1 sm:gap-5 lg:justify-start">
            <FeatureBadge icon={Sprout} label="SLS FREE" />
            <FeatureBadge icon={ShieldCheck} label="CAVITY PROTECTION" />
            <FeatureBadge icon={Leaf} label="FRESH BREATH" />
          </motion.div>
          <motion.div variants={item} className="mt-8">
            <Button asChild variant="hero" size="hero">
              <a href="#toothpaste">
                Explore Our Range
                <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }} className="relative h-[23rem] w-full sm:mx-auto sm:h-[31rem] sm:w-4/5 lg:h-[min(74vh,46rem)] lg:w-full" role="img" aria-label="Five Totalflux toothpaste products displayed on a studio podium">
          <ClientOnly fallback={<ProductSkeleton />}>
            <Suspense fallback={<ProductSkeleton />}>
              <ProductScene />
            </Suspense>
          </ClientOnly>
        </motion.div>
      </section>
    </main>
  );
}