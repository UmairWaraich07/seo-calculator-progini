import { NextResponse } from "next/server";
import {
  fetchKeywordData,
  fetchLocalCompetitors,
  fetchNationalCompetitors,
} from "@/lib/dataseo";
import { generateKeywords } from "@/lib/keywords";
import { calculateSeoOpportunity } from "@/lib/report-generator";

export async function POST(request: Request) {
  try {
    const {
      businessType,
      location,
      businessUrl,
      locationCode,
      analysisScope,
      customerValue,
    } = await request.json();

    if (!businessType || !location) {
      return NextResponse.json(
        { error: "Business type and location are required" },
        { status: 400 }
      );
    }

    // Step 1. Fetch local competitors or national competitors using DataForSEO
    const scope = analysisScope || "local";
    let competitorInfo;
    let competitorUrls: string[] = [];
    if (scope === "local") {
      competitorInfo = await fetchLocalCompetitors(
        businessType,
        location,
        businessUrl,
        locationCode
      );
      competitorUrls = competitorInfo.competitors.map((c) => c.url);
    } else {
      competitorInfo = await fetchNationalCompetitors(
        businessType,
        businessUrl
      );

      competitorUrls = competitorInfo.map((c) => c.url);
    }

    // console.log("Competitor Info:", competitorInfo);

    // Step 2. Process result and generate keywords
    const keywords = await generateKeywords(
      businessType,
      location,
      analysisScope
    );
    // console.log("Generated keywords:", keywords);

    // Step 3. Fetch keyword data from DataForSEO API
    const keywordData = await fetchKeywordData(
      businessUrl,
      competitorUrls.filter(Boolean), // Filter out empty strings
      keywords,
      analysisScope,
      location,
      locationCode,
      businessType
    );

    // console.log("Keyword Data:", keywordData);

    // Step 4. Calculate potential traffic and revenue
    console.log("Starting Calculating potential traffic and revenue");
    const report = await calculateSeoOpportunity(
      keywordData,
      customerValue,
      businessType,
      analysisScope
    );

    // console.log("Report generated:", report);

    return NextResponse.json(
      {
        report,
        businessType,
        businessUrl,
        location,
        competitorInfo,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error detecting local competitors:", error);
    return NextResponse.json(
      {
        error: "Failed to detect local competitors",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
