# Implementation Prompt: Clerk Authentication

## Goal
Integrate Clerk authentication into KIWI using `@clerk/nextjs` following Next.js 16 conventions and the Kiwi design system. This includes:
1. Installing `@clerk/nextjs`.
2. Setting up environment variables in `.env.local` and documenting them in `.env.example`.
3. Adding `<ClerkProvider>` inside `<body>` in `app/layout.tsx`.
4. Creating `proxy.ts` (Next.js 16 proxy convention) configured with `clerkMiddleware`.
5. Creating dedicated `/sign-in/[[...sign-in]]` and `/sign-up/[[...sign-up]]` catch-all pages.
6. Integrating auth state into `components/layout/header.tsx` with `<SignedIn>`, `<SignedOut>`, `<SignInButton>`, and `<UserButton>`.
7. Styling Clerk components with custom appearance tokens matching Kiwi's design system (Poppins font, `#0D0D0F` primary, `#FFFFFF` card background, and rounded corners).

---

## Skills Read
- `AGENTS.md` (Workflow, architecture, tech stack, security, and environment rules)
- `.agents/skills/clerk/SKILL.md` (Version detection, routing, SDK conventions)
- `.agents/skills/clerk-setup/SKILL.md` (Next.js quickstart, ClerkProvider inside `<body>`, Next.js 16 `proxy.ts`, environment variables)
- `.agents/skills/clerk-nextjs-patterns/SKILL.md` (Middleware/proxy strategies, public-first matching, Server vs Client auth, `<SignedIn>` / `<SignedOut>` / `<UserButton>`)
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` (Next.js 16 `proxy.ts` file convention and matcher rules)

---

## Existing Code Inspected
- `package.json`: Next.js 16.3.3, React 19.2.8; `@clerk/nextjs` is not yet installed.
- `.env.local`: Contains valid `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
- `app/layout.tsx`: Root layout with `Poppins` font configured on `<html>` and `<body>`.
- `components/layout/header.tsx`: Header component containing a static secondary "Login" button in the right action section.
- `app/globals.css`: Contains design tokens, CSS variables, and Tailwind setup.

---

## Decisions and Assumptions
1. **Next.js 16 Proxy Convention**: Next.js 16 deprecates `middleware.ts` in favor of `proxy.ts`. We will implement `proxy.ts` in the project root exporting `clerkMiddleware`.
2. **Public-First Routing**: The homepage (`/`), news details (`/news/[id]`), sign-in (`/sign-in`), sign-up (`/sign-up`), and static assets will remain public. The proxy will protect private routes when defined and attach auth context to all requests.
3. **ClerkProvider Placement**: Must be placed directly inside `<body>` in `app/layout.tsx`, wrapping `{children}` and applying the custom brand appearance theme.
4. **Header Auth UI**:
   - When signed out: Render a "Sign In" button (using `<SignInButton mode="modal">` or linking to `/sign-in`) retaining the existing sleek outline button design (`rounded-[6px]`, `px-4`, `h-9`).
   - When signed in: Render Clerk's `<UserButton />` with user avatar, profile menu, and sign out, alongside an optional user greeting or dashboard link.
5. **Brand Appearance Theming**: Configure `appearance` on `ClerkProvider` using Kiwi design variables (`colorPrimary: "#0D0D0F"`, `colorText: "#0D0D0F"`, `fontFamily: "var(--font-poppins)"`, `borderRadius: "8px"`).
6. **Route Paths**:
   - Sign in: `/sign-in/[[...sign-in]]/page.tsx`
   - Sign up: `/sign-up/[[...sign-up]]/page.tsx`

---

## Files Likely to Change
- `package.json`: Add `@clerk/nextjs`.
- `.env.local`: Add route configuration variables (`NEXT_PUBLIC_CLERK_SIGN_IN_URL`, etc.).
- `.env.example`: Create file documenting required Clerk keys and config.
- `app/layout.tsx`: Wrap contents inside `<body>` with `<ClerkProvider>`.
- `proxy.ts`: Create Next.js 16 proxy with `clerkMiddleware`.
- `app/sign-in/[[...sign-in]]/page.tsx`: Create Sign In page component.
- `app/sign-up/[[...sign-up]]/page.tsx`: Create Sign Up page component.
- `components/layout/header.tsx`: Replace static Login button with dynamic auth state (`<SignedIn>`, `<SignedOut>`, `<UserButton>`, `<SignInButton>`).

---

## Implementation Requirements

