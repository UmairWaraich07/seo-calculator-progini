import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createIndexes } from "@/lib/mongodb";

// Create MongoDB indexes on app startup
createIndexes().catch(console.error);

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SEO Opportunity Calculator - Powered by Progini AI",
  description:
    "Discover your website's hidden SEO potential with Progini AI's advanced SEO opportunity calculator. Get detailed insights and revenue projections in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
