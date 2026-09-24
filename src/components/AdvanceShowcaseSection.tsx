// components/AdvanceShowcaseSection.tsx
import { Component, Suspense, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, useGLTF } from "@react-three/drei";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import * as THREE from "three";
import type { AdvanceProduct } from "@/data/advance-product";

const EASE = [0.22, 1, 0.36, 1] as const;
const CHAPTER_VH = 55;
const IDLE_ORBIT_SPEED = 0.16;
const TUBE_TILT = 0;

function Tube({ model }: { model: string }) {
  const { scene } = useGLTF(model);
  const spin = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const spinVelocity = useRef(0);
  const manualRotationY = useRef(0);

  const prepared = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((c) => {
      if (!(c instanceof THREE.Mesh)) return;
      c.castShadow = true;
      c.receiveShadow = true;
      const mats = Array.isArray(c.material) ? c.material : [c.material];
      c.material = Array.isArray(c.material) ? mats.map((m) => m.clone()) : mats[0].clone();
    });
    const size = new THREE.Box3().setFromObject(clone).getSize(new THREE.Vector3());
    clone.scale.setScalar(3.4 / Math.max(size.y, 0.0001));
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.set(-center.x, -box.min.y, -center.z);
    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    if (dragging.current) {
      // handled in pointer move
    } else if (Math.abs(spinVelocity.current) > 0.0001) {
      manualRotationY.current += spinVelocity.current;
      spinVelocity.current *= 0.94;
    } else {
      manualRotationY.current += IDLE_ORBIT_SPEED * delta;
    }
    if (spin.current) spin.current.rotation.y = manualRotationY.current;
  });

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
    const rotationDelta = deltaX * 0.01;
    manualRotationY.current += rotationDelta;
    spinVelocity.current = rotationDelta;
  };

  const handlePointerUp = () => {
    dragging.current = false;
  };

  return (
    <group ref={tilt} rotation-z={TUBE_TILT}>
      <group ref={spin} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerOut={handlePointerUp}>
        <primitive object={prepared} />
      </group>
    </group>
  );
}

class TubeErrorBoundary extends Component<{ children: ReactNode; model: string }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch(error: Error) {
    console.warn(`[AdvanceShowcase] Failed to load ${this.props.model}`, error);
  }
  override render() {
    if (this.state.failed) {
      return (
        <mesh position={[0, 1.7, 0]} rotation-z={TUBE_TILT}>
          <boxGeometry args={[1, 3.4, 0.55]} />
          <meshStandardMaterial color="#c7cdd6" roughness={0.5} />
        </mesh>
      );
    }
    return this.props.children;
  }
}

function Scene({ model, accent }: { model: string; accent: string }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[-4, 6, 5]} intensity={2.6} color="#ffffff" />
      <pointLight position={[4, 2, 3]} intensity={13} color="#f0f7f3" />
      <pointLight position={[-3, 1.5, -2]} intensity={9} color={accent} />
      <Environment resolution={128}>
        <Lightformer intensity={2.1} position={[0, 5, 3]} scale={[8, 3, 1]} color="#ffffff" />
        <Lightformer intensity={1.3} position={[-4, 1, 2]} rotation-y={Math.PI / 2} scale={[5, 2, 1]} color={accent} />
      </Environment>
      <group position={[0, -1.5, 0]}>
        <Suspense fallback={null}>
          <TubeErrorBoundary model={model}>
            <Tube model={model} />
          </TubeErrorBoundary>
        </Suspense>
        <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={7} blur={2.4} far={2.5} resolution={512} />
      </group>
    </>
  );
}

const RING_R = 38;
const RING_CENTER = 50;
const RING_DOTS = {
  topLeft: { dot: [23.13, 23.13] as const, stub: [14.65, 14.65] as const },
  topRight: { dot: [76.87, 23.13] as const, stub: [85.36, 14.65] as const },
  bottomLeft: { dot: [23.13, 76.87] as const, stub: [14.65, 85.36] as const },
  bottomRight: { dot: [76.87, 76.87] as const, stub: [85.36, 85.36] as const },
};

function OrbitRing({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 100 100" className="pointer-events-none absolute left-1/2 top-1/2 z-0 size-[78%] -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
      <circle cx={RING_CENTER} cy={RING_CENTER} r={RING_R} fill="none" stroke={accent} strokeWidth="0.4" opacity={0.5} />
      {Object.values(RING_DOTS).map(({ dot, stub }, i) => (
        <g key={i} opacity={0.6}>
          <line x1={dot[0]} y1={dot[1]} x2={stub[0]} y2={stub[1]} stroke={accent} strokeWidth="0.4" />
          <circle cx={dot[0]} cy={dot[1]} r="0.9" fill={accent} />
        </g>
      ))}
    </svg>
  );
}


