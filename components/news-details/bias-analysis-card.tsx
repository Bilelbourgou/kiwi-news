import React from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BiasAnalysisCardProps {
  overallLabel?: string;
  overallPercentage?: number;
  sourcesCount?: number;
  leftPercentage?: number;
  centerPercentage?: number;
  rightPercentage?: number;
}

export function BiasAnalysisCard({
  overallLabel = "Right",
  overallPercentage = 49,
  sourcesCount = 12,
  leftPercentage = 20,
  centerPercentage = 31,
  rightPercentage = 49,
}: BiasAnalysisCardProps) {
  const biasColor =
    overallLabel === "Left"
      ? "text-[#B42318]"
      : overallLabel === "Right"
      ? "text-[#1D4ED8]"
      : "text-[#0D0D0F]";

  return (
    <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
        <h3 className="text-[16px] font-semibold text-[#0D0D0F]">Bias Analysis</h3>
        <button
          type="button"
          aria-label="Bias analysis info"
          className="text-[#9CA3AF] hover:text-[#0D0D0F] transition-colors"
        >
          <Info className="w-4 h-4 stroke-[2]" />
        </button>
      </div>

      {/* Overall Score */}
      <div>
        <span className="text-[12px] text-[#6B7280] block mb-0.5">Overall Bias</span>
        <div className={`text-[24px] font-bold ${biasColor} leading-tight`}>
          {overallLabel} {overallPercentage}%
        </div>
        <span className="text-[12px] text-[#6B7280]">
          Based on {sourcesCount} balanced sources
        </span>
      </div>

      {/* Breakdown Rows */}
      <div className="space-y-2.5 pt-1">
        {/* Left */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#0D0D0F] font-medium">Left</span>
            <span className="text-[#B42318] font-semibold">{leftPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-[#F6F6F6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#B42318] rounded-full transition-all"
              style={{ width: `${leftPercentage}%` }}
            />
          </div>
        </div>

        {/* Center */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#0D0D0F] font-medium">Center</span>
            <span className="text-[#6B7280] font-semibold">{centerPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-[#F6F6F6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D1D5DB] rounded-full transition-all"
              style={{ width: `${centerPercentage}%` }}
            />
          </div>
        </div>

        {/* Right */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#0D0D0F] font-medium">Right</span>
            <span className="text-[#1D4ED8] font-semibold">{rightPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-[#F6F6F6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1D4ED8] rounded-full transition-all"
              style={{ width: `${rightPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Methodology Explainer */}
      <p className="text-[12px] text-[#6B7280] leading-relaxed pt-2 border-t border-[#F0F0F0]">
        Our analysis is based on the political leaning of the publication and how the story is
        framed. Sources are weighted by reliability and recency.
      </p>

      {/* Action Button */}
      <Button
        variant="secondary"
        visualState="outline"
        size="sm"
        className="w-full text-[13px] rounded-[6px] h-9"
      >
        How We Analyze Bias
      </Button>
    </div>
  );
}
