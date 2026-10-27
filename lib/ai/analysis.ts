import { generateText, Output } from "ai";
import { z } from "zod";

import { getAIModel } from "./client";
import type { Article, BiasLabel, SentimentLabel } from "@/lib/supabase/types";

export const aiRawAnalysisSchema = z.object({
  summary: z
    .string()
    .min(10)
    .describe(
      "A neutral, factual summary of the article's core points, written without editorial bias or partisan language."
    ),
  sentimentScore: z
    .number()
    .min(-1)
    .max(1)
    .describe(
      "Tone of the article from -1.0 (strongly negative/critical) to 1.0 (strongly positive/favorable). 0.0 is neutral."
    ),
  sentimentLabel: z
    .enum(["positive", "neutral", "negative"])
    .describe("Sentiment category that corresponds to the sentimentScore."),
  leftPercentage: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Estimated percentage (0-100) reflecting left-leaning framing, priorities, viewpoints, or advocacy."
    ),
  centerPercentage: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Estimated percentage (0-100) reflecting balanced, neutral, objective, or bipartisan framing."
    ),
  rightPercentage: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Estimated percentage (0-100) reflecting right-leaning framing, priorities, viewpoints, or advocacy."
    ),
  politicalFramingLabel: z
    .enum(["left", "center", "right", "mixed", "unclear"])
    .describe(
      "Political framing classification based on the strongest evidence: 'left', 'center', 'right', 'mixed', or 'unclear'."
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence level from 0.0 to 1.0 in this framing assessment based on article evidence."),
  framingNotes: z
    .string()
    .describe(
      "Concise explanation of how facts, quotes, context, and arguments are framed in the text."
    ),
  loadedTerms: z
    .array(z.string())
    .describe(
      "List of emotionally charged, rhetorical, or partisan words/phrases identified in the text."
    ),
  disclaimer: z
    .string()
    .describe(
      "Mandatory disclaimer stating that political framing and sentiment metrics are AI-estimated and not objective truth."
    ),
});

export type AIRawAnalysisOutput = z.infer<typeof aiRawAnalysisSchema>;

export interface ArticleAnalysisData {
  article_id: string;
  summary: string;
  sentiment_score: number;
  sentiment_label: SentimentLabel;
  bias_score: number;
  bias_label: BiasLabel;
  left_percentage: number;
  center_percentage: number;
  right_percentage: number;
  confidence: number;
  framing_notes: string;
  loaded_terms: string[];
  disclaimer: string;
  model: string;
}

/**
 * Normalizes left, center, and right percentages so they are non-negative integers
 * that strictly sum to 100, fulfilling the database constraint `pct_sum_100`.
 */
export function normalizePercentages(
  left: number,
  center: number,
  right: number
): { leftPercentage: number; centerPercentage: number; rightPercentage: number } {
  let l = Math.max(0, Math.min(100, Math.round(left)));
  let c = Math.max(0, Math.min(100, Math.round(center)));
  let r = Math.max(0, Math.min(100, Math.round(right)));

  const total = l + c + r;

  if (total === 100) {
    return { leftPercentage: l, centerPercentage: c, rightPercentage: r };
  }

  if (total === 0) {
    return { leftPercentage: 0, centerPercentage: 100, rightPercentage: 0 };
  }

  // Rescale proportionally
  const factor = 100 / total;
  l = Math.round(l * factor);
  c = Math.round(c * factor);
  r = 100 - (l + c);

  // Guard against any negative edge case
  if (r < 0) {
    r = 0;
    c = 100 - l;
  }
  if (c < 0) {
    c = 0;
    l = 100 - r;
  }

  return { leftPercentage: l, centerPercentage: c, rightPercentage: r };
}

/**
 * Reconciles the political framing label according to AGENTS.md §19 rules:
 * - The label should match the strongest percentage unless confidence is low or percentages are close.
 * - If evidence is weak, use 'unclear' and keep confidence low.
 * - Use article text evidence only.
 */
