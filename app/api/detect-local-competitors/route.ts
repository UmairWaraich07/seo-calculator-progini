import { NextResponse } from "next/server";
import { fetchLocalCompetitors } from "@/lib/dataseo";

export async function POST(request: Request) {
  try {
    const { businessType, location, businessUrl, locationCode } =
      await request.json();

    if (!businessType || !location) {
      return NextResponse.json(
        { error: "Business type and location are required" },
        { status: 400 }
      );
    }

    // Fetch local competitors using DataForSEO
    const result = await fetchLocalCompetitors(
      businessType,
      location,
      businessUrl,
      locationCode
    );

    return NextResponse.json({
      success: true,
      competitors: result.competitors,
      searchTerm: result.searchTerm,
    });
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
