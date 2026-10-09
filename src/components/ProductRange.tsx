// components/ProductRange.tsx
import { BrandName } from "@/components/BrandName";
import { useRef } from "react";
import { motion, MotionConfig, useScroll, useTransform } from "motion/react";
import type { ProductPage } from "@/data/product-pages";

const EASE = [0.22, 1, 0.36, 1] as const;

const reveal = (delay = 0) =>
  ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.7, delay, ease: EASE },
  }) as const;

/** Where the four benefit circles sit around the tube (% of the visual box), clockwise from top-left. */
const ORBIT_SPOTS = [
  { left: "14%", top: "26%" },
  { left: "86%", top: "26%" },
  { left: "86%", top: "74%" },
  { left: "14%", top: "74%" },
];
/** The dots on the dashed ring (% of the visual box). */
const RING_DOTS = [
  [32, 13],
  [68, 13],
  [91, 50],
  [68, 87],
  [32, 87],
  [9, 50],
];

/**
 * One product: eyebrow, a big gradient heading with depth, the summary and a button on the
 * left; on the right the tube, tilted, over a glass disc inside a dashed orbit, with its four
 * benefits in glass circles around it. As the section scrolls past, the parts move at
 * different speeds (parallax): the tube rises and turns, the circles and the text drift.
 * flip: the tube on the left and the text on the right (stacked sections alternate).
 */
