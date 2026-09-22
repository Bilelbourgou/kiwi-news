"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [activeTab, setActiveTab] = useState("Home");
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");

  return (
    <header className="w-full bg-white border-b border-[#E5E7EB] sticky top-0 z-50">
      {/* 1. TOP UTILITY BAR */}
      <div className="w-full bg-[#FFFFFF] border-b border-[#F0F0F0] text-[11px] text-[#6B7280]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-8 flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="hover:text-[#0D0D0F] transition-colors cursor-pointer"
            >
              Browser Extension
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-[#9CA3AF]">
              <span>Theme:</span>
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`transition-colors cursor-pointer ${
                  theme === "light"
                    ? "font-semibold text-[#0D0D0F]"
                    : "hover:text-[#0D0D0F]"
                }`}
              >
                Light
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`transition-colors cursor-pointer ${
                  theme === "dark"
                    ? "font-semibold text-[#0D0D0F]"
                    : "hover:text-[#0D0D0F]"
                }`}
              >
                Dark
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setTheme("auto")}
                className={`transition-colors cursor-pointer ${
                  theme === "auto"
                    ? "font-semibold text-[#0D0D0F]"
                    : "hover:text-[#0D0D0F]"
                }`}
              >
                Auto
              </button>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <span className="hidden md:inline">Monday, June 1, 2026</span>
            <button
              type="button"
              className="hover:text-[#0D0D0F] transition-colors cursor-pointer"
            >
              Set Location
            </button>
            <div className="flex items-center gap-1 hover:text-[#0D0D0F] transition-colors cursor-pointer">
              <Globe className="w-3.5 h-3.5 stroke-[2]" />
              <span>International Edition</span>
              <ChevronDown className="w-3 h-3 stroke-[2]" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 sm:h-[68px] flex items-center justify-between">
        {/* Left: Hamburger & Logo */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            type="button"
            aria-label="Open menu"
            className="p-1.5 -ml-1.5 text-[#0D0D0F] hover:bg-[#F6F6F6] rounded-md transition-colors"
          >
            <Menu className="w-6 h-6 stroke-[2]" />
          </button>

          <Link href="/" className="flex flex-col items-center select-none group">
            <span className="text-[26px] font-extrabold tracking-tight text-[#0D0D0F] leading-none">
              biasly
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0D0D0F] -mt-0.5">
              News
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-[14px]">
          <button
            type="button"
            onClick={() => setActiveTab("Home")}
            className={`transition-colors py-1 cursor-pointer font-medium ${
              activeTab === "Home"
                ? "text-[#0D0D0F] border-b-2 border-[#0D0D0F]"
                : "text-[#6B7280] hover:text-[#0D0D0F]"
            }`}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("For You")}
            className={`transition-colors py-1 cursor-pointer font-medium relative flex items-center gap-1 ${
              activeTab === "For You"
                ? "text-[#0D0D0F] border-b-2 border-[#0D0D0F]"
                : "text-[#6B7280] hover:text-[#0D0D0F]"
            }`}
          >
            <span>For You</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#B42318] inline-block -mt-1" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("Local")}
            className={`transition-colors py-1 cursor-pointer font-medium ${
              activeTab === "Local"
                ? "text-[#0D0D0F] border-b-2 border-[#0D0D0F]"
                : "text-[#6B7280] hover:text-[#0D0D0F]"
            }`}
          >
            Local
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("Blindspot")}
            className={`transition-colors py-1 cursor-pointer font-medium ${
              activeTab === "Blindspot"
                ? "text-[#0D0D0F] border-b-2 border-[#0D0D0F]"
                : "text-[#6B7280] hover:text-[#0D0D0F]"
            }`}
          >
            Blindspot
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            className="rounded-[6px] px-4 font-medium text-[13px] h-9"
          >
            Subscribe
          </Button>

          <Button
            variant="secondary"
            visualState="outline"
            size="sm"
            className="rounded-[6px] px-4 font-medium text-[13px] h-9"
          >
            Login
          </Button>
        </div>
      </div>
    </header>
  );
}
