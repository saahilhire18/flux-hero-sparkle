# Totalflux Hero Implementation Plan

## Goal
Build the home page as a polished, full-width Totalflux oral-care hero with responsive navigation, animated marketing content, and an interactive 3D toothpaste showcase.

## What I’ll Build
- Replace the placeholder home page with the requested `Hero` composition.
- Add a sticky transparent navigation bar that gains a white surface on scroll, plus an accessible mobile menu.
- Add the eyebrow, two-line headline, supporting copy, three icon benefits, and primary range button with staggered entrance motion.
- Add the pale blue studio background, diagonal light rays, faint circular product arch, and soft tropical leaf silhouettes.
- Build a transparent React Three Fiber scene containing a matte podium, contact shadow, mint sprig, and five distinct procedural toothpaste tubes arranged in an arc.
- Add gentle floating, pointer parallax, tube hover lift/scale, constrained horizontal orbiting, reduced-motion handling, and mobile rendering of three tubes.
- Add an accessible loading placeholder and defer the 3D bundle until the product area is needed.

## Product Asset Strategy
- Ship a complete visual fallback without external files: each tube will have shaped procedural geometry, a cap, crimp, and branded front label rendered as a canvas texture.
- Keep the tube definitions centralized and document the exact public asset conventions for later replacements: `/models/tube-1.glb` through `/models/tube-5.glb` and `/textures/tube-1.png` through `/textures/tube-5.png`.
- Avoid runtime-hosted environment files; use local studio light formers so the product scene cannot hang on an external asset request.

## Files and Structure
- `src/components/Hero.tsx` — full hero layout and entrance animation.
- `src/components/Navbar.tsx` — desktop navigation and mobile menu.
- `src/components/ProductScene.tsx` — client-side 3D canvas and product scene.
- `src/components/FeatureBadge.tsx` — reusable circular feature treatment.
- `src/styles.css` — Totalflux colors, typography, shadows, background treatments, and motion rules.
- `src/routes/index.tsx` — home rendering and page-specific metadata.
- `src/routes/__root.tsx` — Poppins font loading and generic metadata cleanup.

## Technical Details
- Install `three`, React Three Fiber, Drei, Three types, and Motion for React.
- Keep the route client-only because the 3D renderer requires the browser.
- Use semantic design tokens for every color and visual role.
- Use `dpr={[1, 2]}`, pause rendering while off-screen, and invalidate frames only while interaction or animation requires them.
- Use pointer-safe DOM overlays, keyboard-visible focus states, meaningful labels, and `prefers-reduced-motion` behavior.

## Validation
- Verify the desktop and mobile layouts in the running preview.
- Confirm the canvas is transparent, models are visible and framed, interactions work, and no browser console or asset errors remain.
- Confirm the home page metadata is unique and product-specific.
