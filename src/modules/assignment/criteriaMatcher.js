function matchesShopCriteria(product, criteria) {
    if (!criteria) return false
  
    // Price
    if (criteria.priceMin != null && product.price < criteria.priceMin)
      return false
  
    if (criteria.priceMax != null && product.price > criteria.priceMax)
      return false
  
    // Rating (skip if product has no reviews yet)
    if (
      criteria.minRating != null &&
      product.reviews > 0 &&
      product.rating < criteria.minRating
    )
      return false
  
    if (
      criteria.minReviews != null &&
      product.reviews < criteria.minReviews
    )
      return false
  
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
  