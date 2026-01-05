const router = require("express").Router()
const {
  fetchAllShops,
  fetchShopBySlug,
  fetchShopProducts,
  createShopHandler,
  updateShopHandler,
  deleteShopHandler,
  reassignProductsHandler
} = require("./shop.controller")
const auth = require("../../middlewares/auth.middleware")

// GET routes (public)
router.get("/", fetchAllShops) // Get all shops
router.get("/:slug/products", fetchShopProducts) // Get shop products
router.get("/:slug", fetchShopBySlug) // Get shop by slug

// CRUD routes (admin - require authentication)
router.post("/", auth, createShopHandler) // Create shop
router.put("/:slug", auth, updateShopHandler) // Update shop
router.delete("/:slug", auth, deleteShopHandler) // Delete shop
router.post("/reassign-products", auth, reassignProductsHandler) // Reassign all products to shops

module.exports = router
