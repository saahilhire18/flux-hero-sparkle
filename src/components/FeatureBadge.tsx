import type { LucideIcon } from "lucide-react";

interface FeatureBadgeProps {
  icon: LucideIcon;
  label: string;
}

export function FeatureBadge({ icon: Icon, label }: FeatureBadgeProps) {
  return (
    <div className="flex w-[5.8rem] flex-col items-center gap-2 text-center sm:w-[6.7rem]">
      <span className="grid size-13 place-items-center rounded-full border-[1.5px] border-primary sm:size-14">
        <Icon aria-hidden="true" className="size-5 stroke-[1.7] text-primary sm:size-6" />
      </span>
      <span className="text-[0.59rem] font-semibold leading-[1.3] tracking-[0.12em] text-primary sm:text-[0.64rem]">
        {label}
      </span>
    </div>
  );
}