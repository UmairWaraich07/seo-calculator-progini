import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function ThankYouPage({
  searchParams,
}: {
  searchParams: { reportId?: string };
}) {
  const reportId = searchParams.reportId || "";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <main className="py-12">
        <div className="container px-4 mx-auto max-w-3xl">
          <Card className="p-8 text-center bg-[#111111] border-gray-800">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>

            <h1 className="text-3xl font-bold mb-4 text-white">Thank You!</h1>

            <p className="text-lg text-gray-300 mb-6">
              Your SEO opportunity report has been sent to your email. Please
              check your inbox (and spam folder) for your detailed analysis
              powered by Progini AI.
            </p>

            <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg mb-8">
              <p className="text-sm text-gray-400 mb-2">Report Reference ID:</p>
              <p className="font-mono text-gray-300">{reportId}</p>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300">
                Want to discuss your SEO opportunities with an expert?
              </p>

              <Button
                asChild
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
              >
                <Link href="/schedule-call">Schedule a Free Consultation</Link>
              </Button>

              <Button
                variant="outline"
                asChild
                className="w-full text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white bg-transparent"
              >
                <Link href="/">Calculate Another Website</Link>
              </Button>

              <div className="mt-8 pt-6 border-t border-gray-800">
                <p className="text-sm text-gray-400 mb-3">
                  Want to explore more AI tools for your business?
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="text-blue-400 border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-300 bg-transparent"
                >
                  <Link
                    href="https://progini.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Progini AI Platform →
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
