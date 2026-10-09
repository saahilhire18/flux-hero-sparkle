// components/MouthwashRange.tsx
import {
  ProductShowcase,
  tint,
  type ShowcaseGroup,
  type ShowcaseItem,
} from "@/components/ProductShowcase";
import { fullName, MOUTHWASHES, MOUTHWASH_GROUPS } from "@/data/mouthwash";

/** The hero's bottom colour: the section starts from it, so the two run together. */
const SEAM_COLOR = "#DCEAF6";

/** The mouthwashes, as the showcase shows them: each stage washed in a pale tint of its liquid. */
const ITEMS: ShowcaseItem[] = MOUTHWASHES.map((mouthwash) => {
  const group = MOUTHWASH_GROUPS.find((each) => each.id === mouthwash.group);
  return {
    id: mouthwash.id,
    name: mouthwash.name,
    variant: mouthwash.variant,
    fullName: fullName(mouthwash),
    family: group && { label: group.label, accent: group.accent },
    benefit: mouthwash.benefit,
    description: mouthwash.description,
    highlights: mouthwash.highlights,
    details: mouthwash.ingredients
      ? { label: "Ingredients", text: mouthwash.ingredients }
      : undefined,
    image: mouthwash.image,
    wordmark: mouthwash.wordmark,
    alt: `Totalflux ${fullName(mouthwash)} mouthwash`,
    colors: {
      glow: mouthwash.colors.liquid,
      ink: mouthwash.colors.ink,
      backdrop: tint(mouthwash.colors.liquid, 0.32),
    },
  };
});

/** The rail lists them by family, as the booklet does. */
const GROUPS: ShowcaseGroup[] = MOUTHWASH_GROUPS.map((group) => ({
  label: group.label,
  ids: MOUTHWASHES.filter((mouthwash) => mouthwash.group === group.id).map(
    (mouthwash) => mouthwash.id,
  ),
}));

/** The section's colour where it ends (the last mouthwash's), for what follows to start from. */
export const RANGE_END_COLOR = ITEMS[ITEMS.length - 1]?.colors.backdrop ?? SEAM_COLOR;

/**
 * The mouthwash range after the hero, one mouthwash at a time (see ProductShowcase): each
 * bottle on a glass podium in the orbit, its key actives around it, its family, benefit,
 * description and ingredients beside it. The hero's bottles and the rail glide here.
 */
export function MouthwashRange() {
  return (
    <ProductShowcase
      items={ITEMS}
      groups={GROUPS}
      pose="stand"
      id="range"
      title="The mouthwash range"
      seamColor={SEAM_COLOR}
    />
  );
}
