const express = require("express")
const router = express.Router()
const controller = require("./product.controller")

// GET routes (public)
router.get("/", controller.getAllProducts)
router.get("/trending", controller.getTrendingProducts)
router.get("/shop/:shopSlug", controller.getProductsByShop)
router.get("/vendor/:vendorSlug", controller.getProductsByVendor)
router.get("/:slug", controller.getProductBySlug) // Must be last to avoid conflicts

// POST routes (admin)
router.post("/", controller.createProduct)
router.post("/bulk", controller.createBulkProducts)

module.exports = router
