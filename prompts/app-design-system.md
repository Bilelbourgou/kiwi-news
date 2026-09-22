# Implementation Prompt: App Design System (KIWI)

## Goal
Implement the comprehensive app design system extracted from the provided UI reference sheet. This includes:
1. Configuring design tokens (colors, typography with Poppins font, spacing, shadows, border radiuses, grid).
2. Setting up base CSS variables and Tailwind utility extensions (compatible with Tailwind v4).
3. Implementing foundational UI component primitives:
   - `Button` (Primary, Secondary, Text in Default, Hover, Outline, Disabled variants)
   - `Chip` / Category filter pills
   - `BiasMeter` segmented progress component with axis markers (Left, Center, Right)
   - `Card` / `NewsCard` implementing the reference card layout
   - Icon system setup (2px stroke, rounded caps using `lucide-react`)
4. Creating an interactive Design System Showcase / preview page (or integrating into the homepage) so all tokens, typography, colors, spacing, shadows, buttons, chips, bias meters, and card examples can be verified pixel-by-pixel against the reference sheet.

---

## Skills Read
- Project rules and architecture defined in `AGENTS.md`
- Next.js 16 conventions (Tailwind v4 `@theme inline` or CSS variable configuration)

---

## Existing Code Inspected
- `AGENTS.md`: Full project guidelines, architecture, and workflow rules
- `package.json`: Next.js 16.3.3, React 19.2.8, Tailwind CSS v4 (`@tailwindcss/postcss`)
- `app/globals.css`: Tailwind v4 import and default CSS variables
- `app/layout.tsx`: Root layout with Geist font (to be updated/augmented with Poppins)
- `app/page.tsx`: Current default Next.js starter page

---

## Visual Interpretation & Design Tokens

### 1. Typography
- **Font Family**: `Poppins` (Google Font loaded via `next/font/google` with Latin subset, weights 400, 500, 600, 700).
- **Type Scale**:
  - `H1` (Page / Screen Title): `32px` (`2rem`), `Bold` (700), Line Height `1.2`
  - `H2` (Section Title): `24px` (`1.5rem`), `SemiBold` (600), Line Height `1.3`
  - `H3` (Card / Module Title): `20px` (`1.25rem`), `SemiBold` (600), Line Height `1.3`
  - `H4` (Subheading): `16px` (`1rem`), `Medium` (500), Line Height `1.4`
  - `Body Large` (Important content): `16px` (`1rem`), `Regular` (400), Line Height `1.6`
  - `Body Medium` (Body text): `14px` (`0.875rem`), `Regular` (400), Line Height `1.6`
  - `Body Small` (Supporting text): `13px` (`0.8125rem`), `Regular` (400), Line Height `1.6`
  - `Caption` (Labels, meta text): `11px` (`0.6875rem`), `Regular` (400), Line Height `1.4`

### 2. Colors
- **Primary**:
  - `Text Primary`: `#0D0D0F`
  - `Text Secondary`: `#6B7280`
  - `Surface`: `#F6F6F6`
- **Semantic / Bias**:
  - `Left Bias`: `#B42318`
  - `Center`: `#E5E7EB`
  - `Right Bias`: `#1D4ED8`
- **Neutrals**:
  - `BG Primary`: `#FFFFFF`
  - `BG Secondary`: `#F0F0F0`
  - `Border`: `#E5E7EB`
  - `Divider`: `#E5E7EB`

### 3. Spacing System (4px Base Unit)
- Base scale: `4px` (`space-1`), `8px` (`space-2`), `16px` (`space-4`), `24px` (`space-6`), `32px` (`space-8`), `40px` (`space-10`), `64px` (`space-16`).

### 4. Grid System
- Max Container Width: `1280px`
- 12-Column Grid
- Gutter: `24px`
- Margin: `24px`

### 5. Shadows
- `Small`: `0px 1px 2px rgba(0, 0, 0, 0.05)`
- `Medium`: `0px 4px 12px rgba(0, 0, 0, 0.08)`
- `Large`: `0px 12px 24px rgba(0, 0, 0, 0.12)`

### 6. Border Radius
- `Small`: `4px`
- `Medium`: `8px`
- `Large`: `12px`
- `Full`: `9999px`

### 7. Icons
- Line style: `2px stroke`, `Rounded caps` (`stroke-width: 2`, `stroke-linecap: round`, `stroke-linejoin: round`).
- Install and use `lucide-react` which matches this exact 2px rounded specification.

