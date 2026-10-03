// data/product-pages.ts
//
// The adult toothpastes, as the home page's range shows them (ToothpasteRange): what each is
// for, its key actives and its benefits, from the Totalflux product sheets, and colours taken
// from its pack.
import type { LucideIcon } from "lucide-react";
import { FlaskConicalOff, Leaf, ShieldPlus, ThermometerSnowflake, Wind } from "lucide-react";
import { ToothShield, ToothSparkle } from "@/components/icons/Tooth";

export type ProductPageId = "advance" | "sensitive" | "essential";

export type ProductPage = {
  id: ProductPageId;
  /** The product's name after "Totalflux". */
  name: string;
  /** What the pack is for (the product sheet's tag line). */
  tag: string;
  /** Who it's for. */
  audience: string;
  summary: string;
  actives: { name: string; amount: string }[];
  /** stat: a figure shown with it, e.g. the active's strength. */
  benefits: { icon: LucideIcon; title: string; text: string; stat?: string }[];
  /** A cut-out photo of the tube (transparent WebP in public/, cropped to the tube) and its size in pixels. */
  image: { src: string; width: number; height: number };
  /**
   * Colours from the pack, checked for contrast (WCAG AA) against `tint`:
   * - brand: the pack's main colour, for glows, icon backgrounds and the platform, never
   *   text (Sensitive's sky blue is too light to read on its tint);
   * - ink: a deeper shade of it, for text and icons (at least 5.8:1 on the tint);
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
    tag: "Total Defense, Multi-Action",
    audience: "For adults wanting enhanced protection",
    summary:
      "Combines anti-tartar, anti-plaque and sensitivity-support actives not typically found together in a single mass-market paste, for patients who ask for something more.",
    actives: [
      { name: "Arginine Bicarbonate", amount: "2%" },
      { name: "Sodium Fluoride", amount: "995 ppm" },
      { name: "Zinc Citrate", amount: "0.3%" },
      { name: "TSPP", amount: "0.3%" },
    ],
    benefits: [
      { icon: ShieldPlus, title: "Total Defense", stat: "2%", text: "Arginine Bicarbonate anchors an anti-tartar, anti-plaque foundation." },
      { icon: ToothShield, title: "Cavity Shield", stat: "995 ppm", text: "Clinically balanced sodium fluoride for enhanced daily protection." },
      { icon: ThermometerSnowflake, title: "Sensitivity Comfort", stat: "0.3%", text: "Zinc Citrate adds sensitivity support to the multi-action formula." },
      { icon: ToothSparkle, title: "Tartar Control", stat: "0.3%", text: "TSPP rounds out the defense, helping keep tartar and plaque in check." },
    ],
    image: { src: "/advance.webp", width: 226, height: 738 },
    colors: { brand: "#2F7C61", ink: "#1F5E48", highlight: "#4F9981", tint: "#ECF5F1", bg: "#D6ECE2" },
  },
  sensitive: {
    id: "sensitive",
    name: "Sensitive",
    tag: "Desensitizing Recommendation",
    audience: "For teeth that react to hot, cold or sweet",
    summary:
      "Provides established desensitizing action with Potassium Nitrate (5%), which stops nerve fibres from firing in response to stimuli, and keeps cavity protection with Sodium Fluoride.",
    actives: [
      { name: "Potassium Nitrate", amount: "5%" },
      { name: "Sodium Fluoride", amount: "950 ppm" },
    ],
    benefits: [
      { icon: ThermometerSnowflake, title: "Established Relief", stat: "5%", text: "Calms the response to hot, cold and sweet, brush after brush." },
      { icon: ToothShield, title: "Cavity Protection", stat: "950 ppm", text: "950 ppm Sodium Fluoride, alongside the desensitizing formula." },
      { icon: FlaskConicalOff, title: "Mild Cleansing", text: "SLS free and paraben free, gentle on sensitive teeth and gums." },
      { icon: Leaf, title: "With Clove Oil", text: "Formulated with clove oil for sensitivity to hot, cold or sweet." },
    ],
    image: { src: "/sensitive.webp", width: 276, height: 897 },
    colors: { brand: "#2398CA", ink: "#15648A", highlight: "#D75C60", tint: "#EAF5FB", bg: "#D5EBF6" },
  },
  essential: {
    id: "essential",
    name: "Essential",
    tag: "For Daily Protection",
    audience: "For everyday adult use and general maintenance",
    summary:
      "A clean, no-frills fluoride toothpaste for reliable daily protection without added complexity, SLS free from the ground up.",
    actives: [{ name: "Sodium Fluoride", amount: "995 ppm" }],
    benefits: [
      { icon: ToothShield, title: "Daily Protection", stat: "995 ppm", text: "Clinically balanced sodium fluoride, built for everyday use." },
      { icon: ToothSparkle, title: "Gum & Plaque Care", text: "Helps guard gums and keep plaque in check, brush after brush." },
      { icon: Wind, title: "Fresh Breath", text: "A Minty White formula that freshens breath and keeps teeth strong." },
      { icon: FlaskConicalOff, title: "SLS Free", text: "Gentle, everyday care with nothing extra added." },
    ],
    image: { src: "/essential.webp", width: 292, height: 952 },
    colors: { brand: "#304977", ink: "#2B4270", highlight: "#B72F28", tint: "#EEF2F9", bg: "#DDE4F2" },
  },
};
