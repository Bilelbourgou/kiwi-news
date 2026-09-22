import React from "react";
import { Header } from "@/components/layout/header";
import { CategoryBar } from "@/components/layout/category-bar";
import { GridNewsCard } from "@/components/ui/grid-news-card";
import { Footer } from "@/components/layout/footer";
import { TOP_NEWS_ARTICLES } from "@/lib/mock-news-data";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F0F0F0] text-[#0D0D0F] font-sans">
      {/* 1. Header (Utility bar + Primary Navigation) */}
      <Header />

      {/* 2. Scrollable Category / Topic Bar */}
      <CategoryBar />

      {/* 3. Main Content Container */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 pt-7 sm:pt-8 pb-12">
        {/* Section Heading */}
        <div className="mb-6">
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0D0D0F] tracking-tight leading-tight">
            Top News
          </h1>
        </div>

        {/* 3-Column Top News Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOP_NEWS_ARTICLES.map((article) => (
            <GridNewsCard key={article.id} article={article} />
          ))}
        </div>
      </main>

      {/* 4. Footer */}
      <Footer />
    </div>
  );
}
