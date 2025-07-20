import { NextResponse } from "next/server";
import { connectToMongoose, Report } from "@/lib/mongodb";
import { sendReportEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email, reportId } = await request.json();

    if (!email || !reportId) {
      return NextResponse.json(
        { error: "Email and reportId are required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectToMongoose();

    // Fetch report from database
    const report = await Report.findById(reportId);

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Send email using Resend
    try {
      const emailResult = await sendReportEmail(email, report);

      // Update report in database
      report.emailSent = true;
      report.emailAddress = email;
      report.emailSentAt = new Date();
      report.emailId = emailResult?.id;
      await report.save();

      return NextResponse.json({
        success: true,
        emailId: emailResult?.id,
      });
    } catch (emailError: any) {
      console.error("Error sending email:", emailError);

      // Return more specific error information
      return NextResponse.json(
        {
          error: "Failed to send email",
          details: emailError.message || "Unknown email error",
          code: emailError.statusCode || 500,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error processing report:", error);
    return NextResponse.json(
      { error: "Failed to process report", details: error.message },
      { status: 500 }
    );
  }
}
