const mongoose = require("mongoose")
const {
  getCart,
  addToCart,
  updateCartItem
} = require("./cart.service")

const TEMP_USER_ID = "000000000000000000000001"

async function fetchCart(req, res) {
  const cart = await getCart(TEMP_USER_ID)
  res.json(cart || { items: [] })
}

async function addProductToCart(req, res) {
  const { productId, quantity } = req.body

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid productId" })
  }

  const cart = await addToCart(
    TEMP_USER_ID,
    productId,
    quantity || 1
  )

  res.json(cart)
}

async function updateCartProduct(req, res) {
  const { productId, quantity } = req.body

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid productId" })
  }

  const cart = await updateCartItem(
    TEMP_USER_ID,
    productId,
    quantity
  )

  res.json(cart)
}

module.exports = {
  fetchCart,
  addProductToCart,
  updateCartProduct
}
