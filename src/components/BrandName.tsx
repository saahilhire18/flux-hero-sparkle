// components/BrandName.tsx

/**
 * "Totalflux" lettered like the logo (font-brand: Comfortaa). Comfortaa sets the f and l
 * almost touching, so the l is nudged right a little, as in the logo.
 */
export function BrandName({ className = "" }: { className?: string }) {
  return (
    <span className={`font-brand ${className}`}>
      Totalf<span className="ml-[0.07em]">lux</span>
    </span>
  );
}
