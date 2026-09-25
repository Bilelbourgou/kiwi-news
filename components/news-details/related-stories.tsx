import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface RelatedStoryItem {
  id: string;
  category: string;
  region: string;
  title: string;
  imageUrl: string;
  date: string;
  readingTime: string;
}

export interface RelatedStoriesProps {
  stories: RelatedStoryItem[];
}

export function RelatedStories({ stories }: RelatedStoriesProps) {
  return (
    <section className="pt-8 border-t border-[#E5E7EB]">
      <h3 className="text-[18px] font-semibold text-[#0D0D0F] mb-4">
        Related Stories
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stories.map((story) => (
          <Link
            key={story.id}
            href={`/news/${story.id}`}
            className="bg-white rounded-[8px] border border-[#E5E7EB] p-3 flex items-center gap-3.5 hover:shadow-[0px_2px_8px_rgba(0,0,0,0.06)] hover:border-[#D1D5DB] transition-all group"
          >
            {/* Thumbnail */}
            <div className="relative w-20 h-20 rounded-[6px] overflow-hidden bg-[#F0F0F0] shrink-0">
              <Image
                src={story.imageUrl}
                alt={story.title}
                fill
                unoptimized
                sizes="80px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between min-w-0 flex-1">
              <div className="text-[11px] text-[#6B7280] mb-0.5">
                <span className="font-semibold text-[#0D0D0F]">{story.category}</span>
                <span> · </span>
                <span>{story.region}</span>
              </div>

              <h4 className="text-[13px] font-semibold text-[#0D0D0F] leading-snug line-clamp-2 group-hover:text-[#1D4ED8] transition-colors mb-1">
                {story.title}
              </h4>

              <div className="text-[11px] text-[#9CA3AF]">
                {story.date} · {story.readingTime}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
