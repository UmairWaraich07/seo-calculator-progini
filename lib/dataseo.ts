import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * DataForSEO API client for SEO data
 */

// DataForSEO API credentials
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN || "";
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD || "";
const DATAFORSEO_BASE_URL = "https://api.dataforseo.com/v3";

// Base64 encoded credentials for authentication
const AUTH_HEADER = Buffer.from(
  `${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`
).toString("base64");

/**
 * Make a request to the DataForSEO API
 */
async function makeRequest(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  data?: any
) {
  try {
    if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
      throw new Error("DataForSEO credentials are not configured");
    }

    const url = `${DATAFORSEO_BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Basic ${AUTH_HEADER}`,
        "Content-Type": "application/json",
      },
    };

    if (data && method === "POST") {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `DataForSEO API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error making DataForSEO request:", error);
    throw error;
  }
}

/**
 * Get keyword data from DataForSEO using the Google Ads search volume endpoint
 * This endpoint provides search volume data through a task-based approach
 */
export async function getKeywordData(
  keywords: string[],
  location: string,
  language = "en",
  locationCode?: number
) {
  try {
    // Get location code for the specified location, using the provided code if available
    const code = locationCode || (await getLocationCode(location));

    // Step 1: Create a task to fetch search volume data
    const taskPostData = [
      {
        location_code: code,
        keywords: keywords,
      },
    ];

    console.log(
      `Creating search volume task for ${keywords.length} keywords from DataForSEO using location code: ${code}`
    );

    const taskResponse = await makeRequest(
      "/keywords_data/google_ads/search_volume/task_post",
      "POST",
      taskPostData
    );

    // Check if task was created successfully
    if (
      !taskResponse.tasks ||
      !taskResponse.tasks.length ||
      !taskResponse.tasks[0].id
    ) {
      throw new Error("Failed to create search volume task");
    }

    const taskId = taskResponse.tasks[0].id;
    console.log(`Search volume task created with ID: ${taskId}`);

    // Step 2: Wait for the task to complete with improved polling
    console.log(`Waiting for task ${taskId} to complete...`);
    const results = await pollForResults([taskId], 20, 3000, "keywords_data");

    if (results.length === 0) {
      console.warn(
        "No results returned from polling. Task may still be in progress."
      );
      // Return empty data rather than failing completely
      return keywords.map((keyword) => ({
        keyword,
        searchVolume: 0,
        cpc: null,
        competition: null,
      }));
    }

    console.log("Processed Keywords Data", results);

    // Process the results
    const processedData = processKeywordVolumeData(results[0], keywords);
    console.log(
      `Search volume data fetched for ${processedData.length} keywords`
    );
    return processedData;
  } catch (error) {
    console.error("Error getting keyword data:", error);
    throw new Error(
      `Failed to fetch keyword data: ${(error as Error).message}`
    );
  }
}

/**
 * Process keyword volume data from DataForSEO Google Ads response
 */
function processKeywordVolumeData(taskResult: any, originalKeywords: string[]) {
  try {
    const keywordData: any[] = [];
    const processedKeywords = new Set<string>();

    if (taskResult && taskResult.result && Array.isArray(taskResult.result)) {
      // Process each keyword item
      for (const item of taskResult.result) {
        keywordData.push({
          keyword: item.keyword,
          searchVolume: item.search_volume || 0,
          cpc: item.cpc || null,
          competition: item.competition || null,
        });
        processedKeywords.add(item.keyword);
      }
    }

    // Check if we got data for all keywords, if not, add missing ones with null values
    // This ensures we maintain the same number of keywords as input
    for (const keyword of originalKeywords) {
      if (!processedKeywords.has(keyword)) {
        keywordData.push({
          keyword,
          searchVolume: 0,
          cpc: null,
          competition: null,
        });
      }
    }

    return keywordData;
  } catch (error) {
    console.error("Error processing keyword volume data:", error);
    throw new Error(
      `Failed to process keyword data: ${(error as Error).message}`
    );
  }
}

/**
 * Get ranked keywords for a domain using DataForSEO Labs
 */
export async function getRankedKeywords(
  domain: string,
  location: string,
  limit = 10
) {
  try {
    // Prepare the request data
    const data = [
      {
        target: domain,
        location_code: "2840", // Default to USA location code -> This API works on country level
        language_code: "en",
        limit: limit,
      },
    ];

    // Make the request to DataForSEO
    const response = await makeRequest(
      "/dataforseo_labs/google/ranked_keywords/live",
      "POST",
      data
    );

    return processRankedKeywordsData(response, domain);
  } catch (error) {
    console.error("Error getting ranked keywords:", error);
    throw error;
  }
}

/**
 * Process ranked keywords data from DataForSEO response
 */
function processRankedKeywordsData(response: any, domain: string) {
  try {
    console.log(
      `Processing ranked keywords data from DataForSEO response for domain: ${domain}`
    );
    const rankedKeywords: any[] = [];

    if (response.tasks && Array.isArray(response.tasks)) {
      for (const task of response.tasks) {
        if (task.result && Array.isArray(task.result)) {
          for (const result of task.result) {
            if (result.items && Array.isArray(result.items)) {
              for (const item of result.items) {
                rankedKeywords.push({
                  keyword: item?.keyword_data?.keyword || "",
                  searchVolume:
                    item?.keyword_data?.keyword_info?.search_volume || 0,
                  keywordDifficulty:
                    item?.ranked_serp_element?.keyword_difficulty || 0,
                  cpc: item?.keyword_data?.keyword_info?.cpc
                    ? Number(item.keyword_data.keyword_info.cpc).toFixed(2)
                    : "0.00",
                  rank:
                    item?.ranked_serp_element?.serp_item?.rank_absolute || 0,
                  url: item?.ranked_serp_element?.serp_item?.url || "",
                  domain: item?.ranked_serp_element?.serp_item?.domain || "",
                });
              }
            }
          }
        }
      }
    }

    console.log(
      `Ranked keywords processed successfully for domain : ${domain} `
    );

    return rankedKeywords;
  } catch (error) {
    console.error("Error processing ranked keywords data:", error);
    throw error;
  }
}

/**
 * Get location code for a specified location
 */
export async function getLocationCode(location: string): Promise<number> {
  try {
    // Make request to get location data
    const response = await makeRequest("/serp/google/locations", "GET", [
      { country: "us" },
    ]);

    // Find the location code for the specified location
    if (response.results && Array.isArray(response.results)) {
      const locationData = response.result.find((loc: any) =>
        loc.location_name.toLowerCase().includes(location.toLowerCase())
      );

      if (locationData) {
        return locationData.location_code;
      }
    }

    // Default to USA if location not found
    return 2840; // USA location code
  } catch (error) {
    console.error("Error getting location code:", error);
    // Default to USA if there's an error
    return 2840;
  }
}

/**
 * Polling function to check task results until they are ready
 * Fetches results for each task ID individually using GET requests
 */
async function pollForResults(
  taskIds: string[],
  maxAttempts = 10,
  initialDelay = 5000,
  endpointType = "keywords_data"
) {
  let attempts = 0;
  const allResults: any[] = [];
  const pendingTaskIds = new Set(taskIds);
  const completedTaskIds = new Set<string>();

  console.log(
    `Starting to poll for results of ${taskIds.length} tasks using ${endpointType} endpoint...`
  );

  // Use exponential backoff for retries
  let currentDelay = initialDelay;

  while (attempts < maxAttempts && pendingTaskIds.size > 0) {
    attempts++;
    console.log(
      `Polling attempt ${attempts}/${maxAttempts} for ${pendingTaskIds.size} remaining tasks...`
    );

    // Process each pending task ID individually
    for (const taskId of Array.from(pendingTaskIds)) {
      try {
        // Determine the correct endpoint based on the endpointType
        let endpoint = "";
        if (endpointType === "keywords_data") {
          endpoint = `/keywords_data/google_ads/search_volume/task_get/${taskId}`;
        } else if (endpointType === "serp") {
          endpoint = `/serp/google/organic/task_get/advanced/${taskId}`;
        } else {
          throw new Error(`Unknown endpoint type: ${endpointType}`);
        }

        const response = await makeRequest(endpoint, "GET");

        console.log(
          `Task ${taskId} status: ${response.tasks?.[0]?.status_code} - ${response.tasks?.[0]?.status_message}`
        );

        // Check the status code
        if (response.tasks && response.tasks.length > 0) {
          const task = response.tasks[0];

          // Task completed successfully
          if (task.status_code === 20000) {
            console.log(`Task ${taskId} completed successfully`);
            allResults.push(task);
            pendingTaskIds.delete(taskId);
            completedTaskIds.add(taskId);
          }
          // Task created but not yet processed
          else if (task.status_code === 20100) {
            console.log(`Task ${taskId} created but not yet processed`);
          }
          // Task in queue
          else if (task.status_code === 40602 || task.status_code === 40601) {
            console.log(`Task ${taskId} is in queue or being processed`);
          }
          // Error codes that indicate we should stop trying
          else if (
            [
              40100, 40200, 40201, 40202, 40203, 40204, 40400, 40401, 40402,
              40403, 50000,
            ].includes(task.status_code)
          ) {
            console.error(
              `Task ${taskId} failed with error: ${task.status_code} - ${task.status_message}`
            );
            pendingTaskIds.delete(taskId);
          }
          // Other error codes - we might want to retry
          else {
            console.warn(
              `Task ${taskId} returned status code ${task.status_code}: ${task.status_message}`
            );
          }
        }
      } catch (error) {
        console.warn(`Error fetching results for task ${taskId}:`, error);
      }
    }

    // If we have results for all tasks, return them
    if (pendingTaskIds.size === 0) {
      console.log(`All ${completedTaskIds.size} tasks completed successfully`);
      return allResults;
    }

    // Wait before retrying with exponential backoff
    console.log(`Waiting ${currentDelay}ms before next polling attempt...`);
    await new Promise((resolve) => setTimeout(resolve, currentDelay));

    // Increase delay for next attempt (exponential backoff with max of 30 seconds)
    currentDelay = Math.min(currentDelay, 30000);
  }

  console.warn(
    `Polling completed. Got results for ${completedTaskIds.size} out of ${taskIds.length} tasks after ${attempts} attempts.`
  );

  // Return the results we have, even if incomplete
  return allResults;
}
/**
 * Get competitor data for a domain
 */
export async function getCompetitorData(domain: string, location: string) {
  try {
    // Prepare the request data
    const data = [
      {
        target: domain,
        location_code: "2840", // Default to USA location code
        language_code: "en",
        language_name: "English",
        limit: 4,
        exclude_top_domains: true,
      },
    ];

    // Make the request to DataForSEO
    const response = await makeRequest(
      "/dataforseo_labs/google/competitors_domain/live",
      "POST",
      data
    );

    console.log("Competitor data response:", response.tasks);

    return processCompetitorData(response, domain);
  } catch (error) {
    console.error("Error getting competitor data:", error);
    throw error;
  }
}

/**
 * Process competitor data from DataForSEO response
 */
function processCompetitorData(response: any, domain: string) {
  try {
    const allCompetitors: any[] = [];

    // Normalize the user's domain by removing protocol and trailing slash
    const normalizedUserDomain = domain
      .replace(/^(https?:\/\/)?(www\.)?/i, "")
      .replace(/\/$/, "");

    if (response.tasks && Array.isArray(response.tasks)) {
      for (const task of response.tasks) {
        if (task.result && Array.isArray(task.result)) {
          for (const result of task.result) {
            if (result.items && Array.isArray(result.items)) {
              for (const competitor of result.items) {
                // Normalize the competitor domain
                const normalizedCompetitorDomain = competitor.domain
                  .replace(/^(https?:\/\/)?(www\.)?/i, "")
                  .replace(/\/$/, "");

                // Skip if this is the user's own domain
                if (normalizedCompetitorDomain === normalizedUserDomain) {
                  continue;
                }

                allCompetitors.push({
                  name: competitor.domain,
                  url: `https://${competitor.domain}`,
                  source: "DataForSEO",
                  organicTraffic: competitor.metrics?.organic?.traffic || 0,
                  keywordCount: competitor.metrics?.organic?.keywords || 0,
                  domainAuthority: competitor.metrics?.domain_rank || 0,
                });
              }
            }
          }
        }
      }
    }

    // If no competitors were found, generate mock data
    if (allCompetitors.length === 0) {
      throw new Error("No competitors found for the domain");
    }

    // Return top 3 competitors
    return allCompetitors.slice(0, 3);
  } catch (error) {
    console.error("Error processing competitor data:", error);
    throw error;
  }
}

