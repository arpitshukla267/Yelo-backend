const { getActiveCategories, getCategoryBySlug, updateCategoryCounts } = require("./category.service")

// GET all categories with products
exports.getAllCategories = async (req, res) => {
  try {
    const { majorCategory } = req.query
    const categories = await getActiveCategories(majorCategory || null)

    res.json({
      success: true,
      data: categories
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

// GET category by slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params
    const category = await getCategoryBySlug(slug)

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      })
    }

    res.json({
      success: true,
      data: category
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

// POST update category counts (admin endpoint)
exports.updateCounts = async (req, res) => {
  try {
    await updateCategoryCounts()
    res.json({
      success: true,
      message: "Category counts updated"
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

