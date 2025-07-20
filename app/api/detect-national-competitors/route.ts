import { NextResponse } from "next/server";
import { fetchNationalCompetitors } from "@/lib/dataseo";

export async function POST(request: Request) {
  try {
    const { businessType, location, businessUrl } = await request.json();

    if (!businessType) {
      return NextResponse.json(
        { error: "Business type is required" },
        { status: 400 }
      );
    }

    // Fetch national competitors using DataForSEO
    const competitors = await fetchNationalCompetitors(
      businessType,
      businessUrl
    );

    return NextResponse.json({
      success: true,
      competitors,
    });
  } catch (error: any) {
    console.error("Error detecting national competitors:", error);
    return NextResponse.json(
      {
        error: "Failed to detect national competitors",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
