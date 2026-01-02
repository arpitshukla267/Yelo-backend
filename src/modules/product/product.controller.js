const Product = require("./product.model")

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body)
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

    const products = await Product.insertMany(req.body, {
      ordered: false
    })

    res.status(201).json({
      success: true,
      count: products.length,
      data: products
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    })
  }
}
