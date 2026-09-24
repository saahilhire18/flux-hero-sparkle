// components/HeroRibbon.tsx
import { useEffect, useRef, useState } from "react";

/**
 * Decorative transparent ribbon video for the hero stage.
 *
 * Mounted inside Hero's <Stage>, between the bg.png <img> and the 3D product
 * canvas, so it paints above the background and below the products by DOM order.
 * Its wrapper is `absolute inset-0` in the same box as bg.png, which means every
 * % value below is in background-image space and stays locked to the podium
 * at every breakpoint.
 *
 * TUNING — edit these values to move the ribbon:
 *   x / y   : where the centre of the video sits on the background (0–100%)
 *   width   : ribbon length, as a % of the background width
 *   height  : ribbon thickness, as a % of the background height. Set independently
 *             of width (object-fit: fill) so the ribbon can span the full hero
 *             without growing taller
 *   rotate  : the source ribbon is horizontal; a negative angle tips the right
 *             end up so it flows top-right → bottom-left
 *   opacity : 0–1; lower = quieter behind the products and copy
 *
 * The source is pre-processed from the original water.webm: seamless loop (1.5s
 * crossfade), half speed with motion-interpolated frames at 60fps, a light blur and
 * 1280×480 frames (it is displayed squashed, so the extra height was never visible).
 * Slowness and softness are baked in, so the browser plays it at its native rate with
 * no per-frame CSS filter. Don't slow it with playbackRate: a lower rate drops the
 * effective frame rate and brings the stutter back.
 */
const RIBBON = {
  src: "/water-smooth.webm",
  x: "50%",
  y: "58%",
  width: "115%",
  height: "34%",
  rotate: "-18deg",
  opacity: 0.45,
};

/**
 * How Hero frames bg.png and the 3D products, as fractions of the stage box:
 * bg.png is zoomed by `scale` about (originX, originY), then the podium and the
 * products are slid together by `shiftX` (negative = left).
 */
export type StageFraming = { scale: number; originX: number; originY: number; shiftX: number };

const BG_W = 1672;
const BG_H = 941;

/**
 * The podium (and the two small side pedestals) are painted into bg.png, so the
 * ribbon can only pass "behind" them by being cut out where they are. The shapes
 * are drawn in bg.png's own pixel space and given the same zoom + shift as the
 * image, so the cut-out always sits exactly on the podium.
 * White = ribbon visible, black = hidden.
 */
function podiumMask({ scale, originX, originY, shiftX }: StageFraming) {
  const ox = originX * BG_W;
  const oy = originY * BG_H;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${BG_W} ${BG_H}' preserveAspectRatio='none'>
    <filter id='f'><feGaussianBlur stdDeviation='3'/></filter>
    <rect width='${BG_W}' height='${BG_H}' fill='white'/>
    <g fill='black' filter='url(#f)' transform='translate(${ox + shiftX * BG_W} ${oy}) scale(${scale}) translate(${-ox} ${-oy})'>
      <ellipse cx='1140' cy='668' rx='474' ry='48'/>
      <rect x='666' y='668' width='948' height='84'/>
      <ellipse cx='1140' cy='752' rx='474' ry='46'/>
      <rect x='-10' y='550' width='122' height='108' rx='12'/>
      <rect x='1498' y='544' width='190' height='82' rx='12'/>
    </g>
  </svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// The ribbon is cut off at the video's left/right frame edges; feather both ends
// so no hard vertical edge shows where they fall inside the stage.
const END_FEATHER = "linear-gradient(to right, transparent 0%, #000 8%, #000 94%, transparent 100%)";

// WebKit (Safari, and every iOS browser) can't render VP9 alpha and would show the
// ribbon on an opaque black rectangle, so the layer is skipped there. Provide an
// HEVC-with-alpha export as a <source type='video/mp4; codecs="hvc1"'> to enable it.
function supportsWebmAlpha() {
  const ua = navigator.userAgent;
  return !(/AppleWebKit/.test(ua) && !/Chrome\/|Chromium|Edg\//.test(ua));
}

export function HeroRibbon({ framing }: { framing: StageFraming }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);

  // Client-only: avoids SSR/hydration quirks with `muted` and lets us feature-check.
  useEffect(() => setEnabled(supportsWebmAlpha()), []);

  // Play only while the hero is on screen and motion is allowed, so decoding never
  // competes with the rest of the page.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const video = videoRef.current;
    if (!wrapper || !video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let onScreen = true;
    const sync = () => {
      video.muted = true;
      if (reduce.matches || !onScreen) video.pause();
      else void video.play().catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true;
      sync();
    });
    observer.observe(wrapper);
    sync();
    reduce.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      reduce.removeEventListener("change", sync);
    };
  }, [enabled]);

  if (!enabled) return null;

  const mask = podiumMask(framing);

  return (
    <div
      ref={wrapperRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ maskImage: mask, maskSize: "100% 100%", WebkitMaskImage: mask, WebkitMaskSize: "100% 100%" }}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        src={RIBBON.src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        tabIndex={-1}
        className="absolute max-w-none object-fill"
        style={{
          left: RIBBON.x,
          top: RIBBON.y,
          width: RIBBON.width,
          height: RIBBON.height,
          opacity: RIBBON.opacity,
          transform: `translate(-50%, -50%) rotate(${RIBBON.rotate})`,
          maskImage: END_FEATHER,
          WebkitMaskImage: END_FEATHER,
        }}
      />
    </div>
  );
}
