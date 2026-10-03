// data/links.ts
//
// Where Totalflux is sold and found online (as on the brand's live site, totalflux-me.com).
// External: open them in a new tab.

/** The Totalflux brand store on Amazon India: "Where to Buy" and "Buy Online". */
export const AMAZON_STORE =
  "https://www.amazon.in/stores/Totalflux/page/5C4DB79E-4F47-46E5-9771-CEED95C4BE91";

/** The brand's social profiles (it has no Twitter/X or LinkedIn pages). */
export const SOCIAL_PROFILES = {
  facebook: "https://www.facebook.com/profile.php?id=100093560424768",
  instagram: "https://www.instagram.com/totalflux/",
  youtube: "https://www.youtube.com/@TotalfluxIndia",
};

/** Props for a link that leaves the site: a new tab, without handing it this page. */
export const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;
