// data/home.ts
//
// The home page's content: the routine, the "find your match" pairings and the promises.
// The claims follow the website content audit of 17 October 2026, which checks them against
// Totalflux's Scientific Detailer and Training Manual (see product-pages.ts, mouthwash.ts,
// oralbrush.ts and KidoosSection).
import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Droplets,
  Feather,
  FlaskConicalOff,
  Leaf,
  ListChecks,
  ThermometerSnowflake,
  Users,
  Wind,
} from "lucide-react";
import { ToothShield } from "@/components/icons/Tooth";
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
    step: "The brush",
    title: "Clean teeth, gums and tongue",
    text: "Brush with the Oralbrush, then slide it open: a gentle tongue scraper is built right in.",
    product: BRUSH,
    link: "Meet the Oralbrush",
  },
  {
    step: "The paste",
    title: "The toothpaste made for you",
    text: "Advance, Sensitive, Essential or Kidoos: every Totalflux toothpaste is SLS-free.",
    product: toothpaste("essential"),
    link: "See the toothpastes",
  },
  {
    step: "The rinse",
    title: "Finish fresh",
    text: "Pick the rinse that suits you, including four alcohol-free options.",
    product: mouthwash("mintfresh"),
    link: "See the mouthwashes",
  },
];

/**
 * One of a need's two picks. The wording is the website content audit's (17 October 2026),
 * which checks every claim against the Scientific Detailer and Training Manual.
 */
export type Pick = {
  product: HomeProduct;
  /** One line on why it suits the need (beside its photo). */
  why: string;
  /** Its key ingredients (and facts such as an age), as chips; one both picks list is ticked. */
  actives: { name: string; amount?: string }[];
};

export type Need = {
  id: string;
  label: string;
  icon: LucideIcon;
  toothpaste: Pick;
  mouthwash: Pick;
  /** What the two have in common, in a word or two each, after "Both have:" (or `sharedLabel`). */
  shared: string[];
  sharedLabel?: string;
  /** A line of guidance on its own, above the disclaimer. */
  note?: string;
  /** Kept out of the selector, and why (see the need). */
  hidden?: string;
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
      why: "5% potassium nitrate helps soothe teeth that react to hot, cold or sweet. Relief builds over 2–4 weeks of twice-daily brushing.",
      actives: [
        { name: "Potassium Nitrate", amount: "5%" },
        { name: "Sodium Fluoride", amount: "950 ppm" },
        { name: "Clove Oil" },
      ],
    },
    mouthwash: {
      product: mouthwash("sensitive"),
      why: "Alcohol-free rinse with potassium nitrate and fluoride. Use it alongside Totalflux Sensitive toothpaste, not instead of it.",
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
      why: "995 ppm fluoride, just under India’s 1,000 ppm legal limit for toothpaste, in an SLS-free base.",
      actives: [{ name: "Sodium Fluoride", amount: "995 ppm" }],
    },
    mouthwash: {
      product: mouthwash("turmeric-no-alcohol"),
      why: "Alcohol-free daily rinse with CPC and 226 ppm fluoride, with turmeric and clove oils for flavour.",
      actives: [
        { name: "CPC", amount: "0.05%" },
        { name: "Sodium Fluoride", amount: "226 ppm" },
        { name: "Turmeric Oil" },
      ],
    },
    shared: ["Fluoride", "No SLS in the paste", "No alcohol in the rinse"],
  },
  // "Plaque & tartar" is withdrawn: no product can support its claims (audit HOME-09). The
  // audit proposes "Herbal choice" in its place (Neem and Turmeric rinses, no toothpaste),
  // which needs a two-rinse panel here first; it waits for Management (Q-16).
  {
    // "Gum care" is withdrawn for the same reason (HOME-06); this is the audit's "Gentle care"
    // in its place, ready but hidden until Management approves it (Q-16)
    id: "gentle",
    hidden: "Awaiting Management approval of the restructure (audit Q-16)",
    colors: { ink: "#007843", soft: "#DCEEDB" },
    label: "Gentle care",
    icon: Feather,
    toothpaste: {
      product: toothpaste("essential"),
      why: "SLS-free fluoride toothpaste, formulated to be gentle on the delicate lining of your mouth.",
      actives: [{ name: "Sodium Fluoride", amount: "995 ppm" }, { name: "SLS-free" }],
    },
    mouthwash: {
      product: mouthwash("neem"),
      why: "Alcohol-free daily rinse with CPC and fluoride, in a traditional neem flavour.",
      actives: [
        { name: "CPC", amount: "0.05%" },
        { name: "Sodium Fluoride", amount: "226 ppm" },
        { name: "Neem Oil" },
      ],
    },
    shared: ["Fluoride", "No SLS in the paste", "No alcohol in the rinse"],
  },
  {
    id: "breath",
    colors: { ink: "#006ea2", soft: "#D4ECF0" },
    label: "Fresh breath",
    icon: Wind,
    toothpaste: {
      product: toothpaste("essential"),
      // The audit's wording for keeping Essential here, until Management decides on moving
      // Advance (zinc citrate) into this need (HOME-07.2)
      why: "A fresh, minty fluoride toothpaste for everyday brushing.",
      actives: [{ name: "Sodium Fluoride", amount: "995 ppm" }],
    },
    mouthwash: {
      product: mouthwash("mintfresh"),
      why: "Eucalyptus, thyme, peppermint and wintergreen oils for a cool, fresh feel. Contains alcohol.",
      actives: [
        { name: "Eucalyptus" },
        { name: "Thyme" },
        { name: "Peppermint" },
        { name: "Wintergreen" },
      ],
    },
    sharedLabel: "Both",
    shared: ["Help freshen breath", "Cool, minty feel"],
  },
  {
    id: "kids",
    colors: { ink: "#f160af", soft: "#F9DEE9" },
    label: "For kids",
    icon: Baby,
    toothpaste: {
      product: KIDOOS_ADVANCE,
      why: "Children’s fluoride toothpaste (498 ppm) for ages 6+, SLS-free and sweetened with xylitol instead of sugar.",
      actives: [
        { name: "Sodium Fluoride", amount: "498 ppm" },
        { name: "Xylitol", amount: "3%" },
      ],
    },
    mouthwash: {
      product: mouthwash("kidoos"),
      why: "Alcohol-free, strawberry-flavoured rinse with 226 ppm fluoride, for children aged 6+ who can rinse and spit.",
      actives: [{ name: "Sodium Fluoride", amount: "226 ppm" }, { name: "Ages 6+" }],
    },
    shared: ["Fluoride", "Strawberry flavour", "For ages 6+"],
    note: "Under 6? Kidoos Plus toothpaste is fluoride-free and made for ages 3+. Kidoos mouthwash is for ages 6+.",
  },
];

/** What every Totalflux product stands for. */
export const PROMISES: { label: string; text: string; icon: LucideIcon }[] = [
  { label: "SLS-free", text: "Every toothpaste, from Essential to Kidoos.", icon: FlaskConicalOff },
  { label: "100% vegetarian", text: "As printed on every toothpaste pack.", icon: Leaf },
  {
    label: "Know what’s inside",
    text: "We show the key ingredients and their strengths for our toothpastes and rinses.",
    icon: ListChecks,
  },
  {
    label: "Alcohol-free options",
    text: "Four of our rinses contain no alcohol, including Kidoos for ages 6+.",
    icon: Droplets,
  },
  { label: "For the whole family", text: "From Kidoos Plus at age 3 to adult care.", icon: Users },
];
