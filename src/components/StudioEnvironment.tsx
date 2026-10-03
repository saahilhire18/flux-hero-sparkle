// components/StudioEnvironment.tsx
import type { ReactNode } from "react";
import { Environment } from "@react-three/drei";

/**
 * What the toothpaste tubes reflect. The tube models are glossy (roughness 0.13, and the
 * Advance and Sensitive ones a little metallic), so they mirror whatever surrounds them.
 * With only a few Lightformers in front, everything else was black: the back of a tube, and
 * its edges (where a glossy surface reflects most), mirrored that black and showed dark
 * patches. Here the Lightformers sit in a soft, light studio instead, so every side of a
 * tube reflects something bright and the back is lit about as evenly as the front.
 *
 * surround: the studio's colour in every direction the Lightformers don't cover (a soft
 * blue-grey, not white, so the fronts don't wash out; it also lights the tubes a little
 * from all round). children: the scene's own Lightformers.
 */
const STUDIO = { surround: "#e1e7ee" };

export function StudioEnvironment({ children }: { children?: ReactNode }) {
  return (
    <Environment resolution={128}>
      <color attach="background" args={[STUDIO.surround]} />
      {children}
    </Environment>
  );
}
