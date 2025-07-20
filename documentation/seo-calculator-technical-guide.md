# SEO Opportunity Calculator: Technical Documentation

This document provides a detailed explanation of how the SEO Opportunity Calculator works, including the specific APIs used, data processing methods, and the step-by-step workflow.

## Table of Contents

1. [System Overview](#system-overview)
2. [Step 1: Business Information Collection](#step-1-business-information-collection)
3. [Step 2: Keyword Generation](#step-2-keyword-generation)
4. [Step 3: Competitor Analysis](#step-3-competitor-analysis)
5. [Step 4: Keyword Data Collection](#step-4-keyword-data-collection)
6. [Step 5: Ranking Analysis](#step-5-ranking-analysis)
7. [Step 6: Opportunity Calculation](#step-6-opportunity-calculation)
8. [Step 7: Report Generation](#step-7-report-generation)
9. [Step 8: Email Delivery](#step-8-email-delivery)
10. [Data Storage Architecture](#data-storage-architecture)
11. [Widget Integration](#widget-integration)
12. [API Reference](#api-reference)

## System Overview

The SEO Opportunity Calculator is a multi-step process that analyzes a business's current SEO performance, identifies opportunities for improvement, and calculates the potential revenue impact of higher rankings. The system uses several external APIs to gather data and performs complex calculations to generate actionable insights.

## Step 1: Business Information Collection

**What happens:**

- Users provide their website URL, business type, location, and average customer value
- Users select between local or national analysis scope
- Users choose whether to automatically detect competitors or enter them manually

**Technical details:**

- The form data is validated using Zod schema validation
- Location data is enriched using the DataForSEO Locations API
- For national analysis, the location is set to "United States" with location code 2840
- For local analysis, we capture both state and city information with corresponding location codes

**APIs used:**

- **DataForSEO Locations API** (`/api/locations`): Provides standardized location codes that are used in subsequent API calls
  - Endpoint: `https://api.dataforseo.com/v3/serp/google/locations`
  - Purpose: Maps user-friendly location names to location codes required by search APIs

## Step 2: Keyword Generation

**What happens:**

- We generate a comprehensive list of relevant keywords based on the business type and location
- For local analysis, we include location-specific modifiers (e.g., "near me", city names)
- For national analysis, we focus on broader industry terms
- We use AI to generate high-converting, commercially-focused keywords

**Technical details:**

- Keywords are generated using OpenAI's GPT-4o model, which provides several advantages:

  1. **AI-powered keyword research**: Uses advanced language models to generate highly relevant keywords
  2. **Commercial intent focus**: Prioritizes keywords that potential customers use when ready to make a purchase
  3. **Strategic keyword mix**: Includes high-intent buyer keywords, problem-solution keywords, comparison keywords, and informational keywords that lead to conversions
  4. **Location-aware generation**: Adapts keywords based on whether it's a local or national analysis

- If AI generation fails, we fall back to a template-based approach:
  1. **Business-specific keyword templates**: Pre-defined keyword patterns based on business type
  2. **Location variants**: Different ways to express the location (city, state, "near me", etc.)
  3. **Long-tail variations**: Adding modifiers like "best", "affordable", "professional", etc.

**APIs used:**

- **OpenAI API** (`GPT-4o model`): Generates commercially-focused keywords based on business type and location
  - Function: `generateAIBasedKeywords(businessType, location, analysisScope)`
  - Input: Business type, location, and analysis scope
  - Output: Array of 40 high-converting keywords
- **Internal keyword generation logic** (`/lib/keywords.ts`): Fallback method if AI generation fails
  - Function: `getFallbackKeywords(businessType, location, analysisScope)`
  - Output: Array of up to 50 relevant keywords

## Step 3: Competitor Analysis

**What happens:**

- If auto-detection is selected, we identify top competitors in the user's market
- For local analysis, we find nearby businesses in the same category
- For national analysis, we find industry leaders across the country

**Technical details:**

- Local competitors are identified using Google Maps data via DataForSEO
- National competitors are identified using organic search data via DataForSEO
- We collect competitor URLs, names, and additional metadata (ratings, review counts, etc.)

**APIs used:**

- **DataForSEO Maps API** (for local competitors):
  - Endpoint: `https://api.dataforseo.com/v3/maps/google/live/advanced`
  - Input: Business type + location (e.g., "plumbers in Chicago, IL")
  - Output: Top local businesses from Google Maps results
- **DataForSEO Domain Analytics API** (for national competitors):
  - Endpoint: `https://api.dataforseo.com/v3/domain_analytics/competitors/live`
  - Input: Client's domain name
  - Output: Top competing domains based on keyword overlap and search visibility

## Step 4: Keyword Data Collection

**What happens:**

- We collect search volume data for all generated keywords
- We gather additional keyword metrics like CPC (cost-per-click) and competition
- We combine keywords from multiple sources to ensure comprehensive coverage
- We filter out irrelevant keywords and keywords with zero search volume

**Technical details:**

- We use the DataForSEO Google Ads API to get search volume data
- The process uses a task-based approach where we submit a task and then poll for results
- We implement retry logic and exponential backoff to handle API rate limits and delays
- We use AI to filter out irrelevant keywords that would contaminate the report
- We remove keywords with zero search volume to focus on actionable opportunities

**APIs used:**

- **OpenAI API** (`GPT-4o model`): Filters out irrelevant keywords based on business context

  - Function: `filterIrrelevantKeywords(keywords, businessType, clientUrl, analysisScope, location)`
  - Input: List of keywords, business type, client URL, analysis scope, and location
  - Output: Filtered list of relevant keywords

- **DataForSEO Google Ads API**:
  - Task creation endpoint: `https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/task_post`
  - Task retrieval endpoint: `https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/task_get/{taskId}`
  - Input: List of keywords and location code
  - Output: Search volume, CPC, and competition data for each keyword

**Keyword filtering process:**

1. Generate initial keywords using AI and competitor analysis
2. Filter out irrelevant keywords using AI-based relevance analysis
3. Collect search volume data for remaining keywords
4. Filter out keywords with zero search volume
5. Sort by search volume and select top keywords for ranking analysis

## Step 5: Ranking Analysis

**What happens:**

- We check current rankings for the user's website and competitors
- We analyze the top 100 search results for each keyword
- We identify ranking gaps and opportunities

**Technical details:**

- We use the DataForSEO SERP API to get ranking data
- Keywords are processed in batches to optimize API usage
- We track rankings for both the client's domain and all competitor domains
- For efficiency, we focus on the top keywords by search volume (after filtering)

**APIs used:**

- **DataForSEO SERP API**:
  - Task creation endpoint: `https://api.dataforseo.com/v3/serp/google/organic/task_post`
  - Task retrieval endpoint: `https://api.dataforseo.com/v3/serp/google/organic/task_get/advanced/{taskId}`
  - Input: Keywords, location code, and language code
  - Output: Complete search results including positions of client and competitor domains

## Step 6: Opportunity Calculation

**What happens:**

- We calculate potential traffic based on search volume and typical click-through rates
- We estimate conversion rates based on industry averages
- We calculate potential customers and revenue using the provided customer value
- We identify ranking gaps between the client's site and competitors

**Technical details:**

- Traffic potential is calculated using a position-based CTR model
- Conversion rates are determined based on business type and analysis scope
- Revenue potential is calculated as: Potential Traffic × Conversion Rate × Customer Value
- We generate analysis insights specific to local or national SEO

**Calculation methods:**

- **Traffic potential**: Search Volume × CTR (varies by ranking position)
  - Position 1: ~30-35% CTR
  - Positions 2-3: ~15-20% CTR
  - Positions 4-10: ~5-10% CTR
- **Conversion rate**: Based on industry benchmarks
  - Local businesses: Typically 3-5%
  - National businesses: Typically 1-3%
- **Revenue calculation**: Potential Traffic × Conversion Rate × Customer Value

## Step 7: Report Generation

**What happens:**

- We create a comprehensive report showing all analysis results
- The report includes executive summary, ranking overview, competitor comparison, and recommendations
- We format the data for both web display and email delivery

**Technical details:**

- Report data is structured into sections for easy consumption
- We generate specific recommendations based on the analysis findings
- The report is stored in MongoDB with a unique ID for future reference

**Data processing:**

- Current rankings are summarized into buckets (top 3, top 10, top 50, top 100)
- Competitor rankings are compared to identify competitive gaps
- Recommendations are generated based on ranking gaps and keyword opportunities

## Step 8: Email Delivery

**What happens:**

- Users enter their email address
- The report is formatted as an HTML email
- The email is sent using the Resend API

**Technical details:**

- The email template is generated using React components
- The email includes interactive elements and formatted data tables
- Delivery status is tracked and stored in the database

**APIs used:**

- **Resend API**:
  - Endpoint: Resend's email sending API
  - Input: Email address, subject, HTML content
  - Output: Delivery status and email ID

## Data Storage Architecture

**What happens:**

- All report data is stored in MongoDB
- Each report has a unique ID for future reference
- User information and report metadata are tracked

**Technical details:**

- We use Mongoose schemas to define data models
- Indexes are created for efficient querying
- The database structure includes collections for:
  - Reports: Stores complete report data
  - Leads: Tracks user information
  - WidgetLeads: Tracks leads generated through the widget

**Database models:**

- **Report**: Stores complete analysis data including keywords, rankings, and calculations
- **Lead**: Tracks user contact information and report access
- **WidgetLead**: Tracks leads generated through embedded widgets

## Widget Integration

**What happens:**

- The SEO calculator can be embedded on agency websites
- The widget collects the same information as the main calculator
- Leads generated through the widget are tracked back to the agency

**Technical details:**

- The widget is loaded via JavaScript
- It communicates with the main application via API endpoints
- Agency identification is passed through all requests

**Integration method:**

- Agencies add a simple script tag to their website
- The script loads the widget dynamically
- The widget UI matches the parent website's styling

## API Reference

### Internal APIs

1. **`/api/process-seo`**

   - Purpose: Main processing endpoint that orchestrates the entire analysis
   - Method: POST
   - Input: Business info, competitor info, session ID
   - Output: Report ID and success status

2. **`/api/detect-local-competitors`**

   - Purpose: Finds local competitors using Google Maps data
   - Method: POST
   - Input: Business type, location
   - Output: List of local competitors

3. **`/api/detect-national-competitors`**

   - Purpose: Finds national competitors using organic search data
   - Method: POST
   - Input: Business type, business URL
   - Output: List of national competitors

4. **`/api/send-report`**

   - Purpose: Sends the report via email
   - Method: POST
   - Input: Email address, report ID
   - Output: Email delivery status

5. **`/api/locations`**

   - Purpose: Provides location data for the location selector
   - Method: GET
   - Input: Optional state parameter for city lookup
   - Output: List of locations with codes

6. **`/api/process-progress`**

   - Purpose: Streams progress updates during report generation
   - Method: GET
   - Input: Session ID
   - Output: Event stream with progress updates

7. **`/api/widget`**

   - Purpose: Serves the embeddable widget JavaScript
   - Method: GET
   - Input: Agency ID and theme parameters
   - Output: JavaScript code for the widget

8. **`/api/widget-submit`**
   - Purpose: Processes submissions from the embedded widget
   - Method: POST
   - Input: Form data, agency ID, referrer
   - Output: Success status and report ID

### External APIs

1. **DataForSEO API**

   - Base URL: `https://api.dataforseo.com/v3`
   - Authentication: Basic auth with API credentials
   - Rate limits: Varies by endpoint and subscription
   - Key endpoints:
     - `/serp/google/locations`: Location data
     - `/keywords_data/google_ads/search_volume/task_post`: Keyword volume data
     - `/serp/google/organic/task_post`: Ranking data
     - `/maps/google/live/advanced`: Local business data
     - `/domain_analytics/competitors/live`: Competitor data

2. **Resend API**

   - Purpose: Email delivery
   - Authentication: API key
   - Features: Delivery tracking, HTML email support

3. **OpenAI API**
   - Purpose: AI-powered keyword generation and filtering
   - Authentication: API key
   - Models used: GPT-4o
   - Features: Keyword generation, relevance filtering

## Conclusion

The SEO Opportunity Calculator combines multiple data sources and sophisticated analysis techniques to provide actionable insights about SEO potential. By leveraging the DataForSEO API for comprehensive search data and implementing custom calculation methods, the system delivers accurate estimates of traffic and revenue potential from improved search rankings.
