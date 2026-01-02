const Shop = require("../shop/shop.model")
const Product = require("../product/product.model")
const matchesShopCriteria = require("./criteriaMatcher")

async function assignProductToShops(product) {
  const shops = await Shop.find({
    majorCategory: product.majorCategory
  })

  const matchedShopSlugs = []

  for (const shop of shops) {
    if (matchesShopCriteria(product, shop.criteria)) {
      matchedShopSlugs.push(shop.slug)
    }
  }

  await Product.updateOne(
    { _id: product._id },
    { assignedShops: matchedShopSlugs }
  )

  return matchedShopSlugs
}

// ✅ THIS FUNCTION WAS MISSING OR NOT EXPORTED
async function reassignSingleProduct(productId) {
  const product = await Product.findById(productId)
  if (!product) return

  await assignProductToShops(product)
}

module.exports = {
  assignProductToShops,
  reassignSingleProduct // ✅ MUST be exported
}
