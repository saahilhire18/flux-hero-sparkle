// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Candy, FlaskConicalOff, ThermometerSnowflake } from "lucide-react";
import { BrandName } from "@/components/BrandName";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { ToothShield } from "@/components/icons/Tooth";
import { KidoosSection } from "@/components/KidoosSection";
import { OralHealthSection } from "@/components/OralHealthSection";
import { ToothpasteRange, TOOTHPASTE_RANGE_END_COLOR } from "@/components/ToothpasteRange";
import type { OrbitItem } from "@/components/Orbit";

// Where the hero and the range meet: the hero fades into this, and the range's background
// starts from it before blending into each product's colour, so there is no seam.
const SEAM_COLOR = "#E7EFF8";

/** Where the Kidoos section ends, which the closing section starts from. */
const KIDOOS_END_COLOR = "#F4F6FF";

/** What the whole toothpaste range promises, around the closing section's figure. */
const TOOTHPASTE_PROMISES: OrbitItem[] = [
  { label: "SLS Free, Every Tube", icon: FlaskConicalOff, color: "#2B6CB0" },
  { label: "Cavity Protection", icon: ToothShield, color: "#178AA0" },
  { label: "Sensitivity Relief", icon: ThermometerSnowflake, color: "#2E8B57" },
  { label: "Strawberry Bliss for Kids", icon: Candy, color: "#B83B72" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Totalflux | Complete Oral Care" },
      {
        name: "description",
        content:
          "Discover Totalflux SLS-free toothpastes for healthy smiles, fresh breath, and everyday cavity protection.",
      },
      { property: "og:title", content: "Totalflux | Complete Oral Care" },
      { property: "og:description", content: "SLS-free oral care for every mouth and every age." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// The home page (the toothpaste page): the hero steps through the range as you scroll (see
// Hero), then the adult toothpastes take the stage one at a time (Advance, Sensitive,
// Essential), then the Kidoos, then why oral health matters. Clicking a tube in the hero goes
// straight to its product.
function Index() {
  return (
    <main>
      <Hero transitionColor={SEAM_COLOR} />
      {/* Target of the hero's "Explore Our Range" button and the navbar's "Toothpaste" link */}
      <div id="toothpaste">
        <ToothpasteRange seamColor={SEAM_COLOR} />
        {/* Starts from Essential's colour, where the range above ends */}
        <KidoosSection topColor={TOOTHPASTE_RANGE_END_COLOR} />
      </div>
      <OralHealthSection
        topColor={KIDOOS_END_COLOR}
        promises={TOOTHPASTE_PROMISES}
        closing={
          <>
            Your journey to a better smile: the <BrandName className="font-bold text-primary" />{" "}
            toothpaste range.
          </>
        }
      />
      <Footer />
    </main>
  );
}
