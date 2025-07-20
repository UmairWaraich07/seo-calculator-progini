// lib/google-maps.ts
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";

export async function fetchLocalCompetitors(
  businessType: string,
  location: string
) {
  try {
    const query = `${businessType} in ${location}`;
    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&key=${GOOGLE_MAPS_API_KEY}`;

    // Initial search for places
    const searchResponse = await fetch(textSearchUrl);
    if (!searchResponse.ok) {
      throw new Error(
        `Google Maps API request failed: ${searchResponse.statusText}`
      );
    }

    const searchData = await searchResponse.json();
    console.log("Google Maps API Search response:", searchData);
    if (searchData.status !== "OK") {
      throw new Error(`Google Maps API error: ${searchData.status}`);
    }

    // Process top 5 results
    const competitors = await Promise.all(
      searchData.results.slice(0, 5).map(async (place: any) => {
        try {
          // Get place details for website
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,rating,user_ratings_total,website&key=${GOOGLE_MAPS_API_KEY}`;
          const detailsResponse = await fetch(detailsUrl);
          const detailsData = await detailsResponse.json();
          console.log("Google Maps API Details response:", detailsData);

          return {
            name: place.name,
            url:
              detailsData.result?.website ||
              `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
            source: "Google Maps",
            rating: place.rating || 0,
            reviewCount: place.user_ratings_total || 0,
            address: place.formatted_address,
          };
        } catch (error) {
          console.error("Error fetching place details:", error);
          return {
            name: place.name,
            url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
            source: "Google Maps",
            rating: place.rating || 0,
            reviewCount: place.user_ratings_total || 0,
            address: place.formatted_address,
          };
        }
      })
    );

    return {
      searchTerm: query,
      competitors: competitors.filter((c) => c !== null),
    };
  } catch (error: any) {
    console.error("Error fetching local competitors:", error);
    throw new Error(`Failed to fetch local competitors: ${error.message}`);
  }
}
