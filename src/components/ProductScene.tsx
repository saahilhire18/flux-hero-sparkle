// components/ProductScene.tsx
import { Component, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Lightformer, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { StudioEnvironment } from "@/components/StudioEnvironment";
import type { HeroProduct } from "@/data/hero-range";
import {
  DIM,
  ENTRANCE,
  FOCUS,
  focusTilt,
  focusZoom,
  HAS_MODELS,
  MODEL_PATHS,
  PRODUCT_SLOTS,
  type ModelName,
  type TubeSlot as SlotConfig,
} from "@/data/hero-tubes";

// The tubes (which product, photo or model, where they stand, how they move when shown) are
// in data/hero-tubes.ts. While every tube is a photo, the hero draws them as plain images
// (ProductRow) and this 3D scene isn't loaded at all; it takes over once any is a model.

/** A click that moved more than this many pixels was a drag to spin the tube, not a click. */
const CLICK_SLOP = 6;

/**
 * CAMERA / UNITS
 * The canvas always has the art box's shape (HeroArt, 990 × 685). The camera sits a little
 * above the tubes and looks down at them, so the platform they stand on (and their shadows
 * on it) is in view, and it sees about 4.7 world units top to bottom: one unit is the same
 * fraction of the box at every screen size. DEFAULT_PLACEMENT nudges the whole group:
 * press "D" in the browser to adjust it live, then paste the numbers printed in the console.
 */
const CAMERA = { position: [0, 1.6, 12] as const, target: [0, 0, 0] as const, fov: 22 };

/**
 * The platform the tubes stand on (HeroArt draws a glass disc at the same spot): its
 * height, and the soft shadow the tubes cast on it (reach = how far up a tube still casts).
 */
const GROUND = { y: -1.75, shadowOpacity: 0.55, shadowBlur: 2.2, shadowReach: 3.2, shadowColor: "#1c3a66" };

/**
 * The row is drawn at ROW_SCALE, scaled about the platform (so the tubes still stand on it),
 * which leaves room around them for the one shown (see FOCUS).
 */
const ROW_SCALE = 0.88;
const DEFAULT_PLACEMENT = { x: 0, y: GROUND.y * (1 - ROW_SCALE), scale: ROW_SCALE };

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * How finely a tube's height above the platform is measured on its way from standing to its
 * pose while shown (see PreparedProduct.standHeights).
 */
const STAND_SAMPLES = 13;

// Only what the slots use: no model downloads for tubes that are photos.
PRODUCT_SLOTS.forEach((slot) => {
  if (slot.model) useGLTF.preload(MODEL_PATHS[slot.model]);
  if (slot.image) useTexture.preload(slot.image.src);
});

function useSceneColor(token: string, fallback: string) {
  return useMemo(() => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    return value || fallback;
  }, [token, fallback]);
}

type Uniform<T> = { value: T };

/**
 * Patches a material so it can turn see-through: `dim` (0 = normal, 1 = dimmed, i.e. at
 * DIM.opacity) while another product is shown and `appear` (0 = invisible, 1 = normal) for
 * the entrance. The material must be transparent for this to show.
 */
function applyFades(material: THREE.Material, dim: Uniform<number>, appear: Uniform<number>) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms["uDim"] = dim;
    shader.uniforms["uAppear"] = appear;
    shader.fragmentShader = `uniform float uDim;\nuniform float uAppear;\n${shader.fragmentShader}`.replace(
      "#include <dithering_fragment>",
      `gl_FragColor.a *= mix(1.0, ${DIM.opacity.toFixed(3)}, uDim) * uAppear;
      #include <dithering_fragment>`,
    );
  };
}

/** A tube ready to place: the object, its fade uniforms, and how high its middle stands. */
type PreparedProduct = {
  object: THREE.Object3D;
  dim: Uniform<number>;
  appear: Uniform<number>;
  /**
   * How far the tube's lowest point is below its middle, as it goes from standing (at its
   * own lean) to its pose while shown (lying down, or leaning): STAND_SAMPLES measurements,
   * evenly along the way.
   */
  standHeights: number[];
};

