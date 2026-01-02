const mongoose = require("mongoose")
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require("./wishlist.service")

const TEMP_USER_ID = "000000000000000000000001"

async function fetchWishlist(req, res) {
  const wishlist = await getWishlist(TEMP_USER_ID)
  res.json(wishlist || { products: [] })
}

async function addProductToWishlist(req, res) {
  const { productId } = req.body

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid productId" })
  }

  const wishlist = await addToWishlist(TEMP_USER_ID, productId)
  res.json(wishlist)
}

async function removeProductFromWishlist(req, res) {
  const { productId } = req.params

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid productId" })
  }

  const wishlist = await removeFromWishlist(TEMP_USER_ID, productId)
  res.json(wishlist)
}

module.exports = {
  fetchWishlist,
  addProductToWishlist,
  removeProductFromWishlist
}