export function determineBiasLabel(
  percentages: { leftPercentage: number; centerPercentage: number; rightPercentage: number },
  suggestedLabel: BiasLabel,
  confidence: number
): BiasLabel {
  const { leftPercentage: l, centerPercentage: c, rightPercentage: r } = percentages;

  if (confidence < 0.35 || (l < 15 && c < 15 && r < 15)) {
    return "unclear";
  }

  // If left and right are very close and both significant
  if (Math.abs(l - r) <= 10 && (l > 30 || r > 30)) {
    return "mixed";
  }

  // If suggested label is already valid and supported by data
  if (suggestedLabel === "mixed" || suggestedLabel === "unclear") {
    return suggestedLabel;
  }

  const max = Math.max(l, c, r);
  if (max === l && l > c && l > r) {
    return "left";
  }
  if (max === r && r > c && r > l) {
    return "right";
  }
  if (max === c && c >= l && c >= r) {
    return "center";
  }

  return suggestedLabel;
}

const SYSTEM_PROMPT = `You are a neutral, objective, principal news analysis AI system for the KIWI news intelligence platform.
Your task is to analyze the provided article headline and body text for tone, sentiment, and political framing.

Rules:
1. Base your assessment SOLELY on the supplied article text and headline. NEVER infer or assume bias based on the news source, publisher name, or URL.
2. Political framing must be evaluated as an AI estimate, never objective truth.
3. leftPercentage, centerPercentage, and rightPercentage must represent the distribution of framing/emphasis and must add up to 100.
4. politicalFramingLabel must be one of: 'left', 'center', 'right', 'mixed', or 'unclear'.
   - Match the strongest percentage unless confidence is low or percentages are close.
   - If the article is straightforward reporting with no discernible partisan spin, assign high center percentage and 'center' label.
   - If evidence is weak or the article is purely factual/technical, use 'unclear' and keep confidence low.
5. sentimentScore must be between -1.0 and 1.0. sentimentLabel must be 'positive', 'neutral', or 'negative'.
6. Identify loadedTerms: specific words, phrases, or rhetorical tropes in the text that carry emotional or ideological charge.
7. Write a concise, neutral factual summary (2-3 sentences) capturing what happened.
8. Include a clear disclaimer stating: "Framing and sentiment assessments are AI-estimated and provided for educational and media literacy purposes, not objective truth."`;

/**
 * Analyzes a single article with retry logic per AGENTS.md §19.
 */
export async function analyzeArticle(
  article: Article,
  modelName?: string
): Promise<ArticleAnalysisData> {
  const { model, modelName: resolvedModelName } = getAIModel(modelName);

  const promptContent = `Title: ${article.title}
Published At: ${article.published_at}
Article Content:
${article.raw_text.slice(0, 12000)}`;

  let lastError: Error | null = null;

  // Try up to 2 attempts (initial + 1 retry per AGENTS.md §19)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await generateText({
        model,
        output: Output.object({
          schema: aiRawAnalysisSchema,
        }),
        system: SYSTEM_PROMPT,
        prompt: promptContent,
      });

      const parsed = response.output;

      // Normalize percentages to strictly sum to 100
      const { leftPercentage, centerPercentage, rightPercentage } = normalizePercentages(
        parsed.leftPercentage,
        parsed.centerPercentage,
        parsed.rightPercentage
      );

      const confidence = Number(Math.max(0, Math.min(1, parsed.confidence)).toFixed(3));
      const biasLabel = determineBiasLabel(
        { leftPercentage, centerPercentage, rightPercentage },
        parsed.politicalFramingLabel,
        confidence
      );

      // Derived bias score: (right_percentage - left_percentage) / 100
      const biasScore = Number(((rightPercentage - leftPercentage) / 100).toFixed(3));
      const sentimentScore = Number(Math.max(-1, Math.min(1, parsed.sentimentScore)).toFixed(3));

      const analysisData: ArticleAnalysisData = {
        article_id: article.id,
        summary: parsed.summary.trim(),
        sentiment_score: sentimentScore,
        sentiment_label: parsed.sentimentLabel,
        bias_score: biasScore,
        bias_label: biasLabel,
        left_percentage: leftPercentage,
        center_percentage: centerPercentage,
        right_percentage: rightPercentage,
        confidence,
        framing_notes: parsed.framingNotes.trim(),
        loaded_terms: parsed.loadedTerms ?? [],
        disclaimer:
          parsed.disclaimer ||
          "Framing and sentiment metrics are AI-estimated and provided for educational and media literacy purposes, not objective truth.",
        model: resolvedModelName,
      };

      return analysisData;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(
        `[ai-analysis] Attempt ${attempt} failed for article "${article.title.slice(0, 40)}...":`,
        lastError.message
      );
      if (attempt < 2) {
        // Small delay before retry
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
  }

  throw lastError ?? new Error("AI analysis failed after retry");
}
