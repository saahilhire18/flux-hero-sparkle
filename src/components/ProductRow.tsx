// components/ProductRow.tsx
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import type { HeroProduct } from "@/data/hero-range";
import {
  DIM,
  ENTRANCE,
  FOCUS,
  focusTilt,
  focusZoom,
  PRODUCT_SLOTS,
  type TubeSlot,
} from "@/data/hero-tubes";

/*
 * The hero's tubes as plain images (while every tube is a photo), moving just as they did in
 * the 3D scene (ProductScene) but without a 3D engine: they drop onto the platform one after
 * another; while a product is shown its tube comes out to the front and lies down (Kidoos:
 * stands, leaning) and grows, while the others shrink and fade where they stand. A soft
 * shadow under each tube follows it. Light falls across each tube from the left, and now and
 * then a shine sweeps over it (and right after it's brought out).
 */

/**
 * How the scene's world units land on the art box, matching the 3D scene's camera: x across
 * (fraction of the box's width per unit, 0 = the middle), y up (fraction of its height per
 * unit); base: where the tubes stand (fraction of the height from the top); forwardDrop /
 * forwardGrow: how much lower and bigger a tube looks per unit it comes forward (z).
 */
const VIEW = { unitX: 0.132, unitY: 0.187, base: 0.834, forwardDrop: 0.052, forwardGrow: 0.08 };

/** easeInOutCubic, the 3D scene's move; easeOutCubic, its drop onto the platform. */
const MOVE_EASE = [0.65, 0, 0.35, 1] as const;
const DROP_EASE = [0.33, 1, 0.68, 1] as const;

const SHADOW_COLOR = "28, 58, 102"; // the 3D scene's #1c3a66

/** The art box's size in pixels (null until measured, e.g. on the server). */
function useBoxSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, size };
}

type Pose = { x: number; y: number; rotate: number; scale: number; opacity: number };
type ShadowPose = { x: number; y: number; scaleX: number; opacity: number };

/**
 * Where a tube is and how it's posed, in pixels, and the same for its shadow. At rest it
 * stands in its place; `transform-origin` is its base, so it shrinks and grows from there.
 */
function layOut(
  slot: TubeSlot,
  box: { width: number; height: number },
  focus: HeroProduct | undefined,
) {
  const image = slot.image ?? { width: 1, height: 3 };
  const h = slot.targetHeight * VIEW.unitY * box.height;
  const w = (h * image.width) / image.height;
  // The middle of its base, at rest
  const baseX = (0.5 + slot.x * VIEW.unitX) * box.width;
  const baseY = VIEW.base * box.height;
  const rest = { left: baseX - w / 2, top: baseY - h, width: w, height: h };

  const shown = focus === slot.product;
  const dimmed = !!focus && !shown;
  let pose: Pose = { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 };
  let shadow: ShadowPose = { x: 0, y: 0, scaleX: 1, opacity: 1 };

  if (dimmed) {
    pose = { ...pose, scale: DIM.shrink, opacity: DIM.opacity };
    shadow = { ...shadow, scaleX: DIM.shrink, opacity: 0.45 };
  } else if (shown) {
    const zoom = focusZoom(slot) * (1 + FOCUS.z * VIEW.forwardGrow);
    // Three.js turns counter-clockwise for a positive angle, CSS clockwise
    const rotate = (-focusTilt(slot) * 180) / Math.PI;
    // Where its base goes: the front of the platform, in the middle
    const toX = (0.5 + FOCUS.x * VIEW.unitX) * box.width;
    const toY = (VIEW.base + FOCUS.z * VIEW.forwardDrop) * box.height;
    if (slot.upright) {
      // Still standing on its base, just leaning
      pose = { x: toX - baseX, y: toY - baseY, rotate, scale: zoom, opacity: 1 };
      shadow = { x: toX - baseX, y: toY - baseY, scaleX: zoom * 1.1, opacity: 1 };
    } else {
      // Lying down: turned about its base, which then sits half a tube's length left of the
      // middle and half its (grown) width up, so it rests on its side, centred
      const length = h * zoom;
      const thickness = w * zoom;
      pose = {
        x: toX - length / 2 - baseX,
        y: toY - thickness / 2 - baseY,
        rotate,
        scale: zoom,
        opacity: 1,
      };
      shadow = { x: toX - baseX, y: toY - baseY, scaleX: (length * 0.92) / w, opacity: 1 };
    }
  }
  return { rest, pose, shadow, shown };
}

