import React from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SourceItem } from "@/lib/mock-news-data";

export interface SourceBreakdownCardProps {
  totalSources?: number;
  leftCount?: number;
  leftPct?: number;
  centerCount?: number;
  centerPct?: number;
  rightCount?: number;
  rightPct?: number;
  topSources?: SourceItem[];
}

export function SourceBreakdownCard({
  totalSources = 12,
  leftCount = 2,
  leftPct = 20,
  centerCount = 4,
  centerPct = 31,
  rightCount = 6,
  rightPct = 49,
  topSources = [],
}: SourceBreakdownCardProps) {
  return (
    <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
        <h3 className="text-[16px] font-semibold text-[#0D0D0F]">Source Breakdown</h3>
        <button
          type="button"
          aria-label="Source breakdown info"
          className="text-[#9CA3AF] hover:text-[#0D0D0F] transition-colors"
        >
          <Info className="w-4 h-4 stroke-[2]" />
        </button>
      </div>

      {/* Total Count */}
      <div className="text-[13px] font-semibold text-[#0D0D0F]">
        {totalSources} Total Sources
      </div>

      {/* Progress Bars */}
      <div className="space-y-2.5">
        {/* Left */}
        <div className="flex items-center justify-between text-[12px]">
          <span className="w-12 text-[#0D0D0F] font-medium">Left</span>
          <span className="w-16 text-[#6B7280]">
            {leftCount} ({leftPct}%)
          </span>
          <div className="flex-1 h-2 bg-[#F6F6F6] rounded-full overflow-hidden ml-2">
            <div
              className="h-full bg-[#B42318] rounded-full transition-all"
              style={{ width: `${leftPct}%` }}
            />
          </div>
        </div>

        {/* Center */}
        <div className="flex items-center justify-between text-[12px]">
          <span className="w-12 text-[#0D0D0F] font-medium">Center</span>
          <span className="w-16 text-[#6B7280]">
            {centerCount} ({centerPct}%)
          </span>
          <div className="flex-1 h-2 bg-[#F6F6F6] rounded-full overflow-hidden ml-2">
            <div
              className="h-full bg-[#D1D5DB] rounded-full transition-all"
              style={{ width: `${centerPct}%` }}
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center justify-between text-[12px]">
          <span className="w-12 text-[#0D0D0F] font-medium">Right</span>
          <span className="w-16 text-[#6B7280]">
            {rightCount} ({rightPct}%)
          </span>
          <div className="flex-1 h-2 bg-[#F6F6F6] rounded-full overflow-hidden ml-2">
            <div
              className="h-full bg-[#1D4ED8] rounded-full transition-all"
              style={{ width: `${rightPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top Sources Table */}
      <div className="pt-3 border-t border-[#F0F0F0]">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#6B7280] font-medium mb-2.5">
          <span>Top Sources</span>
          <span>Bias</span>
        </div>

        <div className="divide-y divide-[#F6F6F6] text-[13px]">
          {topSources.map((source, index) => {
            const biasColor =
              source.bias === "Left"
                ? "text-[#B42318] font-medium"
                : source.bias === "Right"
                ? "text-[#1D4ED8] font-medium"
                : "text-[#6B7280]";

            return (
              <div
                key={index}
                className="py-2 flex items-center justify-between hover:bg-[#F9FAFB] px-1 rounded transition-colors"
              >
                <span className="text-[#0D0D0F]">{source.name}</span>
                <span className={biasColor}>{source.bias}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <Button
          variant="secondary"
          visualState="outline"
          size="sm"
          className="w-full text-[13px] rounded-[6px] h-9"
        >
          View All Sources
        </Button>
      </div>
    </div>
  );
}
