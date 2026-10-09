// data/hero-range.ts
//
// Hero steps. The first is the intro: the whole range standing in a row, every tube alike,
// and a pill per product that goes to its step. Every other step shows one product (picked by
// resting the mouse on its tube, or clicking the tube or its pill): its tube floats to the
// middle and lies down (the Kidoos stand and grow) while the others shrink and fade back, and
// the text above names it, with its details as pills underneath.
//
// Details follow the Totalflux product sheets and packs (the same as product-pages.ts and
// KidoosSection). Keep descriptions to about two lines (~75 characters) so every step fits
// the same space and nothing below the text moves.
import type { LucideIcon } from "lucide-react";
import {
  Atom,
  CandyOff,
  DropletOff,
  FlaskConicalOff,
  Gem,
  Leaf,
  ShieldPlus,
  ThermometerSnowflake,
  Wind,
} from "lucide-react";
import { ToothShield, ToothSparkle } from "@/components/icons/Tooth";

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
    title: ["Healthy Smile", "Happier You"],
    description: "A range of SLS free toothpastes for every mouth, every age.",
  },
  {
    id: "advance",
    eyebrow: "Total Defense · Multi-Action",
    title: ["Totalflux", "Advance"],
    description: "Anti-tartar, anti-plaque and sensitivity care, together in one paste.",
    product: {
      id: "advance",
      name: "Advance",
      details: [
        { label: "Total Defense", icon: ShieldPlus },
        { label: "Cavity Shield", icon: ToothShield, stat: "995 ppm" },
        { label: "Sensitivity Comfort", icon: ThermometerSnowflake },
        { label: "Tartar Control", icon: ToothSparkle },
        { label: "SLS Free", icon: FlaskConicalOff },
      ],
      colors: { brand: "#2F7C61", ink: "#1F5E48" },
      image: { src: "/advance.webp", width: 304, height: 1000 },
      height: 1,
    },
  },
  {
    id: "sensitive",
    eyebrow: "Desensitizing Care",
    title: ["Totalflux", "Sensitive"],
    description: "Potassium Nitrate (5%) calms teeth that react to hot, cold or sweet.",
    product: {
      id: "sensitive",
      name: "Sensitive",
      details: [
        { label: "Sensitivity Relief", icon: ThermometerSnowflake, stat: "5%" },
        { label: "Cavity Protection", icon: ToothShield, stat: "950 ppm" },
        { label: "SLS & Paraben Free", icon: FlaskConicalOff },
        { label: "With Clove Oil", icon: Leaf },
      ],
      colors: { brand: "#2398CA", ink: "#15648A" },
      image: { src: "/sensitive.webp", width: 304, height: 1000 },
      height: 1,
    },
  },
  {
    id: "essential",
    eyebrow: "For Daily Protection",
    title: ["Totalflux", "Essential"],
    description: "Clean, no-frills fluoride protection for every day, SLS free.",
    product: {
      id: "essential",
      name: "Essential",
      details: [
        { label: "Daily Protection", icon: ToothShield, stat: "995 ppm" },
        { label: "Gum & Plaque Care", icon: ToothSparkle },
        { label: "Fresh Breath", icon: Wind },
        { label: "SLS Free", icon: FlaskConicalOff },
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
    description: "Reduced-dose fluoride, calibrated for children's growing teeth.",
    product: {
      id: "kidoos-advance",
      name: "Kidoos Advance",
      details: [
        { label: "Cavity Protection", icon: ToothShield, stat: "498 ppm" },
        { label: "Fresh Breath All Day", icon: Wind },
        { label: "Non-Cariogenic", icon: CandyOff },
        { label: "SLS Free", icon: FlaskConicalOff },
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
    description: "Fluoride free, with hydroxyapatite for enamel remineralization.",
    product: {
      id: "kidoos-plus",
      name: "Kidoos Plus",
      details: [
        { label: "Fluoride Free", icon: DropletOff },
        { label: "Hydroxyapatite", icon: Atom, stat: "3%" },
        { label: "Enamel Protection", icon: Gem },
        { label: "SLS Free", icon: FlaskConicalOff },
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
