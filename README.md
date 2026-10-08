# Totalflux Hero Canvas

Build a full-width, responsive hero section for an oral care brand called "Totalflux". Match the layout, mood, and polish of a premium consumer-health website.

## OVERALL LAYOUT

- Full-viewport hero (min-height 100vh on desktop), two-column layout:
  - LEFT (approx. 45%): text content
  - RIGHT (approx. 55%): 3D product showcase
- Background: soft, airy white-to-pale-blue gradient (#FFFFFF → #E8F1FA) with a subtle diagonal light-ray effect from the top-left, and a large faint circular arch/ring outline behind the products on the right.
- Blurred green tropical leaf shadows/foliage in the top-right corner for depth (decorative, low opacity, blurred).

## NAVBAR (sticky, transparent → white on scroll)

- Left: "Totalflux" logo (bold, deep navy #0B2A5B, with a small ® mark)
- Center links: Toothpaste, Mouthwash, Oralbrush, About Us (navy, medium weight, hover = underline slide-in animation)
- Right: pill-shaped button "Where to Buy" (navy background, white text, hover = slightly lighter with soft shadow)

## LEFT CONTENT

1. Small eyebrow text: "COMPLETE ORAL CARE" — uppercase, wide letter-spacing (0.25em), small size, teal/navy.
2. Headline (H1): "Healthy Smile Happier You" — very bold, deep navy (#0B2A5B), large (clamp 44px–72px), tight line height, broken into 2 lines: "Healthy Smile" / "Happier You".
3. Subtext: "A range of SLS free toothpastes for every mouth, every age." — gray-blue (#3B4B66), 18px, max-width 420px.
4. Three feature icons in a row, each inside a thin-outlined circle with a line icon and a small uppercase label below:
   - Leaf/tooth icon → "SLS FREE"
   - Shield with tooth → "CAVITY PROTECTION"
   - Leaf icon → "FRESH BREATH"
     (Use lucide-react icons, navy stroke, circle border 1.5px navy)
5. CTA button: "Explore Our Range →" — pill-shaped, navy fill, white text, arrow icon that nudges right on hover.

## RIGHT: 3D PRODUCT SHOWCASE

- Use React Three Fiber (@react-three/fiber) + @react-three/drei + three.
- Scene contains a **white matte circular podium/stand** (cylinder with slightly beveled edge, soft rounded corners, low height) centered at the bottom of the canvas, with a soft contact shadow beneath it (drei `ContactShadows`).
- Place **5 toothpaste tube 3D models standing upright side by side on the podium**, slightly fanned in a gentle arc, with the center tubes taller/forward:
  1. Red/blue "Essential" tube
  2. Green/white "Advance" tube
  3. Light-blue "Sensitive" tube
  4. Small blue "Kidoos" kids tube
  5. Small red/pink "Kidoos Advance" tube
- Each tube: use a GLB model if provided (I'll upload /public/models/*.glb); otherwise create a procedural tube (tapered cylinder body + flat crimped seal at the top + white cap at the bottom) and map the front-facing product label image texture onto the body (`/public/textures/tube-1.png` … `tube-5.png`). Use MeshPhysicalMaterial with slight clearcoat and roughness ~0.35 for a glossy plastic look.
- Lighting: soft studio setup — ambient light, one key directional light with soft shadows, a fill light, and `<Environment preset="studio" />` for reflections. Background of canvas must be **transparent** so the page gradient shows through.
- A fresh **mint leaf sprig** (GLB or image sprite) resting on the front-left edge of the podium.
- Interactions:
  - Gentle idle floating animation on each tube (tiny sine-wave Y movement, staggered phases)
  - Subtle mouse-parallax: scene rotates ±8° following cursor
  - Hover on a tube = scales up 1.05 and lifts slightly
  - Limit orbit controls (no zoom, no pan, small horizontal rotate only)
- Lazy-load the canvas with a skeleton placeholder while models load.

## STYLE & TECH

- React + TypeScript + Tailwind CSS + shadcn/ui
- Framer Motion for entrance animations: text fades/slides up with stagger; product canvas fades in and scales from 0.95 → 1.
- Font: Poppins or Inter (headline weight 800).
- Color tokens: navy #0B2A5B, accent teal #1FA7A0, soft blue #E8F1FA, white #FFFFFF.
- Fully responsive:
  - Tablet: stack content, products below text, scale canvas to 80% width
  - Mobile: center text, hide nav links behind a hamburger menu, show 3 tubes only, reduce canvas height to ~360px
- Optimize performance: `dpr={[1, 2]}`, `frameloop="demand"` when off-screen, compress textures.
- Accessibility: semantic HTML, alt text/aria-label on the canvas, focus-visible states on all buttons/links, respect `prefers-reduced-motion` (disable float/parallax).

## DELIVERABLE

A single `Hero.tsx` component, plus `Navbar.tsx`, `ProductScene.tsx` (the 3D canvas), and `FeatureBadge.tsx`. Render it on the home page. Include placeholder assets and clear comments showing where to drop in my real GLB models and label textures.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8fed6734-9021-438c-89aa-7693a427ee43).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
