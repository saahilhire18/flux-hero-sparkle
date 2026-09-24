// components/FeatureShowcaseSection.tsx
import { Component, Suspense, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, useGLTF } from "@react-three/drei";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import * as THREE from "three";
import type { ToothpasteSection } from "@/data/toothpaste-features";
import { FeatureBadge } from "@/components/FeatureBadge";

const EASE = [0.22, 1, 0.36, 1] as const;
const CHAPTER_VH = 55;
const IDLE_ORBIT_SPEED = 0.22;

function Tube({
  model,
  tilt,
  motionStyle,
}: {
  model: string;
  tilt: MotionValue<number>;
  motionStyle: "static" | "orbit";
}) {
  const { scene } = useGLTF(model);
  const group = useRef<THREE.Group>(null);
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
    clone.scale.setScalar(3.2 / Math.max(size.y, 0.0001));
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.set(-center.x, -box.min.y, -center.z);
    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const target = THREE.MathUtils.degToRad(tilt.get());
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, target, 6, delta);

    if (dragging.current) {
      // handled in pointer move
    } else if (Math.abs(spinVelocity.current) > 0.0001) {
      manualRotationY.current += spinVelocity.current;
      spinVelocity.current *= 0.94;
    } else if (motionStyle === "orbit") {
      manualRotationY.current += IDLE_ORBIT_SPEED * delta;
    }
    group.current.rotation.y = manualRotationY.current;
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
    <group
      ref={group}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOut={handlePointerUp}
    >
      <primitive object={prepared} />
    </group>
  );
}

class TubeErrorBoundary extends Component<{ children: ReactNode; model: string }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch(error: Error) {
    console.warn(`[FeatureShowcase] Failed to load ${this.props.model}`, error);
  }
  override render() {
    if (this.state.failed) {
      return (
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[0.9, 3.2, 0.5]} />
          <meshStandardMaterial color="#c7cdd6" roughness={0.5} />
        </mesh>
      );
    }
    return this.props.children;
  }
}

function Scene({
  model,
  tilt,
  motionStyle,
  accent,
}: {
  model: string;
  tilt: MotionValue<number>;
  motionStyle: "static" | "orbit";
  accent: string;
}) {
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[-4, 6, 5]} intensity={2.4} color="#ffffff" />
      <pointLight position={[4, 2, 3]} intensity={12} color="#f4f6fa" />
      <pointLight position={[-3, 1, -2]} intensity={9} color={accent} />
      <Environment resolution={128}>
        <Lightformer intensity={2} position={[0, 5, 3]} scale={[8, 3, 1]} color="#ffffff" />
        <Lightformer intensity={1.2} position={[-4, 1, 2]} rotation-y={Math.PI / 2} scale={[5, 2, 1]} color={accent} />
      </Environment>
      <group position={[0, -1.7, 0]}>
        <Suspense fallback={null}>
          <TubeErrorBoundary model={model}>
            <Tube model={model} tilt={tilt} motionStyle={motionStyle} />
          </TubeErrorBoundary>
        </Suspense>
        <ContactShadows position={[0, 0, 0]} opacity={0.45} scale={7} blur={2.6} far={2.5} resolution={512} />
      </group>
    </>
  );
}

// Single large leaf-cluster image, centered directly behind the tube.
// Rendered BEFORE the Canvas div in the JSX below so it paints underneath —
// later DOM siblings always paint over earlier ones at equal/higher z-index,
// so call order here matters as much as the z-[2] value itself.
function FloatingLeaves() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden" aria-hidden="true">
      <img src="/leaves-mint.png" alt="" className="w-[70%] max-w-xl opacity-60 sm:w-[55%]" />
    </div>
  );
}

function FloatingSparkles({ accent }: { accent: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden="true">
      <Sparkles className="absolute left-[40%] top-[16%] size-16 sm:size-20" style={{ color: `${accent}55` }} strokeWidth={1.3} />
      <Sparkles className="absolute left-[62%] top-[12%] size-8 sm:size-10" style={{ color: `${accent}66` }} strokeWidth={1.5} />
      <Sparkles className="absolute left-[70%] top-[48%] size-6 sm:size-7" style={{ color: `${accent}77` }} strokeWidth={1.6} />
      <Sparkles className="absolute left-[76%] top-[64%] size-10 blur-[1px] sm:size-12" style={{ color: `${accent}50` }} strokeWidth={1.3} />
      <Sparkles className="absolute left-[46%] top-[70%] size-5 sm:size-6" style={{ color: `${accent}66` }} strokeWidth={1.6} />
    </div>
  );
}

