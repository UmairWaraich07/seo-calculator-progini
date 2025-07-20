import { type NextRequest, NextResponse } from "next/server";

// DataForSEO API credentials
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN || "";
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD || "";
const DATAFORSEO_BASE_URL = "https://api.dataforseo.com/v3";

// Cache the locations to avoid repeated API calls
let cachedLocations: { states: any[]; cities: Record<string, any[]> } | null =
  null;
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

// Levenshtein distance calculation for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

// Calculate similarity score (0-1, where 1 is perfect match)
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;

  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return (maxLength - distance) / maxLength;
}

// Enhanced fuzzy matching with multiple strategies
function findBestMatch(
  items: any[],
  searchTerm: string,
  threshold = 0.6
): { match: any | null; score: number; method: string } {
  if (!items || items.length === 0) {
    return { match: null, score: 0, method: "none" };
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();
  let bestMatch: any = null;
  let bestScore = 0;
  let bestMethod = "none";

  for (const item of items) {
    const itemName = item.name.toLowerCase();
    let score = 0;
    let method = "";

    // Strategy 1: Exact match (highest priority)
    if (itemName === normalizedSearch) {
      return { match: item, score: 1, method: "exact" };
    }

    // Strategy 2: Starts with or ends with
    if (
      itemName.startsWith(normalizedSearch) ||
      itemName.endsWith(normalizedSearch)
    ) {
      score = 0.9;
      method = "starts_ends_with";
    }
    // Strategy 3: Contains (substring)
    else if (
      itemName.includes(normalizedSearch) ||
      normalizedSearch.includes(itemName)
    ) {
      score = 0.8;
      method = "contains";
    }
    // Strategy 4: Word-level matching
    else {
      const searchWords = normalizedSearch.split(/\s+/);
      const itemWords = itemName.split(/\s+/);
      const wordMatches = searchWords.filter((searchWord) =>
        itemWords.some(
          (itemWord: string) =>
            itemWord.includes(searchWord) ||
            searchWord.includes(itemWord) ||
            calculateSimilarity(searchWord, itemWord) > 0.8
        )
      );

      if (wordMatches.length > 0) {
        score =
          wordMatches.length / Math.max(searchWords.length, itemWords.length);
        method = "word_match";
      }
    }

    // Strategy 5: Levenshtein distance-based fuzzy matching
    const similarity = calculateSimilarity(normalizedSearch, itemName);
    if (similarity > score && similarity > threshold) {
      score = similarity;
      method = "fuzzy";
    }

    // Update best match if this score is better
    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestMatch = item;
      bestMethod = method;
    }
  }

  return { match: bestMatch, score: bestScore, method: bestMethod };
}