/** A tube's lean `f` (0–1) of the way from standing (slot.tilt) to its lean while shown. */
const tiltAt = (slot: SlotConfig, f: number) => THREE.MathUtils.lerp(slot.tilt, focusTilt(slot), f);

/** Measures, on the real geometry, how far below its middle an object reaches once leaned. */
function measureStandHeight(object: THREE.Object3D, tilt: number) {
  const probe = new THREE.Group();
  probe.rotation.z = tilt;
  probe.add(object);
  probe.updateMatrixWorld(true);
  const standHeight = -new THREE.Box3().setFromObject(probe, true).min.y;
  probe.remove(object);
  return standHeight;
}

/** PreparedProduct.standHeights for an object. Measuring re-parents it for a moment. */
function measureStandHeights(object: THREE.Object3D, slot: SlotConfig) {
  return Array.from({ length: STAND_SAMPLES }, (_, i) => measureStandHeight(object, tiltAt(slot, i / (STAND_SAMPLES - 1))));
}

/** The stand height `f` (0–1) of the way from standing to lying down, between the measured ones. */
function standAt(heights: number[], f: number) {
  const at = THREE.MathUtils.clamp(f, 0, 1) * (heights.length - 1);
  const i = Math.min(Math.floor(at), heights.length - 2);
  return THREE.MathUtils.lerp(heights[i] ?? 0, heights[i + 1] ?? 0, at - i);
}

/**
 * A flat card showing a tube photo, unlit (the photo already has its own lighting). The
 * photos are cropped to the tube itself (no clear margin), so its cap stands on the platform.
 * A flat card would cast only a thin line of shadow, so an invisible tube-shaped stand-in
 * (wide crimp, narrow cap, flattened front to back) casts the platform shadow instead, like
 * the 3D tubes'.
 */
function usePreparedImage(texture: THREE.Texture, slot: SlotConfig): PreparedProduct {
  return useMemo(() => {
    const image = texture.image as HTMLImageElement | ImageBitmap;
    const map = texture.clone();
    map.colorSpace = THREE.SRGBColorSpace;
    map.needsUpdate = true;

    const material = new THREE.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.5, toneMapped: false });
    const dim = { value: 0 };
    const appear = { value: 0 };
    applyFades(material, dim, appear);

    const width = slot.targetHeight * (image.width / image.height);
    const card = new THREE.Mesh(new THREE.PlaneGeometry(width, slot.targetHeight), material);

    // Draws nothing itself (no colour, no depth); ContactShadows still renders it
    const shadowCaster = new THREE.Mesh(
      new THREE.CylinderGeometry(width / 2, width * 0.3, slot.targetHeight, 24),
      new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }),
    );
    shadowCaster.scale.z = 0.4;
    // Measured on the stand-in, not the card: tipping over, the tube rests on the rim of its
    // cap, not on the card's (empty) corner. Before it joins its group.
    const standHeights = measureStandHeights(shadowCaster, slot);

    const object = new THREE.Group().add(card, shadowCaster);
    return { object, dim, appear, standHeights };
  }, [texture, slot]);
}

