const router = require("express").Router()
const {
  fetchWishlist,
  addProductToWishlist,
  removeProductFromWishlist
} = require("./wishlist.controller")

router.get("/", fetchWishlist)
router.post("/", addProductToWishlist)
router.delete("/:productId", removeProductFromWishlist)

module.exports = router
