const Product = require("./product.model")
const { assignProductToShops } = require("../assignment/assignment.service")
const SORT_MAP = require("./product.sort")

// =======================
// CREATE PRODUCT
// =======================
async function createProduct(payload) {
  payload.majorCategory =
    payload.price <= 1000 ? "AFFORDABLE" : "LUXURY"

  const product = await Product.create(payload)

  const assignedShops = await assignProductToShops(product)
  product.assignedShops = assignedShops

  return product
}

// =======================
// GET PRODUCTS BY SHOP
// =======================
async function getProductsByShop({
  shopSlug,
  sort = "popular",
  filters = {}
}) {
  const sortQuery = SORT_MAP[sort] || SORT_MAP.popular

  const query = {
    assignedShops: shopSlug,
    isActive: true
  }

  // PRICE FILTER
  if (filters.minPrice || filters.maxPrice) {
    query.price = {}
    if (filters.minPrice) query.price.$gte = Number(filters.minPrice)
    if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice)
  }

  // BRAND FILTER
  if (filters.brand) {
    query.brand = { $in: filters.brand.split(",") }
  }

  // SIZE FILTER
  if (filters.size) {
    query.sizes = { $in: filters.size.split(",") }
  }

  // COLOR FILTER
  if (filters.color) {
    query["colors.name"] = { $in: filters.color.split(",") }
  }

  const products = await Product.find(query).sort(sortQuery).lean()

  // Add SEO-friendly URLs to products
  const productsWithSeoUrl = products.map(product => ({
    ...product,
    seoUrl: product.vendorSlug && product.baseSlug 
      ? `${product.vendorSlug}/${product.baseSlug}` 
      : product.slug
  }))

  return {
    products: productsWithSeoUrl
  }
}



module.exports = {
  createProduct,
  getProductsByShop
}