### 1. Dependency Installation
- Install `@clerk/nextjs` using `npm install @clerk/nextjs`.

### 2. Environment Variables Configuration
- Ensure `.env.local` contains:
  ```env
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
  CLERK_SECRET_KEY=sk_test_...
  NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
  NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
  ```
- Create `.env.example` documenting all Clerk environment variables with descriptions.

### 3. Provider Setup in `app/layout.tsx`
- Import `ClerkProvider` from `@clerk/nextjs`.
- Wrap children within `<body>` with `<ClerkProvider appearance={{ ... }}>`.
- Apply custom brand styling:
  - `variables`: `colorPrimary: "#0D0D0F"`, `colorText: "#0D0D0F"`, `borderRadius: "8px"`, `fontFamily: "var(--font-poppins)"`.

### 4. Next.js 16 Proxy in `proxy.ts`
- Implement `proxy.ts` at the root of the project using `clerkMiddleware` and `createRouteMatcher` from `@clerk/nextjs/server`:
  ```typescript
  import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

  const isPublicRoute = createRouteMatcher([
    "/",
    "/news(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api(.*)",
  ]);

  export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  });

  export const config = {
    matcher: [
      "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
      "/(api|trpc)(.*)",
    ],
  };
  ```

### 5. Dedicated Auth Pages
- Create `app/sign-in/[[...sign-in]]/page.tsx`:
  - Centered layout on `#F0F0F0` background.
  - Renders `<SignIn routing="path" path="/sign-in" />`.
- Create `app/sign-up/[[...sign-up]]/page.tsx`:
  - Centered layout on `#F0F0F0` background.
  - Renders `<SignUp routing="path" path="/sign-up" />`.

### 6. Header Auth Controls
- In `components/layout/header.tsx`:
  - Import `{ SignedIn, SignedOut, SignInButton, UserButton }` from `@clerk/nextjs`.
  - In the right-hand action container:
    - `<SignedOut>`: Display "Sign In" button that triggers modal sign-in or links to `/sign-in`, keeping the exact Kiwi UI style (`variant="secondary" visualState="outline" size="sm"`).
    - `<SignedIn>`: Display `<UserButton />` with `afterSignOutUrl="/"`.

---

## Security Requirements
- `CLERK_SECRET_KEY` must never be exposed to client-side code or bundle (never use `NEXT_PUBLIC_` prefix for secret key).
- Never log Clerk secrets or session tokens.
- Public route matcher must explicitly guard any protected endpoints once added.
- Next.js Proxy matcher must exclude static assets to prevent unnecessary invocations and blocking of CSS/JS.

---

## Acceptance Criteria
- [ ] `@clerk/nextjs` is installed and builds cleanly.
- [ ] `<ClerkProvider>` wraps the application inside `<body>`.
- [ ] `proxy.ts` runs without errors on Next.js 16.
- [ ] Visiting `/sign-in` renders the Clerk sign-in form with Kiwi branding.
- [ ] Visiting `/sign-up` renders the Clerk sign-up form with Kiwi branding.
- [ ] Header shows "Sign In" button when user is logged out.
- [ ] Clicking "Sign In" opens the modal or navigates to `/sign-in`.
- [ ] After logging in, Header displays the Clerk `<UserButton />`.
- [ ] Logging out returns to the unauthenticated state seamlessly.
- [ ] Existing home page (`/`) and news details page (`/news/[id]`) load without authentication barriers.

---

## Checks to Run
- `npm run typecheck` (`tsc --noEmit`)
- `npm run lint` (`eslint`)
- `npm run build` (`next build`)

---

## Exact Manual Test Steps Expected After Implementation
1. Ensure the dev server is running (`npm run dev`) or test on `http://localhost:3000`.
2. Open `http://localhost:3000` in the browser:
   - Verify the page loads normally with all top news stories.
   - Verify the top right header shows "Subscribe" and "Sign In".
3. Click "Sign In":
   - Verify the sign-in modal/flow opens cleanly with Kiwi styling.
4. Navigate directly to `http://localhost:3000/sign-in`:
   - Verify the dedicated sign-in card renders centered on the page.
5. Complete sign-in with email or credentials:
   - Verify redirection back to the homepage.
   - Verify the header now shows the `<UserButton />` instead of "Sign In".
6. Click the `<UserButton />`:
   - Verify the Clerk user profile dropdown opens (Manage Account, Sign Out).
7. Click "Sign Out":
   - Verify the user is signed out and the header returns to showing "Sign In".