/**
 * Get local competitors using Google Maps data via DataForSEO
 */
export async function getLocalCompetitors(
  businessType: string,
  location: string,
  businessUrl?: string,
  locationCode?: number
) {
  try {
    // Prepare the request data
    const data = [
      {
        keyword: `${businessType} in ${location}`,
        location_code: locationCode,
        language_code: "en",
      },
    ];

    // Make the request to DataForSEO
    const response = await makeRequest(
      "/serp/google/maps/live/advanced",
      "POST",
      data
    );

    console.log("Local competitors response:", response.tasks);

    return processLocalCompetitorData(
      response,
      businessType,
      location,
      businessUrl
    );
  } catch (error) {
    console.error("Error getting local competitors:", error);
    throw error;
  }
}

/**
 * Process local competitor data from DataForSEO response
 */
function processLocalCompetitorData(
  response: any,
  businessType: string,
  location: string,
  businessUrl?: string
) {
  try {
    const allCompetitors: any[] = [];

    // Normalize the businessUrl by removing trailing slash if present
    const normalizedBusinessUrl = businessUrl
      ? businessUrl.replace(/\/$/, "")
      : undefined;

    if (response.tasks && Array.isArray(response.tasks)) {
      for (const task of response.tasks) {
        if (task.result && Array.isArray(task.result)) {
          for (const result of task.result) {
            if (result.items && Array.isArray(result.items)) {
              // Get local businesses from the results
              for (const item of result.items) {
                // Skip competitors that don't have a website URL
                if (!item.url || item.url.trim() === "") {
                  continue;
                }

                // Normalize the competitor URL by removing trailing slash if present
                const normalizedItemUrl = item.url.replace(/\/$/, "");

                // Skip the user's own business if the normalized URLs match
                if (
                  normalizedBusinessUrl &&
                  normalizedItemUrl === normalizedBusinessUrl
                ) {
                  continue;
                }

                allCompetitors.push({
                  name: item.title,
                  url: item.url,
                  source: "Google Maps",
                  rating: item.rating?.value || 0,
                  reviewCount: item.rating?.votes_count || 0,
                  address: item.address || "",
                });
              }
            }
          }
        }
      }
    }
    // If no competitors were found, generate mock data
    if (allCompetitors.length === 0) {
      throw new Error("No local competitors found");
    }

    return {
      searchTerm: `${businessType} in ${location}`,
      competitors: allCompetitors.slice(0, 3), // Ensures only 3 competitors are returned
    };
  } catch (error) {
    console.error("Error processing local competitor data:", error);
    throw error;
  }
}

