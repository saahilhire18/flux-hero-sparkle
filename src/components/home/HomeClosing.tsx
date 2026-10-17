// components/home/HomeClosing.tsx
import { motion, MotionConfig } from "motion/react";
import { WhereToBuyBand } from "@/components/WhereToBuy";
import { PROMISES } from "@/data/home";

const EASE = [0.22, 1, 0.36, 1] as const;
const NAVY = "#24467A";

/**
 * The home page's close: what every Totalflux product stands for, in glass tiles, then where
 * to buy (the Amazon store) and how to reach the company, on a deep blue glass panel.
 * topColor: the colour above it, which its background starts from.
 */
export function HomeClosing({ topColor }: { topColor: string }) {
  return (
    <MotionConfig reducedMotion="user">
      <section
        id="why-totalflux"
        aria-labelledby="why-title"
        className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 lg:px-12"
        style={{ background: `linear-gradient(180deg, ${topColor} 0%, #E4EEF8 100%)` }}
      >
        <div className="mx-auto max-w-[90rem]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#178AA0] sm:text-sm">
              Why Totalflux
            </p>
            <h2
              id="why-title"
              className="mt-3 text-[clamp(2rem,4vw,3.4rem)] font-black leading-[1.05] tracking-tight text-primary"
            >
              Made for every smile.
            </h2>
          </motion.div>

          {/* The promises */}
          <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {PROMISES.map(({ label, text, icon: Icon }, i) => (
              <motion.li
                key={label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                className="flex flex-col items-center gap-3 rounded-[1.75rem] border border-white/85 bg-white/55 px-4 py-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_40px_-26px_rgba(20,60,120,0.45)] backdrop-blur-md transition-transform duration-300 last:col-span-2 hover:-translate-y-1 md:last:col-span-1"
              >
                <span
                  className="grid size-12 place-items-center rounded-2xl text-white shadow-[0_12px_24px_-12px_rgba(15,40,80,0.6)]"
                  style={{ backgroundColor: NAVY }}
                >
                  <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="text-base font-extrabold text-primary">{label}</span>
                <span className="text-sm leading-snug text-slate-600">{text}</span>
              </motion.li>
            ))}
          </ul>

          {/* Where to buy */}
          <div className="mt-14">
            <WhereToBuyBand />
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
