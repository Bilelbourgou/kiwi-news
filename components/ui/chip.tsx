import * as React from "react";
import { Plus } from "lucide-react";

export interface ChipProps extends React.HTMLAttributes<HTMLButtonElement | HTMLSpanElement> {
  label: string;
  showPlus?: boolean;
  active?: boolean;
  asButton?: boolean;
}

export function Chip({
  label,
  showPlus = true,
  active = false,
  asButton = true,
  className = "",
  onClick,
  ...props
}: ChipProps) {
  const baseClasses =
    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-normal transition-colors border select-none";
  const stateClasses = active
    ? "bg-[#0D0D0F] text-white border-[#0D0D0F]"
    : "bg-[#F6F6F6] hover:bg-[#E5E7EB] text-[#0D0D0F] border-[#E5E7EB]";

  if (asButton) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClasses} ${stateClasses} cursor-pointer ${className}`.trim()}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        <span>{label}</span>
        {showPlus && <Plus className="w-3.5 h-3.5 stroke-[2] text-[#6B7280]" />}
      </button>
    );
  }

  return (
    <span
      className={`${baseClasses} ${stateClasses} ${className}`.trim()}
      {...(props as React.HTMLAttributes<HTMLSpanElement>)}
    >
      <span>{label}</span>
      {showPlus && <Plus className="w-3.5 h-3.5 stroke-[2] text-[#6B7280]" />}
    </span>
  );
}
