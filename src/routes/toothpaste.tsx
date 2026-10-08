// src/routes/toothpaste.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { KidoosSection } from "@/components/KidoosSection";
import { ProductRange } from "@/components/ProductRange";
import { PRODUCT_PAGES } from "@/data/product-pages";

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
          "Discover Totalflux SLS-free toothpastes for healthy smiles, fresh breath, and everyday cavity protection.",
      },
      { property: "og:title", content: "Totalflux Toothpaste | Complete Oral Care" },
      { property: "og:description", content: "SLS-free oral care for every mouth and every age." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ToothpastePage,
});

// The toothpaste page: the hero shows the range, one product at a time on hover or click (see
// Hero), then the adult toothpastes' sections (Advance, Sensitive, Essential) on a background
// blending from each one's colour into the next, then the Kidoos. Clicking a tube in the hero
// (on a touch screen, tapping it a second time) scrolls straight to its section.
function ToothpastePage() {
  return (
    <main>
      <Hero transitionColor={SEAM_COLOR} />
      {/* Target of the hero's "Explore Our Range" button and the navbar's "Toothpaste" link */}
      <div id="toothpaste">
        <ProductRange products={[advance, sensitive, essential]} topColor={SEAM_COLOR} />
        {/* Starts from Essential's colour, where the range above ends */}
        <KidoosSection topColor={essential.colors.bg} />
      </div>
      <Footer />
    </main>
  );
}