function SpecCard({
  feature,
  accent,
  headingColor,
  active,
  position,
  onClick,
}: {
  feature: AdvanceProduct["features"][number];
  accent: string;
  headingColor: string;
  active: boolean;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  onClick: () => void;
}) {
  const pos: Record<typeof position, string> = {
    "top-left": "left-[7%] top-[16%] sm:left-[11%] sm:top-[14%]",
    "top-right": "right-[5%] top-[16%] sm:right-[9%] sm:top-[14%]",
    "bottom-left": "left-[5%] bottom-[18%] sm:left-[9%] sm:bottom-[16%]",
    "bottom-right": "right-[7%] bottom-[18%] sm:right-[11%] sm:bottom-[16%]",
  };
  const Icon = feature.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`pointer-events-auto absolute z-10 flex w-[7.5rem] flex-col items-center gap-2 text-center transition-opacity duration-300 sm:w-[8.5rem] ${pos[position]}`}
      style={{ opacity: active ? 1 : 0.55 }}
    >
      {/* Frosted-glass badge instead of solid white — reads better on a dark bg */}
      <span
        className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/10 backdrop-blur-md transition-transform duration-300 sm:size-12"
        style={{ color: accent, transform: active ? "scale(1.1)" : "scale(1)" }}
      >
        <Icon aria-hidden="true" className="size-5 stroke-[1.7] sm:size-5.5" />
      </span>
      <p className="text-[0.72rem] font-semibold leading-tight sm:text-[0.78rem]" style={{ color: headingColor }}>{feature.ingredient}</p>
      <p className="font-semibold" style={{ color: accent }}>{feature.percent}</p>
    </button>
  );
}

export function AdvanceShowcaseSection({ product, nextColor }: { product: AdvanceProduct; nextColor?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const N = product.features.length;

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.min(N - 1, Math.floor(p * N));
    setActiveFeature((prev) => (prev === i ? prev : i));
  });

// In both files — the transform:
const gradientOpacity = useTransform(scrollYProgress, [0.9, 1], [0, 1]);

  const feature = product.features[activeFeature]!;
  const positions = ["top-left", "top-right", "bottom-left", "bottom-right"] as const;
  const [eyebrowLine1, eyebrowLine2] = product.subtitle.split(" — ");

  const jumpTo = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const scrollable = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.5) / N) * scrollable, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} id="advance" className="relative" style={{ height: `${N * CHAPTER_VH + 100}vh`, scrollSnapAlign: "start" }}>
      <div className="sticky top-0 h-screen overflow-hidden" style={{ backgroundColor: product.bg }}>

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: `radial-gradient(${product.accent} 1px, transparent 1px)`, backgroundSize: "34px 34px" }}
        />

        <div className="absolute inset-y-0 right-0 z-0 w-full sm:w-[62%]" style={{ top: "var(--nav-h, 4.75rem)" }}>
          <OrbitRing accent={product.accent} />
          <div className="absolute inset-0 z-10">
            <Canvas dpr={[1, 2]} camera={{ position: [0, 0.3, 9], fov: 25 }} gl={{ alpha: true, antialias: true }}>
              <Scene model={product.model} accent={product.accent} />
            </Canvas>
          </div>
          {product.features.map((f, i) => (
            <SpecCard
              key={f.ingredient}
              feature={f}
              accent={product.accent}
              headingColor={product.headingColor}
              active={i === activeFeature}
              position={positions[i] ?? "top-left"}
              onClick={() => jumpTo(i)}
            />
          ))}
        </div>

        <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[90rem] items-center px-8 lg:px-16">
          <div className="w-[420px] text-left">
            <p className="mb-5 font-mono text-[0.68rem] uppercase leading-relaxed tracking-[0.18em]" style={{ color: product.mutedColor }}>
              {eyebrowLine1}
              {eyebrowLine2 && (
                <>
                  <br />– {eyebrowLine2}
                </>
              )}
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={feature.headline}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <h2 className="text-[clamp(2.75rem,4.6vw,4rem)] font-extrabold leading-[1.02]" style={{ color: product.headingColor }}>
                  {feature.headline}
                </h2>
                <p className="mt-4 max-w-sm text-[15px] leading-7" style={{ color: product.bodyColor }}>{feature.body}</p>
              </motion.div>
            </AnimatePresence>

            <button
              type="button"
              onClick={() => jumpTo(Math.min(activeFeature + 1, N - 1))}
              className="pointer-events-auto mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[0.95rem] font-semibold text-white transition-transform duration-200 hover:scale-105"
              style={{ backgroundColor: product.accent }}
            >
              {product.ctaLabel}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-8 left-8 z-10 flex items-center gap-3 sm:bottom-10 sm:left-16">
          <span className="h-px w-8" style={{ backgroundColor: product.accent }} />
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em]" style={{ color: product.mutedColor }}>{product.tagline}</p>
        </div>

{nextColor && (
  <motion.div
    className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[35vh]"
    style={{
      opacity: gradientOpacity,
      background: `linear-gradient(to top, ${nextColor} 0%, ${nextColor}00 100%)`,
    }}
    aria-hidden="true"
  />
)}   </div>
    </section>
  );
}