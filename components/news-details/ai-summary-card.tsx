import React from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AISummaryCardProps {
  generatedDate?: string;
  readingTime?: string;
  points: string[];
}

export function AISummaryCard({
  generatedDate = "May 31, 2026",
  readingTime = "3 min read",
  points,
}: AISummaryCardProps) {
  return (
    <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
        <h3 className="text-[16px] font-semibold text-[#0D0D0F]">AI Summary</h3>
        <button
          type="button"
          aria-label="AI summary info"
          className="text-[#9CA3AF] hover:text-[#0D0D0F] transition-colors"
        >
          <Info className="w-4 h-4 stroke-[2]" />
        </button>
      </div>

      {/* Timestamp */}
      <div className="text-[12px] text-[#6B7280]">
        Generated {generatedDate} · {readingTime}
      </div>

      {/* Bullet Points */}
      <ul className="space-y-3 text-[13px] text-[#0D0D0F] leading-relaxed">
        {points.map((pt, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D0D0F] mt-2 shrink-0" />
            <span>{pt}</span>
          </li>
        ))}
      </ul>

      {/* Disclaimer & Action */}
      <div className="pt-2 border-t border-[#F0F0F0] space-y-3">
        <p className="text-[11px] text-[#9CA3AF]">
          AI summaries can make mistakes.
        </p>
        <Button
          variant="secondary"
          visualState="outline"
          size="sm"
          className="w-full text-[13px] rounded-[6px] h-9"
        >
          Provide Feedback
        </Button>
      </div>
    </div>
  );
}
