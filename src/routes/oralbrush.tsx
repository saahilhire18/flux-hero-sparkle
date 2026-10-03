// src/routes/oralbrush.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/Footer";
import { OralbrushHero } from "@/components/OralbrushHero";
import { OralbrushTour } from "@/components/OralbrushTour";
import { ORALBRUSH } from "@/data/oralbrush";

const DESCRIPTION = `The Totalflux Oralbrush: ${ORALBRUSH.tagline} Smart bristle design, easy to open, with a gentle tongue scraper built in.`;

export const Route = createFileRoute("/oralbrush")({
  head: () => ({
    meta: [
      { title: "Totalflux Oralbrush | Complete Oral Care" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Totalflux Oralbrush | Complete Oral Care" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OralbrushPage,
});

// The Oralbrush page: the brush and its promise in the hero, then how it works, a feature at
// a time, and the footer.
function OralbrushPage() {
  return (
    <>
      <main>
        <OralbrushHero />
        <OralbrushTour />
      </main>
      <Footer />
    </>
  );
}
