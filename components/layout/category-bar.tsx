"use client";

import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const CATEGORIES = [
  "World Cup",
  "IPL",
  "Social Media",
  "Business & Markets",
  "Health & Medicine",
  "Soccer",
  "Artificial Intelligence",
  "Arsenal FC",
  "Extreme Weather and Disasters",
];

export function CategoryBar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full bg-white border-b border-[#E5E7EB]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative flex items-center py-2.5">
        {/* Left Scroll Button */}
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="p-1 rounded-full text-[#6B7280] hover:text-[#0D0D0F] hover:bg-[#F6F6F6] transition-colors shrink-0 mr-1"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2]" />
        </button>

        {/* Scrollable Pills Container */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5 flex-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(isActive ? null : cat)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-normal transition-colors border select-none whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#0D0D0F] text-white border-[#0D0D0F]"
                    : "bg-[#F6F6F6] hover:bg-[#E5E7EB] text-[#0D0D0F] border-[#E5E7EB]"
                }`}
              >
                <span>{cat}</span>
                <Plus className={`w-3.5 h-3.5 stroke-[2] ${isActive ? "text-white" : "text-[#6B7280]"}`} />
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="p-1 rounded-full text-[#6B7280] hover:text-[#0D0D0F] hover:bg-[#F6F6F6] transition-colors shrink-0 ml-1"
        >
          <ChevronRight className="w-4 h-4 stroke-[2]" />
        </button>
      </div>
    </div>
  );
}
