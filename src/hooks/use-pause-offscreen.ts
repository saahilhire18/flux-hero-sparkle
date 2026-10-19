// hooks/use-pause-offscreen.ts
import { useEffect } from "react";

/**
 * Marks each of the page's sections with data-offscreen while it's well off the screen, so its
 * looping CSS animations pause (styles.css). Called by each page, not the root layout: a page's
 * effects run once its own sections have hydrated, so the attribute never reaches HTML that
 * React hasn't checked yet.
 */
export function usePauseOffscreenAnimations() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          entry.target.toggleAttribute("data-offscreen", !entry.isIntersecting);
      },
      // A little ahead of the screen, so animations are running again by the time it arrives
      { rootMargin: "300px 0px" },
    );
    const sections = document.querySelectorAll("main section");
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
}
