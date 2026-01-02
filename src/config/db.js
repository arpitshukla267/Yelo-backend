const mongoose = require("mongoose")

const connectDB = async () => {
  // Get MongoDB URI from environment variables
  let mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI
  
  if (!mongoUri) {
    throw new Error(
      "MongoDB connection string is missing. Please set MONGODB_URI or MONGO_URI environment variable in Render."
    )
  }
  
  // Trim whitespace
  mongoUri = mongoUri.trim()
  
  // Validate connection string format
  if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
    // Log first 20 chars for debugging (without exposing full connection string)
    const preview = mongoUri.substring(0, 20) + (mongoUri.length > 20 ? "..." : "")
    throw new Error(
      `Invalid MongoDB connection string format. Expected to start with "mongodb://" or "mongodb+srv://". ` +
      `Received: "${preview}" (length: ${mongoUri.length}). ` +
      `Please check your MONGODB_URI environment variable in Render.`
    )
  }
  
  try {
    await mongoose.connect(mongoUri)
    console.log("✅ MongoDB connected successfully")
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message)
    throw error
  }
}

module.exports = connectDB
