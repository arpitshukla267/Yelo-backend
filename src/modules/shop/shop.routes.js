const router = require("express").Router()
const {
  fetchAllShops,
  fetchShopBySlug,
  fetchShopProducts
} = require("./shop.controller")

// MOST SPECIFIC FIRST
router.get("/:slug/products", fetchShopProducts)
router.get("/:slug", fetchShopBySlug)
router.get("/", fetchAllShops)

module.exports = router
