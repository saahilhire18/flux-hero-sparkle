// lib/images.ts
//
// The props that let a browser fetch an image at the size it's shown. The product photos also
// come at half width (public/<name>-sm.webp), which phones and small slots use.

type Image = { src: string; width: number };

/** The photos that have a half-width copy beside them. */
const HALF_WIDTH = new Set(
  [
    "advance",
    "sensitive",
    "essential",
    "kidoos-advance",
    "kidoos-plus",
    "mouthwash-mintfresh",
    "mouthwash-turmeric",
    "mouthwash-sensitive",
    "mouthwash-kidoos",
    "mouthwash-neem",
    "mouthwash-turmeric-no-alcohol",
    "mouthwash-chlorhexidine",
    "toothpaste-boxes",
    "toothpaste-range",
    "oralbrush-open",
    "oralbrush-front",
    "oralbrush-side",
    "wordmark-advance",
    "wordmark-essential",
    "wordmark-kidoos-plus",
    "wordmark-kidoos-mouthwash",
  ].map((name) => `/${name}.webp`),
);

/** Both sizes of a photo for srcSet, or undefined if it only comes in one. */
function srcSetOf({ src, width }: Image) {
  if (!HALF_WIDTH.has(src)) return undefined;
  return `${src.replace(/\.webp$/, "-sm.webp")} ${Math.round(width / 2)}w, ${src} ${width}w`;
}

/**
 * An image in the first screen: fetched at once. sizes: how wide it's shown, e.g.
 * "(max-width: 1023px) 24vw, 13vw" (a little over, rather than under, keeps it sharp).
 */
export function eagerImage(image: Image, sizes: string) {
  const srcSet = srcSetOf(image);
  return { src: image.src, srcSet, sizes: srcSet ? sizes : undefined };
}

/**
 * An image further down the page: fetched as it nears the screen, at the width it's laid out
 * at (sizes="auto"; browsers without it fall back to `fallback`).
 */
export function lazyImage(image: Image, fallback = "50vw") {
  const srcSet = srcSetOf(image);
  return {
    src: image.src,
    srcSet,
    sizes: srcSet ? `auto, ${fallback}` : undefined,
    loading: "lazy" as const,
    decoding: "async" as const,
  };
}
