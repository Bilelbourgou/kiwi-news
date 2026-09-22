import * as React from "react";

export interface BiasMeterProps {
  leftPercentage: number;
  centerPercentage: number;
  rightPercentage: number;
  showAxis?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function BiasMeter({
  leftPercentage,
  centerPercentage,
  rightPercentage,
  showAxis = true,
  className = "",
  size = "md",
}: BiasMeterProps) {
  // Normalize percentages if they don't add to 100
  const total = leftPercentage + centerPercentage + rightPercentage || 100;
  const leftPct = (leftPercentage / total) * 100;
  const centerPct = (centerPercentage / total) * 100;
  const rightPct = (rightPercentage / total) * 100;

  const barHeight = size === "sm" ? "h-6 text-[11px]" : "h-7 text-[12px]";

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {/* Segmented Bar */}
      <div
        className={`w-full ${barHeight} rounded-[4px] overflow-hidden flex font-medium select-none`}
      >
        {/* Left Segment */}
        {leftPct > 0 && (
          <div
            style={{ width: `${leftPct}%` }}
            className="bg-[#B42318] text-white flex items-center justify-center transition-all duration-300 px-1 truncate"
            title={`Left ${Math.round(leftPct)}%`}
          >
            {leftPct >= 15 ? `Left ${Math.round(leftPercentage)}%` : `${Math.round(leftPercentage)}%`}
          </div>
        )}

        {/* Center Segment */}
        {centerPct > 0 && (
          <div
            style={{ width: `${centerPct}%` }}
            className="bg-[#E5E7EB] text-[#0D0D0F] flex items-center justify-center transition-all duration-300 px-1 truncate"
            title={`Center ${Math.round(centerPct)}%`}
          >
            {centerPct >= 15 ? `Center ${Math.round(centerPercentage)}%` : `${Math.round(centerPercentage)}%`}
          </div>
        )}

        {/* Right Segment */}
        {rightPct > 0 && (
          <div
            style={{ width: `${rightPct}%` }}
            className="bg-[#1D4ED8] text-white flex items-center justify-center transition-all duration-300 px-1 truncate"
            title={`Right ${Math.round(rightPct)}%`}
          >
            {rightPct >= 15 ? `Right ${Math.round(rightPercentage)}%` : `${Math.round(rightPercentage)}%`}
          </div>
        )}
      </div>

      {/* Axis markers */}
      {showAxis && (
        <div className="flex justify-between items-center text-[11px] text-[#6B7280] px-0.5 font-normal select-none">
          <span>0%</span>
          <span className="translate-x-[-50%]">50%</span>
          <span>100%</span>
        </div>
      )}
    </div>
  );
}
