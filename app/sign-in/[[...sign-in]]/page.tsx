import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F0F0F0]">
      <div className="w-full max-w-[480px] flex flex-col items-center gap-6">
        <Link
          href="/"
          className="self-start inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0D0D0F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to biasly News</span>
        </Link>

        <div className="flex flex-col items-center select-none mb-2">
          <span className="text-[32px] font-extrabold tracking-tight text-[#0D0D0F] leading-none">
            biasly
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0D0D0F] -mt-0.5">
            News
          </span>
        </div>

        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
        />
      </div>
    </main>
  );
}
