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
  image: { src: "/kidoos-advance.webp", width: 266, height: 800 },
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
/** One of a need's two picks: everything here is from its product sheet or the booklet. */
export type Pick = {
  product: HomeProduct;
  /** One line on why it suits the need (beside its photo). */
  why: string;
  /** Its key actives, as on its pack or product sheet; one both picks share is ticked. */
  actives: { name: string; amount?: string }[];
};

export type Need = {
  id: string;
  label: string;
  icon: LucideIcon;
  toothpaste: Pick;
  mouthwash: Pick;
  /** What the two have in common, in a word or two each. */
  shared: string[];
  note?: string;
  /**
   * The need's colour, from the packs of the products it suggests: ink, a deep shade for its
   * circle (filled when chosen) and its marks; soft, a pale wash of it for its circle's glass.
   */
  colors: { ink: string; soft: string };
};

export const NEEDS: Need[] = [
  {
    id: "sensitivity",
    colors: { ink: "#15648A", soft: "#D3EEF4" },
    label: "Sensitivity",
    icon: ThermometerSnowflake,
    toothpaste: {
      product: toothpaste("sensitive"),
      why: "Our only paste made for sensitivity: Potassium Nitrate calms teeth that react to hot, cold or sweet.",
      actives: [
        { name: "Potassium Nitrate", amount: "5%" },
        { name: "Sodium Fluoride", amount: "950 ppm" },
        { name: "Clove Oil" },
      ],
    },
    mouthwash: {
      product: mouthwash("sensitive"),
      why: "Our only rinse with Potassium Nitrate, alcohol-free to soothe without irritation.",
      actives: [{ name: "Potassium Nitrate" }, { name: "Sodium Fluoride" }, { name: "Clove Oil" }],
    },
    shared: ["Potassium Nitrate", "Sodium Fluoride", "Clove Oil"],
  },
  {
    id: "cavities",
    colors: { ink: "#2B4270", soft: "#DCE3F1" },
    label: "Cavity protection",
    icon: ToothShield,
    toothpaste: {
      product: toothpaste("essential"),
      why: "Clinically balanced fluoride for reliable protection, every day, with nothing extra.",
      actives: [{ name: "Sodium Fluoride", amount: "995 ppm" }],
    },
    mouthwash: {
      product: mouthwash("turmeric-no-alcohol"),
      why: "The alcohol-free rinse designed to protect against cavities, with fluoride and turmeric.",
      actives: [{ name: "Sodium Fluoride" }, { name: "Turmeric Oil" }, { name: "Clove Oil" }],
    },
    shared: ["Sodium Fluoride", "No SLS or alcohol"],
  },
  {
    id: "plaque",
    colors: { ink: "#8A6512", soft: "#F4EACB" },
    label: "Plaque & tartar",
    icon: ToothSparkle,
    toothpaste: {
      product: toothpaste("advance"),
      why: "Our only paste with tartar-control actives: anti-tartar and anti-plaque in one.",
      actives: [
        { name: "Arginine Bicarbonate", amount: "2%" },
        { name: "Sodium Fluoride", amount: "995 ppm" },
        { name: "Zinc Citrate", amount: "0.3%" },
        { name: "TSPP", amount: "0.3%" },
      ],
    },
    mouthwash: {
      product: mouthwash("turmeric"),
      why: "Reduces harmful bacteria and calms gums, with natural Curcumin and Clove Oil.",
      actives: [{ name: "Turmeric Oil" }, { name: "Clove Oil" }],
    },
    shared: ["Multi-action", "Teeth and gums"],
  },
  {
    id: "gums",
    colors: { ink: "#007843", soft: "#DCEEDB" },
    label: "Gum care",
    icon: ShieldPlus,
    toothpaste: {
      product: toothpaste("advance"),
      why: "Keeps plaque and tartar, the build-up that irritates gums, in check.",
      actives: [
        { name: "Arginine Bicarbonate", amount: "2%" },
        { name: "Sodium Fluoride", amount: "995 ppm" },
        { name: "Zinc Citrate", amount: "0.3%" },
        { name: "TSPP", amount: "0.3%" },
      ],
    },
    mouthwash: {
      product: mouthwash("neem"),
      why: "Our rinse made for gums: natural Neem soothes bleeding gums, alcohol-free.",
      actives: [{ name: "Neem Oil" }, { name: "Clove Oil" }, { name: "Sodium Fluoride" }],
    },
    shared: ["Sodium Fluoride", "Fight plaque"],
  },
  {
    id: "breath",
    colors: { ink: "#006ea2", soft: "#D4ECF0" },
    label: "Fresh breath",
    icon: Wind,
    toothpaste: {
      product: toothpaste("essential"),
      why: "A Minty White formula that freshens breath and keeps teeth strong.",
      actives: [{ name: "Sodium Fluoride", amount: "995 ppm" }],
    },
    mouthwash: {
      product: mouthwash("mintfresh"),
      why: "Four essential oils kill germs and leave a cool, fresh feel.",
      actives: [
        { name: "Eucalyptus" },
        { name: "Thyme" },
        { name: "Peppermint" },
        { name: "Wintergreen" },
      ],
    },
    shared: ["Minty fresh", "Against tooth decay"],
  },
  {
    id: "kids",
    colors: { ink: "#f160af", soft: "#F9DEE9" },
    label: "For kids",
    icon: Baby,
    toothpaste: {
      product: KIDOOS_ADVANCE,
      why: "Reduced-dose fluoride for growing teeth, ages 6+, SLS free.",
      actives: [
        { name: "Sodium Fluoride", amount: "498 ppm" },
        { name: "Xylitol", amount: "3%" },
      ],
    },
    mouthwash: {
      product: mouthwash("kidoos"),
      why: "Our only rinse made for children: alcohol-free, with a safe amount of fluoride.",
      actives: [{ name: "Sodium Fluoride", amount: "kid-safe" }],
    },
    shared: ["Sodium Fluoride", "Strawberry flavour", "Made for kids"],
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
