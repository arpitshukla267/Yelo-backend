const Shop = require("../shop/shop.model")
const Product = require("../product/product.model")
const matchesShopCriteria = require("./criteriaMatcher")

async function assignProductToShops(product) {
  // Ensure product has majorCategory set (fallback to AFFORDABLE if not set)
  let majorCategory = product.majorCategory
  if (!majorCategory) {
    majorCategory = (product.brand && product.brand.trim() !== '') ? "LUXURY" : "AFFORDABLE"
    // Update the product in the database
    await Product.updateOne(
      { _id: product._id },
      { majorCategory: majorCategory }
    )
    // Also update the product object so it's available for criteria matching
    product.majorCategory = majorCategory
  }

  // Get all shops - products can match shops with matching majorCategory
  const shops = await Shop.find({
    majorCategory: product.majorCategory || majorCategory
  })

  const matchedShopSlugs = []

  for (const shop of shops) {
    // Check if product matches shop criteria
    if (matchesShopCriteria(product, shop.criteria)) {
      matchedShopSlugs.push(shop.slug)
    }
  }

  // Remove duplicates (shouldn't be needed, but safe)
  const uniqueShopSlugs = [...new Set(matchedShopSlugs)]

  // Update the product with assigned shops
  await Product.updateOne(
    { _id: product._id },
    { assignedShops: uniqueShopSlugs }
  )

  return uniqueShopSlugs
}

// ✅ THIS FUNCTION WAS MISSING OR NOT EXPORTED
async function reassignSingleProduct(productId) {
  const product = await Product.findById(productId)
  if (!product) return

  await assignProductToShops(product)
}

// Reassign all products to shops (useful when shop criteria changes)
async function reassignAllProducts() {
  const products = await Product.find({ isActive: true })
  let reassignedCount = 0
  let errorCount = 0
  
  for (const product of products) {
    try {
      // Ensure majorCategory is set before assignment
      if (!product.majorCategory) {
        product.majorCategory = (product.brand && product.brand.trim() !== '') ? "LUXURY" : "AFFORDABLE"
        await Product.updateOne(
          { _id: product._id },
          { majorCategory: product.majorCategory }
        )
      }
      
      await assignProductToShops(product)
      reassignedCount++
    } catch (error) {
      errorCount++
      console.error(`Error reassigning product ${product._id} (${product.name}):`, error.message)
    }
  }
  
  console.log(`✅ Reassigned ${reassignedCount} products to shops${errorCount > 0 ? ` (${errorCount} errors)` : ''}`)
  return reassignedCount
}

module.exports = {
  assignProductToShops,
  reassignSingleProduct,
  reassignAllProducts
}