export function FeatureShowcaseSection({ product, nextColor }: { product: ToothpasteSection; nextColor?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const N = product.features.length;

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.min(N - 1, Math.floor(p * N));
    setActiveFeature((prev) => (prev === i ? prev : i));
  });

  const tilt = useTransform(scrollYProgress, (p) => {
    const i = Math.min(N - 1, Math.floor(p * N));
    return product.features[i]?.tilt ?? 0;
  });

  const barScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Transition fade: only the final 10% of scroll, confined to a 35vh strip —
  // tuned down from earlier versions that washed out too much of the last chapter.
  const gradientOpacity = useTransform(scrollYProgress, [0.9, 1], [0, 1]);

  const feature = product.features[activeFeature]!;
  const [firstWord, ...restWords] = feature.headline.split(" ");
  const restOfHeadline = restWords.join(" ");

  const jumpTo = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const scrollable = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.5) / N) * scrollable, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${N * CHAPTER_VH + 100}vh`, scrollSnapAlign: "start" }}>
      {/* No Vignette here — it was the cause of the grey seam between sections, removed */}
      <div className="sticky top-0 h-screen overflow-hidden" style={{ backgroundColor: product.bg }}>
        <div className="pointer-events-none absolute inset-6 z-20 sm:inset-10">
          {["left-0 top-0 border-l-2 border-t-2", "right-0 top-0 border-r-2 border-t-2", "left-0 bottom-0 border-l-2 border-b-2", "right-0 bottom-0 border-r-2 border-b-2"].map((pos) => (
            <div key={pos} className={`absolute h-6 w-6 ${pos}`} style={{ borderColor: product.accent, opacity: 0.6 }} />
          ))}
        </div>

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(${product.accent} 1px, transparent 1px), linear-gradient(90deg, ${product.accent} 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
          }}
        />

        <div className="absolute left-6 top-6 z-20 font-mono text-xs tracking-wider sm:left-10 sm:top-10" style={{ color: product.mutedColor }}>
          <span style={{ color: product.accent }}>{String(activeFeature + 1).padStart(2, "0")}</span> / {String(N).padStart(2, "0")}
        </div>
        <motion.div style={{ scaleX: barScale, backgroundColor: product.accent }} className="absolute left-0 top-0 z-20 h-[2px] w-full origin-left opacity-50" />

        {/* Decoration MUST come before the Canvas div — DOM order determines
            paint order for absolutely-positioned siblings, so this being first
            is what puts the leaves/sparkles behind the tube, not the z-index alone. */}
        {product.decoration === "leaves" ? <FloatingLeaves /> : <FloatingSparkles accent={product.accent} />}
<div className="absolute inset-x-0 bottom-0 top-19 z-[1] cursor-grab active:cursor-grabbing">
  <Canvas dpr={[1, 2]} camera={{ position: [0, 0.3, 8.6], fov: 26 }} gl={{ alpha: true, antialias: true }}>
    <Scene model={product.model} tilt={tilt} motionStyle={product.motionStyle} accent={product.accent} />
  </Canvas>
</div>

        <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[90rem] items-center justify-start px-8 lg:px-16">
          <div className="w-[420px] text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={feature.headline}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <p className="mb-2 font-mono text-xs uppercase tracking-[0.25em]" style={{ color: product.mutedColor }}>
                  {product.name}
                </p>
                <h2 className="text-[clamp(2.5rem,4.2vw,3.75rem)] font-extrabold leading-[1.02]" style={{ color: product.headingColor, fontFeatureSettings: '"ss01"' }}>
                  <span style={{ color: product.accent }}>{firstWord}</span>
                  {restOfHeadline ? ` ${restOfHeadline}` : ""}
                </h2>
                <p className="mt-4 max-w-sm text-[15px] leading-7" style={{ color: product.bodyColor }}>{feature.body}</p>

                <button
                  type="button"
                  onClick={() => jumpTo(Math.min(activeFeature + 1, N - 1))}
                  className="group pointer-events-auto mt-6 inline-flex items-center gap-2 text-sm font-semibold tracking-wide"
                  style={{ color: product.accent }}
                >
                  Discover More
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>

                <div className="pointer-events-auto mt-8 flex items-center gap-4">
                  {product.features.map((f, i) => (
                    <button
                      key={f.headline}
                      type="button"
                      onClick={() => jumpTo(i)}
                      aria-current={i === activeFeature}
                      className="font-mono text-xs font-semibold tracking-wider transition-colors"
                      style={{ color: i === activeFeature ? product.accent : product.mutedColor }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-6 z-10 hidden flex-col items-center justify-center gap-8 sm:right-10 lg:flex">
          {product.badges.map((b) => (
            <FeatureBadge key={b.label} icon={b.icon} label={b.label} color={product.headingColor} />
          ))}
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
        )}
      </div>
    </section>
  );
}