"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <section className="bg-white rounded-[12px] border border-[#E5E7EB] p-6 sm:p-8 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Text Info */}
      <div className="space-y-1 text-center md:text-left">
        <h3 className="text-[20px] font-bold text-[#0D0D0F] tracking-tight">
          Stay Informed. Stay Balanced.
        </h3>
        <p className="text-[14px] text-[#6B7280]">
          Get the top stories and bias analysis delivered to your inbox.
        </p>
      </div>

      {/* Subscription Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2.5"
      >
        {subscribed ? (
          <div className="text-[14px] font-medium text-[#1D4ED8] px-4 py-2 bg-[#EFF6FF] rounded-[6px] border border-[#BFDBFE]">
            ✓ Thank you for subscribing!
          </div>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full sm:w-72 h-10 px-4 rounded-[6px] border border-[#E5E7EB] bg-white text-[14px] text-[#0D0D0F] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0D0D0F]/10 focus:border-[#0D0D0F] transition-all"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full sm:w-auto rounded-[6px] px-6 text-[14px] font-medium h-10 shrink-0"
            >
              Subscribe
            </Button>
          </>
        )}
      </form>
    </section>
  );
}
