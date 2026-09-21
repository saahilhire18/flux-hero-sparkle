# Totalflux Hero Implementation Plan

## Goal
Build the home page as a polished, full-width Totalflux oral-care hero with responsive navigation, animated marketing content, and an interactive 3D toothpaste showcase.

## What I’ll Build
- Replace the placeholder home page with the requested `Hero` composition.
- Add a sticky transparent navigation bar that gains a white surface on scroll, plus an accessible mobile menu.
- Add the eyebrow, two-line headline, supporting copy, three icon benefits, and primary range button with staggered entrance motion.
- Add the pale blue studio background, diagonal light rays, faint circular product arch, and soft tropical leaf silhouettes.
- Build a transparent React Three Fiber scene containing a matte podium, contact shadow, mint sprig, and five slots arranged in an arc using the three supplied toothpaste models.
- Add gentle floating, pointer parallax, tube hover lift/scale, constrained horizontal orbiting, reduced-motion handling, and mobile rendering of three tubes.
- Add an accessible loading placeholder and defer the 3D bundle until the product area is needed.

## Product Asset Strategy
- Place the supplied `paste-1.glb`, `paste-2.glb`, and `paste-3.glb` files in `/public/models/`; no procedural tubes or canvas-drawn product labels will be created.
- Load each file once with `useGLTF`, preload all three, and reuse them across five slots by deeply cloning each scene and its materials for independent styling.
- Keep one editable slot configuration array at the top of `ProductScene.tsx`, using the exact model, height, position, and rotation values provided. Support optional `tint`, `labelTexture`, and `flipX` fields without applying them initially.
- Auto-normalize every clone from its bounding box: center it on X/Z, scale it to the configured target height, and align its base precisely to the podium surface.
- Preserve original model textures and materials, with a restrained reflection-intensity boost; only correct texture color space if visual validation shows washed-out color.
- The uploaded GLBs are valid GLB 2.0 files and currently declare no Draco extension. Keep decoding fully local and add a bundled Draco decoder only if later model replacements require it.
- If an individual GLB fails, log a clear warning and render a simple fallback box in that slot without crashing the rest of the scene.
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
- Keep the route server-rendered so navigation and copy appear immediately; lazy-load only `ProductScene` behind a client-only boundary and skeleton.
- Use semantic design tokens for every color and visual role.
- Use `dpr={[1, 2]}` and render continuously while the hero is visible; pause only off-screen or when reduced motion is preferred.
- Use pointer-safe DOM overlays, keyboard-visible focus states, meaningful labels, and `prefers-reduced-motion` behavior.

## Validation
- Verify the desktop and mobile layouts in the running preview.
- Confirm the canvas is transparent, models are visible and framed, interactions work, and no browser console or asset errors remain.
- Confirm the home page metadata is unique and product-specific.
