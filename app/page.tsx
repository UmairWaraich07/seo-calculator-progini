import { Suspense } from "react";
import { Calculator } from "@/components/calculator";
import { LoadingSpinner } from "@/components/loading-spinner";
import Image from "next/image";

export const metadata = {
  title: "SEO Opportunity Calculator - Powered by Progini AI",
  description:
    "Discover your website's hidden SEO potential with Progini AI's advanced SEO opportunity calculator. Get detailed insights and revenue projections in minutes.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <main className="py-12">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Image src={"/logo.png"} alt="progini" width={48} height={48} />
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                SEO Opportunity Calculator
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
              Powered by Progini AI's advanced analytics engine. Discover your
              untapped SEO potential and calculate the revenue impact of ranking
              higher for your most valuable keywords.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-8">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>AI-Powered Analysis</span>
              <div className="w-1 h-1 bg-gray-600 rounded-full mx-2"></div>
              <span>Real-Time Data</span>
              <div className="w-1 h-1 bg-gray-600 rounded-full mx-2"></div>
              <span>Instant Results</span>
            </div>

            {/* Progini AI Branding Banner */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 mb-8">
              <p className="text-blue-400 text-sm font-medium">
                🚀 This tool is part of Progini AI's comprehensive suite of 25+
                AI-powered business tools
              </p>
              <a
                href="https://progini.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-400 text-sm underline mt-1 inline-block"
              >
                Explore all Progini AI tools →
              </a>
            </div>
          </div>

          <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <Suspense fallback={<LoadingSpinner />}>
              <Calculator />
            </Suspense>
          </div>

          {/* Features Section */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-[#111111] border border-gray-800 rounded-xl">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Lightning Fast Analysis
              </h3>
              <p className="text-gray-400 text-sm">
                Get comprehensive SEO insights in under 60 seconds using our
                AI-powered analysis engine.
              </p>
            </div>

            <div className="text-center p-6 bg-[#111111] border border-gray-800 rounded-xl">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Accurate Predictions
              </h3>
              <p className="text-gray-400 text-sm">
                Revenue projections based on real search data and
                industry-proven conversion rates.
              </p>
            </div>

            <div className="text-center p-6 bg-[#111111] border border-gray-800 rounded-xl">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Actionable Insights
              </h3>
              <p className="text-gray-400 text-sm">
                Get specific recommendations and strategies to improve your
                search rankings.
              </p>
            </div>
          </div>

          {/* Progini AI Footer Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-gray-800 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Need More AI Tools for Your Business?
              </h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                This SEO calculator is just one of 25+ powerful AI tools
                available in the Progini AI platform. From content creation to
                business automation, we have everything you need to grow your
                business.
              </p>
              <a
                href="https://progini.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
              >
                Explore Progini AI Platform
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 17L17 7M17 7H7M17 7V17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
