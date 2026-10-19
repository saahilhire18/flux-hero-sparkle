// src/routes/mouthwash.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/Footer";
import { MouthwashHero } from "@/components/MouthwashHero";
import { MouthwashRange, RANGE_END_COLOR } from "@/components/MouthwashRange";
import { OralHealthSection } from "@/components/OralHealthSection";
import { WhereToBuySection } from "@/components/WhereToBuy";
import { absoluteUrl } from "@/data/site";
import { usePauseOffscreenAnimations } from "@/hooks/use-pause-offscreen";

const DESCRIPTION =
  "The Totalflux mouthwash range: Mintfresh, Turmeric, Sensitive, Kidoos, Neem and Turmeric No Alcohol. Minty, herbal, sensitive and kids’ formulas, including four alcohol-free rinses with fluoride.";

export const Route = createFileRoute("/mouthwash")({
  head: () => ({
    meta: [
      { title: "Totalflux Mouthwash | Complete Oral Care" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Totalflux Mouthwash | Complete Oral Care" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: absoluteUrl("/mouthwash") },
    ],
    // The address this page lives at, so search engines list it once, under that
    links: [{ rel: "canonical", href: absoluteUrl("/mouthwash") }],
  }),
  component: MouthwashPage,
});

// The mouthwash page, following the product booklet: the whole range in the hero, each
// mouthwash in turn, then why daily oral care matters and the range's promises, where to buy,
// and the footer.
function MouthwashPage() {
  usePauseOffscreenAnimations();
  return (
    <>
      <main id="main" tabIndex={-1} className="outline-none">
        <MouthwashHero />
        <MouthwashRange />
        <OralHealthSection topColor={RANGE_END_COLOR} />
        {/* Starts from the colour the section above ends with */}
        <WhereToBuySection topColor="#DCEAF6" />
      </main>
      <Footer />
    </>
  );
}
