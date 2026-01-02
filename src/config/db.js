const mongoose = require("mongoose")

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI
  
  if (!mongoUri) {
    throw new Error(
      "MongoDB connection string is missing. Please set MONGODB_URI or MONGO_URI environment variable."
    )
  }
  
  await mongoose.connect(mongoUri)
}

module.exports = connectDB
