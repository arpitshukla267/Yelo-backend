const Vendor = require("./vendors.model")
const Product = require("../product/product.model")

exports.createVendor = async (req, res) => {
  try {
    const vendor = await Vendor.create(req.body)
    res.status(201).json({ success: true, data: vendor })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

exports.getAllVendors = async (req, res) => {
  const vendors = await Vendor.find()
  res.json({ success: true, data: vendors })
}

exports.getVendorById = async (req, res) => {
  const vendor = await Vendor.findById(req.params.id)
  if (!vendor)
    return res.status(404).json({ success: false, message: "Vendor not found" })

  res.json({ success: true, data: vendor })
}

exports.updateVendor = async (req, res) => {
  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )
  res.json({ success: true, data: vendor })
}

exports.deleteVendor = async (req, res) => {
  await Vendor.findByIdAndDelete(req.params.id)
  res.json({ success: true, message: "Vendor deleted" })
}

exports.getVendorProducts = async (req, res) => {
    try {
      const products = await Product.find({
        vendorSlug: req.params.slug,
        isActive: true
      })
  
      res.json({
        success: true,
        count: products.length,
        data: products
      })
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      })
    }
  }
  
