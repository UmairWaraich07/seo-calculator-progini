import { NextResponse } from "next/server";
import { connectToMongoose, Report, WidgetLead } from "@/lib/mongodb";
import { sendReportEmail } from "@/lib/email";
import { generateKeywords } from "@/lib/keywords";
import { fetchKeywordData } from "@/lib/dataseo";
import { calculateSeoOpportunity } from "@/lib/report-generator";

export async function POST(request: Request) {
  try {
    const { agencyId, formData, reportId, referrer } = await request.json();

    if (!formData || !formData.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Connect to MongoDB
    await connectToMongoose();

    // Save the lead to database
    const widgetLead = new WidgetLead({
      agencyId,
      formData,
      reportId,
      referrer,
      timestamp: new Date(),
      status: "new",
    });

    await widgetLead.save();

    // Generate keywords based on business type and location
    const keywords = await generateKeywords(
      formData.businessType,
      formData.location,
      formData.analysisScope
    );

    // Fetch keyword data from DataForSEO API
    const keywordData = await fetchKeywordData(
      formData.businessUrl,
      formData.competitors.filter(Boolean), // Filter out empty strings
      keywords,
      formData.analysisScope,
      formData.location,
      formData.locationCode,
      formData.businessType // Pass the location code from the widget
    );

    // Calculate potential traffic and revenue
    const reportData = await calculateSeoOpportunity(
      keywordData,
      Number.parseFloat(formData.customerValue),
      formData.businessType,
      formData.analysisScope
    );

    // Create the full report object
    const fullReport = {
      basicInfo: {
        businessUrl: formData.businessUrl,
        businessType: formData.businessType,
        location: formData.location,
        locationCode: formData.locationCode,
        customerValue: Number.parseFloat(formData.customerValue),
        analysisScope: formData.analysisScope,
        competitorType: formData.competitorType,
      },
      report: reportData,
    };

    // Fix competitorRanks objects for MongoDB
    const fixedKeywordData = {
      ...keywordData,
      keywordData: keywordData.keywordData.map((kw: any) => ({
        ...kw,
        competitorRanks: JSON.parse(JSON.stringify(kw.competitorRanks)),
      })),
    };

    // Fix report competitorRanks objects for MongoDB
    const fixedReportData = {
      ...reportData,
      keywordData: reportData.keywordData.map((kw: any) => ({
        ...kw,
        competitorRanks: JSON.parse(JSON.stringify(kw.competitorRanks)),
      })),
    };

    // Save report to database
    const newReport = new Report({
      basicInfo: fullReport.basicInfo,
      competitorInfo: { competitors: formData.competitors.filter(Boolean) },
      keywords,
      keywordData: fixedKeywordData,
      report: fixedReportData,
      createdAt: new Date(),
      emailSent: false,
      source: "widget",
      agencyId,
      referrer,
    });

    await newReport.save();

    // Send email with report
    try {
      const emailResult = await sendReportEmail(formData.email, {
        basicInfo: fullReport.basicInfo,
        report: reportData,
      });

      // Update lead status in database
      widgetLead.status = "email_sent";
      widgetLead.emailSentAt = new Date();
      widgetLead.emailId = emailResult?.id;
      await widgetLead.save();

      return NextResponse.json({
        success: true,
        message: "Report sent successfully",
      });
    } catch (emailError: any) {
      console.error("Error sending email:", emailError);

      // Update lead status in database
      widgetLead.status = "email_failed";
      widgetLead.emailError = emailError.message;
      await widgetLead.save();

      return NextResponse.json(
        {
          error: "Failed to send email",
          details: emailError.message || "Unknown email error",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error processing widget submission:", error);
    return NextResponse.json(
      { error: "Failed to process submission", details: error.message },
      { status: 500 }
    );
  }
}
