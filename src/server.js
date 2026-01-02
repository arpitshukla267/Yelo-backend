const app = require("./app")
const connectDB = require("./config/db")

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    // 1️⃣ Connect DB ONCE
    await connectDB()
    console.log("MongoDB connected")

    // 2️⃣ OPTIONAL: seed shops (only if SEED_SHOPS env var is set)
    if (process.env.SEED_SHOPS === "true") {
      try {
        const seedShops = require("./modules/shop/shop.seed")
        await seedShops()
        console.log("✅ Shops seeded successfully")
      } catch (seedError) {
        console.warn("⚠️ Shop seeding failed (non-critical):", seedError.message)
        // Don't crash the server if seeding fails
      }
    }

    // 3️⃣ Start server AFTER DB is ready
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error("Server startup failed:", err)
    process.exit(1)
  }
}

startServer()
