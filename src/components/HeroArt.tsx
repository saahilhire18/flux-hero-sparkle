// components/HeroArt.tsx
import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ClientOnly } from "@tanstack/react-router";
import { ProductRow } from "@/components/ProductRow";
import type { HeroProduct } from "@/data/hero-range";
import { HAS_MODELS } from "@/data/hero-tubes";

const ProductScene = lazy(() => import("@/components/ProductScene"));

/**
 * If the 3D scene can't load or crashes (e.g. its code fails to download), leave the
 * tubes out and log why, instead of taking the whole page down with it.
 */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch(error: Error) {
    console.error("[Totalflux 3D] The hero's 3D scene failed; showing the page without it.", error);
  }
  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

/*
 * The hero's right-hand artwork: floating tubes (3D), a dashed ring with short circuit
 * traces, and water bubbles. It is all laid out on one box with the reference design's
 * proportions, in that design's pixels (VIEW), so every piece
 * scales together: the SVG uses VIEW as its viewBox, HTML pieces are placed in % of it and
 * sized in cqw (1cqw = 1% of the box's width, i.e. 9.9 reference pixels).
 */
const VIEW = { width: 990, height: 685 };
const RING = { cx: 490, cy: 345, r: 330 };

const pctX = (x: number) => `${(x / VIEW.width) * 100}%`;
const pctY = (y: number) => `${(y / VIEW.height) * 100}%`;
const cqw = (px: number) => `${(px / VIEW.width) * 100}cqw`;

// Short traces off the ring, purely decorative.
const TRACES: { d: string; dot: [number, number] }[] = [
  { d: "M162 318 H122 V286", dot: [122, 286] },
  { d: "M818 300 H862 V262", dot: [862, 262] },
  { d: "M370 38 V12", dot: [370, 12] },
];

/**
 * Water bubbles: centre and diameter in VIEW pixels. `front` ones sit over the tubes; `fresh`
 * ones have just been blown and swell into place.
 */
type Bubble = { id: number; x: number; y: number; d: number; front?: boolean; fresh?: boolean };

const BUBBLES: Omit<Bubble, "id">[] = [
  { x: 40, y: 252, d: 46 },
  { x: 16, y: 360, d: 64 },
  { x: 66, y: 190, d: 10 },
  { x: 58, y: 128, d: 28 },
  { x: 6, y: 452, d: 9 },
  { x: 78, y: 468, d: 14 },
  { x: 850, y: 472, d: 100, front: true },
  { x: 906, y: 386, d: 26 },
  { x: 952, y: 214, d: 34 },
  { x: 884, y: 572, d: 12 },
  { x: 934, y: 312, d: 9 },
  { x: 436, y: 118, d: 12 },
  { x: 612, y: 96, d: 8 },
];

/**
 * Where a popped bubble's replacement may appear, in VIEW pixels: the open space beside and
 * above the tubes, clear of the platform.
 */
const SPAWN_ZONES = [
  { x: [8, 72], y: [110, 500] },
  { x: [888, 968], y: [160, 500] },
  { x: [260, 740], y: [26, 72] },
] as const;

/** How long a pop's film and droplets take (the CSS runs a little shorter), and the wait before a new bubble appears. */
const POP_MS = 600;
const RESPAWN_MS = [700, 1600] as const;

const BUBBLE_STYLE: CSSProperties = {
  background:
    "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0 9%, rgba(255,255,255,0.4) 22%, rgba(186,220,248,0.22) 58%, rgba(120,176,236,0.38) 100%)",
  border: "1px solid rgba(255,255,255,0.75)",
  boxShadow: "inset -3px -5px 10px rgba(80,145,215,0.25), 0 6px 16px rgba(70,130,200,0.12)",
};

const between = (min: number, max: number) => min + Math.random() * (max - min);

/** A new bubble somewhere in the spawn zones, not touching the ones already there. */
function blowBubble(id: number, others: Bubble[]): Bubble {
  let bubble: Bubble = { id, x: 0, y: 0, d: 0, fresh: true };
  for (let attempt = 0; attempt < 12; attempt++) {
    const zone = SPAWN_ZONES[Math.floor(Math.random() * SPAWN_ZONES.length)] ?? SPAWN_ZONES[0];
    const d = Math.random() < 0.7 ? between(8, 26) : between(30, 56); // mostly small
    bubble = {
      id,
      x: between(zone.x[0], zone.x[1]),
      y: between(zone.y[0], zone.y[1]),
      d,
      fresh: true,
    };
    const clear = others.every(
      (other) => Math.hypot(other.x - bubble.x, other.y - bubble.y) > (other.d + d) / 2 + 8,
    );
    if (clear) break;
  }
  return bubble;
}

