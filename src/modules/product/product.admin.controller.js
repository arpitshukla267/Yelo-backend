const Product = require("./product.model")
const { assignProductToShops } = require("../assignment/assignment.service")
const { ensureCategory, updateCategoryCounts } = require("../category/category.service")
const seedShops = require("../shop/shop.seed")

async function deleteAllProducts(req, res) {
  try {
    const result = await Product.deleteMany({})
    res.json({ success: true, message: `Deleted ${result.deletedCount} products.` })
  } catch (error) {
    console.error("Error deleting all products:", error)
    res.status(500).json({ success: false, message: "Failed to delete all products." })
  }
}

async function deleteProductsByCriteria(req, res) {
  try {
    const criteria = req.body
    if (Object.keys(criteria).length === 0) {
      return res.status(400).json({ success: false, message: "Deletion criteria cannot be empty." })
    }
    const result = await Product.deleteMany(criteria)
    res.json({ success: true, message: `Deleted ${result.deletedCount} products matching criteria.`, criteria })
  } catch (error) {
    console.error("Error deleting products by criteria:", error)
    res.status(500).json({ success: false, message: "Failed to delete products by criteria." })
  }
}

// Seed shops (ensures all shops exist)
async function seedShopsEndpoint(req, res) {
  try {
    await seedShops()
    res.json({
      success: true,
      message: "Shops seeded successfully"
    })
  } catch (error) {
    console.error("Error seeding shops:", error)
    res.status(500).json({
      success: false,
      message: "Failed to seed shops.",
      error: error.message
    })
  }
}

// Reassign all products to shops and create categories
async function reassignAndSyncProducts(req, res) {
  try {
    // First ensure shops are seeded
    await seedShops()
    
    const products = await Product.find({ isActive: true })
    let assignedCount = 0
    let categoryCount = 0
    const assignmentDetails = []

    for (const product of products) {
      try {
        // Reassign to shops
        const assignedShops = await assignProductToShops(product)
        assignedCount++
        
        if (assignedShops.length > 0) {
          assignmentDetails.push({
            productId: product._id,
            productName: product.name,
            shops: assignedShops
          })
        }

        // Create category if it doesn't exist
        if (product.category) {
          const majorCategory = product.majorCategory || (product.price <= 1000 ? "AFFORDABLE" : "LUXURY")
          await ensureCategory(product.category, product.productType, majorCategory)
          categoryCount++
        }
      } catch (err) {
        console.error(`Error processing product ${product._id}:`, err.message)
      }
    }

    // Update category counts
    await updateCategoryCounts()

    res.json({
      success: true,
      message: `Reassigned ${assignedCount} products and synced ${categoryCount} categories.`,
      assignedCount,
      categoryCount,
      totalProducts: products.length,
      assignmentDetails: assignmentDetails.slice(0, 10) // Show first 10 for debugging
    })
  } catch (error) {
    console.error("Error reassigning and syncing products:", error)
    res.status(500).json({
      success: false,
      message: "Failed to reassign and sync products.",
      error: error.message
    })
  }
}

// Create categories from all existing products
async function createCategoriesFromProducts(req, res) {
  try {
    const products = await Product.find({ isActive: true, category: { $exists: true, $ne: null } })
    const categoriesCreated = new Set()
    let count = 0

    for (const product of products) {
      try {
        if (product.category) {
          const majorCategory = product.majorCategory || (product.price <= 1000 ? "AFFORDABLE" : "LUXURY")
          await ensureCategory(product.category, product.productType, majorCategory)
          
          if (!categoriesCreated.has(product.category)) {
            categoriesCreated.add(product.category)
            count++
          }
        }
      } catch (err) {
        console.error(`Error creating category for product ${product._id}:`, err.message)
      }
    }

    // Update category counts
    await updateCategoryCounts()

    res.json({
      success: true,
      message: `Created ${count} categories from existing products.`,
      categoriesCreated: Array.from(categoriesCreated),
      count
    })
  } catch (error) {
    console.error("Error creating categories from products:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create categories from products.",
      error: error.message
    })
  }
}

module.exports = {
  deleteAllProducts,
  deleteProductsByCriteria,
  reassignAndSyncProducts,
  createCategoriesFromProducts,
  seedShopsEndpoint
}
