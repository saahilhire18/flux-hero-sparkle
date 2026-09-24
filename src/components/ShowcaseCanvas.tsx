// components/ShowcaseCanvas.tsx
import { Canvas } from "@react-three/fiber";
import type { MotionValue } from "motion/react";

import ShowcaseScene from "./ShowcaseScene"; // no curly braces — default export
import type { ProductRange } from "@/lib/showcase-layout";

interface ShowcaseCanvasProps {
  ranges: ProductRange[];
  scrollYProgress: MotionValue<number>;
}

export default function ShowcaseCanvas({
  ranges,
  scrollYProgress,
}: ShowcaseCanvasProps) {
  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas
        shadows
        className="!block !h-full !w-full"
        dpr={[1, 2]}
        camera={{
          position: [0, 0.35, 8],
          fov: 28,
          near: 0.1,
          far: 60,
        }}
        gl={{
          alpha: true,
          antialias: true,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ShowcaseScene ranges={ranges} scrollYProgress={scrollYProgress} />
      </Canvas>
    </div>
  );
}