/**
 * Get domain rankings for multiple domains and keywords in a single batch of requests
 */
export async function getDomainRankings(
  domains: string[],
  keywords: string[],
  location: string,
  locationCode: number
) {
  try {
    // Split keywords into batches of 50 (DataForSEO's limit)
    const batchSize = 50; // Reduce batch size to avoid overloading the API
    const keywordBatches = [];

    for (let i = 0; i < keywords.length; i += batchSize) {
      keywordBatches.push(keywords.slice(i, i + batchSize));
    }

    // Process each batch
    const domainRankings: Record<string, Record<string, number | null>> = {};

    // Initialize rankings object for each domain
    domains.forEach((domain) => {
      domainRankings[domain] = {};
    });

    for (const batch of keywordBatches) {
      try {
        // Prepare the request data for task_post - no target domain needed
        const data = batch.map((keyword) => ({
          keyword,
          location_code: locationCode,
          language_code: "en",
          depth: 100, // Get top 100 results
          priority: 2,
        }));

        // Submit tasks
        console.log(
          `Submitting batch of ${batch.length} keywords to DataForSEO SERP API using location code: ${locationCode}`
        );
        const postResponse = await makeRequest(
          "/serp/google/organic/task_post",
          "POST",
          data
        );

        if (!postResponse.tasks || !postResponse.tasks.length) {
          console.warn("No tasks were created for SERP data");
          continue;
        }

        // Extract task IDs
        const taskIds = postResponse.tasks.map((task: any) => task.id);

        console.log(
          `Created ${taskIds.length} SERP tasks, waiting for completion...`
        );

        // Poll for results using the improved polling function
        const taskResults = await pollForResults(taskIds, 20, 10000, "serp");
        console.log(
          `Received results for ${taskResults.length} out of ${taskIds.length} SERP tasks`
        );

        // Process the results for all domains at once
        for (const task of taskResults) {
          if (task.result && Array.isArray(task.result)) {
            for (const result of task.result) {
              const keyword = result.keyword;

              // Initialize this keyword for all domains
              domains.forEach((domain) => {
                domainRankings[domain][keyword] = null;
              });

              // Find all domains in the organic results
              if (result.items && Array.isArray(result.items)) {
                for (const item of result.items) {
                  if (item.type === "organic") {
                    // Check if this result matches any of our domains
                    for (const domain of domains) {
                      if (item.domain === domain || item.url.includes(domain)) {
                        domainRankings[domain][keyword] = item.rank_absolute;
                        break; // Found this domain, move to next item
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(
          `Error processing batch of keywords: ${batch.join(", ")}`,
          error
        );
        // Continue with next batch even if this one fails
      }
    }

    // Ensure all keywords are accounted for
    domains.forEach((domain) => {
      keywords.forEach((keyword) => {
        if (!(keyword in domainRankings[domain])) {
          domainRankings[domain][keyword] = null;
        }
      });
    });

    return domainRankings;
  } catch (error) {
    console.error("Error getting domain rankings:", error);

    throw new Error(
      `Failed to get domain rankings: ${(error as Error).message}`
    );
  }
}

/**
 * Filter irrelevant keywords using AI before performing detailed keyword analysis
 */
async function filterIrrelevantKeywords(
  keywords: string[],
  businessType: string,
  clientUrl: string,
  analysisScope: "local" | "national",
  location: string
): Promise<string[]> {
  try {
    console.log(`Filtering ${keywords.length} keywords for relevance...`);

    // Extract domain name for context
    const clientDomain = getDomainFromUrl(clientUrl);
    const businessName = clientDomain.split(".")[0];

    // Process all keywords in a single API call
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI specializing in SEO keyword relevance analysis for ${businessType} businesses. Your task is to filter out irrelevant keywords that would contaminate an SEO report.

CONTEXT:
- Business type: ${businessType}
- Business domain: ${clientDomain}
- Business name: ${businessName}
- Location focus: ${
            analysisScope === "local" ? location : "National (United States)"
          }

TASK: Analyze each keyword in the provided list and determine if it is relevant to this specific business type and scope. Return ONLY the relevant keywords as a JSON array.

RELEVANCE CRITERIA:
1. MUST be related to products/services this business type typically offers
2. MUST have commercial or informational intent related to this business
3. MUST NOT be related to:
   - Jobs/careers at this type of business
   - Competing businesses (unless specifically comparing with this business type)
   - Internal business operations unrelated to customer needs
   - Brand names unrelated to this business
   - Similar-sounding but unrelated concepts
   - Irrelevant locations (for local businesses)

INSTRUCTIONS:
- Analyze each keyword in the JSON array
- Return ONLY a JSON array of strings containing relevant keywords
- Do not include any explanation, just the filtered JSON array
- Return the array in exactly this format: {"keywords": ["keyword1", "keyword2", ...]}
- When in doubt about relevance, include the keyword (err on inclusion)`,
        },
        {
          role: "user",
          content: `Here's the list of keywords to filter for a ${businessType} business${
            analysisScope === "local" ? ` in ${location}` : " (national scope)"
          }. Return only the relevant keywords as a valid JSON array.

${JSON.stringify(keywords)}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    try {
      const content = response.choices[0]?.message?.content || "{}";
      const parsedResponse = JSON.parse(content);
      const filteredKeywords = parsedResponse.keywords || [];

      console.log(
        `Filtered ${
          keywords.length - filteredKeywords.length
        } irrelevant keywords. ${filteredKeywords.length} keywords remain.`
      );
      return filteredKeywords;
    } catch (e) {
      console.error("Error parsing AI response:", e);
      // If parsing fails, be conservative and return the original keywords
      return keywords;
    }
  } catch (error) {
    console.error("Error filtering keywords:", error);
    // On error, return original keywords to avoid data loss
    return keywords;
  }
}

/**
 * Fetch keyword data for a client and competitors
 */
export async function fetchKeywordData(
  clientUrl: string,
  competitorUrls: string[],
  keywords: string[],
  analysisScope: "local" | "national" = "local",
  location = "United States",
  locationCode: number,
  businessType: string // Added businessType parameter
) {
  try {
    // If analysis scope is national, use US location code
    if (analysisScope === "national") {
      locationCode = 2840; // US location code
      console.log("Using US location code (2840) for national analysis");
    }
    console.log(`Fetching keyword data from DataForSEO for ${clientUrl}`);
    console.log(`Analysis scope: ${analysisScope}`);
    console.log(
      `Using location: ${location}${
        locationCode ? ` (code: ${locationCode})` : ""
      }`
    );

    // Get domain from URL
    const clientDomain = getDomainFromUrl(clientUrl);

    // Get competitor domains
    const competitorDomains = competitorUrls.map((url) =>
      getDomainFromUrl(url)
    );
    const competitors = competitorUrls.map((url) => ({
      url,
      name: getDomainFromUrl(url),
    }));

    console.log(
      `Fetching ranked keywords for ${competitorUrls.length} competitors...`
    );

    // 1. Get ranked keywords for competitors only (not for client domain)
    const competitorRankedKeywordsPromises = competitorDomains.map((domain) =>
      getRankedKeywords(domain, location, 30)
    );

    const competitorRankedKeywordsResults = await Promise.all(
      competitorRankedKeywordsPromises
    );

    console.log("Ranked keywords fetched successfully");

    // Flatten and deduplicate competitor ranked keywords
    const allRankedKeywords = new Map();
    competitorRankedKeywordsResults.forEach((rankedKeywords) => {
      rankedKeywords.forEach((kw: any) => {
        if (!allRankedKeywords.has(kw.keyword)) {
          allRankedKeywords.set(kw.keyword, kw);
        }
      });
    });

    console.log(`all ranked keywords`, allRankedKeywords);

    // Combine our generated keywords with competitor ranked keywords
    const allKeywords = [
      ...new Set([...keywords, ...Array.from(allRankedKeywords.keys())]),
    ];

    console.log(`Total keywords for analysis: ${allKeywords}`);

    console.log(`Combined keywords for analysis: ${allKeywords.length}`);

    // Filter the irrelevant keywords from the list before getting the keyword data
    const filteredKeywords = await filterIrrelevantKeywords(
      allKeywords,
      businessType,
      clientUrl,
      analysisScope,
      location
    );

    // const clientRankedKeywords = await getRankedKeywords(
    //   clientDomain,
    //   location,
    //   100
    // );

    // console.log("client Ranked keywords, ", clientRankedKeywords);
    // const clientRankedKeywordsArray = clientRankedKeywords.map(
    //   (k) => k.keyword
    // );

    // 2. Get keyword data for all keywords (now filtered)
    const keywordData = await getKeywordData(
      [...filteredKeywords],
      location,
      "en",
      locationCode
    );

    console.log("keyword data: ", keywordData);

    // 3. Filter out keywords with zero search volume
    const keywordsWithSearchVolume = keywordData.filter(
      (kw) => kw.searchVolume > 0
    );
    console.log(
      `Filtered out ${
        keywordData.length - keywordsWithSearchVolume.length
      } keywords with zero search volume`
    );

    // 4. Sort keywords by search volume and take only the top 50
    keywordsWithSearchVolume.sort(
      (a, b) => (b.searchVolume || 0) - (a.searchVolume || 0)
    );
    const top50Keywords = keywordsWithSearchVolume
      .slice(0, 50)
      .map((kw) => kw.keyword);

    console.log(
      `Selected top ${top50Keywords.length} keywords by search volume for ranking analysis`
    );

    // 5. Get rankings for all domains (client + competitors) but only for top 50 keywords
    const allDomains = [clientDomain, ...competitorDomains];
    const rankingsForTop50 = await getDomainRankings(
      allDomains,
      top50Keywords,
      location,
      locationCode
    );
    console.log("Rankings fetched for all domains successfully (top keywords)");

    // 6. Combine all data - FIXED: Use keywordsWithSearchVolume instead of filteredKeywords
    const combinedKeywordData = keywordsWithSearchVolume
      .map((keywordDataItem) => {
        const keyword = keywordDataItem.keyword;

        // Check if we have data from ranked keywords
        const rankedData = allRankedKeywords.get(keyword);

        // Get client rank for this keyword (only if it's in top 50, otherwise null)
        const clientRank = top50Keywords.includes(keyword)
          ? rankingsForTop50[clientDomain][keyword]
          : null;

        // Get competitor ranks for this keyword (only if it's in top 50, otherwise null)
        const competitorRanks: Record<string, number | null> = {};
        competitorUrls.forEach((url, i) => {
          const domain = competitorDomains[i];
          competitorRanks[url] = top50Keywords.includes(keyword)
            ? rankingsForTop50[domain][keyword]
            : null;
        });

        // Use the best data available - prioritize keywordDataItem since it's already filtered
        const searchVolume =
          keywordDataItem.searchVolume || rankedData?.searchVolume || 0;
        const cpc = keywordDataItem.cpc || rankedData?.cpc || "0.00";

        return {
          keyword,
          searchVolume,
          clientRank,
          competitorRanks,
        };
      })
      .filter((kw) => kw.searchVolume > 0); // Extra safety filter

    console.log(
      `Final keyword data contains ${combinedKeywordData.length} keywords with search volume > 0`
    );

    // Sort keywords by search volume (highest first)
    combinedKeywordData.sort((a, b) => b.searchVolume - a.searchVolume);

    return {
      clientUrl,
      competitors,
      keywordData: combinedKeywordData,
      analysisScope,
    };
  } catch (error) {
    console.error("Error fetching data from DataForSEO:", error);
    throw new Error(`Failed to fetch keyword data: ${error}`);
  }
}

/**
 * Fetch national competitors from DataForSEO
 */
export async function fetchNationalCompetitors(
  businessType: string,
  clientUrl?: string
) {
  try {
    console.log(
      `Fetching national competitors for ${businessType} and ${clientUrl}`
    );

    if (clientUrl) {
      // Get domain from URL
      const clientDomain = getDomainFromUrl(clientUrl);

      // Get competitor data from DataForSEO
      return await getCompetitorData(clientDomain, "United States");
    } else {
      throw new Error("Client URL is required to fetch national competitors");
    }
  } catch (error) {
    console.error("Error fetching national competitors:", error);
    throw new Error(
      `Failed to fetch national competitors: ${(error as Error).message}`
    );
  }
}

/**
 * Fetch local competitors from DataForSEO
 */
export async function fetchLocalCompetitors(
  businessType: string,
  location: string,
  businessUrl?: string,
  locationCode?: number
) {
  try {
    console.log(
      `Fetching local competitors for ${businessType} in ${location}`
    );

    // Get local competitor data from DataForSEO
    return await getLocalCompetitors(
      businessType,
      location,
      businessUrl,
      locationCode
    );
  } catch (error) {
    console.error("Error fetching local competitors:", error);
    throw new Error(
      `Failed to fetch local competitors: ${(error as Error).message}`
    );
  }
}

/**
 * Extract domain name from URL
 */
function getDomainFromUrl(url: string) {
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, "");
  } catch (error) {
    return url;
  }
}
