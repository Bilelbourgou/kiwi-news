import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Info } from "lucide-react";
import { NewsArticleItem } from "@/lib/mock-news-data";

export interface GridNewsCardProps {
  article: NewsArticleItem;
  className?: string;
}

export function GridNewsCard({ article, className = "" }: GridNewsCardProps) {
  const {
    id,
    title,
    category,
    region,
    imageUrl,
    leftPercentage,
    centerPercentage,
    rightPercentage,
    sourcesCount,
  } = article;

  // Normalized widths
  const total = leftPercentage + centerPercentage + rightPercentage || 100;
  const leftW = (leftPercentage / total) * 100;
  const centerW = (centerPercentage / total) * 100;
  const rightW = (rightPercentage / total) * 100;

  return (
    <article
      className={`bg-white rounded-[12px] border border-[#E5E7EB] p-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[0px_4px_12px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between group ${className}`}
    >
      <div>
        {/* Card Image */}
        <div className="relative w-full aspect-[16/10] rounded-[8px] overflow-hidden bg-[#F0F0F0] mb-3.5">
          <Link href={`/news/${id}`} className="block w-full h-full">
            <Image
              src={imageUrl}
              alt={title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-103"
            />
          </Link>
          <button
            type="button"
            aria-label="Article information"
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-xs text-white flex items-center justify-center transition-colors shadow-xs z-10 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        </div>

        {/* Breadcrumb Category · Region */}
        <div className="text-[12px] text-[#6B7280] flex items-center gap-1.5 mb-1.5">
          <span className="font-semibold text-[#0D0D0F]">{category}</span>
          <span className="text-[#9CA3AF]">·</span>
          <span>{region}</span>
        </div>

        {/* Headline */}
        <h3 className="text-[17px] sm:text-[18px] font-semibold text-[#0D0D0F] leading-[1.35] tracking-tight group-hover:text-[#1D4ED8] transition-colors line-clamp-3 min-h-[48px] mb-3">
          <Link href={`/news/${id}`}>{title}</Link>
        </h3>
      </div>

      <div className="space-y-2 pt-1">
        {/* Compact Segmented Bias Meter */}
        <div className="w-full h-[22px] rounded-[4px] overflow-hidden flex font-medium text-[11px] select-none">
          {leftW > 0 && (
            <div
              style={{ width: `${leftW}%` }}
              className="bg-[#B42318] text-white flex items-center justify-center px-1 truncate"
              title={`Left ${leftPercentage}%`}
            >
              L {leftPercentage}%
            </div>
          )}
          {centerW > 0 && (
            <div
              style={{ width: `${centerW}%` }}
              className="bg-[#E5E7EB] text-[#0D0D0F] flex items-center justify-center px-1 truncate"
              title={`Center ${centerPercentage}%`}
            >
              Center {centerPercentage}%
            </div>
          )}
          {rightW > 0 && (
            <div
              style={{ width: `${rightW}%` }}
              className="bg-[#1D4ED8] text-white flex items-center justify-center px-1 truncate"
              title={`Right ${rightPercentage}%`}
            >
              Right {rightPercentage}%
            </div>
          )}
        </div>

        {/* Sources Count */}
        <div className="text-[12px] text-[#6B7280]">
          {sourcesCount} sources
        </div>
      </div>
    </article>
  );
}
