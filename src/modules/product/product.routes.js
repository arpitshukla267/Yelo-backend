const express = require("express")
const router = express.Router()
const controller = require("./product.controller")

// Admin routes for product management (MUST be before regex route)
const adminController = require("./product.admin.controller")
router.get("/admin/debug", adminController.getProductDebugData)
router.post("/admin/delete-all", adminController.deleteAllProducts)
router.post("/admin/delete-by-criteria", adminController.deleteProductsByCriteria)
router.post("/admin/reassign-and-sync", adminController.reassignAndSyncProducts)
router.post("/admin/create-categories-from-products", adminController.createCategoriesFromProducts)
router.post("/admin/populate-subcategories", adminController.populateSubcategories)
router.post("/admin/migrate-categories", adminController.migrateCategories)
router.post("/admin/seed-shops", adminController.seedShopsEndpoint)

// GET routes (public)
router.get("/", controller.getAllProducts)
router.get("/trending", controller.getTrendingProducts)
router.get("/shop/:shopSlug", controller.getProductsByShop)
router.get("/vendor/:vendorSlug", controller.getProductsByVendor)
// Use regex to capture slugs with slashes (e.g., vendor-slug/product-slug)
// This matches any path that doesn't start with the above routes
router.get(/^\/(.+)$/, controller.getProductBySlug) // Must be last to avoid conflicts

// POST routes (admin)
router.post("/", controller.createProduct)
router.post("/bulk", controller.createBulkProducts)

module.exports = router
