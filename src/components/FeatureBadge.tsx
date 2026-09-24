import type { LucideIcon } from "lucide-react";

interface FeatureBadgeProps {
  icon: LucideIcon;
  label: string;
  color?: string; // overrides the default theme color, for dark sections
}

export function FeatureBadge({ icon: Icon, label, color }: FeatureBadgeProps) {
  return (
    <div
      className="flex w-[5.8rem] flex-col items-center gap-2 text-center sm:w-[6.7rem]"
      style={color ? { color } : undefined}
    >
      <span
        className={`grid size-13 place-items-center rounded-full border-[1.5px] sm:size-14 ${color ? "" : "border-primary"}`}
        style={color ? { borderColor: color } : undefined}
      >
        <Icon aria-hidden="true" className={`size-5 stroke-[1.7] sm:size-6 ${color ? "" : "text-primary"}`} />
      </span>
      <span
        className={`text-[0.59rem] font-semibold leading-[1.3] tracking-[0.12em] sm:text-[0.64rem] ${color ? "" : "text-primary"}`}
      >
        {label}
      </span>
    </div>
  );
}