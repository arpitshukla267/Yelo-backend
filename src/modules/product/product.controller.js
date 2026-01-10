const Product = require("./product.model")
const { getProductsByShop, createProduct: createProductService } = require("./product.service")
const { ensureCategory } = require("../category/category.service")

// GET all products (with filters and pagination)
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      sort = "popular",
      category,
      brand,
      minPrice,
      maxPrice,
      gender,
      isTrending,
      isActive = true,
      search
    } = req.query

    const query = { isActive: isActive !== 'false' }

    // Search filter - search in name, brand, category
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      query.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
        { productType: searchRegex },
        { description: searchRegex }
      ]
    }

    // Filters
    if (category) query.category = category
    if (brand) query.brand = { $in: brand.split(",") }
    if (gender) query["audience.gender"] = gender
    if (isTrending === 'true') query.isTrending = true

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    // Sort options
    const sortOptions = {
      popular: { reviews: -1, rating: -1 },
      "price-low": { price: 1 },
      "price-high": { price: -1 },
      newest: { dateAdded: -1 },
      rating: { rating: -1 }
    }

    const sortQuery = sortOptions[sort] || sortOptions.popular

    const skip = (Number(page) - 1) * Number(limit)

    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit))
      .lean()

    const total = await Product.countDocuments(query)

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

// GET product by slug (supports vendor-slug/product-slug format)
exports.getProductBySlug = async (req, res) => {
  try {
    // Handle both regex route (req.params[0]) and named parameter route (req.params.slug)
    const slug = req.params[0] || req.params.slug

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Product slug is required"
      })
    }

    let product = null

    // Check if it's vendor-slug/product-slug format (SEO-friendly)
    if (slug.includes('/')) {
      const parts = slug.split('/')
      if (parts.length === 2) {
        const [vendorSlug, productSlug] = parts
        product = await Product.findOne({
          vendorSlug: vendorSlug.toLowerCase(),
          baseSlug: productSlug.toLowerCase(),
          isActive: true
        }).lean()
      }
    }

    // If not found, try exact slug match (backward compatibility)
    if (!product) {
      product = await Product.findOne({ 
        slug: slug.toLowerCase(), 
        isActive: true 
      }).lean()
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      })
    }

    // Add SEO-friendly URL to response
    const responseData = {
      ...product,
      seoUrl: product.vendorSlug && product.baseSlug 
        ? `${product.vendorSlug}/${product.baseSlug}` 
        : product.slug
    }

    res.json({
      success: true,
      data: responseData
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

// GET products by vendor slug
exports.getProductsByVendor = async (req, res) => {
  try {
    const { vendorSlug } = req.params
    const {
      page = 1,
      limit = 50,
      sort = "popular"
    } = req.query

    const query = {
      vendorSlug,
      isActive: true
    }

    const sortOptions = {
      popular: { reviews: -1, rating: -1 },
      "price-low": { price: 1 },
      "price-high": { price: -1 },
      newest: { dateAdded: -1 }
    }

    const sortQuery = sortOptions[sort] || sortOptions.popular
    const skip = (Number(page) - 1) * Number(limit)

    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit))
      .lean()

    const total = await Product.countDocuments(query)

    // Add SEO-friendly URLs to products
    const productsWithSeoUrl = products.map(product => ({
      ...product,
      seoUrl: product.vendorSlug && product.baseSlug 
        ? `${product.vendorSlug}/${product.baseSlug}` 
        : product.slug
    }))

    res.json({
      success: true,
      data: productsWithSeoUrl,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

// GET products by shop slug
exports.getProductsByShop = async (req, res) => {
  try {
    const { shopSlug } = req.params
    const { sort = "popular", page = 1, limit = 6, ...filters } = req.query

    const result = await getProductsByShop({
      shopSlug,
      sort,
      filters,
      page: Number(page),
      limit: Number(limit)
    })

    res.json({
      success: true,
      data: result.products || [],
      pagination: result.pagination || {
        page: Number(page),
        limit: Number(limit),
        total: 0,
        pages: 0,
        hasMore: false
      }
    })
  } catch (err) {
    console.error('Error in getProductsByShop:', err)
    // Return empty array instead of error
    res.json({
      success: true,
      data: [],
      pagination: {
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 6),
        total: 0,
        pages: 0,
        hasMore: false
      }
    })
  }
}

// GET products by category and subcategory (paginated)
exports.getProductsByCategory = async (req, res) => {
  try {
    const { 
      categorySlug, 
      subcategorySlug,
      page = 1,
      limit = 6,
      sort = "popular",
      minPrice,
      maxPrice
    } = req.query

    // If no category or subcategory provided, return empty
    if (!categorySlug && !subcategorySlug) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          pages: 0,
          hasMore: false
        }
      })
    }

    const query = { isActive: true }
    
    // Build category match conditions
    if (categorySlug) {
      const categoryConditions = [
        { category: categorySlug },
        { category: { $regex: new RegExp(`^${categorySlug}$`, 'i') } }
      ]
      
      // Also match by category name variations
      const categoryName = categorySlug.replace(/-/g, ' ')
      categoryConditions.push(
        { category: { $regex: new RegExp(`^${categoryName}$`, 'i') } }
      )
      
      query.$or = categoryConditions
    }
    
    // Add subcategory filter
    if (subcategorySlug) {
      const subcategoryConditions = [
        { subcategory: subcategorySlug },
        { subcategory: { $regex: new RegExp(`^${subcategorySlug}$`, 'i') } },
        { productType: subcategorySlug },
        { productType: { $regex: new RegExp(`^${subcategorySlug}$`, 'i') } }
      ]
      
      const subcategoryName = subcategorySlug.replace(/-/g, ' ')
      subcategoryConditions.push(
        { subcategory: { $regex: new RegExp(`^${subcategoryName}$`, 'i') } },
        { productType: { $regex: new RegExp(`^${subcategoryName}$`, 'i') } }
      )
      
      // Combine with category conditions if they exist
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: subcategoryConditions }
        ]
        delete query.$or
      } else {
        query.$or = subcategoryConditions
      }
    }

    // Add price filter if provided
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice && minPrice !== 'undefined') {
        query.price.$gte = Number(minPrice)
      }
      if (maxPrice && maxPrice !== 'undefined') {
        query.price.$lte = Number(maxPrice)
      }
    }

    // Sort options
    const sortOptions = {
      popular: { reviews: -1, rating: -1 },
      "price-low": { price: 1 },
      "price-high": { price: -1 },
      newest: { createdAt: -1, dateAdded: -1 },
      rating: { rating: -1 }
    }

    const sortQuery = sortOptions[sort] || sortOptions.popular
    const skip = (Number(page) - 1) * Number(limit)

    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit))
      .lean()
      .select('name slug baseSlug vendorSlug price originalPrice images brand category subcategory emoji isTrending rating reviews')

    const total = await Product.countDocuments(query)

    // Always return success, even if no products found
    res.json({
      success: true,
      data: products || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / Number(limit)),
        hasMore: skip + (products?.length || 0) < (total || 0)
      }
    })
  } catch (err) {
    console.error('Error in getProductsByCategory:', err)
    // Return empty array instead of error to prevent 404
    res.json({
      success: true,
      data: [],
      pagination: {
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 6),
        total: 0,
        pages: 0,
        hasMore: false
      }
    })
  }
}

