// data/mouthwash.ts
//
// The Totalflux mouthwash range, from the product booklet ("Booklet Updated Design"): each
// mouthwash's one-line benefit, its group, description and ingredients, a cut-out photo of
// the bottle (WebP copies of public/Mouthwash/*.png, trimmed to the bottle) and its colours.
import type { LucideIcon } from "lucide-react";
import {
  BugOff,
  Candy,
  Droplet,
  Flower2,
  Leaf,
  ShieldCheck,
  ShieldPlus,
  Sparkles,
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
  /** The booklet's heading for it, e.g. "Multi-Protection". */
  benefit: string;
  group: MouthwashGroup;
  /** From the booklet; a lead before the first ": " is shown in bold, as the booklet does. */
  description: string;
  /** Its key actives, from the description and ingredients (for Chlorhexidine, the claims on its pack). */
  highlights: { label: string; icon: LucideIcon }[];
  /** As printed in the booklet (none is given for Chlorhexidine). */
  ingredients?: string;
  image: { src: string; width: number; height: number };
  /**
   * liquid: the liquid's colour, sampled from the photo (for glows);
   * ink: a deep shade of the pack colour, for its name tag (white text reads on it, and it
   * reads as text on the page's pale blue: at least 4.9:1 either way).
   */
  colors: { liquid: string; ink: string };
};

const BOTTLE = { width: 408, height: 1000 };

/**
 * In the hero's order, left to right: the liquid colours alternate and mirror each other about
 * Kidoos in the middle. The range section groups them (alcohol-based, medicinal, alcohol-free)
 * in this same order.
 */
