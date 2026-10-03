// hooks/use-wide-screen.ts
import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 1024px)";

/**
 * Whether the screen is desktop-wide (Tailwind's lg and up), kept up to date. False on the
 * server, so a page first renders its narrow-screen layout and switches after it loads.
 */
export function useWideScreen() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(QUERY);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
