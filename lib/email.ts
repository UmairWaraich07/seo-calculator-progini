import { Resend } from "resend";
import { ReportEmailTemplate } from "@/components/email/report-email-template";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender email
const DEFAULT_FROM_EMAIL = "SEO Calculator <umair@joinaiautomation.com>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

/**
 * Generic function to send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = DEFAULT_FROM_EMAIL,
  replyTo,
}: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      replyTo: replyTo,
    });

    console.log("Email sent:", data);

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

/**
 * Send SEO report email to the user
 */
export async function sendReportEmail(email: string, report: any) {
  const { basicInfo, report: reportData } = report;

  // Generate HTML email with React component
  const emailHtml = ReportEmailTemplate({
    report: reportData,
    basicInfo,
    previewText: `Your SEO Opportunity Report for ${basicInfo.businessUrl}`,
  });

  return sendEmail({
    to: email,
    subject: `Your SEO Opportunity Report for ${basicInfo.businessUrl}`,
    html: emailHtml,
    replyTo: "umair@joinaiautomation.com",
  });
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
