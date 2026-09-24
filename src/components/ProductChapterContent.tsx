// components/ProductChapterContent.tsx
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { chapterIndexFor, localProgressFor, type ProductRange } from "@/lib/showcase-layout";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ProductChapterContent({ range, scrollYProgress }: { range: ProductRange; scrollYProgress: MotionValue<number> }) {
  const { product } = range;
  const N = product.features.length;
  const [activeFeature, setActiveFeature] = useState(0);

  const localProgress = useTransform(scrollYProgress, (p) => localProgressFor(range, p));

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = chapterIndexFor(range, p);
    setActiveFeature((prev) => (prev === i ? prev : i));
  });

  const feature = product.features[activeFeature]!;

  const jumpTo = (i: number) => {
    const el = document.documentElement;
    const totalScrollable = el.scrollHeight - window.innerHeight;
    const targetGlobalP = range.rangeStart + ((i + 0.5) / N) * range.spinStart * (range.rangeEnd - range.rangeStart);
    window.scrollTo({ top: targetGlobalP * totalScrollable, behavior: "smooth" });
  };

  return (
    <div className="sticky h-screen overflow-hidden bg-[#f4f5f2]" style={{ top: "var(--nav-h)" }}>
      <div className="pointer-events-none absolute inset-6 z-20 sm:inset-10">
        {["left-0 top-0 border-l-2 border-t-2", "right-0 top-0 border-r-2 border-t-2", "left-0 bottom-0 border-l-2 border-b-2", "right-0 bottom-0 border-r-2 border-b-2"].map((pos) => (
          <div key={pos} className={`absolute h-6 w-6 ${pos}`} style={{ borderColor: product.accent }} />
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(${product.accent} 1px, transparent 1px), linear-gradient(90deg, ${product.accent} 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />

      <div className="absolute left-6 top-6 z-20 font-mono text-xs tracking-wider text-neutral-500 sm:left-10 sm:top-10">
        <span style={{ color: product.accent }}>{String(activeFeature + 1).padStart(2, "0")}</span> / {String(N).padStart(2, "0")}
      </div>
      <motion.div style={{ scaleX: localProgress, backgroundColor: product.accent }} className="absolute left-0 top-0 z-20 h-[2px] w-full origin-left opacity-40" />

      <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[90rem] items-center justify-end px-8 lg:px-16">
        <div className="w-[420px] text-right">
          <AnimatePresence mode="wait">
            <motion.div key={feature.headline} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.45, ease: EASE }}>
              <p className="mb-2 font-mono text-xs uppercase tracking-[0.25em] text-neutral-400">{product.name}</p>
              <h2 className="text-[clamp(2.5rem,4.2vw,3.75rem)] font-extrabold leading-[1.02] text-neutral-900" style={{ fontFeatureSettings: '"ss01"' }}>
                {feature.headline}
              </h2>
              <div className="mt-3 h-px w-16 self-end" style={{ backgroundColor: product.accent, marginLeft: "auto" }} />
              <p className="mt-4 max-w-sm text-[15px] leading-7 text-neutral-600">{feature.body}</p>
              <p className="mt-4 font-mono text-xs font-semibold tracking-wide" style={{ color: product.accent }}>{feature.label}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <nav className="pointer-events-auto absolute bottom-10 left-6 z-20 flex flex-col gap-2 sm:left-10">
        {product.features.map((f, i) => (
          <button key={f.headline} onClick={() => jumpTo(i)} className="group flex items-center gap-3 text-left" aria-current={i === activeFeature}>
            <span className="font-mono text-xs transition-colors" style={{ color: i === activeFeature ? product.accent : "#a3a3a3" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-sm font-medium transition-colors" style={{ color: i === activeFeature ? "#171717" : "#a3a3a3" }}>{f.headline}</span>
            <span className="h-px transition-all duration-300" style={{ width: i === activeFeature ? "24px" : "0px", backgroundColor: product.accent }} />
          </button>
        ))}
      </nav>
    </div>
  );
}