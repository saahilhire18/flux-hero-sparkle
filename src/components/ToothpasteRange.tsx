// components/ToothpasteRange.tsx
import { ProductShowcase, tint, type ShowcaseItem } from "@/components/ProductShowcase";
import { PRODUCT_PAGES, type ProductPage } from "@/data/product-pages";

/** The adult toothpastes, in the hero's order. */
const PRODUCTS: ProductPage[] = [
  PRODUCT_PAGES.advance,
  PRODUCT_PAGES.sensitive,
  PRODUCT_PAGES.essential,
];

/** The toothpastes, as the showcase shows them (from the product sheets, in product-pages.ts). */
const ITEMS: ShowcaseItem[] = PRODUCTS.map((product) => ({
  id: product.id,
  name: product.name,
  fullName: `Totalflux ${product.name}`,
  family: { label: product.tag, accent: product.colors.brand },
  benefit: product.audience,
  description: product.summary,
  highlights: product.benefits.map(({ title, icon, stat }) => ({ label: title, icon, stat })),
  details: {
    label: "Key actives",
    text: product.actives.map(({ name, amount }) => `${name} ${amount}`).join(" · "),
  },
  image: product.image,
  alt: `Totalflux ${product.name} toothpaste`,
  colors: {
    glow: tint(product.colors.brand, 0.45),
    ink: product.colors.ink,
    backdrop: product.colors.bg,
  },
}));

/** The section's colour where it ends (Essential's), for what follows to start from. */
export const TOOTHPASTE_RANGE_END_COLOR = PRODUCT_PAGES.essential.colors.bg;

/**
 * The adult toothpastes after the hero, one at a time (see ProductShowcase), in the same
 * design as the mouthwash range: each tube floating at a lean in the orbit, its benefits (and
 * strengths) around it, its family, who it's for, what it does and its key actives beside it.
 * The hero's tubes glide here. seamColor: the hero's bottom colour.
 */
export function ToothpasteRange({ seamColor }: { seamColor: string }) {
  return (
    <ProductShowcase
      items={ITEMS}
      pose="float"
      id="range"
      title="The Totalflux toothpaste range"
      seamColor={seamColor}
    />
  );
}
