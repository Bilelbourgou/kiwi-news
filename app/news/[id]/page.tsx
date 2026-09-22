import React from "react";
import Image from "next/image";
import { Bookmark, Share2, MoreHorizontal, Info } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BiasAnalysisCard } from "@/components/news-details/bias-analysis-card";
import { AISummaryCard } from "@/components/news-details/ai-summary-card";
import { SourceBreakdownCard } from "@/components/news-details/source-breakdown-card";
import { RelatedStories } from "@/components/news-details/related-stories";
import { NewsletterBanner } from "@/components/news-details/newsletter-banner";
import { getArticleDetail } from "@/lib/mock-news-data";

interface NewsPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewsDetailsPage({ params }: NewsPageProps) {
  const { id } = await params;
  const article = getArticleDetail(id);

  // Bias bar widths
  const total =
    article.leftPercentage + article.centerPercentage + article.rightPercentage || 100;
  const leftW = (article.leftPercentage / total) * 100;
  const centerW = (article.centerPercentage / total) * 100;
  const rightW = (article.rightPercentage / total) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F0F0] text-[#0D0D0F] font-sans">
      {/* 1. Shared Header */}
      <Header />

      {/* 2. Main Article Details Container */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT / MAIN ARTICLE COLUMN (8 cols) */}
          <article className="lg:col-span-8 space-y-6">
            {/* Category Breadcrumb */}
            <div className="text-[12px] text-[#6B7280] flex items-center gap-1.5">
              <span className="font-semibold text-[#0D0D0F]">
                {article.category}
              </span>
              <span className="text-[#9CA3AF]">·</span>
              <span>{article.region}</span>
            </div>

            {/* Headline Title */}
            <h1 className="text-[28px] sm:text-[34px] font-bold text-[#0D0D0F] leading-[1.2] tracking-tight">
              {article.title}
            </h1>

            {/* Author & Meta & Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-[#6B7280] border-b border-[#E5E7EB] pb-4">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#0D0D0F]">
                  By {article.author}
                </span>
                <span>|</span>
                <span>{article.publishedDate}</span>
                <span>|</span>
                <span>{article.readingTime}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 text-[#0D0D0F]">
                <button
                  type="button"
                  className="flex items-center gap-1.5 hover:text-[#1D4ED8] transition-colors cursor-pointer"
                >
                  <span className="text-[12px] font-medium">Save</span>
                  <Bookmark className="w-4 h-4 stroke-[2]" />
                </button>

                <button
                  type="button"
                  className="flex items-center gap-1.5 hover:text-[#1D4ED8] transition-colors cursor-pointer"
                >
                  <span className="text-[12px] font-medium">Share</span>
                  <Share2 className="w-4 h-4 stroke-[2]" />
                </button>

                <button
                  type="button"
                  aria-label="More actions"
                  className="hover:text-[#1D4ED8] transition-colors cursor-pointer p-1"
                >
                  <MoreHorizontal className="w-4 h-4 stroke-[2]" />
                </button>
              </div>
            </div>

            {/* Featured Image & Caption */}
            <div className="space-y-2">
              <div className="relative w-full aspect-[16/10] rounded-[8px] overflow-hidden bg-[#E5E7EB] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 840px"
                  className="object-cover"
                />
              </div>
              <p className="text-[11px] text-[#6B7280] leading-normal">
                {article.imageCaption} {article.imageCredit}
              </p>
            </div>

            {/* In-Content Bias Distribution Widget */}
            <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] space-y-2.5">
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0D0D0F]">
                <span>Bias Distribution</span>
                <Info className="w-3.5 h-3.5 text-[#9CA3AF] stroke-[2]" />
              </div>

              {/* Segmented Bar */}
              <div className="w-full h-6 rounded-[4px] overflow-hidden flex font-medium text-[11px] select-none">
                {leftW > 0 && (
                  <div
                    style={{ width: `${leftW}%` }}
                    className="bg-[#B42318] text-white flex items-center justify-center px-1 truncate"
                  >
                    Left {article.leftPercentage}%
                  </div>
                )}
                {centerW > 0 && (
                  <div
                    style={{ width: `${centerW}%` }}
                    className="bg-[#E5E7EB] text-[#0D0D0F] flex items-center justify-center px-1 truncate"
                  >
                    Center {article.centerPercentage}%
                  </div>
                )}
                {rightW > 0 && (
                  <div
                    style={{ width: `${rightW}%` }}
                    className="bg-[#1D4ED8] text-white flex items-center justify-center px-1 truncate"
                  >
                    Right {article.rightPercentage}%
                  </div>
                )}
              </div>

              <div className="text-[12px] text-[#6B7280]">
                {article.sourcesCount} sources
              </div>
            </div>

            {/* Editorial Article Body */}
            <div className="space-y-5 text-[15px] sm:text-[16px] text-[#0D0D0F] leading-[1.7] font-normal pt-2">
              {article.paragraphs.map((p, index) => (
                <p key={index}>{p}</p>
              ))}
            </div>

            {/* Related Stories Section */}
            <RelatedStories stories={article.relatedStories} />
          </article>

          {/* RIGHT / SIDEBAR COLUMN (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Widget 1: Bias Analysis */}
            <BiasAnalysisCard
              overallLabel={article.overallBiasLabel}
              overallPercentage={article.overallBiasPercentage}
              sourcesCount={article.sourcesCount}
              leftPercentage={article.leftPercentage}
              centerPercentage={article.centerPercentage}
              rightPercentage={article.rightPercentage}
            />

            {/* Widget 2: AI Summary */}
            <AISummaryCard
              generatedDate={article.publishedDate}
              readingTime="3 min read"
              points={article.aiSummaryPoints}
            />

            {/* Widget 3: Source Breakdown */}
            <SourceBreakdownCard
              totalSources={article.sourceBreakdown.total}
              leftCount={article.sourceBreakdown.leftCount}
              leftPct={article.sourceBreakdown.leftPercentage}
              centerCount={article.sourceBreakdown.centerCount}
              centerPct={article.sourceBreakdown.centerPercentage}
              rightCount={article.sourceBreakdown.rightCount}
              rightPct={article.sourceBreakdown.rightPercentage}
              topSources={article.topSources}
            />
          </aside>
        </div>

        {/* 3. Newsletter Banner */}
        <NewsletterBanner />
      </main>

      {/* 4. Footer */}
      <Footer />
    </div>
  );
}
