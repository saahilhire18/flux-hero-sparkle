// src/routes/toothpaste.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { KidoosSection } from "@/components/KidoosSection";
import { ProductRange } from "@/components/ProductRange";
import { WhereToBuySection } from "@/components/WhereToBuy";
import { PRODUCT_PAGES } from "@/data/product-pages";
import { absoluteUrl } from "@/data/site";
import { usePauseOffscreenAnimations } from "@/hooks/use-pause-offscreen";

const { advance, sensitive, essential } = PRODUCT_PAGES;

// Where the hero and the range meet: the hero fades into this, and the range's background
// starts from it before blending into each product's colour, so there is no seam.
const SEAM_COLOR = "#E7EFF8";

export const Route = createFileRoute("/toothpaste")({
  head: () => ({
    meta: [
      { title: "Totalflux Toothpaste | Complete Oral Care" },
      {
        name: "description",
        content:
          "Five Totalflux SLS-free toothpastes for adults and children aged 3 and up: Advance, Sensitive, Essential, Kidoos Advance and Kidoos Plus.",
      },
      { property: "og:title", content: "Totalflux Toothpaste | Complete Oral Care" },
      {
        property: "og:description",
        content: "Five SLS-free toothpastes for adults and children aged 3 and up.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: absoluteUrl("/toothpaste") },
    ],
    // The address this page lives at, so search engines list it once, under that
    links: [{ rel: "canonical", href: absoluteUrl("/toothpaste") }],
  }),
  component: ToothpastePage,
});

// The toothpaste page: the hero shows the range, one product at a time on hover or click (see
// Hero), then the adult toothpastes' sections (Advance, Sensitive, Essential) on a background
// blending from each one's colour into the next, then the Kidoos. Clicking a tube in the hero
// (on a touch screen, tapping it a second time) scrolls straight to its section.
function ToothpastePage() {
  usePauseOffscreenAnimations();
  return (
    <>
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero transitionColor={SEAM_COLOR} />
        {/* Target of the hero's "Explore the range" button and the navbar's "Toothpaste" link */}
        <div id="toothpaste">
          <ProductRange products={[advance, sensitive, essential]} topColor={SEAM_COLOR} />
          {/* Starts from Essential's colour, where the range above ends */}
          <KidoosSection topColor={essential.colors.bg} />
        </div>
        {/* Starts from the colour the Kidoos section ends with */}
        <WhereToBuySection topColor="#F4F6FF" />
      </main>
      <Footer />
    </>
  );
}
