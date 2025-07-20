import mongoose from "mongoose";
import { MongoClient, type Db } from "mongodb";

// Import models
import Report from "@/models/report";
import Lead from "@/models/lead";
import WidgetLead from "@/models/widget-lead";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/seo-calculator";
const MONGODB_DB = process.env.MONGODB_DB || "seo-calculator";

// Cache the MongoDB connection to reuse it across requests
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let isConnected = false;

/**
 * Connect to MongoDB using Mongoose
 */
export async function connectToMongoose() {
  if (isConnected) {
    return;
  }

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("Connected to MongoDB with Mongoose");
  } catch (error) {
    console.error("Error connecting to MongoDB with Mongoose:", error);
    throw error;
  }
}

/**
 * Connect to MongoDB using the MongoDB client
 */
export async function connectToDatabase() {
  // If we have the cached connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // If no cached connection, create a new one
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  if (!MONGODB_DB) {
    throw new Error("Please define the MONGODB_DB environment variable");
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);

    // Cache the connection
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw new Error("Could not connect to database");
  }
}

// Define MongoDB collections
export const collections = {
  reports: "reports",
  leads: "leads",
  widgetLeads: "widget_leads",
};

// Create indexes for MongoDB collections
export async function createIndexes() {
  try {
    // Connect to MongoDB with Mongoose
    await connectToMongoose();

    // Ensure indexes are created for all models
    await Report.syncIndexes();
    await Lead.syncIndexes();
    await WidgetLead.syncIndexes();

    console.log("MongoDB indexes created successfully");
  } catch (error) {
    console.error("Error creating MongoDB indexes:", error);
  }
}

// Export models
export { Report, Lead, WidgetLead };