/** Scrolls the page to a product's section. */
function openSection(section: string | undefined) {
  if (!section) return;
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document
    .getElementById(section)
    ?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
}

/**
 * focus: the product the hero is showing; its tube comes to the front, the others fade back.
 * Fills its parent (the hero's art box).
 */
export function ProductRow({ focus }: { focus: HeroProduct | undefined }) {
  const { ref, size } = useBoxSize();

  return (
    <div ref={ref} className="absolute inset-0">
      {size && (
        <>
          {/* Shadows first, so every tube stands over every shadow */}
          {PRODUCT_SLOTS.map((slot, i) => {
            const { rest, shadow } = layOut(slot, size, focus);
            const shadowH = size.height * 0.05;
            return (
              // Appears as its tube lands
              <motion.span
                key={`${slot.id}-shadow`}
                aria-hidden="true"
                className="pointer-events-none absolute"
                style={{
                  left: rest.left,
                  top: rest.top + rest.height - shadowH / 2,
                  width: rest.width,
                  height: shadowH,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: ENTRANCE.startDelay + i * ENTRANCE.stagger + ENTRANCE.duration * 0.6,
                }}
              >
                <motion.span
                  className="block size-full rounded-[50%]"
                  style={{
                    background: `radial-gradient(ellipse at center, rgba(${SHADOW_COLOR},0.5) 0%, rgba(${SHADOW_COLOR},0.22) 45%, transparent 72%)`,
                  }}
                  animate={shadow}
                  transition={{ duration: FOCUS.duration, ease: MOVE_EASE }}
                />
              </motion.span>
            );
          })}

          {PRODUCT_SLOTS.map((slot, i) => {
            if (!slot.image) return null;
            const { rest, pose, shown } = layOut(slot, size, focus);
            const mask = `url(${slot.image.src})`;
            return (
              // Its drop onto the platform when the page opens
              <motion.div
                key={slot.id}
                className="absolute"
                style={{ ...rest, zIndex: shown ? 20 : 1 }}
                initial={{ opacity: 0, y: -ENTRANCE.drop * VIEW.unitY * size.height }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: ENTRANCE.duration,
                  delay: ENTRANCE.startDelay + i * ENTRANCE.stagger,
                  ease: DROP_EASE,
                }}
              >
                {/* Its pose: in the row, dimmed, or brought out */}
                <motion.button
                  type="button"
                  aria-label={`${slot.name}: see its details`}
                  onClick={() => openSection(slot.section)}
                  className="block size-full cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ transformOrigin: "50% 100%" }}
                  animate={pose}
                  transition={{ duration: FOCUS.duration, ease: MOVE_EASE }}
                >
                  {/* Grows a little from its base on hover */}
                  <motion.span
                    className="relative block size-full"
                    style={{ transformOrigin: "50% 100%" }}
                    whileHover={{ scale: 1.04 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  >
                    <img
                      src={slot.image.src}
                      width={slot.image.width}
                      height={slot.image.height}
                      alt=""
                      draggable={false}
                      className="size-full select-none"
                    />
                    {/* Light across the tube, and a shine now and then: both only on the tube
                        itself (masked by its photo). Brought out, it shines as it lands. */}
                    <span
                      aria-hidden="true"
                      className="tube-light"
                      style={{ "--tube": mask } as CSSProperties}
                    />
                    <span
                      key={shown ? "shown" : "row"}
                      aria-hidden="true"
                      className="tube-shine"
                      style={
                        {
                          "--tube": mask,
                          "--shine-delay": shown ? `${FOCUS.duration * 0.8}s` : `${2.5 + i * 1.3}s`,
                        } as CSSProperties
                      }
                    />
                  </motion.span>
                </motion.button>
              </motion.div>
            );
          })}
        </>
      )}
    </div>
  );
}
