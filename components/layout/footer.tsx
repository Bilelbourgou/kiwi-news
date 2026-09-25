import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#0D0D0F] text-white mt-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-12 pb-8">
        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 pb-12 border-b border-white/10">
          {/* Brand Col (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <Link href="/" className="inline-block select-none">
              <span className="text-[26px] font-extrabold tracking-tight block leading-none">
                biasly
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider block text-white/70 -mt-0.5">
                News
              </span>
            </Link>
            <p className="text-[13px] text-white/70 max-w-[240px] leading-relaxed">
              Balanced news coverage powered by AI.
            </p>
          </div>

          {/* Company Links (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-[13px] font-semibold text-white tracking-wide">Company</h4>
            <ul className="space-y-2 text-[13px] text-white/70">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Help Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[13px] font-semibold text-white tracking-wide">Help</h4>
            <ul className="space-y-2 text-[13px] text-white/70">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-[13px] font-semibold text-white tracking-wide">Connect</h4>
            <div className="flex items-center gap-2.5">
              {/* X / Twitter */}
              <Link
                href="#"
                aria-label="X"
                className="w-8 h-8 rounded-[6px] bg-white/[0.08] hover:bg-white/[0.16] flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-105"
              >
                <svg
                  className="w-3.5 h-3.5 fill-white"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>

              {/* LinkedIn */}
              <Link
                href="#"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-[6px] bg-white/[0.08] hover:bg-white/[0.16] flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-105"
              >
                <svg
                  className="w-3.5 h-3.5 fill-white"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </Link>

              {/* Substack / Newsletter */}
              <Link
                href="#"
                aria-label="Substack"
                className="w-8 h-8 rounded-[6px] bg-white/[0.08] hover:bg-white/[0.16] flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-105"
              >
                <svg
                  className="w-3.5 h-3.5 fill-white"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
                </svg>
              </Link>

              {/* YouTube */}
              <Link
                href="#"
                aria-label="YouTube"
                className="w-8 h-8 rounded-[6px] bg-white/[0.08] hover:bg-white/[0.16] flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-105"
              >
                <svg
                  className="w-3.5 h-3.5 fill-white"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[12px] text-white/50 gap-2">
          <span>© 2026 Biasly News. All rights reserved.</span>
          <span>Stay consistent. Stay unbiased.</span>
        </div>
      </div>
    </footer>
  );
}
