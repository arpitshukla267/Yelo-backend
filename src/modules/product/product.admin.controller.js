const Product = require("./product.model")

/**
 * Delete all products (Admin only)
 * POST /api/products/admin/delete-all
 */
async function deleteAllProducts(req, res) {
  try {
    const result = await Product.deleteMany({})
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} products`,
      deletedCount: result.deletedCount
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Delete products by criteria
 * POST /api/products/admin/delete-by-criteria
 * Body: { criteria: { field: value } }
 */
async function deleteProductsByCriteria(req, res) {
  try {
    const { criteria } = req.body
    
    if (!criteria || typeof criteria !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Criteria object is required'
      })
    }

    const result = await Product.deleteMany(criteria)
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} products matching criteria`,
      deletedCount: result.deletedCount,
      criteria
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

module.exports = {
  deleteAllProducts,
  deleteProductsByCriteria
}

