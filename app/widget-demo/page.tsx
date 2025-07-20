"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WidgetDemoPage() {
  const widgetLoaded = useRef(false);

  useEffect(() => {
    // Only load the widget once
    if (!widgetLoaded.current) {
      const script = document.createElement("script");
      script.src = "/api/widget?agencyId=demo";
      script.async = true;
      script.onload = () => {
        console.log("Widget script loaded successfully");
      };
      script.onerror = (error) => {
        console.error("Error loading widget script:", error);
      };
      document.body.appendChild(script);
      widgetLoaded.current = true;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12">
      <div className="container px-4 mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">
            SEO Calculator Widget Demo
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            This page demonstrates how to embed the SEO Calculator widget on any
            website.
          </p>
        </div>

        <Card className="bg-white rounded-xl shadow-xl overflow-hidden p-6 mb-10">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="preview">Widget Preview</TabsTrigger>
              <TabsTrigger value="code">Implementation Code</TabsTrigger>
            </TabsList>

            <TabsContent value="preview">
              <p className="mb-6 text-slate-600">
                This is how the widget will appear when embedded on your
                website:
              </p>
              {/* Widget container */}
              <div
                id="seo-calculator-widget"
                className="border border-slate-200 rounded-lg min-h-[400px]"
              ></div>
            </TabsContent>

            <TabsContent value="code">
              <p className="mb-4 text-slate-600">
                Copy and paste the following code into your website where you
                want the widget to appear:
              </p>

              <div className="bg-slate-800 text-slate-100 p-4 rounded-md overflow-x-auto">
                <pre className="text-sm">
                  {`<!-- SEO Calculator Widget -->
<div id="seo-calculator-widget"></div>
<script src="${
                    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                  }/api/widget?agencyId=YOUR_AGENCY_ID"></script>`}
                </pre>
              </div>

              <h3 className="text-xl font-bold mt-8 mb-2">
                Customization Options
              </h3>
              <p className="mb-4 text-slate-600">
                You can customize the widget by adding parameters to the script
                URL:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 px-4 py-2 text-left">
                        Parameter
                      </th>
                      <th className="border border-slate-300 px-4 py-2 text-left">
                        Description
                      </th>
                      <th className="border border-slate-300 px-4 py-2 text-left">
                        Example
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 px-4 py-2">
                        agencyId
                      </td>
                      <td className="border border-slate-300 px-4 py-2">
                        Your unique agency identifier
                      </td>
                      <td className="border border-slate-300 px-4 py-2">
                        agency123
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-4 py-2">
                        theme
                      </td>
                      <td className="border border-slate-300 px-4 py-2">
                        Widget color theme
                      </td>
                      <td className="border border-slate-300 px-4 py-2">
                        blue, green, dark
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="bg-white rounded-xl shadow-xl overflow-hidden p-6 mb-10">
          <h2 className="text-2xl font-bold mb-4">New Features</h2>
          <p className="mb-6 text-slate-600">
            The SEO Calculator widget now includes these powerful features:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-bold mb-2">Local Analysis</h3>
              <p className="text-slate-600 mb-3">
                Analyze competitors in your specific location using Google Maps
                data to dominate your local market.
              </p>
              <ul className="list-disc pl-5 text-sm text-slate-500 space-y-1">
                <li>Identify top local competitors</li>
                <li>Optimize for "near me" searches</li>
                <li>Improve Google Maps rankings</li>
                <li>Target location-specific keywords</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-bold mb-2">National Analysis</h3>
              <p className="text-slate-600 mb-3">
                Discover top organic competitors nationwide using SearchAtlas
                data for broader market reach.
              </p>
              <ul className="list-disc pl-5 text-sm text-slate-500 space-y-1">
                <li>Identify industry-leading competitors</li>
                <li>Find content gap opportunities</li>
                <li>Discover high-volume keywords</li>
                <li>Build effective backlink strategies</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
