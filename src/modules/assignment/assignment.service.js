const Shop = require("../shop/shop.model")
const Product = require("../product/product.model")
const matchesShopCriteria = require("./criteriaMatcher")

async function assignProductToShops(product) {
  // Get all shops - products can match shops with matching majorCategory
  // or shops that don't restrict by majorCategory
  const shops = await Shop.find({
    $or: [
      { majorCategory: product.majorCategory },
      // Also check if shop has no majorCategory restriction (though model requires it)
      // For now, just check shops matching the product's majorCategory
    ]
  })

  const matchedShopSlugs = []

  for (const shop of shops) {
    // Check if product matches shop criteria
    if (matchesShopCriteria(product, shop.criteria)) {
      matchedShopSlugs.push(shop.slug)
    }
  }

  // If product is trending, also assign to trending shop
  if (product.isTrending === true) {
    const trendingShop = await Shop.findOne({ slug: 'trending' })
    if (trendingShop && !matchedShopSlugs.includes('trending')) {
      matchedShopSlugs.push('trending')
    }
  }

  // Remove duplicates (shouldn't be needed, but safe)
  const uniqueShopSlugs = [...new Set(matchedShopSlugs)]

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
  
  for (const product of products) {
    try {
      await assignProductToShops(product)
      reassignedCount++
    } catch (error) {
      console.error(`Error reassigning product ${product._id}:`, error.message)
    }
  }
  
  console.log(`✅ Reassigned ${reassignedCount} products to shops`)
  return reassignedCount
}

module.exports = {
  assignProductToShops,
  reassignSingleProduct,
  reassignAllProducts
}
