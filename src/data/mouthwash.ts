// data/mouthwash.ts
//
// The Totalflux mouthwash range: each mouthwash's heading, group, description and key
// ingredients, worded as the website content audit of 17 October 2026 recommends (checked
// against Totalflux's Scientific Detailer and Training Manual), its ingredient list from the
// product booklet ("Booklet Updated Design"), a cut-out photo of
// the bottle (WebP copies of the supplied product renders, trimmed to the bottle) and its
// colours, which are only ever the label's own (the "Hexa Codes" sheet: three per label).
import type { LucideIcon } from "lucide-react";
import {
  Candy,
  Droplet,
  Flower2,
  Leaf,
  ShieldCheck,
  ShieldPlus,
  Sprout,
  ThermometerSnowflake,
  TreePine,
  Wind,
} from "lucide-react";

export type MouthwashGroup = "alcohol-based" | "alcohol-free" | "medicinal";

export type Mouthwash = {
  id: string;
  name: string;
  /** Printed next to the name where two share it, e.g. "No Alcohol" for the alcohol-free Turmeric. */
  variant?: string;
  /** Its heading in the range section, e.g. "Cool mint freshness". */
  benefit: string;
  /** Kept off the site, and why. */
  hidden?: string;
  group: MouthwashGroup;
  /** Its description; a lead before the first ": " is shown in bold, as the booklet does. */
  description: string;
  /** Its key ingredients (with strengths where known), around the bottle. */
  highlights: { label: string; icon: LucideIcon }[];
  /** As printed in the booklet (none is given for Chlorhexidine). */
  ingredients?: string;
  image: { src: string; width: number; height: number };
  /** The name as lettered on the pack (a transparent WebP), shown in place of the typed name. */
  wordmark?: { src: string; width: number; height: number };
  /**
   * Both from the label's three colours on the "Hexa Codes" sheet. liquid: the one nearest
   * the liquid's colour (for glows); ink: the most readable one, for its name tag (white text
   * on it) and as text on the page.
   */
  colors: { liquid: string; ink: string };
};

const BOTTLE = { width: 388, height: 1000 };

/**
 * In the hero's order, left to right: the liquid colours alternate and mirror each other about
 * Kidoos in the middle. The range section groups them (alcohol-based, medicinal, alcohol-free)
 * in this same order.
 */
