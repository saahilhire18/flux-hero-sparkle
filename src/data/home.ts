// data/home.ts
//
// The home page's content: the routine, the "find your match" pairings and the promises.
// Every claim comes from the product sheets, the booklets or the packs (see product-pages.ts,
// mouthwash.ts, oralbrush.ts and KidoosSection).
import type { LucideIcon } from "lucide-react";
import {
  Baby,
  FlaskConicalOff,
  Leaf,
  ShieldCheck,
  ShieldPlus,
  Sparkles,
  ThermometerSnowflake,
  Wind,
} from "lucide-react";
import { ToothShield, ToothSparkle } from "@/components/icons/Tooth";
import { MOUTHWASHES } from "@/data/mouthwash";
import { ORALBRUSH } from "@/data/oralbrush";
import { PRODUCT_PAGES } from "@/data/product-pages";

type Image = { src: string; width: number; height: number };

/** A product as the home page shows it: its photo, name, colour and where it is on the site. */
export type HomeProduct = {
  name: string;
  kind: "Toothpaste" | "Mouthwash" | "Oralbrush";
  image: Image;
  /** Its pack's deep colour, for its name and marks. */
  ink: string;
  /** Its page, and its place on that page. */
  to: "/toothpaste" | "/mouthwash" | "/oralbrush";
  hash?: string;
  /** A soft colour of it, for a glow behind it (a mouthwash's liquid). */
  glow?: string;
};

/** A mouthwash (by its id in mouthwash.ts) as the home page shows it. */
export const mouthwash = (id: string): HomeProduct => {
  const found = MOUTHWASHES.find((each) => each.id === id);
  if (!found) throw new Error(`No mouthwash "${id}"`);
  return {
    name: found.variant ? `${found.name} ${found.variant}` : found.name,
    kind: "Mouthwash",
    image: found.image,
    ink: found.colors.ink,
    to: "/mouthwash",
    hash: found.id,
    glow: found.colors.liquid,
  };
};

/** An adult toothpaste as the home page shows it. */
export const toothpaste = (id: "advance" | "sensitive" | "essential"): HomeProduct => {
  const page = PRODUCT_PAGES[id];
  return {
    name: page.name,
    kind: "Toothpaste",
    image: page.image,
    ink: page.colors.ink,
    to: "/toothpaste",
    hash: id,
  };
};

export const KIDOOS_ADVANCE: HomeProduct = {
  name: "Kidoos Advance",
  kind: "Toothpaste",
  image: { src: "/kidoos-advance.webp", width: 232, height: 729 },
  ink: "#8E2442",
  to: "/toothpaste",
  hash: "kidoos-advance",
};

/** Mintfresh, the range's best-known bottle. */
export const MINTFRESH = mouthwash("mintfresh");

export const BRUSH: HomeProduct = {
  name: "Oralbrush",
  kind: "Oralbrush",
  image: ORALBRUSH.images.side,
  ink: ORALBRUSH.colors.ink,
  to: "/oralbrush",
};

/** The daily routine, in order. */
export const ROUTINE: {
  step: string;
  title: string;
  text: string;
  product: HomeProduct;
  link: string;
}[] = [
  {
    step: "Brush & scrape",
    title: "Clean teeth, gums and tongue",
    text: "Brush with the Oralbrush, then slide it open: a gentle tongue scraper is built right in.",
    product: BRUSH,
    link: "Meet the Oralbrush",
  },
  {
    step: "Brush with your paste",
    title: "The toothpaste made for you",
    text: "Advance, Sensitive, Essential or Kidoos: every Totalflux toothpaste is SLS free.",
    product: toothpaste("essential"),
    link: "See the toothpastes",
  },
  {
    step: "Rinse",
    title: "Finish fresh and protected",
    text: "A Totalflux mouthwash kills 99.9% of oral germs, for a healthier mouth.",
    product: mouthwash("mintfresh"),
    link: "See the mouthwashes",
  },
];

/** A need, and the toothpaste and mouthwash pair for it, each with why. */
export type Need = {
  id: string;
  label: string;
  icon: LucideIcon;
  toothpaste: { product: HomeProduct; why: string };
  mouthwash: { product: HomeProduct; why: string };
  note?: string;
};

export const NEEDS: Need[] = [
  {
    id: "sensitivity",
    label: "Sensitivity",
    icon: ThermometerSnowflake,
    toothpaste: {
      product: toothpaste("sensitive"),
      why: "Potassium Nitrate (5%) calms teeth that react to hot, cold or sweet.",
    },
    mouthwash: {
      product: mouthwash("sensitive"),
      why: "Alcohol-free, with Potassium Nitrate, Sodium Fluoride and Clove Oil.",
    },
  },
  {
    id: "cavities",
    label: "Cavity protection",
    icon: ToothShield,
    toothpaste: {
      product: toothpaste("essential"),
      why: "Sodium Fluoride (995 ppm) for reliable protection, every day.",
    },
    mouthwash: {
      product: mouthwash("turmeric-no-alcohol"),
      why: "Turmeric oil and fluoride, without alcohol, to protect against cavities.",
    },
  },
  {
    id: "plaque",
    label: "Plaque & tartar",
    icon: ToothSparkle,
    toothpaste: {
      product: toothpaste("advance"),
      why: "Anti-tartar and anti-plaque actives together in one paste.",
    },
    mouthwash: {
      product: mouthwash("turmeric"),
      why: "Anti-plaque and anti-inflammatory, with Curcumin and Clove Oil.",
    },
  },
  {
    id: "gums",
    label: "Gum care",
    icon: ShieldPlus,
    toothpaste: {
      product: toothpaste("advance"),
      why: "Multi-action care for healthy gums, with Arginine and Zinc Citrate.",
    },
    mouthwash: {
      product: mouthwash("neem"),
      why: "Natural anti-inflammatory Neem that soothes bleeding gums.",
    },
  },
  {
    id: "breath",
    label: "Fresh breath",
    icon: Wind,
    toothpaste: {
      product: toothpaste("essential"),
      why: "A Minty White formula that freshens breath and keeps teeth strong.",
    },
    mouthwash: {
      product: mouthwash("mintfresh"),
      why: "Eucalyptus, Thyme, Peppermint and Wintergreen kill germs and refresh.",
    },
  },
  {
    id: "kids",
    label: "For kids",
    icon: Baby,
    toothpaste: {
      product: KIDOOS_ADVANCE,
      why: "Reduced-dose fluoride (498 ppm) for growing teeth, ages 6+.",
    },
    mouthwash: {
      product: mouthwash("kidoos"),
      why: "Strawberry-flavoured and alcohol-free, against cavities and bad breath.",
    },
    note: "Under 6? Kidoos Plus is fluoride free, made for ages 3+.",
  },
];

/** What every Totalflux product stands for. */
export const PROMISES: { label: string; text: string; icon: LucideIcon }[] = [
  { label: "SLS free", text: "Every toothpaste, from Essential to Kidoos.", icon: FlaskConicalOff },
  { label: "100% vegetarian", text: "As printed on every toothpaste pack.", icon: Leaf },
  { label: "Clinically tested", text: "100% secure, clinically tested care.", icon: ShieldCheck },
  {
    label: "Kills 99.9% of germs",
    text: "Totalflux mouthwash, for a healthier mouth.",
    icon: Sparkles,
  },
  { label: "For every age", text: "From Kidoos Plus at 3+ to grown-up care.", icon: Baby },
];
