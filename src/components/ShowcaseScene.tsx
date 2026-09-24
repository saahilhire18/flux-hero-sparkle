// components/ShowcaseScene.tsx
import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, useGLTF } from "@react-three/drei";
import type { MotionValue } from "motion/react";
import * as THREE from "three";

import { productAnimState, type ProductRange } from "@/lib/showcase-layout";

type ShowcaseSceneProps = {
  ranges: ProductRange[];
  scrollYProgress: MotionValue<number>;
};

type ProductModelProps = {
  range: ProductRange;
  ranges: ProductRange[];
  scrollYProgress: MotionValue<number>;
};

function ProductModel({ range, ranges, scrollYProgress }: ProductModelProps) {
  const { scene } = useGLTF(range.product.model);
  const group = useRef<THREE.Group>(null);

  const model = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      const clonedMaterials = materials.map((material) => {
        const next = material.clone();
        if ("envMapIntensity" in next) (next as THREE.MeshStandardMaterial).envMapIntensity = 1.25;
        // Required so the cross-fade between outgoing/incoming products
        // actually renders translucent instead of popping at opacity 1.
        (next as THREE.MeshStandardMaterial).transparent = true;
        return next;
      });
      child.material = Array.isArray(child.material) ? clonedMaterials : clonedMaterials[0];
    });

    const initialBox = new THREE.Box3().setFromObject(clone);
    const initialSize = initialBox.getSize(new THREE.Vector3());
    const targetHeight = 3.4;
    clone.scale.setScalar(targetHeight / Math.max(initialSize.y, 0.0001));

    const scaledBox = new THREE.Box3().setFromObject(clone);
    const center = scaledBox.getCenter(new THREE.Vector3());
    clone.position.set(-center.x, -scaledBox.min.y, -center.z);

    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    const current = group.current;
    if (!current) return;

    // productAnimState already encodes the full per-product lifecycle —
    // tilt through its own chapters, then a multi-turn spin-out while
    // fading, while the next product spins in while fading up. No
    // separate x-slide/scale logic needed here anymore; the spin+fade
    // IS the transition between products.
    const globalP = scrollYProgress.get();
    const { tilt, opacity } = productAnimState(range, ranges, globalP);

    const targetZ = THREE.MathUtils.degToRad(tilt);
    current.rotation.z = THREE.MathUtils.damp(current.rotation.z, targetZ, 7, delta);

    // Skip rendering entirely once fully faded — avoids paying for an
    // invisible model's draw calls while it waits for its next chapter.
    current.visible = opacity > 0.01;

    current.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((m) => {
        if (!("opacity" in m)) return;
        const mat = m as THREE.MeshStandardMaterial;
        mat.opacity = THREE.MathUtils.damp(mat.opacity, opacity, 10, delta);
      });
    });
  });

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
}

export default function ShowcaseScene({ ranges, scrollYProgress }: ShowcaseSceneProps) {
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight
        position={[-4, 6, 5]}
        intensity={2.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0005}
      />
      <pointLight position={[4, 2.5, 3]} intensity={16} />
      <Environment resolution={128}>
        <Lightformer intensity={2.2} position={[0, 5, 3]} scale={[8, 3, 1]} />
        <Lightformer intensity={1.1} position={[-4, 1, 2]} rotation-y={Math.PI / 2} scale={[5, 2, 1]} />
      </Environment>

      <group position={[0, -1.35, 0]}>
        <ContactShadows position={[0, -0.01, 0]} opacity={0.55} scale={6} blur={1.6} far={1.2} resolution={512} />
        <Suspense fallback={null}>
          {ranges.map((range) => (
            <ProductModel key={range.product.id} range={range} ranges={ranges} scrollYProgress={scrollYProgress} />
          ))}
        </Suspense>
      </group>
    </>
  );
}