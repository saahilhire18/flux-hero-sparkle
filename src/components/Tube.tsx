import {
  Component,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "motion/react";

interface TubeProps {
  model: string;
  tilt: MotionValue<number>;
  opacity: MotionValue<number>;
}

export function Tube({
  model,
  tilt,
  opacity,
}: TubeProps) {
  const { scene } = useGLTF(model);

  const groupRef = useRef<THREE.Group>(null);

  const materialsRef = useRef<THREE.Material[]>([]);

  const preparedScene = useMemo(() => {
    const clone = scene.clone(true);

    const materials: THREE.Material[] = [];

    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;

      const sourceMaterials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      const clonedMaterials = sourceMaterials.map(
        (material) => {
          const clonedMaterial = material.clone();

          clonedMaterial.transparent = true;

          materials.push(clonedMaterial);

          return clonedMaterial;
        },
      );

      object.material = Array.isArray(object.material)
        ? clonedMaterials
        : clonedMaterials[0];
    });

    materialsRef.current = materials;

    /*
     * Normalize model size.
     */
    const box = new THREE.Box3().setFromObject(clone);

    const size = box.getSize(
      new THREE.Vector3(),
    );

    const maxHeight = Math.max(
      size.y,
      0.0001,
    );

    clone.scale.setScalar(
      3.2 / maxHeight,
    );

    /*
     * Recalculate after scaling.
     */
    const scaledBox = new THREE.Box3().setFromObject(
      clone,
    );

    const center = scaledBox.getCenter(
      new THREE.Vector3(),
    );

    clone.position.set(
      -center.x,
      -scaledBox.min.y,
      -center.z,
    );

    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    /*
     * Rotation.
     */
    const targetTilt = THREE.MathUtils.degToRad(
      tilt.get(),
    );

    group.rotation.z = THREE.MathUtils.damp(
      group.rotation.z,
      targetTilt,
      6,
      delta,
    );

    /*
     * Opacity.
     */
    const targetOpacity = THREE.MathUtils.clamp(
      opacity.get(),
      0,
      1,
    );

    for (const material of materialsRef.current) {
      material.opacity = THREE.MathUtils.damp(
        material.opacity,
        targetOpacity,
        10,
        delta,
      );

      material.transparent = true;
      material.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={preparedScene} />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Error Boundary                                                             */
/* -------------------------------------------------------------------------- */

interface TubeErrorBoundaryProps {
  children: ReactNode;
  model: string;
}

interface TubeErrorBoundaryState {
  failed: boolean;
}

export class TubeErrorBoundary extends Component<
  TubeErrorBoundaryProps,
  TubeErrorBoundaryState
> {
override state: TubeErrorBoundaryState = {
  failed: false,
};

  static getDerivedStateFromError(): TubeErrorBoundaryState {
    return {
      failed: true,
    };
  }

  override componentDidCatch(
    error: Error,
  ) {
    console.error(
      `[Showcase] Failed to render model: ${this.props.model}`,
      error,
    );
  }

  override render() {
    if (this.state.failed) {
      return (
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry
            args={[0.9, 3.2, 0.5]}
          />

          <meshStandardMaterial
            color="#c7cdd6"
            roughness={0.5}
            transparent
            opacity={1}
          />
        </mesh>
      );
    }

    return this.props.children;
  }
}