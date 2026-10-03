// data/hero-tubes.ts
//
// The toothpaste hero's tubes: which product each is, what it's shown as (a photo now, a 3D
// model later), where it stands and how it moves when its product is the one shown. Shared by
// the two ways the hero can draw them: ProductRow (plain images, while every tube is a photo)
// and ProductScene (the 3D scene, once any tube is a model). Lengths and positions are in the
// scene's world units; ProductRow maps them onto the page.
import type { HeroProduct } from "@/data/hero-range";

export type ModelName = "paste-4" | "paste-2" | "paste-3";

export type TubeSlot = {
  id: string;
  /** Which product this tube is: the hero's product steps each show one. */
  product: HeroProduct;
  /** Its name, for screen readers (the tube is a link to its product's section). */
  name: string;
  /** A 3D model of the tube… */
  model?: ModelName;
  /**
   * …or, until it has one, a cut-out photo of it: a transparent WebP in public/, cropped to
   * the tube itself (no clear margin, so its cap stands on the platform), with its size.
   */
  image?: { src: string; width: number; height: number };
  /** Tube length, in world units. */
  targetHeight: number;
  /** Where the tube stands on the platform: x across, z depth (positive = nearer). */
  x: number;
  z: number;
  /** Lean, in radians (negative = top leans right). */
  tilt: number;
  /**
   * How it's shown while it's the product shown: by default it lies down (see FOCUS); with
   * this it stays standing as it comes out to the front, leaning a further `tilt` radians and
   * grown `zoom` times.
   */
  upright?: { tilt: number; zoom: number };
  tint?: string;
  labelTexture?: string;
  flipX?: boolean;
  /** The id of the product's section on the page, scrolled to by clicking the tube. */
  section?: string;
};

// Product photos: WebP copies of the "Totalflux … Toothpaste … .png" originals in public/.
const TUBE_IMAGES = {
  advance: { src: "/advance.webp", width: 226, height: 738 },
  sensitive: { src: "/sensitive.webp", width: 276, height: 897 },
  essential: { src: "/essential.webp", width: 292, height: 952 },
  kidoosAdvance: { src: "/kidoos-advance.webp", width: 232, height: 729 },
  kidoosPlus: { src: "/kidoos-plus.webp", width: 213, height: 697 },
};

// Product arrangement, left to right: edit this one array when swapping or moving tubes.
// The adult tubes come first; the smaller Kidoos tubes stand together on the right.
// All stand in one row at the same depth (z), so their bases line up on screen; a tube
// further back would look higher and smaller, since the camera looks down at them.
// The tubes stand straight (tilt 0); a negative tilt leans a tube's top to the right.
// To use a 3D model later, replace a slot's `image` with `model` (see MODEL_PATHS): the hero
// then draws the tubes in 3D (ProductScene).
export const PRODUCT_SLOTS: TubeSlot[] = [
  {
    id: "slot-1",
    product: "advance",
    name: "Totalflux Advance",
    image: TUBE_IMAGES.advance,
    targetHeight: 3.55,
    x: -2.55,
    z: 0,
    tilt: 0,
    section: "advance",
  },
  {
    id: "slot-2",
    product: "sensitive",
    name: "Totalflux Sensitive",
    image: TUBE_IMAGES.sensitive,
    targetHeight: 3.55,
    x: -1.35,
    z: 0,
    tilt: 0,
    section: "sensitive",
  },
  {
    id: "slot-3",
    product: "essential",
    name: "Totalflux Essential",
    image: TUBE_IMAGES.essential,
    targetHeight: 3.55,
    x: -0.15,
    z: 0,
    tilt: 0,
    section: "essential",
  },
  // The Kidoos packs print their names upright, so their tubes stay standing when shown
  {
    id: "slot-4",
    product: "kidoos-advance",
    name: "Totalflux Kidoos Advance",
    image: TUBE_IMAGES.kidoosAdvance,
    targetHeight: 2.55,
    x: 1.05,
    z: 0,
    tilt: 0,
    upright: { tilt: -0.24, zoom: 1.55 },
    section: "kidoos-advance",
  },
  {
    id: "slot-5",
    product: "kidoos-plus",
    name: "Totalflux Kidoos Plus",
    image: TUBE_IMAGES.kidoosPlus,
    targetHeight: 2.45,
    x: 2.1,
    z: 0,
    tilt: 0,
    upright: { tilt: -0.24, zoom: 1.6 },
    section: "kidoos-plus",
  },
];

export const MODEL_PATHS: Record<ModelName, string> = {
  "paste-4": "/models/paste-4.glb",
  "paste-2": "/models/paste-2.glb",
  "paste-3": "/models/paste-3.glb",
};

/** Whether any tube is a 3D model: then the hero draws the tubes in 3D, otherwise as images. */
export const HAS_MODELS = PRODUCT_SLOTS.some((slot) => slot.model);

// Entrance: the tubes drop onto the platform one after another (seconds / world units).
export const ENTRANCE = { startDelay: 0.3, stagger: 0.12, duration: 0.9, drop: 1.2 };

/**
 * While the hero shows one product, the other tubes stay where they are, turn see-through
 * (to `opacity`) and shrink from their base (to `shrink`). speed: higher = faster (3D scene).
 */
export const DIM = { opacity: 0.35, shrink: 0.82, speed: 5 };

/**
 * The product shown: its tube swings out of the row to the front of the platform (at x, z),
 * in front of the others, and lies down there, cap to the left so its label reads left to
 * right (`tilt`: a quarter turn clockwise). Lying down it grows to `length` world units, but
 * at most to `maxZoom` times its size. (A slot with `upright` stays standing instead, with
 * its own lean and zoom.) duration: seconds, for the whole move.
 */
export const FOCUS = { x: 0, z: 0.5, tilt: -Math.PI / 2, length: 5.2, maxZoom: 1.7, duration: 0.9 };

/** How much a tube grows while it's the product shown. */
export const focusZoom = (slot: TubeSlot) =>
  slot.upright?.zoom ?? Math.min(FOCUS.maxZoom, FOCUS.length / slot.targetHeight);

/** A tube's lean while it's the product shown: lying down, or its upright lean. */
export const focusTilt = (slot: TubeSlot) =>
  slot.upright ? slot.tilt + slot.upright.tilt : FOCUS.tilt;
