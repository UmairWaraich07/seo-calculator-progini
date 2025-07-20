import mongoose, { Schema, type Document, type Model } from "mongoose";

// Define interfaces for the schema
export interface IBasicInfo {
  businessUrl: string;
  businessType: string;
  location: string;
  customerValue: number;
  competitorType: "manual" | "auto";
  analysisScope: "local" | "national";
}

export interface ICompetitorInfo {
  competitors: string[];
}

export interface IKeywordData {
  keyword: string;
  searchVolume: number;
  clientRank: number | null;
  competitorRanks: Record<string, number | null>;
  isLocal: boolean;
  hasLocalPack?: boolean;
  localIntent?: number;
  keywordDifficulty?: number;
  cpc?: string;
}

export interface ICompetitorRanking {
  name: string;
  url: string;
  top3: number;
  top10: number;
  top50: number;
  top100: number;
  source: string;
}

export interface ICurrentRankings {
  top3: number;
  top10: number;
  top50: number;
  top100: number;
  total: number;
}

export interface IAnalysisInsights {
  localPackOpportunities?: number;
  googleMapsRankingFactor?: string;
  nearMeSearches?: number;
  localCompetitorStrength?: string;
  competitiveDifficulty?: string;
  contentGaps?: number;
  backlinkOpportunities?: number;
  recommendedActions: string[];
}

export interface IReportData {
  totalSearchVolume: number;
  potentialTraffic: number;
  conversionRate: number;
  potentialCustomers: number;
  potentialRevenue: number;
  currentRankings: ICurrentRankings;
  competitorRankings: ICompetitorRanking[];
  analysisScope: "local" | "national";
  analysisInsights: IAnalysisInsights;
  keywordData: IKeywordData[];
}

export interface IReport extends Document {
  basicInfo: IBasicInfo;
  competitorInfo: ICompetitorInfo;
  keywords: string[];
  keywordData: {
    clientUrl: string;
    competitors: Array<{
      url: string;
      name: string;
      source: string;
    }>;
    keywordData: IKeywordData[];
    analysisScope: "local" | "national";
  };
  report: IReportData;
  createdAt: Date;
  emailSent: boolean;
  emailAddress?: string;
  emailSentAt?: Date;
  emailId?: string;
  source?: string;
  agencyId?: string;
  referrer?: string;
}

// Define the schema
const ReportSchema = new Schema<IReport>(
  {
    basicInfo: {
      businessUrl: { type: String, required: true },
      businessType: { type: String, required: true },
      location: { type: String, required: true },
      customerValue: { type: Number, required: true },
      competitorType: {
        type: String,
        enum: ["manual", "auto"],
        required: true,
      },
      analysisScope: {
        type: String,
        enum: ["local", "national"],
        required: true,
      },
    },
    competitorInfo: {
      competitors: [{ type: String }],
    },
    keywords: [{ type: String }],
    keywordData: {
      clientUrl: { type: String },
      competitors: [
        {
          url: { type: String },
          name: { type: String },
          source: { type: String },
        },
      ],
      keywordData: [
        {
          keyword: { type: String },
          searchVolume: { type: Number },
          clientRank: { type: Schema.Types.Mixed }, // Can be number or null
          // Change from Map to Object type for competitorRanks
          competitorRanks: { type: Object }, // Store as plain object instead of Map
          isLocal: { type: Boolean },
          hasLocalPack: { type: Boolean },
          localIntent: { type: Number },
          keywordDifficulty: { type: Number },
          cpc: { type: String },
        },
      ],
      analysisScope: { type: String, enum: ["local", "national"] },
    },
    report: {
      totalSearchVolume: { type: Number, required: true },
      potentialTraffic: { type: Number, required: true },
      conversionRate: { type: Number, required: true },
      potentialCustomers: { type: Number, required: true },
      potentialRevenue: { type: Number, required: true },
      currentRankings: {
        top3: { type: Number, required: true },
        top10: { type: Number, required: true },
        top50: { type: Number, required: true },
        top100: { type: Number, required: true },
        total: { type: Number, required: true },
      },
      competitorRankings: [
        {
          name: { type: String, required: true },
          url: { type: String, required: true },
          top3: { type: Number, required: true },
          top10: { type: Number, required: true },
          top50: { type: Number, required: true },
          top100: { type: Number, required: true },
          source: { type: String, required: true },
        },
      ],
      analysisScope: {
        type: String,
        enum: ["local", "national"],
        required: true,
      },
      analysisInsights: {
        localPackOpportunities: { type: Number },
        googleMapsRankingFactor: { type: String },
        nearMeSearches: { type: Number },
        localCompetitorStrength: { type: String },
        competitiveDifficulty: { type: String },
        contentGaps: { type: Number },
        backlinkOpportunities: { type: Number },
        recommendedActions: [{ type: String }],
      },
      keywordData: [
        {
          keyword: { type: String, required: true },
          searchVolume: { type: Number, required: true },
          clientRank: { type: Schema.Types.Mixed, required: true }, // Can be number, null, or "Not ranked"
          // Change from Map to Object type for competitorRanks
          competitorRanks: { type: Object }, // Store as plain object instead of Map
          isLocal: { type: Boolean, required: true },
        },
      ],
    },
    createdAt: { type: Date, default: Date.now },
    emailSent: { type: Boolean, default: false },
    emailAddress: { type: String },
    emailSentAt: { type: Date },
    emailId: { type: String },
    source: { type: String },
    agencyId: { type: String },
    referrer: { type: String },
  },
  {
    timestamps: true,
  }
);

// Create indexes
ReportSchema.index({ createdAt: 1 });
ReportSchema.index({ "basicInfo.businessUrl": 1 });
ReportSchema.index({ emailAddress: 1 });
ReportSchema.index({ agencyId: 1 });

// Create and export the model
let Report: Model<IReport>;

// Check if the model already exists to prevent OverwriteModelError
if (mongoose.models.Report) {
  Report = mongoose.model<IReport>("Report");
} else {
  Report = mongoose.model<IReport>("Report", ReportSchema);
}

export default Report;
