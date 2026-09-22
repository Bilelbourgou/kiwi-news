# Implementation Prompt: News Details Page UI (KIWI)

## Goal
Implement the complete, pixel-perfect, responsive News Details Page (`app/news/[id]/page.tsx`) matching the attached reference UI.
Also link the home page story cards to navigate seamlessly to the news details page.

---

## Skills Read
- Project rules and architecture defined in `AGENTS.md`
- Next.js 16 conventions (Dynamic route parameters, server/client boundaries)
- Clerk skill (auth boundary awareness)
- Supabase skill (data schema compatibility for articles and article_analyses)

---

## Existing Code Inspected
- `app/globals.css`: Color tokens, Poppins typography scale, spacing, shadows, and radii.
- `app/layout.tsx`: Poppins font configuration.
- `components/layout/header.tsx`: Shared Top utility bar and navigation header.
- `components/layout/footer.tsx`: Shared dark footer with brand, links, and SVG social icons.
- `components/ui/button.tsx`, `components/ui/bias-meter.tsx`: Design system UI primitives.
- `components/ui/grid-news-card.tsx`: Home page card component (to link to `/news/[id]`).
- `lib/mock-news-data.ts`: Mock articles dataset.

---

## Visual Interpretation & Layout Specifications

### 1. Page Header & Navigation
- Shared `Header` component across all pages with sticky positioning.

### 2. Main Layout
- Container: Max width `1280px`, centered with `px-4 sm:px-6 py-8`.
- Two-column editorial layout:
  - Left / Main Content: ~65% width (`lg:col-span-8`), containing article header, featured image, in-content bias distribution widget, full editorial text, and related stories grid.
  - Right / Sidebar: ~35% width (`lg:col-span-4`), sticky or scrolling column containing 3 analysis cards (`Bias Analysis`, `AI Summary`, `Source Breakdown`).

### 3. Main Content Components (Left Column)
1. **Article Breadcrumb & Headline**:
   - Breadcrumb: `Politics · United States` in `text-[12px] text-[#6B7280]` with bold category.
   - Headline: `Trump Sends Iran Revised Peace Proposal With Tougher Terms: Report` in `text-[30px] sm:text-[34px] font-bold text-[#0D0D0F] leading-[1.2] tracking-tight`.
2. **Author, Date & Action Bar**:
   - Metadata: `By David Morgan | May 31, 2026 | 12 min read` in `text-[13px] text-[#6B7280]`.
   - Action controls: `Save` (with bookmark icon), `Share` (with share icon), and More options (`...`).
3. **Featured Image & Caption**:
   - High-res image with `rounded-[8px]`, aspect ratio ~16:10.
   - Caption & Photo Credit: `President Donald Trump in the Cabinet Room at the White House, Washington, D.C., May 30, 2026. Photo: Andrew Harnik/Getty Images` in `text-[11px] text-[#6B7280]`.
