import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

type AnalysisScope = "local" | "national";

export async function generateKeywords(
  businessType: string,
  location: string,
  analysisScope: AnalysisScope = "local"
) {
  try {
    console.log(
      `Generating keywords for ${businessType} in ${location} (${analysisScope} scope)`
    );

    // Generate keywords using AI
    const aiKeywords = await generateAIBasedKeywords(
      businessType,
      location,
      analysisScope
    );

    // If AI generation fails or returns too few keywords, fall back to base keywords
    if (aiKeywords.length < 10) {
      console.log(
        "AI keyword generation returned insufficient results, using fallback method"
      );
      return getFallbackKeywords(businessType, location, analysisScope);
    }

    console.log(`Generated ${aiKeywords.length} keywords using AI`);
    return aiKeywords;
  } catch (error) {
    console.error("Error generating keywords:", error);
    // Fallback to base keywords if AI generation fails
    return getFallbackKeywords(businessType, location, analysisScope);
  }
}

async function generateAIBasedKeywords(
  businessType: string,
  location: string,
  scope: AnalysisScope
): Promise<string[]> {
  try {
    // Generate keywords using AI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert SEO keyword researcher specializing in generating high-value, conversion-focused keywords for local and national businesses. Your output will be used directly in an SEO opportunity calculator that analyzes ranking potential and revenue impact.

TASK: Generate exactly 50 high-performing SEO keywords specific to the business type and location provided. Focus on keywords with commercial intent that potential customers would use when looking to purchase products/services.

OUTPUT REQUIREMENTS:
- Provide ONLY a comma-separated list of keywords without any additional text, explanations, or formatting
- Format each keyword in lowercase with proper spacing (e.g., "roof repair chicago", not "RoofRepairChicago")
- Include a strategic mix of keyword types:
  • 20 high-intent buyer keywords (e.g., "hire [service] in [location]", "best [service] company [location]")
  • 15 problem-solution keywords (e.g., "fix leaking roof [location]", "[location] emergency [service]")
  • 10 comparison keywords (e.g., "affordable [service] [location]", "[service] cost [location]")
  • 5 informational keywords that often lead to conversions (e.g., "how to choose [service] in [location]")
- For local analysis: Include location modifiers in 80% of keywords (e.g., "[service] in [neighborhood]", "[location] [service] near me")
- For national analysis: Include broader terms with industry-specific qualifiers
- Include a mix of 2-5 word phrases (prioritize 3-word phrases as they typically have the best conversion/volume balance)
- Avoid keyword stuffing or overly generic terms
- Each keyword must be between 3-60 characters
- Focus on keywords with clear commercial intent that would have reasonable search volume
- Ensure keywords are diverse and cover different aspects of the business's offerings`,
        },
        {
          role: "user",
          content: `Generate 50 high-converting SEO keywords for a ${businessType} business ${
            scope === "local" ? `in ${location}` : "across the United States"
          }. Focus on keywords that potential customers would use when ready to make a purchase or hire this service.`,
        },
      ],
      temperature: 0.5, // Slightly lower temperature for more focused results with increased keyword count
    });

    const content = response.choices[0]?.message?.content;
    return content ? parseAIKeywords(content) : [];
  } catch (error) {
    console.error("AI keyword generation failed:", error);
    return [];
  }
}

function parseAIKeywords(rawText: string): string[] {
  return rawText
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 2 && k.length < 60);
}

function createLocationPatterns(
  businessType: string,
  locations: string[]
): string[] {
  const serviceForms = [
    businessType,
    `${businessType} services`,
    `${businessType} company`,
    `${businessType} near me`,
    `best ${businessType}`,
    `affordable ${businessType}`,
  ];

  const patterns: string[] = [];

  for (const service of serviceForms) {
    for (const location of locations) {
      patterns.push(`${service} ${location}`);
      patterns.push(`${location} ${service}`);
    }
  }

  return patterns;
}

/**
 * Get fallback keywords if AI generation fails
 */
