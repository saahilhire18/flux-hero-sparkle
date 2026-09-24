// data/toothpaste-features.ts
import type { LucideIcon } from "lucide-react";
import { Droplet, Heart, Shield, ShieldCheck, Sparkles, Wind } from "lucide-react";

export type FeatureCallout = {
  icon: LucideIcon;
  label: string;
  headline: string;
  body: string;
  tilt: number;
};

export type ProductBadge = { icon: LucideIcon; label: string };

export type ToothpasteSection = {
  id: string;
  name: string;
  subtitle: string;
  model: "/models/paste-4.glb" | "/models/paste-2.glb" | "/models/paste-3.glb";
  accent: string;
  secondary: string;
  bg: string;
  headingColor: string;
  bodyColor: string;
  mutedColor: string;
  motionStyle: "static" | "orbit";
  decoration: "leaves" | "sparkle";
  badges: ProductBadge[];
  features: FeatureCallout[];
};

export const TOOTHPASTE_SECTIONS: ToothpasteSection[] = [
  {
    id: "essential",
    name: "Totalflux Essential",
    subtitle: "Everyday Adult Use — General Maintenance",
    model: "/models/paste-4.glb",
    accent: "#1B3A6B", // navy, from the box
    secondary: "#D9463F", // red panel on the box
    bg: "#EAF2FB",
    headingColor: "#10203A",
    bodyColor: "rgba(16,32,58,0.72)",
    mutedColor: "rgba(16,32,58,0.45)",
    motionStyle: "static",
    decoration: "leaves",
    badges: [
      { icon: ShieldCheck, label: "Daily Protection" },
      { icon: Shield, label: "Gum Care" },
      { icon: Wind, label: "Fresh Breath" },
    ],
    features: [
      { icon: Droplet, label: "SLS Free, Ground Up", headline: "SLS Free", body: "A clean, no-frills fluoride formula for patients who need reliable daily protection without added complexity.", tilt: -8 },
      { icon: ShieldCheck, label: "995 ppm Sodium Fluoride", headline: "Daily Protection", body: "Clinically balanced sodium fluoride at 995 ppm, built for everyday adult use and general maintenance.", tilt: 8 },
      { icon: Shield, label: "Gum Protection · Plaque Control", headline: "Gum Protection", body: "Helps guard gums and keep plaque in check, brush after brush.", tilt: -6 },
      { icon: Wind, label: "Freshen Breath · Strong Teeth", headline: "Fresh, Strong, Simple", body: "Minty White formula that freshens breath and keeps teeth strong — everyday protection, nothing extra.", tilt: 6 },
    ],
  },
  {
    id: "sensitive",
    name: "Totalflux Sensitive",
    subtitle: "Patients With Hypersensitivity to Hot, Cold or Sweet — Desensitizing Recommendation",
    model: "/models/paste-2.glb",
    accent: "#E14B4B", // SENSITIVE wordmark
    secondary: "#2AA9D8", // box's sky-blue field
    bg: "#E9F8FC",
    headingColor: "#0F2A38",
    bodyColor: "rgba(15,42,56,0.72)",
    mutedColor: "rgba(15,42,56,0.45)",
    motionStyle: "orbit",
    decoration: "sparkle",
    badges: [
      { icon: Heart, label: "Desensitizing" },
      { icon: ShieldCheck, label: "Cavity Protection" },
      { icon: Sparkles, label: "Mild Cleansing" },
    ],
    features: [
      { icon: Heart, label: "Potassium Nitrate 5%", headline: "Established Relief", body: "Potassium Nitrate (5%) provides established desensitizing action, preventing nerve fibers from firing in response to hot, cold, or sweet stimuli.", tilt: -8 },
      { icon: ShieldCheck, label: "950 ppm Sodium Fluoride", headline: "Cavity Protection", body: "Maintains cavity protection with 950 ppm Sodium Fluoride, alongside the desensitizing formula.", tilt: 8 },
      { icon: Droplet, label: "SLS Free · Paraben Free", headline: "Mild Cleansing", body: "SLS free and paraben free, with mild cleansing built for hypersensitive teeth and gums.", tilt: -6 },
      { icon: Sparkles, label: "Toothpaste with Clove Oil", headline: "With Clove Oil", body: "Formulated with clove oil, a recommendation for patients with sensitivity to hot, cold, or sweet.", tilt: 6 },
    ],
  },
];