// GET trending products
exports.getTrendingProducts = async (req, res) => {
  try {
    const { limit = 20 } = req.query

    const products = await Product.find({
      isTrending: true,
      isActive: true
    })
      .sort({ dateAdded: -1, createdAt: -1 }) // Sort by newest first for recently added trending products
      .limit(Number(limit))
      .lean()

    // Add SEO-friendly URLs to products
    const productsWithSeoUrl = products.map(product => ({
      ...product,
      seoUrl: product.vendorSlug && product.baseSlug 
        ? `${product.vendorSlug}/${product.baseSlug}` 
        : product.slug
    }))

    res.json({
      success: true,
      data: productsWithSeoUrl
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

exports.createProduct = async (req, res) => {
  try {
    // Ensure isActive is set
    if (req.body.isActive === undefined) {
      req.body.isActive = true
    }

    // Auto-create category if it doesn't exist
    if (req.body.category) {
      const majorCategory = req.body.price <= 2000 ? "AFFORDABLE" : "LUXURY"
      await ensureCategory(req.body.category, req.body.productType, majorCategory)
    }

    // Use service to create product (which auto-assigns shops)
    const product = await createProductService(req.body)
    
    res.status(201).json({
      success: true,
      data: product
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    })
  }
}

exports.createBulkProducts = async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Request body must be an array"
      })
    }

    // Ensure isActive is set for all products and auto-create categories
    const createdProducts = []
    
    for (const productData of req.body) {
      try {
        if (productData.isActive === undefined) {
          productData.isActive = true
        }

        // Auto-create category if it doesn't exist
        if (productData.category) {
          const majorCategory = productData.price <= 2000 ? "AFFORDABLE" : "LUXURY"
          await ensureCategory(productData.category, productData.productType, majorCategory)
        }

        // Use service to create product (which auto-assigns shops)
        const product = await createProductService(productData)
        createdProducts.push(product)
      } catch (err) {
        // Continue with other products even if one fails
      }
    }

    res.status(201).json({
      success: true,
      count: createdProducts.length,
      data: createdProducts,
      message: `Created ${createdProducts.length} out of ${req.body.length} products`
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    })
  }
}

// UPDATE product by ID
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body
    
    // Find and update product
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      })
    }
    
    // Reassign to shops if price/category changed
    if (updateData.price || updateData.category || updateData.majorCategory) {
      const { assignProductToShops } = require("../assignment/assignment.service")
      await assignProductToShops(product)
    }
    
    // Update category counts if category changed
    if (updateData.category) {
      const { updateCategoryCounts } = require("../category/category.service")
      updateCategoryCounts().catch(() => {
        // Silently fail - counts will update on next sync
      })
    }
    
    res.json({
      success: true,
      data: product
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

// DELETE product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params
    
    const product = await Product.findByIdAndDelete(id)
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      })
    }
    
    // Update category counts
    const { updateCategoryCounts } = require("../category/category.service")
    updateCategoryCounts().catch(() => {
      // Silently fail - counts will update on next sync
    })
    
    res.json({
      success: true,
      message: "Product deleted successfully"
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

// PATCH product by ID (partial update)
exports.patchProduct = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body
    
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      })
    }
    
    res.json({
      success: true,
      data: product
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}