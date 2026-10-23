// data/hero-range.ts
//
// Hero steps. The first is the intro: the whole range standing in a row, every tube alike,
// and a pill per product that goes to its step. Every other step shows one product (picked by
// resting the mouse on its tube, or clicking the tube or its pill): its tube floats to the
// middle and lies down (the Kidoos stand and grow) while the others shrink and fade back, and
// the text above names it, with its details as pills underneath.
//
// Wording follows the website content audit of 17 October 2026 (checked against Totalflux's
// Scientific Detailer and Training Manual; the same as product-pages.ts and KidoosSection). Keep descriptions to about two lines (~75 characters) so every step fits
// the same space and nothing below the text moves.
import type { LucideIcon } from "lucide-react";
import {
  Atom,
  CandyOff,
  DropletOff,
  Feather,
  FlaskConical,
  FlaskConicalOff,
  Leaf,
  Sprout,
  ThermometerSnowflake,
  Wind,
} from "lucide-react";
import { ToothShield } from "@/components/icons/Tooth";

export type HeroProduct = "advance" | "sensitive" | "essential" | "kidoos-advance" | "kidoos-plus";

/** One of a product's pills. stat: a figure shown with it, e.g. the fluoride strength. */
export type HeroDetail = { label: string; icon: LucideIcon; stat?: string };

export type HeroStep = {
  id: string;
  eyebrow: string;
  /** The heading's two lines; on a product step the second (the product's name) is in its colour. */
  title: [string, string];
  description: string;
  /** Absent on the intro, where every tube is shown alike. */
  product?: {
    id: HeroProduct;
    /** Its name on the intro's pill. */
    name: string;
    details: HeroDetail[];
    /**
     * From the pack: brand, its main colour (the intro pill's dot); ink, a deep shade of it
     * for the name and the pill icons (readable on the hero's pale background).
     */
    colors: { brand: string; ink: string };
    /** A cut-out photo of the tube: a transparent WebP in public/, cropped to the tube, and its size in pixels. */
    image: { src: string; width: number; height: number };
    /** Its height beside the others: 1 for the adult tubes; the Kidoos packs are smaller. */
    height: number;
    /** The Kidoos packs print their names upright, so their tubes stay standing when shown. */
    upright?: boolean;
  };
};

export const HERO_STEPS: HeroStep[] = [
  {
    id: "intro",
    eyebrow: "Complete Oral Care",
    title: ["Healthy smile", "happier you"],
    description: "Five SLS-free toothpastes for adults and children aged 3 and up.",
  },
  {
    id: "advance",
    eyebrow: "Multi-action · Arginine + fluoride",
    title: ["Totalflux", "Advance"],
    description:
      "Arginine to help neutralise plaque acids, with 995 ppm fluoride, in an SLS-free paste.",
    product: {
      id: "advance",
      name: "Advance",
      details: [
        { label: "Arginine", icon: FlaskConical, stat: "2%" },
        { label: "Fluoride", icon: ToothShield, stat: "995 ppm" },
        { label: "Fresher breath", icon: Wind },
        { label: "SLS-free", icon: FlaskConicalOff },
      ],
      colors: { brand: "#2F7C61", ink: "#1F5E48" },
      image: { src: "/advance.webp", width: 304, height: 1000 },
      height: 1,
    },
  },
  {
    id: "sensitive",
    eyebrow: "Desensitising care",
    title: ["Totalflux", "Sensitive"],
    description:
      "5% potassium nitrate helps soothe teeth that react to hot, cold or sweet, with relief building over 2–4 weeks.",
    product: {
      id: "sensitive",
      name: "Sensitive",
      details: [
        { label: "Sensitivity relief", icon: ThermometerSnowflake, stat: "5%" },
        { label: "Fluoride", icon: ToothShield, stat: "950 ppm" },
        { label: "SLS & paraben-free", icon: FlaskConicalOff },
        { label: "With clove oil", icon: Leaf },
      ],
      // ink: the Sensitive red, as in product-pages.ts and on the mouthwash page
      colors: { brand: "#2398CA", ink: "#d02831" },
      image: { src: "/sensitive.webp", width: 304, height: 1000 },
      height: 1,
    },
  },
  {
    id: "essential",
    eyebrow: "For Daily Protection",
    title: ["Totalflux", "Essential"],
    description: "Everyday fluoride toothpaste at 995 ppm, SLS-free and gentle on your mouth.",
    product: {
      id: "essential",
      name: "Essential",
      details: [
        { label: "Fluoride", icon: ToothShield, stat: "995 ppm" },
        { label: "SLS-free", icon: FlaskConicalOff },
        { label: "Gentle formula", icon: Feather },
        { label: "Minty flavour", icon: Leaf },
      ],
      colors: { brand: "#304977", ink: "#2B4270" },
      image: { src: "/essential.webp", width: 299, height: 1000 },
      height: 1,
    },
  },
  {
    id: "kidoos-advance",
    eyebrow: "Totalflux Kidoos · Ages 6+",
    title: ["Kidoos", "Advance"],
    description:
      "Children’s fluoride toothpaste at 498 ppm, sweetened with xylitol instead of sugar.",
    product: {
      id: "kidoos-advance",
      name: "Kidoos Advance",
      details: [
        { label: "Fluoride", icon: ToothShield, stat: "498 ppm" },
        { label: "Sugar-free", icon: CandyOff },
        { label: "Xylitol", icon: Sprout, stat: "3%" },
        { label: "SLS-free", icon: FlaskConicalOff },
      ],
      colors: { brand: "#E0506A", ink: "#8E2442" },
      image: { src: "/kidoos-advance.webp", width: 266, height: 800 },
      height: 0.75,
      upright: true,
    },
  },
  {
    id: "kidoos-plus",
    eyebrow: "Totalflux Kidoos · Ages 3+",
    title: ["Kidoos", "Plus"],
    description:
      "Fluoride-free toothpaste with 3% hydroxyapatite, the mineral tooth enamel is made of.",
    product: {
      id: "kidoos-plus",
      name: "Kidoos Plus",
      details: [
        { label: "Fluoride-free", icon: DropletOff },
        { label: "Hydroxyapatite", icon: Atom, stat: "3%" },
        { label: "Xylitol", icon: Sprout, stat: "3%" },
        { label: "SLS-free", icon: FlaskConicalOff },
      ],
      colors: { brand: "#5AA7E0", ink: "#23498A" },
      image: { src: "/kidoos-plus.webp", width: 266, height: 800 },
      height: 0.75,
      upright: true,
    },
  },
];

/** The product steps in order, with their index in HERO_STEPS (for the intro's pills). */
export const HERO_PRODUCTS = HERO_STEPS.flatMap((step, stepIndex) =>
  step.product ? [{ stepIndex, ...step.product }] : [],
);
