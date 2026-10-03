// components/Footer.tsx
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { AMAZON_STORE, EXTERNAL, SOCIAL_PROFILES } from "@/data/links";

const PRODUCT_LINKS = [
  { label: "Mouthwash", href: "/mouthwash" },
  { label: "Toothpaste", href: "/toothpaste" },
  { label: "Oralbrush", href: "/oralbrush" },
];
/** external: it leaves the site (a new tab). */
const COMPANY_LINKS = [
  { label: "Contact Us", href: "#contact-us", external: false },
  { label: "Buy Online", href: AMAZON_STORE, external: true },
];
const SOCIAL_LINKS = [
  { label: "Facebook", icon: Facebook, href: SOCIAL_PROFILES.facebook },
  { label: "Instagram", icon: Instagram, href: SOCIAL_PROFILES.instagram },
  { label: "YouTube", icon: Youtube, href: SOCIAL_PROFILES.youtube },
];

/** From the product booklet (every page's footer). */
const CONTACT = [
  { label: "Customer care helpline", icon: Phone, text: "1800-532-4561", href: "tel:18005324561" },
  {
    label: "Email",
    icon: Mail,
    text: "info@neovabiogene.com",
    href: "mailto:info@neovabiogene.com",
  },
  {
    label: "Address",
    icon: MapPin,
    text: "Marathon Monte Plaza, Malviya Marg, Mulund West, Mumbai, Maharashtra 400080",
  },
];

const LINK =
  "text-[0.95rem] font-medium uppercase tracking-wide text-white/90 transition-colors hover:text-white";

/** Site footer: logo, links, social icons, contact details and the company line. */
export function Footer() {
  return (
    // bg-primary: the site's dark blue, the same as its headings and text
    <footer className="bg-primary text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-8 pt-14 sm:px-10 md:grid-cols-2 md:items-center lg:grid-cols-[1.1fr_0.8fr_1fr_1.4fr]">
        {/* The navy logo, turned white for the dark footer */}
        <a
          href="#top"
          aria-label="Totalflux, back to top"
          className="justify-self-center md:justify-self-start"
        >
          <img
            src="/logo-transparent.png"
            alt="Totalflux"
            width={1626}
            height={515}
            className="h-16 w-auto brightness-0 invert sm:h-20"
          />
        </a>

        <nav aria-label="Products" className="flex flex-col items-center gap-5 md:items-start">
          {PRODUCT_LINKS.map((link) => (
            <a key={link.label} href={link.href} className={LINK}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-5 md:items-start">
          {COMPANY_LINKS.map((link) => (
            <a key={link.label} href={link.href} {...(link.external && EXTERNAL)} className={LINK}>
              {link.label}
              {link.external && <span className="sr-only"> (Amazon, opens in a new tab)</span>}
            </a>
          ))}
          <ul className="flex items-center gap-5">
            {SOCIAL_LINKS.map(({ label, icon: Icon, href }) => (
              <li key={label}>
                <a
                  href={href}
                  {...EXTERNAL}
                  aria-label={`Totalflux on ${label} (opens in a new tab)`}
                  className="block text-white/90 transition-transform hover:scale-110 hover:text-white"
                >
                  <Icon className="size-7" strokeWidth={1.8} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact details (the "Contact Us" link above comes here) */}
        <address
          id="contact-us"
          className="flex scroll-mt-24 flex-col items-center gap-4 not-italic md:items-start"
        >
          {CONTACT.map(({ label, icon: Icon, text, href }) => {
            const body = (
              <>
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-white/10">
                  <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span>
                  <span className="sr-only">{label}: </span>
                  {text}
                </span>
              </>
            );
            const style =
              "flex max-w-xs items-start gap-3 text-center text-[0.95rem] leading-6 text-white/90 md:text-left";
            return href ? (
              <a key={label} href={href} className={`${style} transition-colors hover:text-white`}>
                {body}
              </a>
            ) : (
              <p key={label} className={style}>
                {body}
              </p>
            );
          })}
        </address>
      </div>

      <div className="flex flex-col items-center gap-3 px-6 pb-10 pt-4 text-center">
        {/* nbw: Neova Biogene Wellness's logo (from the product booklet), white on the footer */}
        <img
          src="/nbw-logo.png"
          alt="Neova Biogene Wellness"
          width={131}
          height={80}
          className="h-10 w-auto brightness-0 invert sm:h-12"
        />
        <p className="text-base text-white/90 sm:text-lg">
          © {new Date().getFullYear()} Neova Biogene Wellness Private Limited | All rights reserved
        </p>
      </div>
    </footer>
  );
}