export const MOUTHWASHES: Mouthwash[] = [
  {
    id: "mintfresh",
    name: "Mintfresh",
    benefit: "Multi-Protection",
    group: "alcohol-based",
    description:
      "Comprehensive oral defence: formulated with alcohol and a blend of essential oils (Eucalyptus, Thyme, Peppermint and Wintergreen), it actively kills germs to prevent plaque build-up, tooth decay and gingivitis.",
    highlights: [
      { label: "Eucalyptus", icon: Leaf },
      { label: "Thyme", icon: Sprout },
      { label: "Peppermint", icon: Wind },
      { label: "Wintergreen", icon: TreePine },
    ],
    ingredients:
      "Aqua, Alcohol, Sorbitol, PEG-40 Hydrogenated Castor Oil, Flavour, Poloxamer 407, Sodium Benzoate, Eucalyptus Oil, Thyme Oil, Benzoic Acid, Sodium Saccharin, Peppermint Oil, Wintergreen Oil, CI 42053.",
    image: { src: "/mouthwash-mintfresh.webp", ...BOTTLE },
    colors: { liquid: "#67B6C3", ink: "#1B6A7E" },
  },
  {
    // The bottle with the "Detox" badge; the alcohol-free Turmeric ("No Alcohol") is further on
    id: "turmeric",
    name: "Turmeric",
    benefit: "Natural Detox",
    group: "alcohol-based",
    description:
      "Natural healing and cleansing: infused with Curcumin (Turmeric) and Clove Oil, it uses natural anti-inflammatory properties to cleanse the mouth, heal gum issues and reduce harmful bacteria.",
    highlights: [
      { label: "Turmeric Oil", icon: Droplet },
      { label: "Clove Oil", icon: Flower2 },
    ],
    ingredients:
      "Aqua, Alcohol, Sorbitol, PEG-40 Hydrogenated Castor Oil, Poloxamer 407, Sodium Benzoate, Turmeric Oil, Benzoic Acid, Flavour, Sodium Saccharin, Clove Oil, Caramel.",
    image: { src: "/mouthwash-turmeric.webp", ...BOTTLE },
    // ink: the green "Turmeric" band on its label, sampled from the photo (lighter than the
    // others: white on it 3.4:1, it on the pale blue 3:1)
    colors: { liquid: "#DFCA84", ink: "#00A048" },
  },
  {
    id: "sensitive",
    name: "Sensitive",
    benefit: "Relief & Repair",
    group: "alcohol-free",
    description:
      "Gentle sensitivity relief: this alcohol-free formula combines Potassium Nitrate and Sodium Fluoride with Clove Oil to soothe tooth sensitivity, strengthen enamel and fight decay without harsh irritation.",
    highlights: [
      { label: "Potassium Nitrate", icon: ThermometerSnowflake },
      { label: "Sodium Fluoride", icon: ShieldCheck },
      { label: "Clove Oil", icon: Flower2 },
    ],
    ingredients:
      "Aqua, Sorbitol, Potassium Nitrate, PEG-40 Hydrogenated Castor Oil, Flavour, Poloxamer 407, Sodium Benzoate, Clove Oil, Sodium Fluoride, Sodium Saccharin, CI 42090.",
    image: { src: "/mouthwash-sensitive.webp", ...BOTTLE },
    colors: { liquid: "#90DAE2", ink: "#C0392F" },
  },
  {
    id: "kidoos",
    name: "Kidoos",
    benefit: "Cavity Protection",
    group: "alcohol-free",
    description:
      "Kid-friendly cavity defence: designed for children, this alcohol-free, strawberry-flavoured formula has a safe quantity of fluoride to protect against cavities, plaque and bad breath.",
    highlights: [
      { label: "Kid-Safe Fluoride", icon: ShieldCheck },
      { label: "Strawberry Flavour", icon: Candy },
    ],
    ingredients:
      "Aqua, Sorbitol, Poloxamer 407, Sodium Benzoate, Sodium Saccharin, Flavour, Peppermint Oil, PEG-40 Hydrogenated Castor Oil, Sodium Fluoride, CI 16255.",
    image: { src: "/mouthwash-kidoos.webp", ...BOTTLE },
    colors: { liquid: "#F0AFCA", ink: "#A62B61" },
  },
  {
    id: "neem",
    name: "Neem",
    benefit: "Herbal Healing",
    group: "alcohol-free",
    description:
      "Powerful antibacterial action to fight plaque and prevent cavities, with natural anti-inflammatory properties that soothe bleeding gums and promote long-term oral hygiene.",
    highlights: [
      { label: "Neem Oil", icon: Leaf },
      { label: "Clove Oil", icon: Flower2 },
      { label: "Sodium Fluoride", icon: ShieldCheck },
    ],
    ingredients:
      "Aqua, Sorbitol, PEG-40 Hydrogenated Castor Oil, Poloxamer 407, Sodium Benzoate, Potassium Sorbate, Azadirachta Indica Oil, Eugenia Caryophyllus Oil, Mentha Piperita Oil, Sodium Fluoride, Cetylpyridinium Chloride, Sodium Saccharin, CI 15985, CI 42090, Citric Acid.",
    image: { src: "/mouthwash-neem.webp", ...BOTTLE },
    colors: { liquid: "#9DC99B", ink: "#2E6B33" },
  },
  {
    // No photo was supplied: cut out of the booklet's page, so a little softer than the others
    id: "turmeric-no-alcohol",
    name: "Turmeric",
    variant: "No Alcohol",
    benefit: "Herbal Protection",
    group: "alcohol-free",
    description:
      "A non-alcoholic mouthwash enriched with turmeric oil and fluoride, designed to protect against cavities, support gum health and reduce oral bacteria.",
    highlights: [
      { label: "Turmeric Oil", icon: Droplet },
      { label: "Clove Oil", icon: Flower2 },
      { label: "Sodium Fluoride", icon: ShieldCheck },
    ],
    ingredients:
      "Aqua, Sorbitol, PEG-40 Hydrogenated Castor Oil, Flavour, Poloxamer 407, Sodium Benzoate, Potassium Sorbate, Curcuma Longa Oil, Eugenia Caryophyllus Oil, Sodium Fluoride, Cetylpyridinium Chloride, Sodium Saccharin, Caramel, Citric Acid.",
    image: { src: "/mouthwash-turmeric-no-alcohol.webp", ...BOTTLE },
    // ink: the booklet's olive "Turmeric" band (white on it 8.1:1; on the pale blue 6.6:1)
    colors: { liquid: "#EBD57E", ink: "#4A5424" },
  },
  {
    id: "chlorhexidine",
    name: "Chlorhexidine",
    benefit: "Medical-Grade",
    group: "medicinal",
    description:
      "A powerful medical-grade antiseptic that eliminates harmful bacteria and prevents plaque build-up, designed to treat gingivitis and speed up healing after dental procedures.",
    highlights: [
      { label: "Antiseptic", icon: ShieldPlus },
      { label: "Antiplaque", icon: Sparkles },
      { label: "Antiviral", icon: BugOff },
      { label: "Antifungal", icon: ShieldCheck },
    ],
    image: { src: "/mouthwash-chlorhexidine.webp", ...BOTTLE },
    colors: { liquid: "#78C4CC", ink: "#1F4E8C" },
  },
];

/** The mouthwash's full name, e.g. "Turmeric No Alcohol". */
export const fullName = (mouthwash: Mouthwash) =>
  mouthwash.variant ? `${mouthwash.name} ${mouthwash.variant}` : mouthwash.name;

/**
 * The groups, as the booklet sets them out. accent: the colour of the booklet's band over the
 * group (for small marks, not text); note: printed with the group in the booklet.
 */
export const MOUTHWASH_GROUPS: { id: MouthwashGroup; label: string; accent: string; note?: string }[] = [
  { id: "alcohol-based", label: "Alcohol-based", accent: "#375A8C" },
  { id: "alcohol-free", label: "Alcohol-free", accent: "#4FA3CF", note: "250 ppm maximum available fluoride" },
  { id: "medicinal", label: "Medicinal", accent: "#D7263D" },
];
