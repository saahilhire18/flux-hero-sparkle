// data/oralbrush.ts
//
// The Totalflux Oralbrush: its photos (renders supplied in public/Oralbrush/, cut out and
// trimmed to the brush as WebPs), its colours and its features. The wording follows the live
// totalflux-me.com Oralbrush page ("A novel sustainable design for convenient & efficient
// teeth, gums & tongue cleaning"; "Slide open by pulling handles to use tongue scraping tool";
// Easy to Open, Smart Bristle Design, Gentle Tongue Scraper) and what the photos show.
import type { LucideIcon } from "lucide-react";
import { Leaf, Smile, Sparkles, UnfoldVertical } from "lucide-react";
import { AMAZON_STORE } from "@/data/links";

export type BrushView = "front" | "side" | "open";

export const ORALBRUSH = {
  name: "Oralbrush",
  tagline: "A novel sustainable design for convenient & efficient teeth, gums & tongue cleaning.",
  images: {
    front: { src: "/oralbrush-front.webp", width: 169, height: 1808 },
    side: { src: "/oralbrush-side.webp", width: 199, height: 1535 },
    open: { src: "/oralbrush-open.webp", width: 1165, height: 1703 },
  } satisfies Record<BrushView, { src: string; width: number; height: number }>,
  /**
   * From the brush: its sky blue (glows, the orbit), and a deep shade of it for text and
   * icons (about 7:1 on the page's pale blue).
   */
  colors: { sky: "#A9C9EA", ink: "#24507F" },
  /** The Totalflux store on Amazon India, until the brush has a page of its own there. */
  buyUrl: AMAZON_STORE,
};

export type BrushFeature = {
  id: string;
  label: string;
  icon: LucideIcon;
  text: string;
  /** The photo that shows it best… */
  view: BrushView;
  /** …and the spot on it to point out: centre and diameter, as fractions of the photo's height (x of its width). */
  spot: { x: number; y: number; size: number };
};

/** The tour, in order: what you see first, then opening it, then what's inside. */
export const BRUSH_FEATURES: BrushFeature[] = [
  {
    id: "bristles",
    label: "Smart Bristle Design",
    icon: Sparkles,
    text: "Two-tone bristles on a compact head, for efficient cleaning of teeth and gums.",
    view: "side",
    spot: { x: 0.42, y: 0.07, size: 0.16 },
  },
  {
    id: "open",
    label: "Easy to Open",
    icon: UnfoldVertical,
    text: "Slide it open by pulling the handles: the tongue scraper is built right in.",
    view: "front",
    spot: { x: 0.5, y: 0.36, size: 0.12 },
  },
  {
    id: "scraper",
    label: "Gentle Tongue Scraper",
    icon: Smile,
    text: "A flexible band for the tongue, for complete cleaning of teeth, gums and tongue.",
    view: "open",
    spot: { x: 0.62, y: 0.08, size: 0.2 },
  },
];

/** The hero's glass circles: the three features and the design's sustainability. */
export const BRUSH_HIGHLIGHTS = [
  ...BRUSH_FEATURES.map(({ label, icon }) => ({ label, icon })),
  { label: "Sustainable Design", icon: Leaf },
];
