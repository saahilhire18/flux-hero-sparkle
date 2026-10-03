// data/site.ts

/**
 * The address the site will be published at, no trailing slash. Share previews (WhatsApp,
 * Facebook, X, LinkedIn) need full addresses for their images; they work once the site is
 * live there (until then that domain still serves the old site, which has no such image).
 */
export const SITE_URL = "https://totalflux-me.com";

/** A path on the site as a full address. */
export const absoluteUrl = (path: string) => `${SITE_URL}${path}`;

/** The picture shown when a page is shared: the logo and the range (public/og-image.jpg). */
export const SHARE_IMAGE = {
  url: absoluteUrl("/og-image.jpg"),
  width: 1200,
  height: 630,
  alt: "Totalflux complete oral care: toothpaste, mouthwash and the Oralbrush",
};
