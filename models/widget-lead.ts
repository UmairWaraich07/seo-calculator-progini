import mongoose, { Schema, type Document, type Model } from "mongoose";

// Define interfaces for the schema
export interface IWidgetLead extends Document {
  agencyId: string;
  formData: {
    businessUrl: string;
    businessType: string;
    location: string;
    customerValue: string;
    competitorType: "manual" | "auto";
    analysisScope: "local" | "national";
    competitors: string[];
    email: string;
  };
  reportId: string;
  referrer: string;
  timestamp: Date;
  status: "new" | "email_sent" | "email_failed";
  emailSentAt?: Date;
  emailId?: string;
  emailError?: string;
}

// Define the schema
const WidgetLeadSchema = new Schema<IWidgetLead>(
  {
    agencyId: { type: String, required: true },
    formData: {
      businessUrl: { type: String, required: true },
      businessType: { type: String, required: true },
      location: { type: String, required: true },
      customerValue: { type: String, required: true },
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
      competitors: [{ type: String }],
      email: { type: String, required: true },
    },
    reportId: { type: String },
    referrer: { type: String },
    timestamp: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["new", "email_sent", "email_failed"],
      default: "new",
    },
    emailSentAt: { type: Date },
    emailId: { type: String },
    emailError: { type: String },
  },
  {
    timestamps: true,
  }
);

// Create indexes
WidgetLeadSchema.index({ timestamp: 1 });
WidgetLeadSchema.index({ agencyId: 1 });
WidgetLeadSchema.index({ "formData.email": 1 });
WidgetLeadSchema.index({ status: 1 });

// Create and export the model
let WidgetLead: Model<IWidgetLead>;

// Check if the model already exists to prevent OverwriteModelError
if (mongoose.models.WidgetLead) {
  WidgetLead = mongoose.model<IWidgetLead>("WidgetLead");
} else {
  WidgetLead = mongoose.model<IWidgetLead>("WidgetLead", WidgetLeadSchema);
}

export default WidgetLead;
