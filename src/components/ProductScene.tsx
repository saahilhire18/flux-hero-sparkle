import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

type ModelName = "paste-1" | "paste-2" | "paste-3";

type SlotConfig = {
  id: string;
  model: ModelName;
  targetHeight: number;
  position: [number, number, number];
  rotationY: number;
  tint?: string;
  labelTexture?: string;
  flipX?: boolean;
};

// Product arrangement: edit this one array when swapping or repositioning models.
const PRODUCT_SLOTS: SlotConfig[] = [
  { id: "slot-1", model: "paste-1", targetHeight: 1.0, position: [-1.6, 0, 0.1], rotationY: -0.15 },
  { id: "slot-2", model: "paste-2", targetHeight: 1.0, position: [-0.8, 0, 0.25], rotationY: -0.08 },
  { id: "slot-3", model: "paste-3", targetHeight: 1.0, position: [0, 0, 0.3], rotationY: 0 },
  { id: "slot-4", model: "paste-1", targetHeight: 0.7, position: [0.85, 0, 0.2], rotationY: 0.1 },
  { id: "slot-5", model: "paste-2", targetHeight: 0.7, position: [1.6, 0, 0.1], rotationY: 0.15 },
];

const MODEL_PATHS: Record<ModelName, string> = {
  "paste-1": "/models/paste-1.glb",
  "paste-2": "/models/paste-2.glb",
  "paste-3": "/models/paste-3.glb",
};

Object.values(MODEL_PATHS).forEach((path) => useGLTF.preload(path));

function useSceneColor(token: string, fallback: string) {
  return useMemo(() => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    return value || fallback;
  }, [token, fallback]);
}

function usePreparedModel(source: THREE.Group, slot: SlotConfig) {
  return useMemo(() => {
    const object = source.clone(true);
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      const cloned = materials.map((material) => {
        const next = material.clone();
        if ("envMapIntensity" in next) (next as THREE.MeshStandardMaterial).envMapIntensity = 1.2;
        if (slot.tint && "color" in next) (next as THREE.MeshStandardMaterial).color.multiply(new THREE.Color(slot.tint));
        return next;
      });
      child.material = Array.isArray(child.material) ? cloned : cloned[0];
    });

    const initial = new THREE.Box3().setFromObject(object);
    const size = initial.getSize(new THREE.Vector3());
    object.scale.setScalar(slot.targetHeight / Math.max(size.y, 0.0001));
    if (slot.flipX) object.scale.x *= -1;
    const scaled = new THREE.Box3().setFromObject(object);
    const center = scaled.getCenter(new THREE.Vector3());
    object.position.set(-center.x, -scaled.min.y, -center.z);

    if (slot.labelTexture) {
      new THREE.TextureLoader().load(slot.labelTexture, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        object.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.map = texture;
            child.material.needsUpdate = true;
          }
        });
      });
    }
    return object;
  }, [source, slot]);
}

function ProductModel({ slot, index, reducedMotion }: { slot: SlotConfig; index: number; reducedMotion: boolean }) {
  const { scene } = useGLTF(MODEL_PATHS[slot.model]);
  const model = usePreparedModel(scene, slot);
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => { document.body.style.cursor = "auto"; };
  }, [hovered]);

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const targetScale = hovered ? 1.05 : 1;
    const targetY = (hovered ? 0.055 : 0) + (reducedMotion ? 0 : Math.sin(clock.elapsedTime * 1.1 + index * 0.8) * 0.018);
    group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 1 - Math.exp(-10 * delta));
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetY, 10, delta);
  });

  return (
    <group ref={group} position={slot.position} rotation-y={slot.rotationY} onPointerEnter={(event) => { event.stopPropagation(); setHovered(true); }} onPointerLeave={() => setHovered(false)}>
      <primitive object={model} />
    </group>
  );
}

class ModelErrorBoundary extends Component<{ children: ReactNode; slot: SlotConfig }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  override componentDidCatch(error: Error) { console.warn(`[Totalflux 3D] Failed to load ${this.props.slot.model}; showing fallback for ${this.props.slot.id}.`, error); }
  override render() { return this.state.failed ? <FallbackProduct slot={this.props.slot} /> : this.props.children; }
}

function FallbackProduct({ slot }: { slot: SlotConfig }) {
  const color = useSceneColor("--scene-fallback", "#dbeaf5");
  return (
    <mesh position={[slot.position[0], slot.targetHeight / 2, slot.position[2]]} rotation-y={slot.rotationY} castShadow>
      <boxGeometry args={[slot.targetHeight * 0.28, slot.targetHeight, slot.targetHeight * 0.16]} />
      <meshStandardMaterial color={color} roughness={0.45} />
    </mesh>
  );
}