// Fetch & cache location data (merged from /api/locations)
async function loadLocationData(): Promise<{
  states: any[];
  cities: Record<string, any[]>;
}> {
  const now = Date.now();
  if (cachedLocations && now - cacheTimestamp < CACHE_DURATION) {
    return cachedLocations;
  }

  const states: any[] = [];
  const cities: Record<string, any[]> = {};
  const country = "us";

  try {
    const resp = await fetch(
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
    if (!resp.ok) throw new Error(`DataForSEO API error: ${resp.statusText}`);
    const json = await resp.json();
    const usLocations = json.tasks[0].result || [];

    // --- STATES ---
    usLocations.forEach((loc: any) => {
      if (loc.location_type === "State") {
        states.push({
          name: loc.location_name,
          code: loc.location_code,
        });
        cities[loc.location_name] = [];
      }
    });
    // Sort so longer names match first (e.g. "West Virginia")
    states.sort((a, b) => b.name.length - a.name.length);

    // --- CITIES: first map raw to objects with `.name` ---
    const allCities = usLocations
      .filter((loc: any) => loc.location_type === "City")
      .map((loc: any) => ({
        name: loc.location_name,
        code: loc.location_code,
      }));

    // Assign cities to their states
    for (const city of allCities) {
      const cityLower = city.name.toLowerCase();
      let assigned = false;

      // Try exact "City, State" match
      for (const st of states) {
        const stLower = st.name.toLowerCase();
        if (
          cityLower.includes(`, ${stLower},`) ||
          cityLower.endsWith(`, ${stLower}`)
        ) {
          cities[st.name].push(city);
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        // Fallback: regex on state name
        for (const st of states) {
          const stLower = st.name.toLowerCase();
          const words = stLower.split(" ").join("\\s+");
          const regex = new RegExp(`\\b${words}\\b`, "i");
          if (regex.test(cityLower)) {
            cities[st.name].push(city);
            break;
          }
        }
      }
    }

    // Sort alphabetically
    states.sort((a, b) => a.name.localeCompare(b.name));
    Object.keys(cities).forEach((st) => {
      cities[st].sort((a, b) => a.name.localeCompare(b.name));
    });

    // Cache and return
    cachedLocations = { states, cities };
    cacheTimestamp = now;
    return cachedLocations;
  } catch (e) {
    console.error("Error fetching location data:", e);
    throw new Error("Failed to load location data from DataForSEO");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { state, city } = await request.json();
    if (!state) {
      return NextResponse.json(
        {
          error: "State is required in request body",
          usage:
            'Send JSON: {"state": "StateName"} or {"state": "StateName", "city": "CityName"}',
        },
        { status: 400 }
      );
    }

    console.log(
      `[get-location-code] Request for state=${state}, city=${city || "n/a"}`
    );

    const { states, cities } = await loadLocationData();

    // Find best state match with detailed scoring
    const stateMatch = findBestMatch(states, state, 0.6);

    if (!stateMatch.match) {
      // Provide suggestions for similar states
      const suggestions = states
        .map((s) => ({
          name: s.name,
          score: calculateSimilarity(state.toLowerCase(), s.name.toLowerCase()),
        }))
        .filter((s) => s.score > 0.4)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((s) => s.name);

      return NextResponse.json(
        {
          error: `State "${state}" not found`,
          suggestion: "Check spelling or try a different name",
          similarStates: suggestions.length > 0 ? suggestions : undefined,
          searchTerm: state,
        },
        { status: 404 }
      );
    }

    console.log(
      `[get-location-code] State match: "${
        stateMatch.match.name
      }" (score: ${stateMatch.score.toFixed(2)}, method: ${stateMatch.method})`
    );

    // City-level match?
    if (city) {
      const stateCities = cities[stateMatch.match.name] || [];
      const cityMatch = findBestMatch(stateCities, city, 0.6);

      if (cityMatch.match) {
        console.log(
          `[get-location-code] City match: "${
            cityMatch.match.name
          }" (score: ${cityMatch.score.toFixed(2)}, method: ${
            cityMatch.method
          })`
        );

        return NextResponse.json({
          success: true,
          location_code: cityMatch.match.code,
          matched: {
            state: stateMatch.match.name,
            state_code: stateMatch.match.code,
            city: cityMatch.match.name,
            city_code: cityMatch.match.code,
          },
          type: "city",
          source: "DataForSEO",
          matchingInfo: {
            state: {
              inputTerm: state,
              matchedName: stateMatch.match.name,
              score: stateMatch.score,
              method: stateMatch.method,
            },
            city: {
              inputTerm: city,
              matchedName: cityMatch.match.name,
              score: cityMatch.score,
              method: cityMatch.method,
            },
          },
        });
      }

      // Provide city suggestions if no match found
      const citySuggestions = stateCities
        .map((c) => ({
          name: c.name,
          score: calculateSimilarity(city.toLowerCase(), c.name.toLowerCase()),
        }))
        .filter((c) => c.score > 0.4)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((c) => c.name);

      console.warn(
        `[get-location-code] No city match for "${city}" in ${stateMatch.match.name}, falling back to state`
      );

      return NextResponse.json({
        success: true,
        location_code: stateMatch.match.code,
        matched: {
          state: stateMatch.match.name,
          state_code: stateMatch.match.code,
        },
        type: "state",
        source: "DataForSEO",
        warning: `City "${city}" not found in ${stateMatch.match.name}`,
        similarCities: citySuggestions.length > 0 ? citySuggestions : undefined,
        matchingInfo: {
          state: {
            inputTerm: state,
            matchedName: stateMatch.match.name,
            score: stateMatch.score,
            method: stateMatch.method,
          },
        },
      });
    }

    // Fallback: return state code
    return NextResponse.json({
      success: true,
      location_code: stateMatch.match.code,
      matched: {
        state: stateMatch.match.name,
        state_code: stateMatch.match.code,
      },
      type: "state",
      source: "DataForSEO",
      matchingInfo: {
        state: {
          inputTerm: state,
          matchedName: stateMatch.match.name,
          score: stateMatch.score,
          method: stateMatch.method,
        },
      },
    });
  } catch (err) {
    console.error("[get-location-code] Internal error:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
