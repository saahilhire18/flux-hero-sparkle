import {
  Suspense,
  useMemo,
  useRef,
} from "react";

import {
  Canvas,
  useFrame,
} from "@react-three/fiber";

import {
  ContactShadows,
  Environment,
  Lightformer,
  useGLTF,
} from "@react-three/drei";

import * as THREE from "three";

import type {
  MotionValue,
} from "motion/react";

import type { Product } from "@/data/products";

/* ================================================================
   TYPES
================================================================ */

type ScrollProductSceneProps = {
  products: Product[];
  activeIndex: number;
  rotation: MotionValue<number>;
};

type ProductModelProps = {
  product: Product;
  index: number;
  activeIndex: number;
  rotation: MotionValue<number>;
};

/* ================================================================
   PRODUCT MODEL
================================================================ */

function ProductModel({
  product,
  index,
  activeIndex,
  rotation,
}: ProductModelProps) {
  const { scene } = useGLTF(
    product.model
  );

  const group =
    useRef<THREE.Group>(null);

  /* ================================================================
     PREPARE GLB
  ================================================================ */

  const model = useMemo(() => {
    const clone =
      scene.clone(true);

    clone.traverse(
      (child) => {
        if (
          !(
            child instanceof THREE.Mesh
          )
        ) {
          return;
        }

        child.castShadow = true;
        child.receiveShadow = true;

        const materials =
          Array.isArray(
            child.material
          )
            ? child.material
            : [child.material];

        const clonedMaterials =
          materials.map(
            (material) => {
              const next =
                material.clone();

              if (
                "envMapIntensity" in
                next
              ) {
                (
                  next as THREE.MeshStandardMaterial
                ).envMapIntensity = 1.2;
              }

              return next;
            }
          );

        child.material =
          Array.isArray(
            child.material
          )
            ? clonedMaterials
            : clonedMaterials[0];
      }
    );

    /* =============================================================
       NORMALIZE PRODUCT HEIGHT
    ============================================================= */

    const initialBox =
      new THREE.Box3().setFromObject(
        clone
      );

    const initialSize =
      initialBox.getSize(
        new THREE.Vector3()
      );

    const targetHeight = 3.2;

    clone.scale.setScalar(
      targetHeight /
        Math.max(
          initialSize.y,
          0.0001
        )
    );

    /* =============================================================
       CENTER PRODUCT
    ============================================================= */

    const scaledBox =
      new THREE.Box3().setFromObject(
        clone
      );

    const center =
      scaledBox.getCenter(
        new THREE.Vector3()
      );

    clone.position.set(
      -center.x,
      -scaledBox.min.y,
      -center.z
    );

    return clone;
  }, [scene]);

  /* ================================================================
     SMOOTH R3F ANIMATION
  ================================================================ */

  useFrame((_, delta) => {
    const current =
      group.current;

    if (!current) {
      return;
    }

    const isActive =
      index === activeIndex;

    const isBefore =
      index < activeIndex;

    /* =============================================================
       HORIZONTAL PRODUCT TRANSITION
    ============================================================= */

    const targetX = isActive
      ? 0
      : isBefore
        ? -2.2
        : 2.2;

    current.position.x =
      THREE.MathUtils.damp(
        current.position.x,
        targetX,
        5,
        delta
      );

    /* =============================================================
       SCALE TRANSITION
    ============================================================= */

    const targetScale =
      isActive ? 1 : 0.86;

    const nextScale =
      THREE.MathUtils.damp(
        current.scale.x,
        targetScale,
        6,
        delta
      );

    current.scale.setScalar(
      nextScale
    );

    /* =============================================================
       CONTINUOUS SCROLL ROTATION

       IMPORTANT:
       We read the MotionValue directly
       inside useFrame.

       No React state update.
       No re-render.
       Extremely smooth.
    ============================================================= */

    if (isActive) {
      const targetRotation =
        rotation.get();

      current.rotation.y =
        THREE.MathUtils.damp(
          current.rotation.y,
          targetRotation,
          8,
          delta
        );
    }
  });

  return (
    <group ref={group}>
      <primitive
        object={model}
      />
    </group>
  );
}

/* ================================================================
   THREE.JS SCENE
================================================================ */

function Scene({
  products,
  activeIndex,
  rotation,
}: ScrollProductSceneProps) {
  return (
    <>
      {/* ==========================================================
          BASE LIGHT
      ========================================================== */}

      <ambientLight
        intensity={0.8}
      />

      {/* ==========================================================
          KEY LIGHT
      ========================================================== */}

      <directionalLight
        position={[-4, 6, 5]}
        intensity={2.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0005}
      />

      {/* ==========================================================
          FILL LIGHT
      ========================================================== */}

      <pointLight
        position={[4, 2.5, 3]}
        intensity={16}
      />

      {/* ==========================================================
          STUDIO ENVIRONMENT
      ========================================================== */}

      <Environment
        resolution={128}
      >
        <Lightformer
          intensity={2.2}
          position={[0, 5, 3]}
          scale={[8, 3, 1]}
        />

        <Lightformer
          intensity={1.1}
          position={[-4, 1, 2]}
          rotation-y={
            Math.PI / 2
          }
          scale={[5, 2, 1]}
        />
      </Environment>

      {/* ==========================================================
          PRODUCT STAGE
      ========================================================== */}

      <group
        position={[0, -1.35, 0]}
      >
        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.55}
          scale={6}
          blur={1.6}
          far={1.2}
          resolution={512}
        />

        <Suspense fallback={null}>
          {products.map(
            (product, index) => (
              <ProductModel
                key={product.id}
                product={product}
                index={index}
                activeIndex={
                  activeIndex
                }
                rotation={rotation}
              />
            )
          )}
        </Suspense>
      </group>
    </>
  );
}

/* ================================================================
   CANVAS
================================================================ */

export default function ScrollProductScene({
  products,
  activeIndex,
  rotation,
}: ScrollProductSceneProps) {
  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: [0, 0.5, 8],
          fov: 28,
          near: 0.1,
          far: 60,
        }}
        gl={{
          alpha: true,
          antialias: true,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(
            0x000000,
            0
          );
        }}
      >
        <Scene
          products={products}
          activeIndex={activeIndex}
          rotation={rotation}
        />
      </Canvas>
    </div>
  );
}