function usePreparedModel(source: THREE.Group, slot: SlotConfig): PreparedProduct {
  return useMemo(() => {
    const object = source.clone(true);
    // Shared by every material of this tube; animated in ProductModel.
    const dim = { value: 0 };
    const appear = { value: 0 };
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      const cloned = materials.map((material) => {
        const next = material.clone();
        if ("envMapIntensity" in next) (next as THREE.MeshStandardMaterial).envMapIntensity = 1.2;
        if (slot.tint && "color" in next) (next as THREE.MeshStandardMaterial).color.multiply(new THREE.Color(slot.tint));
        next.transparent = true; // so it can fade (applyFades)
        applyFades(next, dim, appear);
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
    // Centred on the origin, so the tube leans and spins about its own middle
    object.position.set(-center.x, -center.y, -center.z);

    // Measured on the real mesh, since the cap is narrower than the crimp
    const standHeights = measureStandHeights(object, slot);

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
    return { object, dim, appear, standHeights };
  }, [source, slot]);
}

type ProductProps = {
  slot: SlotConfig;
  index: number;
  reducedMotion: boolean;
  /** The product shown, if any: its tube zooms in and leans, the others fade back. */
  focus: HeroProduct | undefined;
  /** Scrolls to a tube's section on the page (slot.section). */
  onOpen: (section: string) => void;
};

function ModelProduct({ model, ...props }: ProductProps & { model: ModelName }) {
  const { scene } = useGLTF(MODEL_PATHS[model]);
  return <ProductBody {...props} prepared={usePreparedModel(scene, props.slot)} spinnable />;
}

function ImageProduct({ image, ...props }: ProductProps & { image: string }) {
  const texture = useTexture(image);
  // A flat photo would show its edge if spun, so it only grows on hover.
  return <ProductBody {...props} prepared={usePreparedImage(texture, props.slot)} spinnable={false} />;
}

/** Places a prepared tube on the platform and runs its entrance, focus, hover and spin. */
function ProductBody({
  slot,
  index,
  reducedMotion,
  focus,
  onOpen,
  prepared,
  spinnable,
}: ProductProps & { prepared: PreparedProduct; spinnable: boolean }) {
  const { object: model, dim, appear, standHeights } = prepared;
  const standHeight = standHeights[0] ?? 0; // standing, at its own lean
  const { section } = slot;
  const canvas = useThree((state) => state.gl.domElement);
  const invalidate = useThree((state) => state.invalidate);
  const focused = focus === slot.product;
  const dimmed = !!focus && !focused;
  const restY = GROUND.y + standHeight; // middle of the tube when it stands on the platform
  const place = useRef<THREE.Group>(null); // where the tube stands, its lean and size
  const shown = useRef(0); // how far into its focus pose, at a steady rate: 0 = in the row, 1 = lying at the front
  const spin = useRef<THREE.Group>(null); // drag-to-spin about the tube's own length
  const hover = useRef<THREE.Group>(null);
  const born = useRef<number | null>(null);
  const targetScale = useRef(new THREE.Vector3(1, 1, 1));
  const [hovered, setHovered] = useState(false);

  // Per-product drag-to-spin state — independent of every other slot.
  const dragging = useRef(false);
  const lastX = useRef(0);
  const spinVelocity = useRef(0);
  const manualSpin = useRef(0);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  // A tube that leads to its section shows the link cursor (the canvas's own style beats the
  // grab cursor set around it).
  useEffect(() => {
    if (!section) return;
    canvas.style.cursor = hovered ? "pointer" : "";
    return () => {
      canvas.style.cursor = "";
    };
  }, [canvas, hovered, section]);

  // The canvas only draws on demand (see ProductScene): start drawing when a target changes.
  useEffect(() => invalidate(), [invalidate, dimmed, focused, hovered]);

  useFrame(({ clock }, frameDelta) => {
    // After the scene has sat idle, the first frame's delta spans the whole pause; capped,
    // so animations start smoothly instead of jumping straight to the end.
    const delta = Math.min(frameDelta, 1 / 30);
    // Eases a value towards its target (straight there when motion is reduced)
    const ease = (value: number, target: number, speed: number) =>
      reducedMotion ? target : THREE.MathUtils.damp(value, target, speed, delta);

    // While another product is shown, this tube turns see-through (and shrinks, below);
    // while it's the one shown, it moves out to the front and lies down (below)
    dim.value = ease(dim.value, dimmed ? 1 : 0, DIM.speed);
    const step = reducedMotion ? 1 : delta / FOCUS.duration;
    shown.current = focused ? Math.min(1, shown.current + step) : Math.max(0, shown.current - step);
    // Eased in and out, so it lifts off gently and settles softly
    const f = easeInOutCubic(shown.current);

    // Hover: grows slightly about its middle
    const hoverScale = hovered ? 1.04 : 1;
    if (hover.current) {
      targetScale.current.set(hoverScale, hoverScale, hoverScale);
      hover.current.scale.lerp(targetScale.current, 1 - Math.exp(-10 * delta));
      // Standing, it grows from its base: lifted by the growth, so the cap stays on the platform
      hover.current.position.y = (hover.current.scale.y - 1) * standHeight * (1 - f);
    }

    // Per-product spin — only this tube is touched, others are unaffected
    if (spin.current && !reducedMotion) {
      if (dragging.current) {
        spin.current.rotation.y = manualSpin.current;
      } else if (Math.abs(spinVelocity.current) > 0.0001) {
        manualSpin.current += spinVelocity.current;
        spinVelocity.current *= 0.94; // momentum decay
        spin.current.rotation.y = manualSpin.current;
      }
      // else: at rest — stays wherever the user left it
    }

    if (!place.current) return;
    born.current ??= clock.elapsedTime;

    // Entrance: drop onto the platform while fading in, one tube after another; then stay put
    let settle = 1;
    if (!reducedMotion) {
      const elapsed = clock.elapsedTime - born.current - ENTRANCE.startDelay - index * ENTRANCE.stagger;
      const t = THREE.MathUtils.clamp(elapsed / ENTRANCE.duration, 0, 1);
      settle = 1 - Math.pow(1 - t, 3); // ease-out cubic
    }
    appear.value = settle;

    // Bigger while shown, smaller (in its place in the row) while another is
    const size = 1 + (focusZoom(slot) - 1) * f - (1 - DIM.shrink) * dim.value;
    // Scaled and turned about its middle, so its middle moves to keep it on the platform:
    // on its cap while standing, on its side once lying down
    const stand = standAt(standHeights, f) * size;
    place.current.scale.setScalar(size);
    place.current.rotation.z = tiltAt(slot, f);
    place.current.position.set(
      THREE.MathUtils.lerp(slot.x, FOCUS.x, f),
      GROUND.y + stand + ENTRANCE.drop * (1 - settle),
      THREE.MathUtils.lerp(slot.z, FOCUS.z, f),
    );

    // Keep drawing only while something is still moving; once all has settled, the canvas
    // stops redrawing until the next change.
    const moving =
      settle < 1 ||
      Math.abs(dim.value - (dimmed ? 1 : 0)) > 0.001 ||
      shown.current !== (focused ? 1 : 0) ||
      Math.abs((hover.current?.scale.x ?? hoverScale) - hoverScale) > 0.001 ||
      dragging.current ||
      Math.abs(spinVelocity.current) > 0.0001;
    if (moving) invalidate();
  });

  // Per-product pointer handlers — dragging one tube never affects the others.
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    dragging.current = true;
    lastX.current = e.clientX;
    spinVelocity.current = 0;
    invalidate();
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
    <group ref={place} position={[slot.x, restY, slot.z]} rotation-z={slot.tilt}>
      <group
        ref={spin}
        {...(spinnable && {
          onPointerDown: handlePointerDown,
          onPointerMove: handlePointerMove,
          onPointerUp: handlePointerUp,
          onPointerOut: handlePointerUp,
        })}
      >
        <group
          ref={hover}
          onPointerEnter={(event) => {
            event.stopPropagation();
            setHovered(true);
          }}
          onPointerLeave={() => setHovered(false)}
          {...(section && {
            onClick: (event: ThreeEvent<MouseEvent>) => {
              if (event.delta > CLICK_SLOP) return; // the end of a drag-to-spin
              event.stopPropagation();
              onOpen(section);
            },
          })}
        >
          <primitive object={model} />
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
    const source = this.props.slot.model ?? this.props.slot.image?.src;
    console.warn(`[Totalflux 3D] Failed to load ${source}; showing fallback for ${this.props.slot.id}.`, error);
  }
  override render() {
    return this.state.failed ? <FallbackProduct slot={this.props.slot} /> : this.props.children;
  }
}

function FallbackProduct({ slot }: { slot: SlotConfig }) {
  const color = useSceneColor("--scene-fallback", "#dbeaf5");
  return (
    <mesh position={[slot.x, GROUND.y + slot.targetHeight / 2, slot.z]} rotation-z={slot.tilt}>
      <boxGeometry args={[slot.targetHeight * 0.28, slot.targetHeight, slot.targetHeight * 0.16]} />
      <meshStandardMaterial color={color} roughness={0.45} />
    </mesh>
  );
}

type Placement = typeof DEFAULT_PLACEMENT;

/** Points the camera at CAMERA.target (it looks down at the tubes from a little above). */
function CameraRig() {
  const camera = useThree((state) => state.camera);
  useLayoutEffect(() => {
    camera.lookAt(...CAMERA.target);
  }, [camera]);
  return null;
}

function Scene({
  reducedMotion,
  placement,
  focus,
  onOpen,
}: {
  reducedMotion: boolean;
  placement: Placement;
  focus: HeroProduct | undefined;
  onOpen: (section: string) => void;
}) {
  const light = useSceneColor("--scene-light", "#fffaf0");
  const fill = useSceneColor("--scene-fill", "#d8eaf7");

  return (
    <>
      <CameraRig />
      {/* Lighting for the 3D models only: the photos are unlit, and building the studio's
          reflections (its blur shaders) was the slowest part of the hero's start */}
      {HAS_MODELS && (
        <>
          <ambientLight intensity={0.9} />
          {/* Soft key from the top-left, a cool fill from the right */}
          <directionalLight position={[-4, 6, 6]} intensity={2.4} color={light} />
          <pointLight position={[5, 1, 5]} intensity={18} color={fill} />
          <StudioEnvironment>
            <Lightformer intensity={2.2} position={[0, 5, 3]} scale={[8, 3, 1]} color={light} />
            <Lightformer intensity={1.1} position={[-4, 1, 2]} rotation-y={Math.PI / 2} scale={[5, 2, 1]} color={fill} />
          </StudioEnvironment>
        </>
      )}

      <group position={[placement.x, placement.y, 0]} scale={placement.scale}>
        {/* The tubes' soft shadow on the platform, so they stand on it rather than float */}
        <ContactShadows
          position={[0, GROUND.y + 0.002, 0]}
          scale={[10, 5]}
          opacity={GROUND.shadowOpacity}
          blur={GROUND.shadowBlur}
          far={GROUND.shadowReach}
          resolution={512} // soft and blurred anyway: 1024 cost 4x the work for no visible gain
          color={GROUND.shadowColor}
        />

        <Suspense fallback={null}>
          {PRODUCT_SLOTS.map((slot, index) => {
            const props = { slot, index, reducedMotion, focus, onOpen };
            return (
              <ModelErrorBoundary key={slot.id} slot={slot}>
                {slot.model ? (
                  <ModelProduct {...props} model={slot.model} />
                ) : slot.image ? (
                  <ImageProduct {...props} image={slot.image.src} />
                ) : null}
              </ModelErrorBoundary>
            );
          })}
        </Suspense>
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

/**
 * focus: the product the hero is showing; its tube zooms in and leans while the others fade
 * back. Omit to show every tube as normal.
 */
export default function ProductScene({ focus }: { focus?: HeroProduct | undefined }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [debug, setDebug] = useState(false);
  const [placement, setPlacement] = useState<Placement>(DEFAULT_PLACEMENT);
  // Bumped when the browser drops this canvas's WebGL context, to start a fresh one.
  const [contextKey, setContextKey] = useState(0);
  // A tube's click scrolls the page down to that product's section
  const openSection = useCallback((section: string) => {
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(section)?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(motionQuery.matches);
    update();
    motionQuery.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? true), { threshold: 0.05 });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", update);
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
        key={contextKey}
        // Up to 1.5x pixel density: sharp on high-DPI screens at about half the cost of 2x
        dpr={[1, 1.5]}
        // "demand": draws only when something changes (the tubes request frames while they
        // move; see ProductBody), so an idle hero costs nothing; nothing at all off screen.
        frameloop={visible ? "demand" : "never"}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [...CAMERA.position], fov: CAMERA.fov, near: 0.1, far: 60 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          // Browsers drop WebGL contexts when too many are open (several 3D sections, many
          // hot reloads) or the GPU resets; the tubes would vanish, so start a new canvas.
          gl.domElement.addEventListener(
            "webglcontextlost",
            (event) => {
              event.preventDefault();
              console.warn("[Totalflux 3D] WebGL context lost; restarting the hero scene.");
              window.setTimeout(() => setContextKey((key) => key + 1), 300);
            },
            { once: true },
          );
        }}
      >
        <Scene
          reducedMotion={reducedMotion}
          placement={placement}
          focus={focus}
          onOpen={openSection}
        />
      </Canvas>
      {debug && <DebugPanel placement={placement} />}
    </div>
  );
}