function getFallbackKeywords(
  businessType: string,
  location: string,
  analysisScope: AnalysisScope
): string[] {
  // Sample base keywords for common business types
  const keywordMap: Record<string, string[]> = {
    roofing: [
      "roof repair",
      "roof replacement",
      "roofing company",
      "roofing contractor",
      "roof installation",
      "roof inspection",
      "metal roofing",
      "shingle roof",
      "commercial roofing",
      "residential roofing",
    ],
    plumbing: [
      "plumber",
      "plumbing services",
      "plumbing repair",
      "emergency plumber",
      "water heater installation",
      "drain cleaning",
      "pipe repair",
      "bathroom plumbing",
      "kitchen plumbing",
      "commercial plumbing",
    ],
    "home improvement": [
      "home renovation",
      "kitchen remodeling",
      "bathroom remodeling",
      "home remodeling",
      "home addition",
      "basement finishing",
      "deck building",
      "interior painting",
      "exterior painting",
      "flooring installation",
    ],
    dental: [
      "dentist",
      "dental clinic",
      "dental care",
      "teeth cleaning",
      "tooth extraction",
      "dental implants",
      "cosmetic dentistry",
      "emergency dentist",
      "family dentist",
      "pediatric dentist",
    ],
    legal: [
      "lawyer",
      "attorney",
      "law firm",
      "legal services",
      "personal injury lawyer",
      "family lawyer",
      "criminal defense attorney",
      "divorce lawyer",
      "estate planning",
      "business lawyer",
    ],
    // Add more business types as needed
  };

  // Get base keywords for the business type
  const lowerBusinessType = businessType.toLowerCase();
  let baseKeywords: string[] = [];

  // Check if we have an exact match
  if (keywordMap[lowerBusinessType]) {
    baseKeywords = keywordMap[lowerBusinessType];
  } else {
    // Check if we have a partial match
    for (const key of Object.keys(keywordMap)) {
      if (lowerBusinessType.includes(key)) {
        baseKeywords = keywordMap[key];
        break;
      }
    }

    // If still no match, use generic keywords
    if (baseKeywords.length === 0) {
      baseKeywords = [
        `${businessType} services`,
        `${businessType} company`,
        `${businessType} near me`,
        `best ${businessType}`,
        `affordable ${businessType}`,
        `local ${businessType}`,
        `${businessType} prices`,
        `${businessType} cost`,
        `${businessType} quotes`,
        `professional ${businessType}`,
      ];
    }
  }

  // For national analysis, we'll use fewer location-specific keywords
  const locationModifiers =
    analysisScope === "local"
      ? [
          `in ${location}`,
          `${location}`,
          "near me",
          `best in ${location}`,
          `top rated ${location}`,
          `affordable in ${location}`,
          `${location} area`,
        ]
      : [
          "",
          "in USA",
          "nationwide",
          "best in America",
          "top rated",
          "professional",
          "affordable",
          "near me",
          "online",
        ];

  const keywords: string[] = [];

  // Combine base keywords with location modifiers
  for (const base of baseKeywords) {
    for (const modifier of locationModifiers) {
      if (modifier) {
        keywords.push(`${base} ${modifier}`);
      } else {
        // Also add some without location for broader terms
        keywords.push(base);
      }
    }
  }

  // Add some long-tail variations
  const longTailPrefixes = [
    "best",
    "top",
    "affordable",
    "professional",
    "experienced",
    "trusted",
    "licensed",
    "emergency",
  ];

  // For national analysis, add more generic prefixes
  if (analysisScope === "national") {
    longTailPrefixes.push("nationwide", "online", "remote", "USA", "American");
  }

  for (const prefix of longTailPrefixes) {
    for (const base of baseKeywords.slice(0, 3)) {
      // Use just the top few base keywords
      if (analysisScope === "local") {
        keywords.push(`${prefix} ${base} in ${location}`);
      } else {
        // For national, use fewer location variants
        keywords.push(`${prefix} ${base}`);
        if (
          prefix !== "nationwide" &&
          prefix !== "online" &&
          prefix !== "USA"
        ) {
          keywords.push(`${prefix} ${base} in USA`);
        }
      }
    }
  }

  // Add analysis-specific keywords
  if (analysisScope === "local") {
    // Add more local-specific keywords
    keywords.push(
      `${businessType} near me`,
      `best ${businessType} in ${location}`,
      `${location} ${businessType} company`,
      `${businessType} services ${location}`,
      `local ${businessType} ${location}`,
      `${businessType} contractor ${location}`
    );
  } else {
    // Add more national-specific keywords
    keywords.push(
      `${businessType} company USA`,
      `nationwide ${businessType} services`,
      `best ${businessType} company in America`,
      `top rated ${businessType} services`,
      `professional ${businessType} nationwide`,
      `${businessType} franchise opportunities`
    );
  }

  // Deduplicate and return
  return [...new Set(keywords)].slice(0, 50); // Limit to 50 keywords
}
