import mongoose, { Schema, type Document, type Model } from "mongoose";

// Define interfaces for the schema
export interface ILead extends Document {
  email: string;
  reportId: mongoose.Types.ObjectId;
  createdAt: Date;
  source: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}

// Define the schema
const LeadSchema = new Schema<ILead>(
  {
    email: { type: String, required: true },
    reportId: { type: Schema.Types.ObjectId, ref: "Report", required: true },
    createdAt: { type: Date, default: Date.now },
    source: { type: String, default: "website" },
    ipAddress: { type: String },
    userAgent: { type: String },
    referrer: { type: String },
  },
  {
    timestamps: true,
  }
);

// Create indexes
LeadSchema.index({ email: 1 });
LeadSchema.index({ createdAt: 1 });
LeadSchema.index({ reportId: 1 });

// Create and export the model
let Lead: Model<ILead>;

// Check if the model already exists to prevent OverwriteModelError
if (mongoose.models.Lead) {
  Lead = mongoose.model<ILead>("Lead");
} else {
  Lead = mongoose.model<ILead>("Lead", LeadSchema);
}

export default Lead;
