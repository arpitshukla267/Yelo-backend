const Product = require("./product.model")
const { assignProductToShops } = require("../assignment/assignment.service")
const SORT_MAP = require("./product.sort")

// =======================
// CREATE PRODUCT
// =======================
async function createProduct(payload) {
  // Assign majorCategory based on brand presence: if brand exists, it's LUXURY, otherwise AFFORDABLE
  payload.majorCategory =
    (payload.brand && payload.brand.trim() !== '') ? "LUXURY" : "AFFORDABLE"

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
  filters = {},
  page = 1,
  limit = 6
}) {
  const sortQuery = SORT_MAP[sort] || SORT_MAP.popular

  const query = {
    assignedShops: shopSlug,
    isActive: true
  }

  // PRICE FILTER
  if (filters.minPrice || filters.maxPrice) {
    query.price = {}
    if (filters.minPrice && filters.minPrice !== 'undefined' && !isNaN(Number(filters.minPrice))) {
      query.price.$gte = Number(filters.minPrice)
    }
    if (filters.maxPrice && filters.maxPrice !== 'undefined' && !isNaN(Number(filters.maxPrice))) {
      query.price.$lte = Number(filters.maxPrice)
    }
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

  const skip = (Number(page) - 1) * Number(limit)
  const total = await Product.countDocuments(query)

  const products = await Product.find(query)
    .sort(sortQuery)
    .skip(skip)
    .limit(Number(limit))
    .lean()
    .select('name slug baseSlug vendorSlug price originalPrice images brand category subcategory emoji isTrending rating reviews')

  // Add SEO-friendly URLs to products
  const productsWithSeoUrl = products.map(product => ({
    ...product,
    seoUrl: product.vendorSlug && product.baseSlug 
      ? `${product.vendorSlug}/${product.baseSlug}` 
      : product.slug
  }))

  return {
    products: productsWithSeoUrl,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
      hasMore: skip + products.length < total
    }
  }
}



module.exports = {
  createProduct,
  getProductsByShop
}