const ALL_MOUTHWASHES: Mouthwash[] = [
  {
    id: "mintfresh",
    name: "Mintfresh",
    benefit: "Cool mint freshness",
    group: "alcohol-based",
    description:
      "A classic rinse with a blend of eucalyptus, thyme, peppermint and wintergreen oils, for a cool, fresh feel after brushing.",
    highlights: [
      { label: "Eucalyptus", icon: Leaf },
      { label: "Thyme", icon: Sprout },
      { label: "Peppermint", icon: Wind },
      { label: "Wintergreen", icon: TreePine },
    ],
    ingredients:
      "Aqua, Alcohol, Sorbitol, PEG-40 Hydrogenated Castor Oil, Flavour, Poloxamer 407, Sodium Benzoate, Eucalyptus Oil, Thyme Oil, Benzoic Acid, Sodium Saccharin, Peppermint Oil, Wintergreen Oil, CI 42053.",
    image: { src: "/mouthwash-mintfresh.webp", ...BOTTLE },
    // Label: #006ea2, #1cb0ff, #5bcff1
    colors: { liquid: "#5bcff1", ink: "#006ea2" },
  },
  {
    // The bottle with the "Detox" badge; the alcohol-free Turmeric ("No Alcohol") is further on
    id: "turmeric",
    name: "Turmeric",
    benefit: "Turmeric & clove",
    group: "alcohol-based",
    description:
      "A rinse with turmeric oil and clove oil, for those who enjoy a traditional flavour.",
    highlights: [
      { label: "Turmeric Oil", icon: Droplet },
      { label: "Clove Oil", icon: Flower2 },
    ],
    ingredients:
      "Aqua, Alcohol, Sorbitol, PEG-40 Hydrogenated Castor Oil, Poloxamer 407, Sodium Benzoate, Turmeric Oil, Benzoic Acid, Flavour, Sodium Saccharin, Clove Oil, Caramel.",
    image: { src: "/mouthwash-turmeric.webp", ...BOTTLE },
    // Label: #d08804, #00a049, #eee07f (ink: the label's green, a shade deeper so white text on
    // it, and it as text on the page, read clearly: at least 4.5:1)
    colors: { liquid: "#eee07f", ink: "#007c39" },
  },
  {
    id: "sensitive",
    name: "Sensitive",
    benefit: "For sensitive teeth",
    group: "alcohol-free",
    description:
      "Gentle on sensitive teeth: a rinse with potassium nitrate, fluoride and clove oil. Use it alongside Totalflux Sensitive toothpaste, not instead of it, to reach areas a brush can miss. Relief builds over 2–4 weeks.",
    highlights: [
      { label: "Potassium Nitrate", icon: ThermometerSnowflake },
      { label: "Sodium Fluoride", icon: ShieldCheck },
      { label: "Clove Oil", icon: Flower2 },
    ],
    ingredients:
      "Aqua, Sorbitol, Potassium Nitrate, PEG-40 Hydrogenated Castor Oil, Flavour, Poloxamer 407, Sodium Benzoate, Clove Oil, Sodium Fluoride, Sodium Saccharin, CI 42090.",
    image: { src: "/mouthwash-sensitive.webp", ...BOTTLE },
    // Label: #06b4e2, #db434b, #59d2eb (ink: the label's red, a shade deeper to read clearly)
    colors: { liquid: "#59d2eb", ink: "#d02831" },
  },
  {
    id: "kidoos",
    name: "Kidoos",
    benefit: "Made for kids 6+",
    group: "alcohol-free",
    description:
      "A strawberry-flavoured rinse with 226 ppm fluoride, for children aged 6 and over who can rinse and spit without swallowing. If your drinking water is high in fluoride, ask your dentist before adding a fluoride rinse.",
    highlights: [
      { label: "Fluoride 226 ppm", icon: ShieldCheck },
      { label: "Strawberry flavour", icon: Candy },
    ],
    ingredients:
      "Aqua, Sorbitol, Poloxamer 407, Sodium Benzoate, Sodium Saccharin, Flavour, Peppermint Oil, PEG-40 Hydrogenated Castor Oil, Sodium Fluoride, CI 16255.",
    image: { src: "/mouthwash-kidoos.webp", ...BOTTLE },
    wordmark: { src: "/wordmark-kidoos-mouthwash.webp", width: 1006, height: 330 },
    // Label: #3eb6f4, #f160af, #8ccbff (ink: the label's pink, a shade deeper to read clearly)
    colors: { liquid: "#f160af", ink: "#d1127a" },
  },
  {
    id: "neem",
    name: "Neem",
    benefit: "Traditional neem",
    group: "alcohol-free",
    description:
      "A daily rinse with 0.05% CPC (cetylpyridinium chloride) and 226 ppm fluoride, with neem, clove and peppermint oils for a traditional flavour.",
    highlights: [
      { label: "CPC 0.05%", icon: ShieldPlus },
      { label: "Sodium Fluoride 226 ppm", icon: ShieldCheck },
      { label: "Neem Oil", icon: Leaf },
    ],
    ingredients:
      "Aqua, Sorbitol, PEG-40 Hydrogenated Castor Oil, Poloxamer 407, Sodium Benzoate, Potassium Sorbate, Azadirachta Indica Oil, Eugenia Caryophyllus Oil, Mentha Piperita Oil, Sodium Fluoride, Cetylpyridinium Chloride, Sodium Saccharin, CI 15985, CI 42090, Citric Acid.",
    image: { src: "/mouthwash-neem.webp", ...BOTTLE },
    // Label: #0b9131, #007843, #6eb343
    colors: { liquid: "#6eb343", ink: "#007843" },
  },
  {
    id: "turmeric-no-alcohol",
    name: "Turmeric",
    variant: "No Alcohol",
    benefit: "Turmeric & clove, with fluoride",
    group: "alcohol-free",
    description:
      "A daily rinse with 0.05% CPC (cetylpyridinium chloride) and 226 ppm fluoride, with turmeric and clove oils for a traditional flavour.",
    highlights: [
      { label: "CPC 0.05%", icon: ShieldPlus },
      { label: "Sodium Fluoride 226 ppm", icon: ShieldCheck },
      { label: "Turmeric Oil", icon: Droplet },
    ],
    ingredients:
      "Aqua, Sorbitol, PEG-40 Hydrogenated Castor Oil, Flavour, Poloxamer 407, Sodium Benzoate, Potassium Sorbate, Curcuma Longa Oil, Eugenia Caryophyllus Oil, Sodium Fluoride, Cetylpyridinium Chloride, Sodium Saccharin, Caramel, Citric Acid.",
    image: { src: "/mouthwash-turmeric-no-alcohol.webp", ...BOTTLE },
    // Label: #df9803, #4a5423, #e9d816
    colors: { liquid: "#e9d816", ink: "#4a5423" },
  },
  {
    id: "chlorhexidine",
    name: "Chlorhexidine",
    benefit: "",
    // Held back (audit MW-08, Q-01): a medicated product outside the cosmetic licence. Its
    // claims are removed; if Regulatory and Legal approve it, add only its label-approved
    // indications and "Use only as directed by your dentist or doctor."
    hidden: "Awaiting Regulatory and Legal (audit Q-01)",
    group: "medicinal",
    description: "",
    highlights: [],
    image: { src: "/mouthwash-chlorhexidine.webp", ...BOTTLE },
    // Label: #00a4ef, #ee0800, #59d2fd (ink: the bottle's blue, as asked, over the red)
    colors: { liquid: "#59d2fd", ink: "#00a4ef" },
  },
];

/** The mouthwashes on the site: every one not held back. */
export const MOUTHWASHES = ALL_MOUTHWASHES.filter((mouthwash) => !mouthwash.hidden);

/** The mouthwash's full name, e.g. "Turmeric No Alcohol". */
export const fullName = (mouthwash: Mouthwash) =>
  mouthwash.variant ? `${mouthwash.name} ${mouthwash.variant}` : mouthwash.name;

/**
 * The groups, as the booklet sets them out. accent: the colour of the booklet's band over the
 * group (for small marks, not text); note: printed with the group in the booklet.
 */
const ALL_GROUPS: { id: MouthwashGroup; label: string; accent: string; note?: string }[] = [
  { id: "alcohol-based", label: "Alcohol-based", accent: "#375A8C" },
  {
    id: "alcohol-free",
    label: "Alcohol-free",
    accent: "#4FA3CF",
    note: "250 ppm maximum available fluoride",
  },
  { id: "medicinal", label: "Medicinal", accent: "#D7263D" },
];

/** The groups with a mouthwash on the site (no "Medicinal" while Chlorhexidine is held back). */
export const MOUTHWASH_GROUPS = ALL_GROUPS.filter((group) =>
  MOUTHWASHES.some((mouthwash) => mouthwash.group === group.id),
);
