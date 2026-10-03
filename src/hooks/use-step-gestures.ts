// hooks/use-step-gestures.ts
import { useEffect, useRef } from "react";

/*
 * One scroll gesture = one step. A trackpad swipe sends a long run of wheel events (its
 * momentum carries on after the fingers lift), so once a gesture has acted, the rest of it
 * is ignored: the next step needs a pause of `quietMs` with no wheel events, and at least
 * `minGapMs` since the last step (about the length of the step's animation).
 * Thresholds are in pixels: how far a wheel run or a swipe must go to count.
 */
const GESTURE = { wheelThreshold: 30, swipeThreshold: 50, quietMs: 200, minGapMs: 650 };

const NEXT_KEYS = new Set(["ArrowDown", "PageDown", " "]);
const PREVIOUS_KEYS = new Set(["ArrowUp", "PageUp"]);

/**
 * Steps through something that fills the screen (a hero, a pinned showcase) with the mouse
 * wheel / trackpad, the arrow, Page and space keys and, if `touch`, a vertical swipe (up =
 * forward), while `active()` says it has the screen. Each gesture calls onStep(1) to go
 * forward or onStep(-1) to go back. Past the last step it calls onExit, if given (the page
 * moves on); otherwise, like before the first step, the browser scrolls as usual. Everywhere
 * else the browser scrolls as usual too, and a gesture that started there and carries on
 * into the stepper stops there: the rest of it neither scrolls on nor steps.
 *
 * touch: swipes are the stepper's (the element should then stop the browser panning while
 * active, with CSS touch-action); without it, swipes scroll the page as usual.
 */
export function useStepGestures({
  index,
  count,
  active,
  onStep,
  onExit,
  touch = true,
  minGapMs = GESTURE.minGapMs,
}: {
  index: number;
  count: number;
  active: () => boolean;
  onStep: (direction: 1 | -1) => void;
  onExit?: () => void;
  touch?: boolean;
  minGapMs?: number;
}) {
  // Read by the listeners below, which are set up once
  const latest = useRef({ index, count, active, onStep, onExit, minGapMs });
  useEffect(() => {
    latest.current = { index, count, active, onStep, onExit, minGapMs };
  }, [index, count, active, onStep, onExit, minGapMs]);

  useEffect(() => {
    let lastAction = -Infinity;
    let wheelTotal = 0;
    let wheelOwner: "stepper" | "page" | null = null; // who the current wheel run belongs to
    let wheelUsed = false; // the stepper has already acted on (or taken over) the current run
    let wheelQuiet: number | undefined;
    let touchStart: { x: number; y: number } | null = null;

    /** What a gesture in `direction` does right now: a step, leaving, or nothing. */
    const actionFor = (direction: 1 | -1) => {
      const { index: at, count: steps, active: isActive, onExit: exit } = latest.current;
      if (!isActive()) return "none";
      if (direction === 1) return at < steps - 1 ? "step" : exit ? "exit" : "none";
      return at > 0 ? "step" : "none";
    };

    /** Carries out a gesture, unless it does nothing or comes too soon; returns whether it did. */
    const act = (direction: 1 | -1) => {
      const action = actionFor(direction);
      const now = performance.now();
      if (action === "none" || now - lastAction < latest.current.minGapMs) return false;
      lastAction = now;
      if (action === "step") latest.current.onStep(direction);
      else latest.current.onExit?.();
      return true;
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // trackpad pinch-zoom
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const deltaY = event.deltaY * unit;
      if (Math.abs(deltaY) < Math.abs(event.deltaX * unit)) return; // sideways

      window.clearTimeout(wheelQuiet);
      wheelQuiet = window.setTimeout(() => {
        wheelOwner = null;
        wheelUsed = false;
        wheelTotal = 0;
      }, GESTURE.quietMs);

      // A run belongs to whichever it starts with, the stepper or the page, momentum and all…
      const action = actionFor(deltaY > 0 ? 1 : -1);
      wheelOwner ??= action === "none" ? "page" : "stepper";
      // …but a page run that carries on into the stepper stops there, without stepping
      if (wheelOwner === "page" && action !== "none") {
        wheelOwner = "stepper";
        wheelUsed = true;
      }
      if (wheelOwner === "page") return;
      event.preventDefault(); // the stepper's: the page itself doesn't scroll
      if (wheelUsed) return;

      wheelTotal += deltaY;
      if (Math.abs(wheelTotal) >= GESTURE.wheelThreshold && act(wheelTotal > 0 ? 1 : -1)) {
        wheelUsed = true;
        wheelTotal = 0;
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      const point = event.touches[0];
      // Only swipes that start while the stepper has the screen are its
      touchStart =
        event.touches.length === 1 && point && latest.current.active()
          ? { x: point.clientX, y: point.clientY }
          : null;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const point = event.changedTouches[0];
      if (!touchStart || !point) return;
      const up = touchStart.y - point.clientY;
      const across = touchStart.x - point.clientX;
      touchStart = null;
      if (Math.abs(up) >= GESTURE.swipeThreshold && Math.abs(up) > Math.abs(across))
        act(up > 0 ? 1 : -1);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      // Space on a focused button or link presses it
      if (event.key === " " && target?.closest("button, a")) return;
      const forward = NEXT_KEYS.has(event.key) && !(event.key === " " && event.shiftKey);
      const back = PREVIOUS_KEYS.has(event.key) || (event.key === " " && event.shiftKey);
      if (!forward && !back) return;
      const direction = forward ? 1 : -1;
      if (actionFor(direction) === "none") return; // the browser scrolls as usual
      event.preventDefault();
      act(direction);
    };

    // Not passive: while the stepper has the screen it keeps the wheel from scrolling the page
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    if (touch) {
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchend", onTouchEnd, { passive: true });
    }
    return () => {
      window.clearTimeout(wheelQuiet);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [touch]);
}
