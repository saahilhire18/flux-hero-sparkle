// data/mouthwash.ts
//
// The Totalflux mouthwash range, from the product booklet ("Booklet Updated Design"): each
// mouthwash's one-line benefit, its group, description and ingredients, a cut-out photo of
// the bottle (WebP copies of the supplied product renders, trimmed to the bottle) and its
// colours, which are only ever the label's own (the "Hexa Codes" sheet: three per label).
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
    // Label: #006ea2, #1cb0ff, #5bcff1
    colors: { liquid: "#5bcff1", ink: "#006ea2" },
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
    // Label: #d08804, #00a049, #eee07f
    colors: { liquid: "#eee07f", ink: "#00a049" },
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
    // Label: #06b4e2, #db434b, #59d2eb
    colors: { liquid: "#59d2eb", ink: "#db434b" },
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
    wordmark: { src: "/wordmark-kidoos-mouthwash.webp", width: 1006, height: 330 },
    // Label: #3eb6f4, #f160af, #8ccbff (the pink is the liquid's colour and the most readable)
    colors: { liquid: "#f160af", ink: "#f160af" },
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
    // Label: #0b9131, #007843, #6eb343
    colors: { liquid: "#6eb343", ink: "#007843" },
  },
  {
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
    // Label: #df9803, #4a5423, #e9d816
    colors: { liquid: "#e9d816", ink: "#4a5423" },
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
    // Label: #00a4ef, #ee0800, #59d2fd (ink: the bottle's blue, as asked, over the red)
    colors: { liquid: "#59d2fd", ink: "#00a4ef" },
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
