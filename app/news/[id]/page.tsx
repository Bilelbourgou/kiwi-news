import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Bookmark, Share2, MoreHorizontal, Info } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BiasAnalysisCard } from "@/components/news-details/bias-analysis-card";
import { AISummaryCard } from "@/components/news-details/ai-summary-card";
import { SourceBreakdownCard } from "@/components/news-details/source-breakdown-card";
import { RelatedStories, type RelatedStoryItem } from "@/components/news-details/related-stories";
import { NewsletterBanner } from "@/components/news-details/newsletter-banner";
import { getArticleById, getRelatedArticles } from "@/lib/supabase/queries";
import type { ArticleWithAnalysis } from "@/lib/supabase/types";

interface NewsPageProps {
  params: Promise<{ id: string }>;
}

/** Split raw article text into display paragraphs. */
function splitIntoParagraphs(rawText: string): string[] {
  return rawText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/** Format a date string for display. */
function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Map related ArticleWithAnalysis rows to the RelatedStoryItem shape. */
function toRelatedStoryItem(row: ArticleWithAnalysis): RelatedStoryItem {
  return {
    id: row.id,
    category: row.source.name,
    region: "",
    title: row.title,
    imageUrl: row.image_url,
    date: formatDate(row.published_at),
    readingTime: "—",
  };
}

export default async function NewsDetailsPage({ params }: NewsPageProps) {
  const { id } = await params;

  const article = await getArticleById(id);
  if (!article) notFound();

  const analysis = article.analysis;
  const biasLabel = analysis?.bias_label ?? null;

  const relatedRows = await getRelatedArticles(id, article.source_id, biasLabel, 6);
  const relatedStories = relatedRows.map(toRelatedStoryItem);

  // Derive paragraph display content
  const paragraphs = splitIntoParagraphs(article.raw_text);

  // Bias bar widths
  const leftPct = analysis?.left_percentage ?? 0;
  const centerPct = analysis?.center_percentage ?? 0;
  const rightPct = analysis?.right_percentage ?? 0;
  const total = leftPct + centerPct + rightPct || 100;
  const leftW = (leftPct / total) * 100;
  const centerW = (centerPct / total) * 100;
  const rightW = (rightPct / total) * 100;

  // Derive overall bias label for the sidebar card
  const overallBiasLabel =
    biasLabel === "left"
      ? "Left"
      : biasLabel === "right"
      ? "Right"
      : biasLabel === "center"
      ? "Center"
      : biasLabel === "mixed"
      ? "Mixed"
      : "Unclear";

  const overallBiasPercentage = Math.max(leftPct, centerPct, rightPct);

  // AI summary points — split analysis summary into sentences
  const aiSummaryPoints: string[] = analysis?.summary
    ? analysis.summary
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 10)
        .slice(0, 5)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F0F0] text-[#0D0D0F] font-sans">
      {/* 1. Shared Header */}
      <Header />

      {/* 2. Main Article Details Container */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT / MAIN ARTICLE COLUMN (8 cols) */}
          <article className="lg:col-span-8 space-y-6">
            {/* Source Breadcrumb */}
            <div className="text-[12px] text-[#6B7280] flex items-center gap-1.5">
              <span className="font-semibold text-[#0D0D0F]">
                {article.source.name}
              </span>
            </div>

            {/* Headline Title */}
            <h1 className="text-[28px] sm:text-[34px] font-bold text-[#0D0D0F] leading-[1.2] tracking-tight">
              {article.title}
            </h1>

            {/* Meta & Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-[#6B7280] border-b border-[#E5E7EB] pb-4">
              <div className="flex items-center gap-2">
                <span>{formatDate(article.published_at)}</span>
                {analysis && (
                  <>
                    <span>|</span>
                    <span className="capitalize">{analysis.sentiment_label} sentiment</span>
                  </>
                )}
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

            {/* Featured Image */}
            <div className="space-y-2">
              <div className="relative w-full aspect-[16/10] rounded-[8px] overflow-hidden bg-[#E5E7EB] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
                <Image
                  src={article.image_url}
                  alt={article.title}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 840px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* In-Content AI-Estimated Framing Widget */}
            {analysis && (
              <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] space-y-2.5">
                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0D0D0F]">
                  <span>AI-Estimated Framing</span>
                  <Info className="w-3.5 h-3.5 text-[#9CA3AF] stroke-[2]" />
                </div>

                {/* Segmented Bar */}
                <div className="w-full h-6 rounded-[4px] overflow-hidden flex font-medium text-[11px] select-none">
                  {leftW > 0 && (
                    <div
                      style={{ width: `${leftW}%` }}
                      className="bg-[#B42318] text-white flex items-center justify-center px-1 truncate"
                    >
                      Left {leftPct}%
                    </div>
                  )}
                  {centerW > 0 && (
                    <div
                      style={{ width: `${centerW}%` }}
                      className="bg-[#E5E7EB] text-[#0D0D0F] flex items-center justify-center px-1 truncate"
                    >
                      Center {centerPct}%
                    </div>
                  )}
                  {rightW > 0 && (
                    <div
                      style={{ width: `${rightW}%` }}
                      className="bg-[#1D4ED8] text-white flex items-center justify-center px-1 truncate"
                    >
                      Right {rightPct}%
                    </div>
                  )}
                </div>

                {analysis.disclaimer && (
                  <p className="text-[11px] text-[#6B7280] italic">
                    {analysis.disclaimer}
                  </p>
                )}
              </div>
            )}

            {/* Editorial Article Body */}
            <div className="space-y-5 text-[15px] sm:text-[16px] text-[#0D0D0F] leading-[1.7] font-normal pt-2">
              {paragraphs.map((p, index) => (
                <p key={index}>{p}</p>
              ))}
            </div>

            {/* Related Stories Section */}
            {relatedStories.length > 0 && (
              <RelatedStories stories={relatedStories} />
            )}
          </article>

          {/* RIGHT / SIDEBAR COLUMN (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Widget 1: Bias Analysis */}
            <BiasAnalysisCard
              overallLabel={overallBiasLabel}
              overallPercentage={overallBiasPercentage}
              sourcesCount={1}
              leftPercentage={leftPct}
              centerPercentage={centerPct}
              rightPercentage={rightPct}
            />

            {/* Widget 2: AI Summary */}
            {analysis && aiSummaryPoints.length > 0 && (
              <AISummaryCard
                generatedDate={formatDate(analysis.created_at)}
                readingTime="~3 min"
                points={aiSummaryPoints}
              />
            )}

            {/* Widget 3: Source Breakdown */}
            <SourceBreakdownCard
              totalSources={1}
              leftCount={leftPct > 0 ? 1 : 0}
              leftPct={leftPct}
              centerCount={centerPct > 0 ? 1 : 0}
              centerPct={centerPct}
              rightCount={rightPct > 0 ? 1 : 0}
              rightPct={rightPct}
              topSources={[
                {
                  name: article.source.name,
                  bias:
                    biasLabel === "left"
                      ? "Left"
                      : biasLabel === "right"
                      ? "Right"
                      : "Center",
                },
              ]}
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
