import { NextResponse } from "next/server";
import { connectToMongoose, Report } from "@/lib/mongodb";
import { generateKeywords } from "@/lib/keywords";
import { fetchKeywordData } from "@/lib/dataseo";
import { calculateSeoOpportunity } from "@/lib/report-generator";

export async function POST(request: Request) {
  try {
    const { basicInfo, competitorInfo } = await request.json();

    if (!basicInfo || !basicInfo.businessUrl) {
      return NextResponse.json(
        { error: "Business URL is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectToMongoose();

    // Generate keywords based on business type and location
    const keywords = await generateKeywords(
      basicInfo.businessType,
      basicInfo.location,
      basicInfo.analysisScope
    );
    console.log("Generated keywords:", keywords);

    // Fetch keyword data from DataForSEO API
    const keywordData = await fetchKeywordData(
      basicInfo.businessUrl,
      competitorInfo.competitors.filter(Boolean), // Filter out empty strings
      keywords,
      basicInfo.analysisScope,
      basicInfo.location,
      basicInfo.locationCode,
      basicInfo.businessType
    );

    // Calculate potential traffic and revenue
    console.log("Starting Calculating potential traffic and revenue");
    const report = await calculateSeoOpportunity(
      keywordData,
      basicInfo.customerValue,
      basicInfo.businessType,
      basicInfo.analysisScope
    );

    console.log("Keyword Data: ", keywordData);

    // Create a new report document
    const newReport = {
      basicInfo,
      competitorInfo,
      keywords,
      keywordData,
      report,
      createdAt: new Date(),
      emailSent: false,
    };

    // Save report to database using Mongoose
    const reportDoc = new Report(newReport);
    console.log("Saving report to database");
    console.log("Report document:", reportDoc);

    try {
      await reportDoc.save();
    } catch (saveError) {
      console.error("Error saving report to database:", saveError);
      // Try to save with a workaround for the competitorRanks issue
      try {
        // Convert keywordData.keywordData.competitorRanks to string and back to object
        const fixedKeywordData = {
          ...keywordData,
          keywordData: keywordData.keywordData.map((kw: any) => ({
            ...kw,
            competitorRanks: JSON.parse(JSON.stringify(kw.competitorRanks)),
          })),
        };

        // Convert report.keywordData.competitorRanks to string and back to object
        const fixedReport = {
          ...report,
          keywordData: report.keywordData.map((kw: any) => ({
            ...kw,
            competitorRanks: JSON.parse(JSON.stringify(kw.competitorRanks)),
          })),
        };

        const fixedReportDoc = new Report({
          ...newReport,
          keywordData: fixedKeywordData,
          report: fixedReport,
        });

        await fixedReportDoc.save();
        return NextResponse.json({
          success: true,
          reportId: (fixedReportDoc._id as any).toString(),
        });
      } catch (fixedSaveError) {
        console.error("Error saving fixed report to database:", fixedSaveError);
        throw fixedSaveError;
      }
    }

    return NextResponse.json({
      success: true,
      reportId: (reportDoc._id as any).toString(),
    });
  } catch (error: any) {
    console.error("Error processing SEO data:", error);
    return NextResponse.json(
      {
        error: "Failed to process SEO data",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
