import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "biasly News - Balanced News Coverage, Powered by AI",
  description: "Balanced news coverage and framing analysis powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F0F0F0] text-[#0D0D0F]">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#0D0D0F",
              colorForeground: "#0D0D0F",
              borderRadius: "8px",
              fontFamily: "var(--font-poppins), sans-serif",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
