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
    // Count products in this category - match by slug, name, or subcategory
    // Also check if any product's subcategory matches this category's subcategories
    const categoryMatchConditions = [
      { category: category.slug },
      { category: category.name },
      { category: { $regex: new RegExp(`^${category.slug}$`, 'i') } },
      { category: { $regex: new RegExp(`^${category.name}$`, 'i') } }
    ]
    
    // If category has subcategories, also match products by subcategory field
    if (category.subcategories && category.subcategories.length > 0) {
      const subcategorySlugs = category.subcategories.map(sub => sub.slug)
      const subcategoryNames = category.subcategories.map(sub => sub.name)
      
      categoryMatchConditions.push(
        { subcategory: { $in: subcategorySlugs } },
        { subcategory: { $in: subcategoryNames } }
      )
      
      // Also match productType if it matches subcategory (case-insensitive)
      for (const sub of category.subcategories) {
        categoryMatchConditions.push(
          { productType: { $regex: new RegExp(`^${sub.slug}$`, 'i') } },
          { productType: { $regex: new RegExp(`^${sub.name}$`, 'i') } }
        )
      }
    }
    
    const productCount = await Product.countDocuments({
      $or: categoryMatchConditions,
      isActive: true
    })
    
    category.productCount = productCount

    // Update subcategory counts - match productType or subcategory field with subcategory name or slug
    // Also match products even if category doesn't match exactly (for flexibility)
    for (const subcategory of category.subcategories) {
      const subcategoryMatchConditions = [
        // Match by productType
        { productType: subcategory.name },
        { productType: subcategory.slug },
        { productType: { $regex: new RegExp(`^${subcategory.slug}$`, 'i') } },
        { productType: { $regex: new RegExp(`^${subcategory.name}$`, 'i') } },
        // Match by subcategory field
        { subcategory: subcategory.slug },
        { subcategory: subcategory.name },
        { subcategory: { $regex: new RegExp(`^${subcategory.slug}$`, 'i') } },
        { subcategory: { $regex: new RegExp(`^${subcategory.name}$`, 'i') } }
      ]
      
      // Try to match with category first, but if no results, match without category requirement
      const subcategoryCountWithCategory = await Product.countDocuments({
        $and: [
          {
            $or: [
              { category: category.slug },
              { category: category.name },
              { category: { $regex: new RegExp(`^${category.slug}$`, 'i') } },
              { category: { $regex: new RegExp(`^${category.name}$`, 'i') } }
            ]
          },
          {
            $or: subcategoryMatchConditions
          },
          { isActive: true }
        ]
      })
      
      // If we got results with category match, use that. Otherwise, count without category requirement
      const subcategoryCount = subcategoryCountWithCategory > 0 
        ? subcategoryCountWithCategory
        : await Product.countDocuments({
            $and: [
              { $or: subcategoryMatchConditions },
              { isActive: true }
            ]
          })
      
      subcategory.productCount = subcategoryCount
    }

    await category.save()
  }
}

// Cache for category counts (expires after 5 minutes)
let categoryCountsCache = null
let categoryCountsCacheTime = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get all categories with active products only
 * @param {string|null} majorCategory - Filter by major category
 * @param {boolean} forceUpdateCounts - Force update counts (default: false, uses cache)
 */
async function getActiveCategories(majorCategory = null, forceUpdateCounts = false) {
  // Only update counts if cache is expired or forced
  const now = Date.now()
  const cacheExpired = !categoryCountsCache || !categoryCountsCacheTime || (now - categoryCountsCacheTime > CACHE_DURATION)
  
  // If cache is valid and not forcing update, skip count updates (use existing counts)
  if (!forceUpdateCounts && !cacheExpired && categoryCountsCache) {
    // Return cached data immediately (fast response)
    return categoryCountsCache
  }
  
  // Need to update counts - do it in background if cache exists, otherwise wait
  if (categoryCountsCache && !forceUpdateCounts) {
    // Update counts in background (don't wait for it to complete)
    updateCategoryCounts().then(() => {
      categoryCountsCacheTime = Date.now()
      // Cache will be updated on next request
    }).catch(err => {
      console.error('Error updating category counts:', err)
    })
    
    // Return cached data immediately while update runs in background
    return categoryCountsCache
  }
  
  // First time or forced update - wait for counts (but optimize by skipping if not needed)
  if (forceUpdateCounts || !categoryCountsCache) {
    await updateCategoryCounts()
  }
  
  // Show categories that have products OR have subcategories (so new categories with subcategories appear)
  // Also show categories that have products matching their subcategories (even if category name doesn't match)
  const baseQuery = { 
    isActive: true,
    $or: [
      { productCount: { $gt: 0 } },
      { 'subcategories.0': { $exists: true } } // Has at least one subcategory
    ]
  }
  
  if (majorCategory) {
    baseQuery.$and = [
      {
        $or: [
          { majorCategory },
          { majorCategory: "ALL" }
        ]
      }
    ]
  }

  const categories = await Category.find(baseQuery)
    .sort({ productCount: -1, name: 1 })
    .lean()
    .select('-__v') // Exclude version field for faster queries

  // Filter out categories that have images but no subcategories
  // Also remove "Men's Wear" category if it has an image (keep only the one with icon)
  // Return all active subcategories (even with 0 products) so users can see them
  const filtered = categories
    .filter(cat => {
      // Remove "Men's Wear" category if it has an image (keep only icon version)
      if (cat.slug === 'mens-wear' && cat.image) {
        return false
      }
      // If category has an image, it must have subcategories
      if (cat.image) {
        return cat.subcategories && Array.isArray(cat.subcategories) && cat.subcategories.length > 0
      }
      // Categories without images are valid
      return true
    })
    .map(cat => ({
      ...cat,
      subcategories: cat.subcategories.filter(sub => sub.isActive !== false)
    }))
  
  // Update cache
  categoryCountsCache = filtered
  categoryCountsCacheTime = Date.now()
  return filtered
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