4. **In-Content Bias Distribution Widget**:
   - Border `#E5E7EB`, rounded `[8px]`, bg `#FFFFFF`, p-4.
   - Title: `Bias Distribution` + info icon.
   - Segmented bar: `Left 20%` (#B42318), `Center 31%` (#E5E7EB), `Right 49%` (#1D4ED8).
   - Label: `12 sources`.
5. **Editorial Article Body**:
   - Formatted body text with elegant typography (line-height 1.7, text-[15px] sm:text-[16px], paragraphs separated by 20px).
   - Includes direct quotes and diplomatic context.
6. **Related Stories Section**:
   - Heading: `Related Stories` in `text-[18px] font-semibold text-[#0D0D0F]`.
   - 2-column grid (`grid grid-cols-1 sm:grid-cols-2 gap-4`) with 6 structured story cards containing thumbnail, topic breadcrumb, headline, date, and reading time.

### 4. Sidebar Analysis Cards (Right Column)
1. **Bias Analysis Card**:
   - Header: `Bias Analysis` + info icon.
   - Overall Bias: `Right 49%` in large blue bold font (#1D4ED8, 22px).
   - Subtitle: `Based on 12 balanced sources`.
   - Bar progress breakdown:
     - `Left` • `20%` • Red bar (#B42318)
     - `Center` • `31%` • Neutral bar (#E5E7EB)
     - `Right` • `49%` • Blue bar (#1D4ED8)
   - Methodology text explaining source weighting.
   - Outline button: `How We Analyze Bias`.
2. **AI Summary Card**:
   - Header: `AI Summary` + info icon.
   - Sub-label: `Generated May 31, 2026 · 3 min read`.
   - 5 structured bullet points summarizing key elements of the article.
   - Disclaimer note: `AI summaries can make mistakes.`.
   - Outline button: `Provide Feedback`.
3. **Source Breakdown Card**:
   - Header: `Source Breakdown` + info icon.
   - Total count: `12 Total Sources`.
   - Distribution with count and percentage:
     - `Left`: `2 (20%)`
     - `Center`: `4 (31%)`
     - `Right`: `6 (49%)`
   - Top Sources list with respective bias labels:
     - Fox News (Right)
     - The Wall Street Journal (Center)
     - Reuters (Center)
     - BBC (Center)
     - CNN (Left)
     - The New York Times (Center)
     - The Washington Post (Center)
     - Newsmax (Right)
   - Outline button: `View All Sources`.

### 5. Newsletter Banner
- Full-width callout above footer:
  - Heading: `Stay Informed. Stay Balanced.`
  - Subtitle: `Get the top stories and bias analysis delivered to your inbox.`
  - Interactive email input field + `Subscribe` button.

---

## Decisions or Assumptions
1. Implement the route as `app/news/[id]/page.tsx` using Next.js 16 dynamic routing.
2. Provide rich article detail data for article `id: "1"` (Trump Sends Iran Revised Peace Proposal) matching the screenshot exactly, with dynamic fallback for other IDs from `TOP_NEWS_ARTICLES`.
3. Update `components/ui/grid-news-card.tsx` on the home page so clicking on a news card navigates to `/news/${article.id}`.
4. Keep the component modular with reusable components:
   - `components/news-details/bias-analysis-card.tsx`
   - `components/news-details/ai-summary-card.tsx`
   - `components/news-details/source-breakdown-card.tsx`
   - `components/news-details/related-stories.tsx`
   - `components/news-details/newsletter-banner.tsx`

---

## Files Likely to Change
- `lib/mock-news-data.ts`: [MODIFY] Add full article body, source list, AI summary points, and related stories data.
- `components/ui/grid-news-card.tsx`: [MODIFY] Wrap card with Next.js `Link` to `/news/${article.id}`.
- `components/news-details/bias-analysis-card.tsx`: [NEW] Sidebar Bias Analysis widget
- `components/news-details/ai-summary-card.tsx`: [NEW] Sidebar AI Summary widget
- `components/news-details/source-breakdown-card.tsx`: [NEW] Sidebar Source Breakdown widget
- `components/news-details/related-stories.tsx`: [NEW] Related Stories grid
- `components/news-details/newsletter-banner.tsx`: [NEW] Newsletter subscription callout
- `app/news/[id]/page.tsx`: [NEW] Dynamic News Details Page

---

## Implementation Requirements
- 100% visual fidelity matching the attached screenshot.
- Responsive breakpoints (Stacked layout on mobile, side-by-side on desktop lg).
- Bookmark and Share buttons have interactive states.
- Clean Next.js 16 TypeScript compliance.

---

## Security Requirements
- Client display UI only, safe inputs with no eval or untrusted HTML injection.

---

## Acceptance Criteria
- [ ] Navigating to `/news/1` renders the news details page.
- [ ] Left column renders breadcrumb, H1 headline, author meta, action buttons, featured image with caption, in-content bias bar, full article body, and 6 related stories.
- [ ] Right column renders the 3 analysis cards (`Bias Analysis`, `AI Summary`, and `Source Breakdown`).
- [ ] Newsletter callout banner renders above the footer with email input and Subscribe button.
- [ ] Clicking any card on the home page navigates to `/news/[id]`.
- [ ] `npm run lint` and `npm run build` pass with 0 errors.

---

## Checks to Run
- `npm run lint`
- `npm run build`

---

## Exact Manual Test Steps Expected After Implementation
1. Ensure the dev server is running (`npm run dev`).
2. Visit `http://localhost:3000/news/1` or click the first card on the home page.
3. Verify the main article layout, in-content bias bar, and body text.
4. Verify the 3 sidebar analysis widgets on the right.
5. Verify the related stories grid and newsletter banner.
6. Verify responsive behavior on mobile and desktop viewports.
