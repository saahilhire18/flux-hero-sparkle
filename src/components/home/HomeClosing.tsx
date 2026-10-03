// components/home/HomeClosing.tsx
import { motion, MotionConfig } from "motion/react";
import { Mail, Phone, ShoppingBag } from "lucide-react";
import { BrandName } from "@/components/BrandName";
import { PROMISES } from "@/data/home";
import { AMAZON_STORE, EXTERNAL } from "@/data/links";

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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative mt-14 overflow-hidden rounded-[2.5rem] px-7 py-10 text-white shadow-[0_40px_80px_-40px_rgba(15,40,80,0.7)] sm:px-12 sm:py-12"
            style={{ background: `linear-gradient(120deg, ${NAVY} 0%, #2B5FA0 55%, #178AA0 130%)` }}
          >
            {/* Soft light and rings, like the glass orbit */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute -right-24 -top-24 size-96 rounded-full border border-white/15" />
              <div className="absolute -right-10 -top-10 size-64 rounded-full border border-dashed border-white/20" />
              <div className="absolute -bottom-32 left-1/3 size-[28rem] rounded-full bg-white/10 blur-3xl" />
            </div>
            <div className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/75">
                  Where to buy
                </p>
                <p className="mt-2 text-[clamp(1.7rem,3vw,2.6rem)] font-black leading-tight tracking-tight">
                  Shop <BrandName className="font-bold" /> online.
                </p>
                <p className="mt-2 text-white/80">Find us on our brand store on Amazon India.</p>
              </div>
              <div className="flex flex-col items-center gap-4 lg:items-end">
                <a
                  href={AMAZON_STORE}
                  {...EXTERNAL}
                  className="inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-base font-bold shadow-[0_16px_32px_-14px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#24467A]"
                  style={{ color: NAVY }}
                >
                  <ShoppingBag className="size-5" aria-hidden="true" />
                  Buy on Amazon
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/85">
                  <a
                    href="tel:18005324561"
                    className="inline-flex items-center gap-1.5 hover:text-white"
                  >
                    <Phone className="size-4" aria-hidden="true" />
                    <span className="sr-only">Customer care: </span>1800-532-4561
                  </a>
                  <a
                    href="mailto:info@neovabiogene.com"
                    className="inline-flex items-center gap-1.5 hover:text-white"
                  >
                    <Mail className="size-4" aria-hidden="true" />
                    <span className="sr-only">Email: </span>info@neovabiogene.com
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}
