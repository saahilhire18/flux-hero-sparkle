// lib/showcase-layout.ts
import type { ToothpasteSection } from "@/data/toothpaste-features";

export const CHAPTER_VH = 55;
export const TRANSITION_VH = 70;
export const TAIL_VH = 100;
const SPIN_TURNS = 2;

export type ProductRange = {
  product: ToothpasteSection;
  index: number;
  isLast: boolean;
  rangeStart: number;
  rangeEnd: number;
  spinStart: number;
};

export function buildShowcaseLayout(sections: ToothpasteSection[]) {
  let cursorVh = 0;
  const rows = sections.map((product, index) => {
    const isLast = index === sections.length - 1;
    const chaptersVh = product.features.length * CHAPTER_VH;
    const bufferVh = isLast ? TAIL_VH : TRANSITION_VH;
    const rangeStartVh = cursorVh;
    const rangeEndVh = rangeStartVh + chaptersVh + bufferVh;
    cursorVh = rangeEndVh;
    return { product, index, isLast, rangeStartVh, rangeEndVh, spinStart: chaptersVh / (chaptersVh + bufferVh) };
  });
  const totalVh = cursorVh;
  const ranges: ProductRange[] = rows.map((r) => ({
    product: r.product,
    index: r.index,
    isLast: r.isLast,
    rangeStart: r.rangeStartVh / totalVh,
    rangeEnd: r.rangeEndVh / totalVh,
    spinStart: r.spinStart,
  }));
  return { ranges, totalVh };
}

function localProgress(range: ProductRange, globalP: number) {
  const span = range.rangeEnd - range.rangeStart;
  return span <= 0 ? 0 : Math.min(1, Math.max(0, (globalP - range.rangeStart) / span));
}

export function chapterIndexFor(range: ProductRange, globalP: number) {
  const N = range.product.features.length;
  return Math.min(N - 1, Math.floor(localProgress(range, globalP) * N));
}

export function localProgressFor(range: ProductRange, globalP: number) {
  return localProgress(range, globalP);
}

export function productAnimState(range: ProductRange, ranges: ProductRange[], globalP: number): { tilt: number; opacity: number } {
  const N = range.product.features.length;
  const lastTilt = range.product.features[N - 1]?.tilt ?? 0;
  const firstTilt = range.product.features[0]?.tilt ?? 0;

  if (globalP < range.rangeStart) {
    const prev = ranges[range.index - 1];
    if (prev && !prev.isLast) {
      const prevLp = localProgress(prev, globalP);
      if (globalP >= prev.rangeStart && prevLp > prev.spinStart) {
        const tp = (prevLp - prev.spinStart) / (1 - prev.spinStart);
        const rotation = -SPIN_TURNS * 360 + tp * (SPIN_TURNS * 360 + firstTilt);
        const opacity = tp < 0.5 ? 0 : Math.min(1, (tp - 0.5) / 0.5);
        return { tilt: rotation, opacity };
      }
    }
    return { tilt: firstTilt, opacity: 0 };
  }

  if (globalP > range.rangeEnd) {
    return { tilt: lastTilt, opacity: 0 };
  }

  const lp = localProgress(range, globalP);
  if (lp <= range.spinStart || range.isLast) {
    const chapter = chapterIndexFor(range, globalP);
    return { tilt: range.product.features[chapter]?.tilt ?? 0, opacity: 1 };
  }

  const tp = (lp - range.spinStart) / (1 - range.spinStart);
  const rotation = lastTilt + tp * (SPIN_TURNS * 360 - lastTilt);
  const opacity = tp < 0.5 ? 1 : Math.max(0, 1 - (tp - 0.5) / 0.5);
  return { tilt: rotation, opacity };
}