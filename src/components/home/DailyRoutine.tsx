// components/home/DailyRoutine.tsx
import { Link } from "@tanstack/react-router";
import { motion, MotionConfig } from "motion/react";
import { ArrowRight } from "lucide-react";
import { ROUTINE } from "@/data/home";

const EASE = [0.22, 1, 0.36, 1] as const;
const NAVY = "#24467A";

/** Where the section's background ends, for the next section to start from. */
export const ROUTINE_END = "#E4EFF8";

/** How each product leans in its circle (degrees). */
const LEAN = [-8, 6, 0];

/** The line joining the steps, through the three circles' middles. */
const LINE = "M0 50 C 100 0, 200 100, 300 50 S 500 0, 600 50";

/**
 * The daily routine in three steps (brush and scrape, brush with your toothpaste, rinse), each
 * product in a glass circle with a slowly turning dashed ring, joined by a line running from
 * the Oralbrush through the toothpaste to the mouthwash (wide screens; phones stack the steps).
 * Each step links to its range. topColor: the colour above it, which its background starts from.
 */
export function DailyRoutine({ topColor }: { topColor: string }) {
  return (
    <MotionConfig reducedMotion="user">
      <section
        id="routine"
        aria-labelledby="routine-title"
        className="relative overflow-hidden px-5 pb-24 pt-16 sm:px-8 lg:px-12"
        style={{ background: `linear-gradient(180deg, ${topColor} 0%, ${ROUTINE_END} 100%)` }}
      >
        <div className="mx-auto max-w-[90rem] [--circle:14rem]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#178AA0] sm:text-sm">
              Your daily routine
            </p>
            <h2
              id="routine-title"
              className="mt-3 text-[clamp(2rem,4vw,3.4rem)] font-black leading-[1.05] tracking-tight text-primary"
            >
              Brush. Paste. Rinse.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
              Three steps, morning and night, for complete care of teeth, gums and tongue.
            </p>
          </motion.div>

          <div className="relative mt-14">
            {/* The line joining the steps (wide screens), through the circles' middles */}
            <svg
              aria-hidden="true"
              viewBox="0 0 600 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute left-[16.67%] top-[calc(var(--circle)/2_-_3rem)] hidden h-24 w-[66.66%] overflow-visible lg:block"
            >
              <path
                d={LINE}
                fill="none"
                stroke="url(#routine-line)"
                strokeWidth="3"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <defs>
                <linearGradient id="routine-line" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#178AA0" />
                  <stop offset="1" stopColor={NAVY} />
                </linearGradient>
              </defs>
            </svg>

            <ol className="relative grid gap-14 lg:grid-cols-3 lg:gap-8">
              {ROUTINE.map(({ step, title, text, product, link }, i) => (
                <motion.li
                  key={step}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.8, delay: i * 0.15, ease: EASE }}
                  className="group flex flex-col items-center text-center"
                >
                  {/* The product in its glass circle */}
                  <div className="relative size-[var(--circle)]">
                    <div className="absolute inset-0 rounded-full border border-white/85 bg-white/45 shadow-[inset_0_2px_14px_rgba(255,255,255,0.9),0_24px_50px_-28px_rgba(20,60,120,0.5)] backdrop-blur-md" />
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 100 100"
                      className="absolute -inset-3 size-[calc(100%_+_1.5rem)] motion-safe:animate-[spin_50s_linear_infinite]"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke={product.ink}
                        strokeOpacity="0.4"
                        strokeWidth="0.5"
                        strokeDasharray="1.5 2.5"
                      />
                      <circle cx="50" cy="2" r="1.3" fill={product.ink} />
                    </svg>
                    <img
                      src={product.image.src}
                      width={product.image.width}
                      height={product.image.height}
                      alt={`Totalflux ${product.name}${product.kind === "Oralbrush" ? "" : ` ${product.kind.toLowerCase()}`}`}
                      loading="lazy"
                      draggable={false}
                      className="absolute left-1/2 top-1/2 h-[78%] w-auto -translate-x-1/2 -translate-y-1/2 select-none object-contain drop-shadow-[0_18px_18px_rgba(20,50,90,0.28)] transition-transform duration-500 ease-out group-hover:-translate-y-[54%]"
                      style={{
                        rotate: `${LEAN[i] ?? 0}deg`,
                        aspectRatio: `${product.image.width} / ${product.image.height}`,
                      }}
                    />
                    <span
                      className="absolute -left-1 top-3 grid size-11 place-items-center rounded-full font-mono text-sm font-bold text-white shadow-[0_10px_20px_-10px_rgba(15,40,80,0.7)]"
                      style={{ backgroundColor: NAVY }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-[#178AA0]">
                    {step}
                  </p>
                  <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-primary">
                    {title}
                  </h3>
                  <p className="mt-2 max-w-xs text-[0.95rem] leading-7 text-slate-600">{text}</p>
                  <Link
                    to={product.to}
                    className="mt-4 inline-flex items-center gap-2 rounded-full px-1 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ color: product.ink }}
                  >
                    {link}
                    <ArrowRight
                      className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
