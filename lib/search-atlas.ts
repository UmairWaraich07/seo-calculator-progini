import axios from "axios";
import { NextResponse } from "next/server";

const SEARCHATLAS_API_KEY = process.env.SEARCHATLAS_API_KEY || "";
const SEARCHATLAS_PROJECT_ID = process.env.SEARCHATLAS_PROJECT_ID || "";

export async function fetchKeywordData(
  clientUrl: string,
  competitorUrls: string[],
  keywords: string[],
  analysisScope: "local" | "national" = "local"
) {
  // In a real implementation, this would make API calls to SearchAtlas
  // For now, we'll generate sample data
  // Configure date ranges (last 30 days)
  const formattedKeywords = keywords.map((keyword) => {
    return {
      keyword: keyword,
      location: "United States",
    };
  });

  console.log("Formatted keywords:", formattedKeywords);

  const apiUrl = `https://keyword.searchatlas.com/api/v2/rank-tracker/${SEARCHATLAS_PROJECT_ID}/tracked-keywords/?searchatlas_api_key=${SEARCHATLAS_API_KEY}`;

  const response = await axios.put(apiUrl, JSON.stringify(formattedKeywords));

  console.log("SearchAtlas ADD Keywords response:", response);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  // Build API URL
  const apiUrl2 = `https://keyword.searchatlas.com/api/v1/rank-tracker/${SEARCHATLAS_PROJECT_ID}/keywords-details/`;

  // Make API call with Axios
  if (response) {
    const response2 = await axios.get(apiUrl2, {
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        period2_start: formatDate(startDate),
        period2_end: formatDate(endDate),
        page: 1,
        page_size: 10,
        searchatlas_api_key: SEARCHATLAS_API_KEY,
      },
    });

    console.log("SearchAtlas Keyword details response:", response2);
  }

  // // Simulate API delay
  // await new Promise((resolve) => setTimeout(resolve, 2000));

  // // Generate competitor data
  // const competitors = competitorUrls.map((url) => ({
  //   url,
  //   name: getDomainFromUrl(url),
  //   source: url.includes("maps") ? "Google Maps" : "SearchAtlas",
  // }));

  // // Generate keyword data
  // const keywordData = keywords.map((keyword) => {
  //   // Generate random search volume between 10 and 1000
  //   // Local keywords typically have lower search volume than national ones
  //   const maxVolume = analysisScope === "local" ? 500 : 2000;
  //   const minVolume = analysisScope === "local" ? 10 : 50;
  //   const searchVolume =
  //     Math.floor(Math.random() * (maxVolume - minVolume)) + minVolume;

  //   // Generate random client rank (sometimes not ranking at all)
  //   const clientRank =
  //     Math.random() > 0.3 ? Math.floor(Math.random() * 100) + 1 : null;

  //   // Generate random competitor ranks
  //   const competitorRanks: Record<string, number | null> = {};
  //   competitorUrls.forEach((url) => {
  //     competitorRanks[url] =
  //       Math.random() > 0.2 ? Math.floor(Math.random() * 100) + 1 : null;
  //   });

  //   // Determine if this is a local-specific keyword
  //   const isLocal =
  //     keyword.includes("near me") ||
  //     keyword.toLowerCase().includes("local") ||
  //     keyword.includes("in ") ||
  //     keyword.includes("near ");

  //   return {
  //     keyword,
  //     searchVolume,
  //     clientRank,
  //     competitorRanks,
  //     isLocal,
  //     // Add more data specific to the analysis type
  //     ...(analysisScope === "local"
  //       ? {
  //           hasLocalPack: Math.random() > 0.5,
  //           localIntent: Math.random() * 10,
  //         }
  //       : {
  //           keywordDifficulty: Math.floor(Math.random() * 100),
  //           cpc: (Math.random() * 10).toFixed(2),
  //         }),
  //   };
  // });

  // // Sort keywords by search volume (highest first)
  // keywordData.sort((a, b) => b.searchVolume - a.searchVolume);

  // return {
  //   clientUrl,
  //   competitors,
  //   keywordData,
  //   analysisScope,
  // };
}

function getDomainFromUrl(url: string) {
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, "");
  } catch (error) {
    return url;
  }
}
