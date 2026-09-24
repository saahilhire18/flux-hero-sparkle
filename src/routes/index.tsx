// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/Hero";
import { FeatureShowcaseSection } from "@/components/FeatureShowcaseSection";
import { AdvanceShowcaseSection } from "@/components/AdvanceShowcaseSection";
import { TOOTHPASTE_SECTIONS } from "@/data/toothpaste-features";
import { ADVANCE_PRODUCT } from "@/data/advance-product";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Totalflux | Complete Oral Care" },
      { name: "description", content: "Discover Totalflux SLS-free toothpastes for healthy smiles, fresh breath, and everyday cavity protection." },
      { property: "og:title", content: "Totalflux | Complete Oral Care" },
      { property: "og:description", content: "SLS-free oral care for every mouth and every age." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <Hero transitionColor={TOOTHPASTE_SECTIONS[0]?.bg ?? "#EAF1FB"} />
      {TOOTHPASTE_SECTIONS.map((product, i) => (
        <FeatureShowcaseSection
          key={product.id}
          product={product}
          nextColor={TOOTHPASTE_SECTIONS[i + 1]?.bg ?? ADVANCE_PRODUCT.bg}
        />
      ))}
      <AdvanceShowcaseSection product={ADVANCE_PRODUCT} />
    </main>
  );
}