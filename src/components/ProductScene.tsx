// components/ProductScene.tsx
import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";

type ModelName = "paste-4" | "paste-2" | "paste-3";

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

/**
 * PLACEMENT ON bg.png
 * ANCHOR = where the 3D origin lands on the background image (0-1).
 * DEFAULT_PLACEMENT = fine-tune values. Press "D" in the browser to nudge them
 * live, then paste the numbers printed in the console here.
 */
const ANCHOR = { x: 0.68, y: 0.73 };
const DEFAULT_PLACEMENT = { x: 0, y: -0.02, scale: 0.75 };
const MOBILE_SCALE_BOOST = 1.4;

// How far each tube base is sunk into the marble so there is never a gap.
const BASE_SINK = 0.012;

// Drop-in intro animation (seconds / world units)
const DROP = { startDelay: 0.5, stagger: 0.13, duration: 0.9, height: 1.8, squashTime: 0.4 };

// Product arrangement: edit this one array when swapping or repositioning models.
// y = 0 is the podium top surface.
const PRODUCT_SLOTS: SlotConfig[] = [
  { id: "slot-1", model: "paste-4", targetHeight: 2.3, position: [-1.48, 0, 0.05], rotationY: -0.06 },
  { id: "slot-2", model: "paste-2", targetHeight: 2.3, position: [-0.74, 0, 0.02], rotationY: -0.03 },
  { id: "slot-3", model: "paste-3", targetHeight: 2.3, position: [0, 0, 0], rotationY: 0 },
  { id: "slot-4", model: "paste-4", targetHeight: 2.0, position: [0.74, 0, 0.02], rotationY: 0.03 },
  { id: "slot-5", model: "paste-2", targetHeight: 2.0, position: [1.48, 0, 0.05], rotationY: 0.06 },
];

const MODEL_PATHS: Record<ModelName, string> = {
  "paste-4": "/models/paste-4.glb",
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
    // Base of the model sits exactly at y = 0
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

/** Soft dark radial blob used as a grounding shadow under each tube. */
function useBlobShadowTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(20,30,50,0.6)");
    g.addColorStop(0.55, "rgba(20,30,50,0.28)");
    g.addColorStop(1, "rgba(20,30,50,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }, []);
}

function ProductModel({ slot, index, reducedMotion }: { slot: SlotConfig; index: number; reducedMotion: boolean }) {
  const { scene } = useGLTF(MODEL_PATHS[slot.model]);
  const model = usePreparedModel(scene, slot);
  const shadow = useBlobShadowTexture();
  const outer = useRef<THREE.Group>(null); // owns this product's own independent rotation
  const drop = useRef<THREE.Group>(null);
  const group = useRef<THREE.Group>(null);
  const shadowMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const born = useRef<number | null>(null);
  const targetScale = useRef(new THREE.Vector3(1, 1, 1));
  const [hovered, setHovered] = useState(false);

  // Per-product drag-to-spin state — independent of every other slot.
  const dragging = useRef(false);
  const lastX = useRef(0);
  const spinVelocity = useRef(0);
  const manualSpin = useRef(slot.rotationY);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  useFrame(({ clock }, delta) => {
    // Hover: scales from the base, never lifts
    if (group.current) {
      const s = hovered ? 1.04 : 1;
      targetScale.current.set(s, s, s);
      group.current.scale.lerp(targetScale.current, 1 - Math.exp(-10 * delta));
    }

    // Per-product spin — only this tube's outer group is touched, others are unaffected
    if (outer.current && !reducedMotion) {
      if (dragging.current) {
        outer.current.rotation.y = manualSpin.current;
      } else if (Math.abs(spinVelocity.current) > 0.0001) {
        manualSpin.current += spinVelocity.current;
        spinVelocity.current *= 0.94; // momentum decay
        outer.current.rotation.y = manualSpin.current;
      }
      // else: at rest — stays wherever the user left it
    }

    if (!drop.current) return;
    born.current ??= clock.elapsedTime;

    // Intro: tube drops onto the podium, then lands with a small squash. Ends at exactly y = 0.
    let fall = 1;
    let squash = 0;
    if (!reducedMotion) {
      const elapsed = clock.elapsedTime - born.current - DROP.startDelay - index * DROP.stagger;
      const t = THREE.MathUtils.clamp(elapsed / DROP.duration, 0, 1);
      fall = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const st = THREE.MathUtils.clamp((elapsed - DROP.duration) / DROP.squashTime, 0, 1);
      squash = st > 0 && st < 1 ? Math.sin(st * Math.PI) * 0.035 : 0;
      drop.current.visible = t > 0;
    }
    drop.current.position.y = DROP.height * (1 - fall);
    drop.current.scale.set(1 + squash * 0.6, 1 - squash, 1 + squash * 0.6);
    if (shadowMaterial.current) shadowMaterial.current.opacity = fall;
  });

  // Per-product pointer handlers — dragging one tube never affects the others.
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    dragging.current = true;
    lastX.current = e.clientX;
    spinVelocity.current = 0;
    (e.target as Element & { setPointerCapture?: (id: number) => void })?.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) return;
    const deltaX = e.clientX - lastX.current;
    lastX.current = e.clientX;
    const rotationDelta = deltaX * 0.01; // single tube — snappier feel than a group drag
    manualSpin.current += rotationDelta;
    spinVelocity.current = rotationDelta;
  };

  const handlePointerUp = () => {
    dragging.current = false;
  };

  return (
    <group
      ref={outer}
      position={slot.position}
      rotation-y={slot.rotationY}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOut={handlePointerUp}
    >
      {/* Blob shadow on the marble: never moves, fades in as the tube lands */}
      <mesh rotation-x={-Math.PI / 2} position={[0.06, 0.006, 0.02]} renderOrder={1}>
        <planeGeometry args={[1.05, 0.5]} />
        <meshBasicMaterial ref={shadowMaterial} map={shadow} transparent opacity={reducedMotion ? 1 : 0} depthWrite={false} toneMapped={false} />
      </mesh>

      <group ref={drop}>
        <group
          ref={group}
          onPointerEnter={(event) => {
            event.stopPropagation();
            setHovered(true);
          }}
          onPointerLeave={() => setHovered(false)}
        >
          <group position={[0, -BASE_SINK, 0]}>
            <primitive object={model} />
          </group>
        </group>
      </group>
    </group>
  );
}