function MintSprig() {
  const mint = useSceneColor("--scene-mint", "#5eae91");
  const stem = useSceneColor("--scene-mint-dark", "#377c65");
  return (
    <group position={[-1.65, 0.13, 0.92]} rotation={[0.08, -0.35, -0.25]}>
      <mesh rotation-z={Math.PI / 2} castShadow><cylinderGeometry args={[0.012, 0.014, 0.82, 8]} /><meshStandardMaterial color={stem} roughness={0.8} /></mesh>
      {[-0.27, -0.05, 0.18, 0.35].map((x, index) => (
        <mesh key={x} position={[x, index % 2 ? 0.1 : -0.08, 0]} rotation={[Math.PI / 2, 0, index % 2 ? -0.55 : 0.55]} scale={[0.17, 0.3, 0.08]} castShadow>
          <sphereGeometry args={[1, 16, 10]} /><meshStandardMaterial color={mint} roughness={0.72} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ reducedMotion, mobile }: { reducedMotion: boolean; mobile: boolean }) {
  const podium = useSceneColor("--scene-podium", "#f7f9fb");
  const light = useSceneColor("--scene-light", "#ffffff");
  const fill = useSceneColor("--scene-fill", "#d8eff2");
  const rig = useRef<THREE.Group>(null);
  const pointer = useThree((state) => state.pointer);

  useFrame((_, delta) => {
    if (!rig.current || reducedMotion) return;
    rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, pointer.x * THREE.MathUtils.degToRad(8), 4, delta);
    rig.current.rotation.x = THREE.MathUtils.damp(rig.current.rotation.x, -pointer.y * THREE.MathUtils.degToRad(3), 4, delta);
  });

  const slots = mobile ? PRODUCT_SLOTS.slice(0, 3) : PRODUCT_SLOTS;
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[-4, 6, 5]} intensity={2.6} color={light} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-3} />
      <pointLight position={[4, 2.5, 3]} intensity={16} color={fill} />
      <Environment resolution={128}>
        <Lightformer intensity={2.2} position={[0, 5, 3]} scale={[8, 3, 1]} color={light} />
        <Lightformer intensity={1.1} position={[-4, 1, 2]} rotation-y={Math.PI / 2} scale={[5, 2, 1]} color={fill} />
      </Environment>
      <group ref={rig} position={[mobile ? 0.8 : 0, -0.75, 0]}>
        <mesh position={[0, 0.02, 0.1]} receiveShadow>
          <cylinderGeometry args={[2.65, 2.76, 0.32, 80, 1, false]} />
          <meshPhysicalMaterial color={podium} roughness={0.6} clearcoat={0.08} />
        </mesh>
        <Suspense fallback={null}>
          {slots.map((slot, index) => (
            <ModelErrorBoundary key={slot.id} slot={slot}>
              <ProductModel slot={slot} index={index} reducedMotion={reducedMotion} />
            </ModelErrorBoundary>
          ))}
        </Suspense>
        <MintSprig />
      </group>
      <ContactShadows position={[0, -0.92, 0.1]} opacity={0.22} scale={7} blur={2.8} far={4} />
      <OrbitControls enablePan={false} enableZoom={false} minAzimuthAngle={-0.14} maxAzimuthAngle={0.14} minPolarAngle={Math.PI / 2.35} maxPolarAngle={Math.PI / 2.1} target={[0, -0.1, 0]} enableDamping />
    </>
  );
}

export default function ProductScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 639px)");
    const update = () => { setReducedMotion(motionQuery.matches); setMobile(mobileQuery.matches); };
    update();
    motionQuery.addEventListener("change", update);
    mobileQuery.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? true), { threshold: 0.05 });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => { observer.disconnect(); motionQuery.removeEventListener("change", update); mobileQuery.removeEventListener("change", update); };
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full touch-pan-y" aria-hidden="true">
      <Canvas shadows dpr={[1, 2]} frameloop={visible && !reducedMotion ? "always" : "never"} camera={{ position: [0, mobile ? 0.95 : 1.1, mobile ? 4.8 : 5.8], fov: 31 }} gl={{ alpha: true, antialias: true }} onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}>
        <Scene reducedMotion={reducedMotion} mobile={mobile} />
      </Canvas>
    </div>
  );
}