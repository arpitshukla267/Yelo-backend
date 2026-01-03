function matchesShopCriteria(product, criteria) {
    // If no criteria defined, accept all products (fallback to accept all)
    if (!criteria || Object.keys(criteria).length === 0) return true
  
    // Price - product must fall within price range if specified
    if (criteria.priceMin != null && (product.price || 0) < criteria.priceMin)
      return false
  
    if (criteria.priceMax != null && (product.price || 0) > criteria.priceMax)
      return false
  
    // Rating (skip if product has no reviews yet, but still check if minReviews is required)
    if (criteria.minRating != null) {
      // Only check rating if product has reviews, otherwise allow it
      if (product.reviews > 0 && (product.rating || 0) < criteria.minRating) {
        return false
      }
      // If minRating is required but product has no reviews, don't exclude it (allow new products)
    }
  
    if (criteria.minReviews != null && (product.reviews || 0) < criteria.minReviews) {
      return false
    }
  
    // Discount
    if (criteria.hasDiscount) {
      const hasDiscount =
        product.discount > 0 ||
        (product.originalPrice && product.originalPrice > product.price)
      if (!hasDiscount) return false
    }
  
    // Time-based (skip if dateAdded missing)
    if (criteria.daysSinceAdded && product.dateAdded) {
      const days =
        (Date.now() - new Date(product.dateAdded)) / (1000 * 60 * 60 * 24)
      if (days > criteria.daysSinceAdded) return false
    }
  
    // Category match
    if (criteria.categoryMatch) {
      const text = `${product.category || ""} ${product.name || ""}`.toLowerCase()
      if (!text.includes(criteria.categoryMatch.toLowerCase())) return false
    }
  
    // Trending
    if (
      criteria.isTrending !== undefined &&
      product.isTrending !== criteria.isTrending
    )
      return false
  
    return true
  }
  
  module.exports = matchesShopCriteria
  