class ModelErrorBoundary extends Component<{ children: ReactNode; slot: SlotConfig }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch(error: Error) {
    console.warn(`[Totalflux 3D] Failed to load ${this.props.slot.model}; showing fallback for ${this.props.slot.id}.`, error);
  }
  override render() {
    return this.state.failed ? <FallbackProduct slot={this.props.slot} /> : this.props.children;
  }
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

/** Shifts the camera view so the 3D origin lands on the podium in bg.png. */
function CameraFraming() {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const { width, height } = size;
    cam.setViewOffset(width, height, -(ANCHOR.x - 0.5) * width, -(ANCHOR.y - 0.5) * height, width, height);
    cam.updateProjectionMatrix();
    return () => {
      cam.clearViewOffset();
      cam.updateProjectionMatrix();
    };
  }, [camera, size]);

  return null;
}

type Placement = typeof DEFAULT_PLACEMENT;

function Scene({ reducedMotion, mobile, placement }: { reducedMotion: boolean; mobile: boolean; placement: Placement }) {
  const light = useSceneColor("--scene-light", "#fffaf0");
  const fill = useSceneColor("--scene-fill", "#d8eaf7");

  const slots = mobile ? PRODUCT_SLOTS.slice(0, 3) : PRODUCT_SLOTS;
  const scale = placement.scale * (mobile ? MOBILE_SCALE_BOOST : 1);

  return (
    <>
      <CameraFraming />
      <ambientLight intensity={0.8} />
      {/* Warm key from the top-left, matching the light rays in bg.png */}
      <directionalLight
        position={[-4, 6, 5]}
        intensity={2.6}
        color={light}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0005}
      />
      <pointLight position={[4, 2.5, 3]} intensity={16} color={fill} />
      <Environment resolution={128}>
        <Lightformer intensity={2.2} position={[0, 5, 3]} scale={[8, 3, 1]} color={light} />
        <Lightformer intensity={1.1} position={[-4, 1, 2]} rotation-y={Math.PI / 2} scale={[5, 2, 1]} color={fill} />
      </Environment>

      <group position={[placement.x, placement.y, 0]} scale={scale}>
        {/* Invisible plane that only shows the tubes' cast shadows on the marble */}
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, 0]} receiveShadow>
          <planeGeometry args={[14, 8]} />
          <shadowMaterial opacity={0.3} />
        </mesh>
        <ContactShadows position={[0, 0.004, 0.1]} opacity={0.55} scale={6} blur={1.6} far={1.2} resolution={512} />

        <group position={[mobile ? 0.74 : 0, 0, 0]}>
          <Suspense fallback={null}>
            {slots.map((slot, index) => (
              <ModelErrorBoundary key={slot.id} slot={slot}>
                <ProductModel slot={slot} index={index} reducedMotion={reducedMotion} />
              </ModelErrorBoundary>
            ))}
          </Suspense>
        </group>
      </group>
    </>
  );
}

function DebugPanel({ placement }: { placement: Placement }) {
  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[100] rounded-md bg-black/80 p-3 font-mono text-xs leading-5 text-white">
      <div className="font-bold">DEBUG (press D to hide)</div>
      <div>Arrow keys: move x / y</div>
      <div>+ / - : scale</div>
      <div>x: {placement.x.toFixed(2)}</div>
      <div>y: {placement.y.toFixed(2)}</div>
      <div>scale: {placement.scale.toFixed(2)}</div>
    </div>
  );
}

export default function ProductScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [debug, setDebug] = useState(false);
  const [placement, setPlacement] = useState<Placement>(DEFAULT_PLACEMENT);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 639px)");
    const update = () => {
      setReducedMotion(motionQuery.matches);
      setMobile(mobileQuery.matches);
    };
    update();
    motionQuery.addEventListener("change", update);
    mobileQuery.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? true), { threshold: 0.05 });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", update);
      mobileQuery.removeEventListener("change", update);
    };
  }, []);

  // Debug controls: D toggles, arrows move, +/- scale.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key;
      if (key === "d" || key === "D") {
        setDebug((value) => !value);
        return;
      }
      if (!debug) return;
      const step = 0.02;
      setPlacement((prev) => {
        const next = { ...prev };
        if (key === "ArrowLeft") next.x -= step;
        else if (key === "ArrowRight") next.x += step;
        else if (key === "ArrowUp") next.y += step;
        else if (key === "ArrowDown") next.y -= step;
        else if (key === "+" || key === "=") next.scale += 0.02;
        else if (key === "-" || key === "_") next.scale -= 0.02;
        else return prev;
        event.preventDefault();
        next.scale = Math.max(0.1, next.scale);
        console.log(`[Totalflux 3D] DEFAULT_PLACEMENT = { x: ${next.x.toFixed(2)}, y: ${next.y.toFixed(2)}, scale: ${next.scale.toFixed(2)} }`);
        return next;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [debug]);

  return (
    <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 2]}
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 1.12, 8], fov: 28, near: 0.1, far: 60 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Scene reducedMotion={reducedMotion} mobile={mobile} placement={placement} />
      </Canvas>
      {debug && <DebugPanel placement={placement} />}
    </div>
  );
}