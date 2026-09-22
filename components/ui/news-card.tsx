import * as React from "react";
import Image from "next/image";
import { Clock, Bookmark, Info } from "lucide-react";
import { BiasMeter } from "./bias-meter";

export interface NewsCardProps {
  imageUrl?: string;
  category?: string;
  countryOrSource?: string;
  title: string;
  snippet: string;
  leftPercentage?: number;
  centerPercentage?: number;
  rightPercentage?: number;
  publishedAgo?: string;
  readingTime?: string;
  className?: string;
}

export function NewsCard({
  imageUrl = "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
  category = "Politics",
  countryOrSource = "United States",
  title = "Trump Sends Iran Revised Peace Proposal With Tougher Terms: Report",
  snippet = "The proposal includes stricter limits on uranium enrichment and enhanced verification measures.",
  leftPercentage = 25,
  centerPercentage = 50,
  rightPercentage = 49,
  publishedAgo = "2h ago",
  readingTime = "12 min read",
  className = "",
}: NewsCardProps) {
  const [bookmarked, setBookmarked] = React.useState(false);

  return (
    <div
      className={`bg-white rounded-[12px] border border-[#E5E7EB] p-4 sm:p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0px_4px_12px_rgba(0,0,0,0.08)] flex flex-col md:flex-row gap-5 items-stretch ${className}`}
    >
      {/* Article Image Container */}
      <div className="relative w-full md:w-[260px] lg:w-[280px] h-[200px] md:h-auto shrink-0 rounded-[8px] overflow-hidden bg-[#F0F0F0]">
        <Image
          src={imageUrl}
          alt={title}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 280px"
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
        {/* Info Icon Button on Image */}
        <button
          type="button"
          aria-label="Article info"
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-colors"
        >
          <Info className="w-4 h-4 stroke-[2]" />
        </button>
      </div>

      {/* Article Content */}
      <div className="flex flex-col justify-between flex-1 gap-3.5">
        <div className="space-y-2">
          {/* Breadcrumb / Source */}
          <div className="text-[13px] text-[#6B7280] font-normal flex items-center gap-1.5">
            <span className="font-medium text-[#0D0D0F]">{category}</span>
            <span>•</span>
            <span>{countryOrSource}</span>
          </div>

          {/* Headline */}
          <h3 className="text-[20px] font-semibold text-[#0D0D0F] leading-[1.3] tracking-tight hover:text-[#1D4ED8] transition-colors cursor-pointer">
            {title}
          </h3>

          {/* Snippet */}
          <p className="text-[14px] text-[#6B7280] leading-[1.6] line-clamp-2">
            {snippet}
          </p>
        </div>

        {/* Bottom Section: Bias Meter & Meta Info */}
        <div className="space-y-3 pt-1">
          {/* Bias Meter */}
          <BiasMeter
            leftPercentage={leftPercentage}
            centerPercentage={centerPercentage}
            rightPercentage={rightPercentage}
            showAxis={false}
            size="sm"
          />

          {/* Footer Metadata */}
          <div className="flex items-center justify-between text-[13px] text-[#6B7280] pt-1 border-t border-[#F0F0F0]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 stroke-[2]" />
              <span>{publishedAgo}</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setBookmarked(!bookmarked)}
                className="hover:text-[#0D0D0F] transition-colors flex items-center gap-1"
                aria-label="Bookmark article"
              >
                <Bookmark
                  className={`w-4 h-4 stroke-[2] ${
                    bookmarked ? "fill-[#0D0D0F] text-[#0D0D0F]" : ""
                  }`}
                />
              </button>
              <span>{readingTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
