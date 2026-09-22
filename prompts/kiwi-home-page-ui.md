# Implementation Prompt: Kiwi / Biasly Home Page UI

## Goal
Implement the complete, responsive Kiwi Home Page matching the provided reference UI. This includes:
1. **Top Utility Bar**: Browser Extension link, Theme selector (Light / Dark / Auto), Date display (`Monday, June 1, 2026`), Set Location, and International Edition dropdown.
2. **Main Navigation Header**: Hamburger menu toggle, `biasly News` brand logo, navigation tabs (`Home`, `For You` with notification indicator, `Local`, `Blindspot`), and action buttons (`Subscribe`, `Login`).
3. **Topic / Category Bar**: Horizontally scrollable filter pills (`World Cup +`, `IPL +`, `Social Media +`, `Business & Markets +`, `Health & Medicine +`, `Soccer +`, `Artificial Intelligence +`, `Arsenal FC +`, `Extreme Weather and Disasters +`) with navigation controls.
4. **Top News Section & Grid**:
   - Section heading `Top News` in H1/H2 Poppins font.
   - 3-column responsive grid (1280px max-width container) with 12 structured news cards displaying realistic mock data (or Supabase articles if available, with graceful fallback).
   - Each card featuring:
     - High-quality image with rounded corners (`rounded-[8px]`) and circular `Info` button.
     - Breadcrumb meta: Category in bold and country/region (`Category · Region`).
     - Headline title (H3, 20px, font-semibold, text-[#0D0D0F], line-height 1.3).
     - Compact segmented Bias Meter (`L %`, `Center %`, `Right %`).
     - Sources count (`X sources`).
5. **Comprehensive Dark Footer**:
   - `biasly News` brand logo and tagline: `Balanced news coverage powered by AI.`
   - Navigation links grouped under `Company` (About, Careers, Press, Contact) and `Help` (Help Center, Guides, Privacy Policy, Terms of Service).
   - Social media connection links (`Connect` with X, LinkedIn, Substack/RSS, YouTube).
   - Copyright notice: `© 2026 Biasly News. All rights reserved.`

---

## Skills Read
- Project rules and architecture defined in `AGENTS.md`
- Next.js 16 conventions and UI patterns
- Clerk skill (for future auth boundary hooks / login button integration)
- Supabase skill (for articles data structure compatibility)

---

## Existing Code Inspected
- `app/globals.css`: Contains the design system tokens, color palette, and typography scale.
- `app/layout.tsx`: Configures `Poppins` font via `next/font/google`.
- `components/ui/button.tsx`: Reusable Button component with Primary, Secondary, Outline, Disabled states.
- `components/ui/chip.tsx`: Category chip pill component with `+` icon.
- `components/ui/bias-meter.tsx`: Segmented bias meter component.
- `components/ui/news-card.tsx`: Card component (to be adapted/extended for the vertical grid card variant shown in the UI).

---

## Visual Interpretation & Specifications

### 1. Header & Navigation
- **Utility Bar**:
  - Background: `#FFFFFF` or `#F9FAFB` with bottom border `#E5E7EB`, height ~36px.
  - Text: Caption size (`11px` - `12px`), color `#6B7280`.
  - Left elements: `Browser Extension` • `Theme: Light Dark Auto` (interactive toggle).
  - Right elements: `Monday, June 1, 2026` • `Set Location` • `International Edition ⌵`.
- **Primary Header**:
  - Height: ~68px, background `#FFFFFF`, border-bottom `#E5E7EB`.
  - Brand: `biasly News` logo with Poppins bold lowercase `biasly` and medium `News`.
  - Center Nav Links: `Home` (active with bottom border or dark font), `For You` (with small red dot `#B42318`), `Local`, `Blindspot`.
  - Actions:
    - `Subscribe`: Primary button `#0D0D0F` text white, `rounded-[6px]`, `px-4 py-2`, `text-[13px]`.
    - `Login`: Secondary outline button, border `#E5E7EB`, `rounded-[6px]`, `px-4 py-2`, `text-[13px]`.

### 2. Category / Topic Bar
- Background: `#FFFFFF`, border-bottom `#E5E7EB`, `py-3`.
- Scrollable row of pills with subtle left and right fade/arrow buttons for overflow.
- Chips: `World Cup +`, `IPL +`, `Social Media +`, `Business & Markets +`, `Health & Medicine +`, `Soccer +`, `Artificial Intelligence +`, `Arsenal FC +`, `Extreme Weather and Disasters +`.

### 3. "Top News" Grid
- Container: Max width `1280px`, centered with `px-4 sm:px-6`.
- Heading: `Top News` in `text-[28px]` / `text-h2`, font-bold, tracking-tight, `mb-6`.
- Grid: 3 columns on desktop (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`), gutter `24px`.
- Card Architecture:
  - Container: Background `#FFFFFF`, border `#E5E7EB`, `rounded-[12px]`, `p-4`, `shadow-[0px_1px_2px_rgba(0,0,0,0.05)]`, hover elevation `shadow-[0px_4px_12px_rgba(0,0,0,0.08)]`.
  - Image: Aspect ratio ~16:10 / 16:9, `rounded-[8px]`, overflow-hidden, with top-right translucent `Info` button (`w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center`).
  - Breadcrumb: `Category · Region` in `text-[12px]`, category in font-semibold `#0D0D0F`, region in `#6B7280`.
  - Headline: H3, 18px-20px font-semibold `#0D0D0F`, leading-snug, line-clamp-3, min-h-[54px] for balanced alignment across cards.
  - Bias Meter: Compact segmented bar:
    - Left: `#B42318` with white text (e.g. `L 20%`)
    - Center: `#E5E7EB` with dark text (e.g. `Center 31%`)
    - Right: `#1D4ED8` with white text (e.g. `Right 49%`)
    - Height: `20px` - `22px`, font size `11px` font-medium.
  - Card Footer: `X sources` in `text-[12px]` text `#6B7280`.

### 4. Footer
- Background: `#0D0D0F`, text white, `py-12 px-6`.
- 4-column layout on desktop:
  - Col 1: Brand logo (`biasly News`) and tagline (`Balanced news coverage powered by AI.`).
  - Col 2: `Company` (About, Careers, Press, Contact).
  - Col 3: `Help` (Help Center, Guides, Privacy Policy, Terms of Service).
  - Col 4: `Connect` (X, LinkedIn, Substack, YouTube icons).
- Bottom sub-footer: Border-top `border-white/10`, copyright `© 2026 Biasly News. All rights reserved.`

---

## Decisions or Assumptions
1. **Component Structure**:
   - `components/layout/header.tsx`: Top utility bar + main navigation header.
   - `components/layout/category-bar.tsx`: Scrollable category chip bar.
   - `components/ui/grid-news-card.tsx`: Vertical card matching the 3-column top news grid.
   - `components/layout/footer.tsx`: Comprehensive dark footer.
   - `app/page.tsx`: Orchestrates the home page with the 12 reference news stories.
2. **Data Model**: Provide realistic static/seed data for the 12 cards depicted in the screenshot so the page renders immediately with 100% visual fidelity, structured so it can plug into Supabase article queries when the DB pipeline is active.
3. **Design System Consistency**: Reuses the exact color tokens, Poppins typography, spacing, shadows, and radii configured in Step 1.

---

## Files Likely to Change
- `components/layout/header.tsx`: [NEW] Utility bar and primary navigation
- `components/layout/category-bar.tsx`: [NEW] Topic / Category pill filter bar
- `components/ui/grid-news-card.tsx`: [NEW] Top News grid card component
- `components/layout/footer.tsx`: [NEW] Comprehensive dark footer
- `lib/mock-news-data.ts`: [NEW] Structured data for the 12 news articles in the screenshot
- `app/page.tsx`: [MODIFY] Render the full Kiwi Home Page

---

## Implementation Requirements
- Exact pixel alignment and layout matching the UI reference.
- Responsive breakpoints: Mobile (1-col), Tablet (2-col), Desktop (3-col).
- Interactive navigation states (Theme selector toggle, Active tab highlight, Chip selection, Bookmark/Info triggers).
- Fast load time with optimized images.

---

## Security Requirements
- Client UI only, no privileged keys or secrets exposed.
- External image domains configured or unoptimized image loaders used.

---

## Acceptance Criteria
- [ ] Top utility bar renders with browser extension, theme selector, date, location, and edition dropdown.
- [ ] Main header renders with logo, navigation links (`Home`, `For You`, `Local`, `Blindspot`), `Subscribe`, and `Login` buttons.
- [ ] Category bar renders all category pills with horizontal scrolling.
- [ ] `Top News` section displays 12 news cards in a 3-column grid matching the reference headlines, categories, images, bias scores, and sources count.
- [ ] Each news card displays the segmented bias meter with accurate `L %`, `Center %`, `Right %` bars.
- [ ] Footer renders with `biasly News` logo, Company links, Help links, Connect icons, and copyright.
- [ ] `npm run lint` and `npm run build` pass with 0 errors.

---

## Checks to Run
- `npm run lint`
- `npm run build`

---

## Exact Manual Test Steps Expected After Implementation
1. Run `npm run dev`.
2. Navigate to `http://localhost:3000`.
3. Inspect the top utility bar, main header, category chips, 3-column news card grid, and footer.
4. Verify hover interactions on cards, buttons, chips, and navigation links.
5. Test responsive resizing from mobile viewport (375px) to tablet (768px) and desktop (1280px+).
