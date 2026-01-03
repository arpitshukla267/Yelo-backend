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

// Admin routes for product management
const adminController = require("./product.admin.controller")
router.post("/admin/delete-all", adminController.deleteAllProducts)
router.post("/admin/delete-by-criteria", adminController.deleteProductsByCriteria)

module.exports = router
