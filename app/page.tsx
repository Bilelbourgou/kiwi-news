import React from "react";
import { Header } from "@/components/layout/header";
import { CategoryBar } from "@/components/layout/category-bar";
import { GridNewsCard, type NewsArticleItem } from "@/components/ui/grid-news-card";
import { Footer } from "@/components/layout/footer";
import { getArticlesWithAnalysis } from "@/lib/supabase/queries";
import type { ArticleWithAnalysis } from "@/lib/supabase/types";

/** Map a Supabase ArticleWithAnalysis row to the GridNewsCard prop shape. */
function toNewsArticleItem(row: ArticleWithAnalysis): NewsArticleItem {
  const analysis = row.analysis;
  return {
    id: row.id,
    // Use the source name as the "category" until a category field exists
    category: row.source.name,
    region: "",
    title: row.title,
    imageUrl: row.image_url,
    leftPercentage: analysis?.left_percentage ?? 0,
    centerPercentage: analysis?.center_percentage ?? 0,
    rightPercentage: analysis?.right_percentage ?? 0,
    // sourcesCount reflects the number of active sources in the DB (shown as 1 per article)
    sourcesCount: 1,
    publishedAgo: row.published_at
      ? formatRelativeTime(row.published_at)
      : undefined,
  };
}

/** Simple relative-time formatter — avoids a heavy date library dependency. */
function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default async function HomePage() {
  const rows = await getArticlesWithAnalysis(50);
  const articles = rows.map(toNewsArticleItem);

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
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <GridNewsCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          /* Empty state — shown until scraping pipeline has run */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E5E7EB] flex items-center justify-center mb-4">
              <span className="text-2xl">📰</span>
            </div>
            <h2 className="text-[18px] font-semibold text-[#0D0D0F] mb-2">
              No articles yet
            </h2>
            <p className="text-[14px] text-[#6B7280] max-w-sm">
              Run the scraping pipeline to pull in articles from your configured
              sources. They will appear here once analyzed.
            </p>
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <Footer />
    </div>
  );
}
