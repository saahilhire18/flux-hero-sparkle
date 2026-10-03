// hooks/use-hover-tilt.ts
import { type PointerEvent } from "react";
import {
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

const SPRING = { stiffness: 170, damping: 20, mass: 0.6 };

/**
 * A card that tilts towards the mouse in 3D while it's hovered (a mouse only, so touch
 * scrolls as usual; none with reduced motion), and eases back flat when it leaves.
 * - Put `handlers` and `style` (rotateX, rotateY, scale) on the card, which should have
 *   `transform-style: preserve-3d` and a parent with perspective.
 * - `hover` goes 0 → 1 as the card is hovered: map it to a layer's `z` (useTransform) to lift
 *   that layer towards the viewer, so the layers shift against each other as the card turns.
 * - `glare`: a soft highlight that follows the mouse, for an overlay's background (fade it in
 *   with `hover` as its opacity).
 * tilt: the most it turns, in degrees (x: up/down, y: sideways); lift: how much it grows.
 */
export function useHoverTilt({ tilt = { x: 9, y: 12 }, lift = 1.02 } = {}): {
  handlers: {
    onPointerMove: (event: PointerEvent<HTMLElement>) => void;
    onPointerLeave: () => void;
  };
  style: { rotateX: MotionValue<number>; rotateY: MotionValue<number>; scale: MotionValue<number> };
  hover: MotionValue<number>;
  glare: MotionValue<string>;
} {
  const reduceMotion = useReducedMotion();
  // The mouse over the card (0–1 across and down; the middle when it's not there) and how far
  // into hover the card is (0–1), all eased
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const hovering = useMotionValue(0);
  const easedX = useSpring(pointerX, SPRING);
  const easedY = useSpring(pointerY, SPRING);
  const hover = useSpring(hovering, SPRING);
  const rotateX = useTransform(easedY, [0, 1], [tilt.x, -tilt.x]);
  const rotateY = useTransform(easedX, [0, 1], [-tilt.y, tilt.y]);
  const scale = useTransform(hover, [0, 1], [1, lift]);
  const glareX = useTransform(easedX, (v) => `${v * 100}%`);
  const glareY = useTransform(easedY, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.5), rgba(255,255,255,0) 55%)`;

  return {
    handlers: {
      onPointerMove: (event) => {
        if (reduceMotion || event.pointerType !== "mouse") return;
        const box = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - box.left) / box.width);
        pointerY.set((event.clientY - box.top) / box.height);
        hovering.set(1);
      },
      onPointerLeave: () => {
        pointerX.set(0.5);
        pointerY.set(0.5);
        hovering.set(0);
      },
    },
    style: { rotateX, rotateY, scale },
    hover,
    glare,
  };
}