---

## Decisions or Assumptions
1. **Tailwind v4 Integration**: Configure custom CSS custom properties and `@theme` tokens in `app/globals.css` so utility classes like `bg-surface`, `text-primary-text`, `text-secondary-text`, `bg-bias-left`, `bg-bias-right`, `bg-bias-center`, `rounded-ds-sm`, `rounded-ds-md`, `rounded-ds-lg`, and `shadow-ds-md` can be used cleanly throughout the codebase.
2. **Font Loading**: Configure `Poppins` in `app/layout.tsx` via `next/font/google` and set as the default font variable `--font-poppins`.
3. **Icons Package**: Add `lucide-react` dependency for clean, scalable, accessible icons matching the reference sheet.
4. **Interactive Component Showcase**: Create dedicated component files in `components/ui/` (e.g. `button.tsx`, `chip.tsx`, `bias-meter.tsx`, `news-card.tsx`) and an interactive design system reference page in `app/page.tsx` (or a dedicated showcase route) that displays the full reference board matching the uploaded image, allowing visual verification against the spec.

---

## Files Likely to Change
- `package.json`: Add `lucide-react`
- `app/globals.css`: Define design system tokens (colors, radii, shadows, typography utility classes)
- `app/layout.tsx`: Load `Poppins` Google font and wire CSS variable
- `components/ui/button.tsx`: [NEW] Button component with Primary, Secondary, Text styles and Default, Hover, Outline, Disabled states
- `components/ui/chip.tsx`: [NEW] Category / Tag filter chip with `+` icon
- `components/ui/bias-meter.tsx`: [NEW] Segmented Left / Center / Right bias meter with percentages and axis marks
- `components/ui/news-card.tsx`: [NEW] News Card component faithfully matching the reference layout
- `app/page.tsx`: Implement the Design System Specification Board displaying all sections from the reference image (Brand, Typography, Colors, Spacing, Grid, Shadows, Border Radius, Icons, UI Elements, Card Example, and Bottom Bar)

---

## Implementation Requirements
1. **Strict Token Accuracy**: All hex color codes, font sizes, line heights, font weights, shadow values, and border radii must match the reference image values exactly.
2. **Responsive Design**: The 1280px max-width container and 12-column grid must adapt cleanly to mobile, tablet, and desktop viewports.
3. **Interactive States**: Buttons and chips must have proper hover, focus-visible, and disabled states.
4. **Bias Meter Math**: The `BiasMeter` component should dynamically distribute the widths based on `left`, `center`, and `right` percentages (summing to 100%), with legible labels inside each segment when width permits.
5. **Clean Component Interfaces**: Components must accept standard HTML attributes, custom class names, and maintain TypeScript safety.

---

## Security Requirements
- Client components and display code only. No secrets or external data mutation.
- Safe image handling with valid fallback or unoptimized placeholder for testing.

---

## Acceptance Criteria
- [ ] `Poppins` font is active and rendered across headings and body text with specified weights (400, 500, 600, 700).
- [ ] Color tokens match reference hex codes exactly (`#0D0D0F`, `#6B7280`, `#F6F6F6`, `#B42318`, `#E5E7EB`, `#1D4ED8`, `#FFFFFF`, `#F0F0F0`).
- [ ] All button variants (Primary, Secondary, Text) and states (Default, Hover, Outline, Disabled) render accurately.
- [ ] Filter chips with `+` indicator render with rounded-full radius.
- [ ] `BiasMeter` renders the 3-part segmented bar with the 0%, 50%, 100% axis indicators.
- [ ] Card example faithfully recreates the reference layout with image, badge/breadcrumb, H3 headline, body snippet, bias meter, and footer metadata.
- [ ] `npm run build` and `npm run lint` execute without TypeScript or lint errors.

---

## Checks to Run
- `npm run lint`
- `npm run build`

---

## Exact Manual Test Steps Expected After Implementation
1. Run `npm run dev` in the terminal.
2. Open `http://localhost:3000` in the browser.
3. Verify the Brand panel, Typography scale, Color swatches, Spacing scale, Shadows, Border radii, Icon showcase, UI Elements (Buttons, Chips, Bias Meter), and Card Example.
4. Hover over interactive elements to verify hover states.
5. Resize browser to ensure responsiveness across desktop, tablet, and mobile.
