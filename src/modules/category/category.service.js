const Category = require("./category.model")
const Product = require("../product/product.model")

/**
 * Auto-create or update category
 */
async function ensureCategory(categoryName, productType = null, majorCategory = "ALL") {
  if (!categoryName) return null

  const categorySlug = categoryName.toLowerCase().replace(/\s+/g, "-")
  
  let category = await Category.findOne({ slug: categorySlug })
  
  if (!category) {
    // Create new category
    category = await Category.create({
      name: categoryName,
      slug: categorySlug,
      majorCategory,
      subcategories: productType ? [{
        name: productType,
        slug: productType.toLowerCase().replace(/\s+/g, "-"),
        productCount: 0
      }] : []
    })
  } else {
    // If productType exists and is not in subcategories, add it
    if (productType) {
      const subcategorySlug = productType.toLowerCase().replace(/\s+/g, "-")
      const subcategoryExists = category.subcategories.some(
        sub => sub.slug === subcategorySlug
      )
      
      if (!subcategoryExists) {
        category.subcategories.push({
          name: productType,
          slug: subcategorySlug,
          productCount: 0
        })
        await category.save()
      }
    }
  }

  return category
}

/**
 * Update category product counts based on actual products
 */
async function updateCategoryCounts() {
  const categories = await Category.find({ isActive: true })
  
  for (const category of categories) {
    // Count products in this category
    const productCount = await Product.countDocuments({
      category: category.slug,
      isActive: true
    })
    
    category.productCount = productCount

    // Update subcategory counts
    for (const subcategory of category.subcategories) {
      const subcategoryCount = await Product.countDocuments({
        category: category.slug,
        productType: subcategory.slug,
        isActive: true
      })
      subcategory.productCount = subcategoryCount
    }

    await category.save()
  }
}

/**
 * Get all categories with active products only
 */
async function getActiveCategories(majorCategory = null) {
  await updateCategoryCounts()
  
  const query = { isActive: true, productCount: { $gt: 0 } }
  if (majorCategory) {
    query.$or = [
      { majorCategory },
      { majorCategory: "ALL" }
    ]
  }

  const categories = await Category.find(query)
    .sort({ productCount: -1, name: 1 })
    .lean()

  // Filter subcategories to only those with products
  return categories.map(cat => ({
    ...cat,
    subcategories: cat.subcategories.filter(sub => sub.productCount > 0)
  }))
}

/**
 * Get category by slug
 */
async function getCategoryBySlug(slug) {
  await updateCategoryCounts()
  return Category.findOne({ slug, isActive: true }).lean()
}

module.exports = {
  ensureCategory,
  updateCategoryCounts,
  getActiveCategories,
  getCategoryBySlug
}

