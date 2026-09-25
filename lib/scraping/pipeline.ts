import { load } from "cheerio";
import { z } from "zod";

import { fetchUrlAsHtml } from "@/lib/oxylabs/client";
import { createServiceClient } from "@/lib/supabase/service";
import type { Source } from "@/lib/supabase/types";
import { getActiveSources } from "@/lib/supabase/queries";

const ARTICLE_REJECT_PATTERNS = [
  "/search",
  "/topic",
  "/topics",
  "/tag",
  "/tags",
  "/author",
  "/authors",
  "/live",
  "/video",
  "/podcast",
  "/program",
  "/show",
  "/shows",
  "/newsletter",
  "/subscribe",
  "/support",
  "/corporate",
  "/product",
  "/products",
  "/shopping",
  "/review",
  "/reviews",
  "/game",
  "/games",
  "/section",
  "/sections",
  "/category",
  "/categories",
  "/sport",
  "/sports",
  "/opinion",
  "/weather",
  "/explained",
  "/analysis",
  "/thefilter-us",
];

const ARTICLE_SCHEMA = z.object({
  url: z.string().url(),
  canonical_url: z.string().url().optional(),
  title: z.string().min(12),
  image_url: z.string().url(),
  published_at: z.string().min(10),
  raw_text: z.string().min(200),
});

export type ScrapeSummary = {
  status: "success" | "partial" | "failed";
  sourcesChecked: number;
  candidatesFound: number;
  candidatesRejected: number;
  duplicatesSkipped: number;
  detailPagesScraped: number;
  articlesInserted: number;
  articlesRejected: number;
  articlesFailed: number;
  totalDurationMs: number;
  rejectionReasons: Record<string, number>;
};

function getNormalizedUrl(value: string, baseUrl: string): string | null {
  try {
    const parsed = new URL(value, baseUrl);
    if (!/^https?:$/i.test(parsed.protocol)) {
      return null;
    }

    const cleanUrl = new URL(parsed.toString());
    cleanUrl.hash = "";
    cleanUrl.search = cleanUrl.search
      .replace(/utm_[^&]+&?/gi, "")
      .replace(/\?&+/g, "?")
      .replace(/[?&]$/, "");

    return cleanUrl.toString();
  } catch {
    return null;
  }
}

function recordRejection(
  summary: ScrapeSummary,
  reason: string
): void {
  summary.rejectionReasons[reason] = (summary.rejectionReasons[reason] ?? 0) + 1;
}

function normalizeHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function looksLikeSourceArticleUrl(url: string, source: Source): boolean {
  const normalized = getNormalizedUrl(url, source.listing_url);

  if (!normalized) {
    return false;
  }

  const parsed = new URL(normalized);
  const hostname = normalizeHostname(normalized);
  const sourceHostname = normalizeHostname(source.listing_url);

  if (hostname !== sourceHostname) {
    return false;
  }

  if (parsed.pathname === "/" || parsed.pathname === "") {
    return false;
  }

  const path = parsed.pathname.toLowerCase();

  if (ARTICLE_REJECT_PATTERNS.some((pattern) => path.includes(pattern))) {
    return false;
  }

  if (path.includes("/search") || path.includes("/author") || path.includes("/section")) {
    return false;
  }

  const segments = path.split("/").filter(Boolean);
  if (segments.length < 2) {
    return false;
  }

  return true;
}

function extractCandidateUrlsFromHtml(html: string, source: Source): string[] {
  const $ = load(html);
  const hrefValues = $('a[href]')
    .toArray()
    .map((element) => $(element).attr("href"))
    .filter((value): value is string => Boolean(value));

  const candidates = new Set<string>();

  for (const href of hrefValues) {
    const normalized = getNormalizedUrl(href, source.listing_url);
    if (!normalized) {
      continue;
    }

    if (!looksLikeSourceArticleUrl(normalized, source)) {
      continue;
    }

    candidates.add(normalized);
  }

  return Array.from(candidates);
}

async function loadSeenUrls(urls: string[]): Promise<Set<string>> {
  if (urls.length === 0) {
    return new Set();
  }

  const supabase = createServiceClient();
  const seen = new Set<string>();

  for (let index = 0; index < urls.length; index += 15) {
    const chunk = urls.slice(index, index + 15);

    const { data, error } = await supabase
      .from("articles")
      .select("url")
      .in("url", chunk);

    if (error) {
      console.error("[scrape] URL existence check failed:", error.message);
      continue;
    }

    for (const row of data ?? []) {
      if (typeof row.url === "string") {
        seen.add(row.url);
      }
    }
  }

  return seen;
}

