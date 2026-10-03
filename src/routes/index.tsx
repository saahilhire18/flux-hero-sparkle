// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/Footer";
import { DailyRoutine, ROUTINE_END } from "@/components/home/DailyRoutine";
import { HomeClosing } from "@/components/home/HomeClosing";
import { HOME_HERO_END, HomeHero } from "@/components/home/HomeHero";
import { MatchFinder, MATCH_END } from "@/components/home/MatchFinder";
import { RangeCards, RANGES_END } from "@/components/home/RangeCards";

const DESCRIPTION =
  "Totalflux complete oral care: SLS-free toothpastes, mouthwashes that kill 99.9% of oral germs, and the Oralbrush with a built-in tongue scraper. For every mouth, every age.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Totalflux | Complete Oral Care" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Totalflux | Complete Oral Care" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

// The home page: the hero, then the three ranges (each leading to its page), the daily
// routine, "find your match", and why Totalflux and where to buy. Each section starts from the
// colour the one above ends with, so they run together.
function HomePage() {
  return (
    <>
      <main>
        <HomeHero />
        <RangeCards topColor={HOME_HERO_END} />
        <DailyRoutine topColor={RANGES_END} />
        <MatchFinder topColor={ROUTINE_END} />
        <HomeClosing topColor={MATCH_END} />
      </main>
      <Footer />
    </>
  );
}
