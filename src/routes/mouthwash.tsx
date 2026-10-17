// src/routes/mouthwash.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/Footer";
import { MouthwashHero } from "@/components/MouthwashHero";
import { MouthwashRange, RANGE_END_COLOR } from "@/components/MouthwashRange";
import { OralHealthSection } from "@/components/OralHealthSection";
import { WhereToBuySection } from "@/components/WhereToBuy";

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
    ],
  }),
  component: MouthwashPage,
});

// The mouthwash page, following the product booklet: the whole range in the hero, each
// mouthwash in turn, then why daily oral care matters and the range's promises, where to buy,
// and the footer.
function MouthwashPage() {
  return (
    <>
      <main>
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