/** A popped bubble: where its film tore (0–1 across the bubble) and the droplets it threw off. */
type Pop = Bubble & {
  hole: [number, number];
  drops: { from: [number, number]; to: [number, number]; size: number }[];
};

/** Droplets from all round the rim, flung out a bit past it and sagging as they go (VIEW px from the centre). */
function sprayDrops(d: number): Pop["drops"] {
  const r = d / 2;
  const count = Math.round(Math.min(14, 6 + d / 10));
  return Array.from({ length: count }, (_, i): Pop["drops"][number] => {
    const angle = ((i + Math.random() * 0.8) / count) * Math.PI * 2;
    const reach = r * between(1.25, 1.8) + 6;
    return {
      from: [Math.cos(angle) * r, Math.sin(angle) * r],
      to: [Math.cos(angle) * reach, Math.sin(angle) * reach + d * 0.15],
      size: Math.max(1.5, d * between(0.04, 0.09)),
    };
  });
}

let popAudio: AudioContext | undefined;

/** A soft pop: a quick falling blip, lower for bigger bubbles. Silent if audio isn't available. */
function playPopSound(d: number) {
  try {
    popAudio ??= new AudioContext();
    const t = popAudio.currentTime;
    const pitch = 1100 - Math.min(d, 100) * 6;
    const osc = popAudio.createOscillator();
    const gain = popAudio.createGain();
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.3, t + 0.06);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.15, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    osc.connect(gain).connect(popAudio.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  } catch {
    // No Web Audio: pop silently
  }
}

/** The bubbles on show and the pops in progress; `pop` bursts one and blows a new one elsewhere shortly after. */
function useBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>(() =>
    BUBBLES.map((bubble, id) => ({ ...bubble, id })),
  );
  const [pops, setPops] = useState<Pop[]>([]);
  const nextId = useRef(BUBBLES.length);
  const timers = useRef(new Set<number>());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const later = (ms: number, run: () => void) => {
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      run();
    }, ms);
    timers.current.add(timer);
  };

  const pop = (bubble: Bubble, hole: [number, number]) => {
    playPopSound(bubble.d);
    const burst: Pop = { ...bubble, hole, drops: sprayDrops(bubble.d) };
    setBubbles((list) => list.filter((other) => other.id !== bubble.id));
    setPops((list) => [...list, burst]);
    later(POP_MS, () => setPops((list) => list.filter((other) => other !== burst)));
    later(between(...RESPAWN_MS), () => {
      const id = nextId.current++;
      setBubbles((list) => [...list, blowBubble(id, list)]);
    });
  };

  return { bubbles, pops, pop };
}

function Bubbles({ bubbles, pops, front }: { bubbles: Bubble[]; pops: Pop[]; front: boolean }) {
  return (
    <>
      {bubbles
        .filter((bubble) => !!bubble.front === front)
        .map((bubble) => (
          <span
            key={bubble.id}
            aria-hidden="true"
            className={`pointer-events-none absolute ${bubble.fresh ? "hero-bubble-in" : ""}`}
            style={{
              left: pctX(bubble.x),
              top: pctY(bubble.y),
              width: cqw(bubble.d),
              height: cqw(bubble.d),
              translate: "-50% -50%",
            }}
          >
            <span
              className="hero-bubble block size-full rounded-full"
              style={{
                ...BUBBLE_STYLE,
                animationDelay: `${-bubble.id * 1.7}s`,
                animationDuration: `${6 + (bubble.id % 4)}s`,
              }}
            />
          </span>
        ))}
      {pops
        .filter((burst) => !!burst.front === front)
        .map((burst) => (
          <span
            key={burst.id}
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              left: pctX(burst.x),
              top: pctY(burst.y),
              width: cqw(burst.d),
              height: cqw(burst.d),
              translate: "-50% -50%",
            }}
          >
            <span
              className="hero-pop-film absolute inset-0 rounded-full"
              style={
                {
                  ...BUBBLE_STYLE,
                  "--hole-x": `${burst.hole[0] * 100}%`,
                  "--hole-y": `${burst.hole[1] * 100}%`,
                } as CSSProperties
              }
            />
            {burst.drops.map((drop, i) => (
              <span
                key={i}
                className="hero-pop-drop absolute left-1/2 top-1/2 rounded-full"
                style={
                  {
                    width: `max(2px, ${cqw(drop.size)})`,
                    height: `max(2px, ${cqw(drop.size)})`,
                    "--from-x": cqw(drop.from[0]),
                    "--from-y": cqw(drop.from[1]),
                    "--to-x": cqw(drop.to[0]),
                    "--to-y": cqw(drop.to[1]),
                  } as CSSProperties
                }
              />
            ))}
          </span>
        ))}
    </>
  );
}

