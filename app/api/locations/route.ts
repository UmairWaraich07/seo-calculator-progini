import { NextResponse } from "next/server";

// DataForSEO API credentials
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN || "";
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD || "";
const DATAFORSEO_BASE_URL = "https://api.dataforseo.com/v3";

// Cache the locations to avoid repeated API calls
let cachedLocations: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  try {
    console.log(
      `Locations API called with state parameter: ${state || "none"}`
    );

    // Check if we have a valid cached response
    const now = Date.now();
    if (cachedLocations && now - cacheTimestamp < CACHE_DURATION) {
      // If state is provided, return cities for that state
      if (state) {
        const cities = cachedLocations.cities[state] || [];
        console.log(
          `Returning ${cities.length} cached cities for state: ${state}`
        );
        return NextResponse.json(cities);
      }
      // Otherwise return states
      console.log(`Returning ${cachedLocations.states.length} cached states`);
      return NextResponse.json(cachedLocations.states || []);
    }

    // Initialize with empty arrays
    const states: any[] = [];
    const cities: Record<string, any[]> = {};

    try {
      const country = "us"; // dynamically from user input, if needed

      const response = await fetch(
        `${DATAFORSEO_BASE_URL}/keywords_data/google_ads/locations/${country}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(
              `${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`
            ).toString("base64")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`DataForSEO API error: ${response.statusText}`);
      }

      const data = await response.json();
      // console.log("DataForSEO locations response:", data.tasks[0].result);
      const usLocations = data.tasks[0].result || [];
      console.log(`Found ${usLocations.length} US locations from DataForSEO`);

      // First pass: collect all states
      usLocations.forEach((loc: any) => {
        if (loc.location_type === "State") {
          states.push({
            name: loc.location_name,
            code: loc.location_code,
            full_name: `${loc.location_name}, United States`,
            location_type: loc.location_type,
          });
          // Initialize the cities array for this state
          cities[loc.location_name] = [];
        }
      });

      console.log(`Found ${states.length} states`);

      // Sort states by name length (descending) to handle overlapping names like "Virginia" vs "West Virginia"
      // This ensures "West Virginia" is checked before "Virginia" when matching cities
      states.sort((a, b) => b.name.length - a.name.length);

      // Second pass: collect all cities
      const allCities: any[] = [];
      usLocations.forEach((loc: any) => {
        if (loc.location_type === "City") {
          allCities.push({
            name: loc.location_name,
            code: loc.location_code,
            full_name: loc.location_name,
            location_type: loc.location_type,
          });
        }
      });

      console.log(`Found ${allCities.length} cities total`);

      // Third pass: associate cities with states using a more precise approach
      for (const city of allCities) {
        let assigned = false;
        const cityLower = city.name.toLowerCase();

        // Try to find which state this city belongs to
        for (const state of states) {
          const stateLower = state.name.toLowerCase();

          // Check for exact format "City, State" or "City, State, USA"
          if (
            cityLower.includes(`, ${stateLower},`) ||
            cityLower.endsWith(`, ${stateLower}`)
          ) {
            // Extract just the city name (remove the state part)
            const cityName = city.name.split(",")[0].trim();

            cities[state.name].push({
              name: cityName,
              code: city.code,
              full_name: city.name,
              location_type: "City",
            });

            assigned = true;
            break;
          }
        }

        // If not assigned yet, try less precise matching
        if (!assigned) {
          for (const state of states) {
            const stateLower = state.name.toLowerCase();

            // Check if city name contains state name with proper word boundaries
            // This helps with cases like "West Virginia" vs "Virginia"
            const stateWords = stateLower.split(" ");
            const stateRegex = new RegExp(
              `\\b${stateWords.join("\\s+")}\\b`,
              "i"
            );

            if (stateRegex.test(cityLower)) {
              // Extract just the city name
              let cityName = city.name;
              if (city.name.includes(",")) {
                cityName = city.name.split(",")[0].trim();
              }

              cities[state.name].push({
                name: cityName,
                code: city.code,
                full_name: city.name,
                location_type: "City",
              });

              assigned = true;
              break;
            }
          }
        }
      }

      // Log city counts by state
      console.log("City counts by state:");
      Object.keys(cities).forEach((state) => {
        console.log(`${state}: ${cities[state].length} cities`);
      });

      // Sort states alphabetically for display
      states.sort((a: any, b: any) => a.name.localeCompare(b.name));

      // Sort cities within each state alphabetically
      Object.keys(cities).forEach((state) => {
        cities[state].sort((a: any, b: any) => a.name.localeCompare(b.name));
      });

      // Cache the organized results
      cachedLocations = {
        states,
        cities,
      };
      cacheTimestamp = now;
    } catch (error) {
      console.error("Error fetching locations from API:", error);
      // Return empty arrays if API fails
      return NextResponse.json([]);
    }

    // Return states or cities based on the request
    if (state) {
      const stateCities = cachedLocations.cities[state] || [];
      console.log(`Returning ${stateCities.length} cities for state: ${state}`);
      return NextResponse.json(stateCities);
    }

    console.log(`Returning ${cachedLocations.states.length} states`);
    return NextResponse.json(cachedLocations.states);
  } catch (error) {
    console.error("Error in locations route handler:", error);

    // If there's an error but we have cached data, return that
    if (cachedLocations) {
      if (state && cachedLocations.cities[state]) {
        return NextResponse.json(cachedLocations.cities[state]);
      }
      return NextResponse.json(cachedLocations.states || []);
    }

    // Return an empty array if all else fails
    return NextResponse.json([]);
  }
}

/**
 const country = "us"; // dynamically from user input, if needed

    const response = await fetch(
      `${DATAFORSEO_BASE_URL}/serp/google/locations/${country}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`
          ).toString("base64")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.statusText}`);
    }

    const data = await response.json();
    // console.log("DataForSEO locations response:", data.tasks[0].result);

 */
