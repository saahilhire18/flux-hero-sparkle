// data/advance-product.ts
import type { LucideIcon } from "lucide-react";
import { Droplet, Shield, ShieldCheck, Sparkles } from "lucide-react";

export type AdvanceFeature = { icon: LucideIcon; ingredient: string; percent: string; headline: string; body: string };

export type AdvanceProduct = {
  id: string;
  name: string;
  subtitle: string;
  model: "/models/paste-1.glb" | "/models/paste-2.glb" | "/models/paste-3.glb";
  accent: string;
  secondary: string;
  bg: string;
  headingColor: string;
  bodyColor: string;
  mutedColor: string;
  tagline: string;
  ctaLabel: string;
  features: AdvanceFeature[];
};

export const ADVANCE_PRODUCT: AdvanceProduct = {
  id: "advance",
  name: "Totalflux Advance",
  subtitle: "Adults Wanting Enhanced Protection — Total Defense, Multi-Action",
  model: "/models/paste-3.glb",
  accent: "#1E9E6E", // green, from the box
  secondary: "#3ED6A6",
  bg: "#E9F9F1",
  headingColor: "#0E2A20",
  bodyColor: "rgba(14,42,32,0.72)",
  mutedColor: "rgba(14,42,32,0.45)",
  tagline: "Daily Care. Lasting Protection.",
  ctaLabel: "Explore Formula",
  features: [
    { icon: Shield, ingredient: "Arginine Bicarbonate", percent: "2%", headline: "Total Defense", body: "Arginine Bicarbonate anchors an anti-tartar, anti-plaque foundation for patients who want more than everyday maintenance." },
    { icon: ShieldCheck, ingredient: "Sodium Fluoride", percent: "995 ppm", headline: "Cavity Shield", body: "The same clinically balanced sodium fluoride, layered into a multi-action formula for enhanced daily protection." },
    { icon: Droplet, ingredient: "Zinc Citrate", percent: "0.3%", headline: "Sensitivity Comfort", body: "Zinc Citrate brings sensitive support actives not typically found together in a mass-market paste." },
    { icon: Sparkles, ingredient: "TSPP", percent: "0.3%", headline: "Tartar Control", body: "TSPP rounds out the multi-action defense — total protection positioned for patients asking for \"something more.\"" },
  ],
};