function ProductPanel({ product, flip }: { product: ProductPage; flip: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { colors } = product;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const tubeY = useTransform(scrollYProgress, [0, 1], [90, -90]);
  // Leans away from the text: top to the right when the tube is on the right, left when flipped
  const lean = flip ? -1 : 1;
  const tubeRotate = useTransform(scrollYProgress, [0, 1], [28 * lean, 14 * lean]);
  const discScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 0.9]);
  const orbitY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const textY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const [eyebrowTop, eyebrowBottom] = [product.audience, product.tag];

  return (
    <section
      ref={ref}
      id={product.id}
      aria-labelledby={`${product.id}-title`}
      className="relative flex min-h-svh items-center overflow-hidden py-24"
      style={{ scrollSnapAlign: "start" }}
    >
      {/* Soft light sweeping across the section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 18% 40%, rgba(255,255,255,0.7), transparent 70%)",
        }}
      />

      <div
        className={`relative mx-auto grid w-full max-w-[90rem] items-center gap-12 px-5 sm:px-8 lg:px-12 ${flip ? "lg:grid-cols-[1.1fr_0.9fr]" : "lg:grid-cols-[0.9fr_1.1fr]"}`}
      >
        <motion.div style={{ y: textY, color: colors.ink }} className="text-center lg:text-left">
          <motion.p
            {...reveal(0)}
            className="font-mono text-xs uppercase leading-6 tracking-[0.22em] text-slate-700 sm:text-sm"
          >
            {eyebrowTop}
            <br />– {eyebrowBottom}
          </motion.p>

          {/* Gradient heading with a soft drop for depth */}
          <motion.h2
            id={`${product.id}-title`}
            {...reveal(0.08)}
            className="mt-5 text-[clamp(3rem,6.5vw,6rem)] font-black leading-[0.95] tracking-tight"
          >
            <BrandName className="block text-[0.42em] font-bold tracking-normal text-slate-800" />
            {/* The name as lettered on the pack where we have it; otherwise solid in the
                pack's colour. Either way with a soft shadow for depth */}
            {product.wordmark ? (
              <img
                src={product.wordmark.src}
                width={product.wordmark.width}
                height={product.wordmark.height}
                alt={product.name}
                draggable={false}
                className="mx-auto mt-[0.12em] block h-[0.85em] w-auto max-w-full select-none lg:mx-0"
                style={{ filter: `drop-shadow(0 6px 10px ${colors.ink}40)` }}
              />
            ) : (
              <span style={{ color: colors.ink, filter: `drop-shadow(0 6px 10px ${colors.ink}40)` }}>
                {product.name}
              </span>
            )}
          </motion.h2>

          <motion.p
            {...reveal(0.16)}
            className="mx-auto mt-5 max-w-lg text-base leading-7 text-slate-700 sm:text-lg lg:mx-0"
          >
            {product.summary}
          </motion.p>

          <p className="mt-10 hidden items-center gap-4 font-mono text-xs uppercase tracking-[0.3em] text-slate-600 lg:flex">
            <span className="h-px w-12" style={{ backgroundColor: colors.ink }} />
            Daily Care. Lasting Protection.
          </p>
        </motion.div>

        {/* Tube in its orbit */}
        <div
          className={`relative mx-auto aspect-square w-full max-w-[40rem] ${flip ? "lg:order-first" : ""}`}
        >
          <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
            <motion.div
              style={{
                scale: discScale,
                background: `radial-gradient(circle at 35% 30%, #ffffffcc, ${colors.brand}40 60%, ${colors.brand}26)`,
              }}
              className="size-[46%] rounded-full border border-white/70 shadow-[inset_0_2px_12px_rgba(255,255,255,0.9)] backdrop-blur-md"
            />
          </div>
          {/* The dashed ring and its dots, turning slowly, as on the mouthwash page */}
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            className="absolute inset-0 size-full overflow-visible motion-safe:animate-[spin_70s_linear_infinite]"
          >
            <circle
              cx="50"
              cy="50"
              r="41"
              fill="none"
              stroke={colors.brand}
              strokeWidth="0.35"
              strokeDasharray="1.2 1.6"
              opacity="0.7"
            />
            {RING_DOTS.map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" fill={colors.brand} />
            ))}
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.img
              src={product.image.src}
              width={product.image.width}
              height={product.image.height}
              alt={`Totalflux ${product.name} toothpaste`}
              draggable={false}
              className="h-[82%] w-auto select-none object-contain drop-shadow-[0_34px_40px_rgba(15,40,80,0.3)]"
              style={{ y: tubeY, rotate: tubeRotate }}
            />
          </div>

          <motion.ul style={{ y: orbitY }} className="absolute inset-0">
            {product.benefits.slice(0, 4).map((benefit, i) => {
              const Icon = benefit.icon;
              const spot = ORBIT_SPOTS[i] ?? { left: "50%", top: "50%" };
              return (
                <motion.li
                  key={benefit.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.1, ease: EASE }}
                  className="absolute flex size-[19%] max-w-[7.5rem] flex-col items-center justify-center rounded-full border border-white/80 bg-white/55 px-2 text-center shadow-[0_18px_40px_-22px_rgba(15,40,80,0.4)] backdrop-blur-md"
                  style={{ left: spot.left, top: spot.top, translateX: "-50%", translateY: "-50%" }}
                >
                  <span
                    className="grid size-7 place-items-center rounded-full text-white sm:size-8"
                    style={{ backgroundColor: colors.ink }}
                  >
                    <Icon className="size-3.5 sm:size-4" strokeWidth={1.8} />
                  </span>
                  <span className="mt-1 text-[0.6rem] font-semibold leading-tight text-slate-800 sm:text-[0.7rem]">
                    {benefit.title}
                  </span>
                  {benefit.stat && (
                    <span
                      className="text-[0.7rem] font-bold sm:text-xs"
                      style={{ color: colors.ink }}
                    >
                      {benefit.stat}
                    </span>
                  )}
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

/**
 * The product sections, stacked, on one continuous background whose colour blends from
 * each product's soft tint to the next as you scroll (each is at its own colour mid-section).
 * topColor: what the background starts as, so it continues from what is above.
 */
export function ProductRange({
  products,
  topColor,
}: {
  products: ProductPage[];
  topColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const n = products.length;
  const stops = [0, ...products.map((_, i) => (i + 1) / (n + 1)), 1];
  const first = products[0]?.colors.bg ?? "#D6ECE2";
  const last = products[n - 1]?.colors.bg ?? first;
  const colors = [topColor ?? first, ...products.map((p) => p.colors.bg), last];
  const backgroundColor = useTransform(scrollYProgress, stops, colors);

  return (
    <MotionConfig reducedMotion="user">
      <motion.div ref={ref} className="relative" style={{ backgroundColor }}>
        {/* The top edge always starts at exactly `topColor`, so it joins what is above without a
            line, however far the background has already blended towards the first product */}
        {topColor && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[45vh]"
            style={{ background: `linear-gradient(to bottom, ${topColor} 0%, ${topColor}00 100%)` }}
          />
        )}
        {products.map((product, i) => (
          <ProductPanel key={product.id} product={product} flip={i % 2 === 1} />
        ))}
      </motion.div>
    </MotionConfig>
  );
}