/**
 * Click targets for every bubble, over the 3D canvas (which would otherwise take the clicks,
 * even for bubbles drawn in front of it). At least 28px across so the tiny ones can be hit.
 */
function BubbleTargets({
  bubbles,
  onPop,
}: {
  bubbles: Bubble[];
  onPop: (bubble: Bubble, hole: [number, number]) => void;
}) {
  return (
    <>
      {bubbles.map((bubble) => (
        <span
          key={bubble.id}
          aria-hidden="true"
          className="absolute cursor-pointer rounded-full"
          style={{
            left: pctX(bubble.x),
            top: pctY(bubble.y),
            width: `max(${cqw(bubble.d)}, 28px)`,
            height: `max(${cqw(bubble.d)}, 28px)`,
            translate: "-50% -50%",
          }}
          onClick={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            const across = (offset: number, size: number) =>
              Math.min(1, Math.max(0, offset / size));
            onPop(bubble, [
              across(event.clientX - box.left, box.width),
              across(event.clientY - box.top, box.height),
            ]);
          }}
        />
      ))}
    </>
  );
}

/**
 * The frosted-glass platform the tubes stand on: a top face over a thin rim that gives it
 * thickness. In % of the box; it must sit where ProductScene's GROUND is in view, so move
 * the two together.
 */
const PLATFORM = { left: 3, width: 94, top: 79, height: 15 };

function GlassPlatform() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{
        left: `${PLATFORM.left}%`,
        width: `${PLATFORM.width}%`,
        top: `${PLATFORM.top}%`,
        height: `${PLATFORM.height}%`,
      }}
    >
      {/* Rim, peeking out below the top face */}
      <div className="absolute inset-x-[0.6%] bottom-0 top-[22%] rounded-[50%] border border-white/60 bg-linear-to-b from-white/40 to-[#a9cdf0]/30 shadow-[0_30px_50px_-24px_rgba(30,80,150,0.5)] backdrop-blur-md" />
      {/* Top face */}
      <div className="absolute inset-x-0 bottom-[22%] top-0 rounded-[50%] border border-white/85 bg-linear-to-br from-white/65 via-white/35 to-white/20 shadow-[inset_0_2px_8px_rgba(255,255,255,0.95),inset_0_-10px_24px_rgba(130,180,235,0.28)] backdrop-blur-xl" />
    </div>
  );
}

/** The dashed ring, its glow, and the traces. */
function Ring() {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
    >
      <defs>
        <radialGradient id="hero-ring-glow">
          <stop offset="0%" stopColor="#a9d0f5" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#cfe4f8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#e6f1fb" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={RING.cx} cy={RING.cy} r={RING.r} fill="url(#hero-ring-glow)" />
      <circle
        cx={RING.cx}
        cy={RING.cy}
        r={RING.r}
        fill="none"
        stroke="#9fc5ec"
        strokeWidth={1.5}
        strokeDasharray="3 7"
        strokeLinecap="round"
        opacity={0.8}
      />

      {TRACES.map((trace) => (
        <g key={trace.d} stroke="#a9cbee" fill="none" opacity={0.7}>
          <path d={trace.d} strokeWidth={1.2} />
          <circle cx={trace.dot[0]} cy={trace.dot[1]} r={3} fill="#a9cbee" />
        </g>
      ))}
    </svg>
  );
}

/**
 * focus: the product the current step shows (undefined on the intro); its tube zooms in and
 * leans while the others fade back.
 * The box keeps the reference's shape. It may grow up to 25% wider than its parent, out
 * into the page's side margin (never past the screen edge), but never taller than it.
 */
export function HeroArt({ focus }: { focus: HeroProduct | undefined }) {
  const { bubbles, pops, pop } = useBubbles();

  return (
    <div
      role="group"
      aria-label="The Totalflux toothpastes"
      className="relative shrink-0 aspect-[990/685] [container-type:inline-size]"
      style={{
        width: `min(125cqw, calc(100cqh * ${VIEW.width} / ${VIEW.height}), calc(100cqw + (100vw - min(100vw, 90rem)) / 2 + 1.5rem))`,
      }}
    >
      <Ring />
      <Bubbles bubbles={bubbles} pops={pops} front={false} />
      <GlassPlatform />

      {/* The tubes: plain images while they're all photos; the 3D scene (and its engine,
          loaded only then) once any is a model */}
      {HAS_MODELS ? (
        <ClientOnly fallback={null}>
          <SceneBoundary>
            <Suspense fallback={null}>
              <ProductScene focus={focus} />
            </Suspense>
          </SceneBoundary>
        </ClientOnly>
      ) : (
        <ProductRow focus={focus} />
      )}

      <Bubbles bubbles={bubbles} pops={pops} front />
      <BubbleTargets bubbles={bubbles} onPop={pop} />
    </div>
  );
}
