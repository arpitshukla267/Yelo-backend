const { getActiveCategories, getCategoryBySlug, updateCategoryCounts, ensureCategory } = require("./category.service")

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

// POST seed hardcoded categories (admin endpoint)
exports.seedHardcodedCategories = async (req, res) => {
  try {
    const hardcodedCategories = [
      { name: "Women's Wear", slug: "womens-wear", majorCategory: "ALL", subcategories: [
        { name: "Dresses", slug: "womens-dresses" },
        { name: "Tops & T-Shirts", slug: "womens-tops" },
        { name: "Jeans & Pants", slug: "womens-jeans" },
        { name: "Skirts", slug: "womens-skirts" },
        { name: "Jackets & Coats", slug: "womens-jackets" },
        { name: "Activewear", slug: "womens-activewear" },
      ]},
      { name: "Men's Wear", slug: "mens-wear", majorCategory: "ALL", subcategories: [
        { name: "Shirts", slug: "mens-shirts" },
        { name: "T-Shirts", slug: "mens-tshirts" },
        { name: "Jeans", slug: "mens-jeans" },
        { name: "Trousers", slug: "mens-trousers" },
        { name: "Jackets", slug: "mens-jackets" },
        { name: "Suits & Blazers", slug: "mens-suits" },
      ]},
      { name: "Kids Wear", slug: "kids-wear", majorCategory: "ALL", subcategories: [
        { name: "Boys Clothing", slug: "kids-boys" },
        { name: "Girls Clothing", slug: "kids-girls" },
        { name: "Infant Wear", slug: "kids-infant" },
        { name: "School Uniforms", slug: "kids-uniforms" },
        { name: "Accessories", slug: "kids-accessories" },
      ]},
      { name: "Footwear", slug: "footwear", majorCategory: "ALL", subcategories: [
        { name: "Casual Shoes", slug: "footwear-casual" },
        { name: "Sports Shoes", slug: "footwear-sports" },
        { name: "Formal Shoes", slug: "footwear-formal" },
        { name: "Heels", slug: "footwear-heels" },
        { name: "Sandals", slug: "footwear-sandals" },
        { name: "Boots", slug: "footwear-boots" },
      ]},
      { name: "Perfumes", slug: "perfumes", majorCategory: "ALL", subcategories: [
        { name: "Men's Perfumes", slug: "perfumes-mens" },
        { name: "Women's Perfumes", slug: "perfumes-womens" },
        { name: "Unisex Perfumes", slug: "perfumes-unisex" },
        { name: "Body Sprays", slug: "perfumes-sprays" },
        { name: "Deodorants", slug: "perfumes-deodorants" },
      ]},
      { name: "Personal Care", slug: "personal-care", majorCategory: "ALL", subcategories: [
        { name: "Skincare", slug: "personal-care-skincare" },
        { name: "Hair Care", slug: "personal-care-haircare" },
        { name: "Body Care", slug: "personal-care-bodycare" },
        { name: "Face Care", slug: "personal-care-facecare" },
        { name: "Oral Care", slug: "personal-care-oralcare" },
        { name: "Men's Grooming", slug: "personal-care-mens" },
      ]},
    ]

    const created = []
    const Category = require("./category.model")

    for (const catData of hardcodedCategories) {
      let category = await Category.findOne({ slug: catData.slug })
      
      if (!category) {
        category = await Category.create({
          name: catData.name,
          slug: catData.slug,
          majorCategory: catData.majorCategory,
          subcategories: catData.subcategories.map(sub => ({
            name: sub.name,
            slug: sub.slug,
            productCount: 0
          })),
          productCount: 0,
          isActive: true
        })
        created.push(catData.slug)
      } else {
        // Update subcategories if missing
        for (const subData of catData.subcategories) {
          const subExists = category.subcategories.some(sub => sub.slug === subData.slug)
          if (!subExists) {
            category.subcategories.push({
              name: subData.name,
              slug: subData.slug,
              productCount: 0
            })
          }
        }
        await category.save()
      }
    }

    // Update counts after seeding
    await updateCategoryCounts()

    res.json({
      success: true,
      message: `Seeded ${created.length} new categories. Total: ${hardcodedCategories.length}`,
      created,
      total: hardcodedCategories.length
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

