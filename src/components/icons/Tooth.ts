// components/icons/Tooth.ts
// Dental icons Lucide doesn't have, drawn on the same 24px grid and stroke style, so they
// take the same props (className, size…) as the Lucide icons. The smaller teeth reuse
// TOOTH through a transform, with their own stroke width set so that, once scaled down,
// it matches the ~1.8 the hero uses (so their lines don't follow a strokeWidth prop).
import { createLucideIcon } from "lucide-react";

const TOOTH =
  "M7.5 3C5 3 3.5 5 3.5 7.4c0 2.2.9 3.6 1.5 5.2.6 1.7.8 3.8 1.2 5.9.3 1.6.9 2.5 1.8 2.5 1.2 0 1.5-1.6 1.8-3.3.3-1.6.7-3 2.2-3s1.9 1.4 2.2 3c.3 1.7.6 3.3 1.8 3.3.9 0 1.5-.9 1.8-2.5.4-2.1.6-4.2 1.2-5.9.6-1.6 1.5-3 1.5-5.2C20.5 5 19 3 16.5 3c-1.9 0-2.9 1-4.5 1S9.4 3 7.5 3z";

export const Tooth = createLucideIcon("Tooth", [["path", { d: TOOTH, key: "tooth" }]]);

/** Cavity protection: a tooth inside a shield. */
export const ToothShield = createLucideIcon("ToothShield", [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "shield",
    },
  ],
  // 0.45 scale: 3.6 draws as ~1.6, a touch finer than the shield so the small tooth stays open
  ["path", { d: TOOTH, transform: "translate(6.6 6.9) scale(0.45)", strokeWidth: "3.6", key: "tooth" }],
]);

/** Plaque control: a clean tooth with shine rays off its top corner. */
export const ToothSparkle = createLucideIcon("ToothSparkle", [
  // 0.78 scale: 2.3 draws as ~1.8
  ["path", { d: TOOTH, transform: "translate(-0.73 5.12) scale(0.78)", strokeWidth: "2.3", key: "tooth" }],
  ["path", { d: "M17 3.5v-2M19.5 5l1.5-1.5M20.5 8h2", key: "shine" }],
]);
