const router = require("express").Router()
const {
  fetchCart,
  addProductToCart,
  updateCartProduct
} = require("./cart.controller")

router.get("/", fetchCart)
router.post("/", addProductToCart)
router.put("/", updateCartProduct)

module.exports = router