function parsePublishedDate(rawValue: string): string | null {
  const candidates = [
    rawValue,
    rawValue.replace(/\s+/, " "),
    rawValue.replace(/T/, " "),
  ];

  for (const candidate of candidates) {
    const value = candidate.trim();
    if (!value) {
      continue;
    }

    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
  }

  return null;
}

function cleanArticleText(rawText: string): string {
  return rawText
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/\b(ad|ads|advertisement|newsletter|subscribe|share)[^\n]{0,120}/gi, " ")
    .replace(/\s+(?:www\.|http[s]?:)[^\s]+/gi, " ")
    .replace(/\b[A-Z]{2,}\s*:\s*[^\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractArticlePayload(html: string, source: Source, pageUrl: string): {
  title: string;
  canonical_url: string;
  image_url: string;
  published_at: string;
  raw_text: string;
} | null {
  const $ = load(html);

  const title =
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $('article h1, h1').first().text().trim() ||
    $('title').first().text().trim();

  const canonicalUrl =
    $('meta[property="og:url"]').attr("content") ||
    $('link[rel="canonical"]').attr("href") ||
    pageUrl;

  const imageUrl =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    $('article img, main img').first().attr("src") ||
    "";

  const publishedAt =
    $('meta[property="article:published_time"]').attr("content") ||
    $('meta[name="pubdate"]').attr("content") ||
    $('meta[name="publishdate"]').attr("content") ||
    $('time[datetime]').first().attr("datetime") ||
    $('time').first().text().trim() ||
    "";

  const paragraphs = $('article p, main p, .article-body p, .story-body p, .entry-content p')
    .toArray()
    .map((element) => $(element).text().trim())
    .filter((value) => value.length > 30)
    .map((value) => cleanArticleText(value));

  const text = paragraphs.join("\n\n");

  if (!title || !imageUrl || !publishedAt || !text) {
    return null;
  }

  const normalizedDate = parsePublishedDate(publishedAt);
  if (!normalizedDate) {
    return null;
  }

  const normalizedImageUrl = getNormalizedUrl(imageUrl, source.listing_url) ?? imageUrl;
  const canonical = getNormalizedUrl(canonicalUrl, pageUrl) ?? pageUrl;

  return {
    title: title.replace(/\s+/g, " ").trim(),
    canonical_url: canonical,
    image_url: normalizedImageUrl,
    published_at: normalizedDate,
    raw_text: text,
  };
}

async function insertArticleRecord(
  source: Source,
  article: z.infer<typeof ARTICLE_SCHEMA>
): Promise<boolean> {
  const supabase = createServiceClient();

  const { error } = await supabase.from("articles").insert({
    source_id: source.id,
    url: article.url,
    canonical_url: article.canonical_url ?? article.url,
    title: article.title,
    image_url: article.image_url,
    published_at: article.published_at,
    raw_text: article.raw_text,
    scraped_at: new Date().toISOString(),
    analyzed_at: null,
  });

  if (error) {
    console.error("[scrape] insertArticleRecord failed:", error.message);
    return false;
  }

  return true;
}

export async function processHomepageHtmlForSource(
  source: Source,
  homepageHtml: string,
  limitPerSource = 5
): Promise<ScrapeSummary> {
  const summary: ScrapeSummary = {
    status: "success",
    sourcesChecked: 1,
    candidatesFound: 0,
    candidatesRejected: 0,
    duplicatesSkipped: 0,
    detailPagesScraped: 0,
    articlesInserted: 0,
    articlesRejected: 0,
    articlesFailed: 0,
    totalDurationMs: 0,
    rejectionReasons: {},
  };

  try {
    console.log(`[scrape] starting source: ${source.name}`);
    const candidateUrls = extractCandidateUrlsFromHtml(homepageHtml, source);
    summary.candidatesFound += candidateUrls.length;

    if (candidateUrls.length === 0) {
      console.log(`[scrape] no candidates found for ${source.name}`);
      return summary;
    }

    const seenUrls = await loadSeenUrls(candidateUrls);
    const uniquePendingUrls = candidateUrls.filter((url) => !seenUrls.has(url));
    summary.duplicatesSkipped += candidateUrls.length - uniquePendingUrls.length;

    if (uniquePendingUrls.length === 0) {
      console.log(`[scrape] all candidate URLs already exist for ${source.name}`);
      return summary;
    }

    const chosenUrls = uniquePendingUrls.slice(0, Math.max(limitPerSource, 1));
    summary.detailPagesScraped += chosenUrls.length;

    for (const candidateUrl of chosenUrls) {
      try {
        const detailHtml = await fetchUrlAsHtml(candidateUrl);
        if (!detailHtml) {
          summary.articlesFailed += 1;
          recordRejection(summary, "detail-fetch-empty");
          continue;
        }

        const articleData = extractArticlePayload(detailHtml, source, candidateUrl);
        if (!articleData) {
          summary.articlesRejected += 1;
          recordRejection(summary, "detail-validation-failed");
          continue;
        }

        const payload = {
          url: candidateUrl,
          canonical_url: articleData.canonical_url,
          title: articleData.title,
          image_url: articleData.image_url,
          published_at: articleData.published_at,
          raw_text: articleData.raw_text,
        };

        const parsed = ARTICLE_SCHEMA.safeParse(payload);
        if (!parsed.success) {
          summary.articlesRejected += 1;
          recordRejection(summary, "schema-invalid");
          continue;
        }

        const inserted = await insertArticleRecord(source, parsed.data);
        if (inserted) {
          summary.articlesInserted += 1;
        } else {
          summary.articlesFailed += 1;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown detail scrape error";
        summary.articlesFailed += 1;
        recordRejection(summary, message.slice(0, 80));
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown source error";
    console.error(`[scrape] ${source.name} failed:`, message);
    summary.articlesFailed += 1;
    recordRejection(summary, "source-error");
    summary.status = "partial";
  }

  if (summary.articlesInserted === 0 && summary.candidatesFound > 0) {
    summary.status = summary.articlesFailed > 0 ? "partial" : "failed";
  } else if (summary.articlesInserted > 0 && summary.articlesFailed > 0) {
    summary.status = "partial";
  }

  return summary;
}

export async function runScrapePipeline(options: {
  sourceIds?: string[];
  limitPerSource?: number;
} = {}): Promise<ScrapeSummary> {
  const startedAt = Date.now();
  const summary: ScrapeSummary = {
    status: "success",
    sourcesChecked: 0,
    candidatesFound: 0,
    candidatesRejected: 0,
    duplicatesSkipped: 0,
    detailPagesScraped: 0,
    articlesInserted: 0,
    articlesRejected: 0,
    articlesFailed: 0,
    totalDurationMs: 0,
    rejectionReasons: {},
  };

  const limitPerSource = Number(options.limitPerSource ?? 5);
  let sources = await getActiveSources();

  if (options.sourceIds && options.sourceIds.length > 0) {
    sources = sources.filter((source) => options.sourceIds!.includes(source.id));
  }

  summary.sourcesChecked = sources.length;

  for (const source of sources) {
    try {
      const homepageHtml = await fetchUrlAsHtml(source.listing_url);
      if (!homepageHtml) {
        recordRejection(summary, "homepage-empty");
        summary.status = "partial";
        continue;
      }

      const sourceSummary = await processHomepageHtmlForSource(source, homepageHtml, limitPerSource);
      summary.candidatesFound += sourceSummary.candidatesFound;
      summary.candidatesRejected += sourceSummary.candidatesRejected;
      summary.duplicatesSkipped += sourceSummary.duplicatesSkipped;
      summary.detailPagesScraped += sourceSummary.detailPagesScraped;
      summary.articlesInserted += sourceSummary.articlesInserted;
      summary.articlesRejected += sourceSummary.articlesRejected;
      summary.articlesFailed += sourceSummary.articlesFailed;

      for (const [key, value] of Object.entries(sourceSummary.rejectionReasons)) {
        summary.rejectionReasons[key] = (summary.rejectionReasons[key] ?? 0) + value;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown source error";
      console.error(`[scrape] ${source.name} failed:`, message);
      summary.articlesFailed += 1;
      recordRejection(summary, "source-error");
      summary.status = "partial";
    }
  }

  summary.totalDurationMs = Date.now() - startedAt;

  if (summary.articlesInserted === 0 && summary.sourcesChecked > 0) {
    summary.status = summary.articlesFailed > 0 ? "partial" : "failed";
  } else if (summary.articlesInserted > 0 && summary.articlesFailed > 0) {
    summary.status = "partial";
  }

  console.log("[scrape] summary:", summary);
  return summary;
}
