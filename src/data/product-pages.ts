// data/product-pages.ts
//
// The adult toothpastes, as the toothpaste page's sections show them (ProductRange): what each is
// for, its key actives and the points around its tube, worded as the website content audit of
// 17 October 2026 recommends (checked against Totalflux's Scientific Detailer and Training
// Manual), and colours taken from its pack.
import type { LucideIcon } from "lucide-react";
import {
  Feather,
  FlaskConical,
  FlaskConicalOff,
  Leaf,
  ThermometerSnowflake,
  Wind,
} from "lucide-react";
import { ToothShield } from "@/components/icons/Tooth";

export type ProductPageId = "advance" | "sensitive" | "essential";

export type ProductPage = {
  id: ProductPageId;
  /** The product's name after "Totalflux". */
  name: string;
  /** Who it's for: the eyebrow's first line. */
  audience: string;
  /** The eyebrow's second line, if it has one. */
  tag?: string;
  summary: string;
  actives: { name: string; amount: string }[];
  /** The points around the tube. stat: a figure shown with it, e.g. the active's strength. */
  benefits: { icon: LucideIcon; title: string; text: string; stat?: string }[];
  /** A cut-out photo of the tube (transparent WebP in public/, cropped to the tube) and its size in pixels. */
  image: { src: string; width: number; height: number };
  /** The name as lettered on the pack (a transparent WebP), shown in place of the typed name. */
  wordmark?: { src: string; width: number; height: number };
  /**
   * Colours from the pack, checked for contrast (WCAG AA) against `tint`:
   * - brand: the pack's main colour, for glows, icon backgrounds and the platform, never
   *   text (Sensitive's sky blue is too light to read on its tint);
   * - ink: a deeper shade of it, for text, icons and the dashed ring (at least 4.5:1 on the
   *   tint). Sensitive's is the red of its name on the pack instead, as on the mouthwash page;
   * - highlight: the pack's second colour, for small decorative marks only;
   * - tint: a pale version, for the hero's bottom edge;
   * - bg: the soft background of the product's section (ink text reads on it).
   */
  colors: { brand: string; ink: string; highlight: string; tint: string; bg: string };
};

export const PRODUCT_PAGES: Record<ProductPageId, ProductPage> = {
  advance: {
    id: "advance",
    name: "Advance",
    audience: "For adults",
    tag: "Multi-action, arginine + fluoride",
    summary:
      "Arginine helps neutralise plaque acids, 995 ppm fluoride helps strengthen enamel, and zinc citrate helps keep breath fresh, all in an SLS-free paste.",
    actives: [
      { name: "Arginine Bicarbonate", amount: "2%" },
      { name: "Sodium Fluoride", amount: "995 ppm" },
      { name: "Zinc Citrate", amount: "0.3%" },
      { name: "TSPP", amount: "0.3%" },
    ],
    benefits: [
      {
        icon: FlaskConical,
        title: "Arginine bicarbonate",
        stat: "2%",
        text: "Helps neutralise plaque acids.",
      },
      {
        icon: ToothShield,
        title: "Sodium fluoride",
        stat: "995 ppm",
        text: "Helps strengthen enamel.",
      },
      {
        icon: Wind,
        title: "Zinc citrate",
        stat: "0.3%",
        text: "Helps keep breath fresh.",
      },
      {
        icon: FlaskConicalOff,
        title: "SLS-free",
        text: "Made without sodium lauryl sulphate.",
      },
    ],
    image: { src: "/advance.webp", width: 304, height: 1000 },
    wordmark: { src: "/wordmark-advance.webp", width: 1241, height: 240 },
    colors: {
      brand: "#2F7C61",
      ink: "#1F5E48",
      highlight: "#4F9981",
      tint: "#ECF5F1",
      bg: "#D6ECE2",
    },
  },
  sensitive: {
    id: "sensitive",
    name: "Sensitive",
    audience: "For teeth that react to hot, cold or sweet",
    summary:
      "5% potassium nitrate helps calm the nerve’s response to hot, cold and sweet, with relief building over 2–4 weeks of twice-daily brushing. Also contains 950 ppm fluoride, in an SLS-free base. If sensitivity persists, see your dentist.",
    actives: [
      { name: "Potassium Nitrate", amount: "5%" },
      { name: "Sodium Fluoride", amount: "950 ppm" },
    ],
    benefits: [
      {
        icon: ThermometerSnowflake,
        title: "Potassium nitrate",
        stat: "5%",
        text: "Relief builds over 2–4 weeks of twice-daily brushing.",
      },
      {
        icon: ToothShield,
        title: "Sodium fluoride",
        stat: "950 ppm",
        text: "Fluoride, alongside the potassium nitrate.",
      },
      {
        icon: Leaf,
        title: "With clove oil",
        text: "As on the pack.",
      },
      {
        icon: FlaskConicalOff,
        title: "SLS-free",
        text: "Made without sodium lauryl sulphate.",
      },
    ],
    image: { src: "/sensitive.webp", width: 304, height: 1000 },
    colors: {
      brand: "#2398CA",
      // The Sensitive red, the same as the Sensitive mouthwash's (mouthwash.ts)
      ink: "#d02831",
      highlight: "#D75C60",
      tint: "#EAF5FB",
      bg: "#D5EBF6",
    },
  },
  essential: {
    id: "essential",
    name: "Essential",
    audience: "For everyday adult use",
    summary:
      "Everyday toothpaste with 995 ppm fluoride, just under India’s 1,000 ppm legal limit for toothpaste. Formulated without SLS to be gentle on the delicate lining of your mouth.",
    actives: [{ name: "Sodium Fluoride", amount: "995 ppm" }],
    benefits: [
      {
        icon: ToothShield,
        title: "Fluoride",
        stat: "995 ppm",
        text: "Just under India’s 1,000 ppm legal limit for toothpaste.",
      },
      {
        icon: FlaskConicalOff,
        title: "SLS-free",
        text: "Made without sodium lauryl sulphate.",
      },
      {
        icon: Feather,
        title: "Gentle formula",
        text: "Formulated to be gentle on the delicate lining of your mouth.",
      },
      {
        icon: Leaf,
        title: "Minty flavour",
        text: "A Minty White flavour.",
      },
    ],
    image: { src: "/essential.webp", width: 299, height: 1000 },
    wordmark: { src: "/wordmark-essential.webp", width: 1125, height: 260 },
    colors: {
      brand: "#304977",
      ink: "#2B4270",
      highlight: "#B72F28",
      tint: "#EEF2F9",
      bg: "#DDE4F2",
    },
  },
};
