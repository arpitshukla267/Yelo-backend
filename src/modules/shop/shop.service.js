const Shop = require("./shop.model")

async function getAllShops() {
  return Shop.find({}).sort({ createdAt: 1 })
}

async function getShopBySlug(slug) {
  return Shop.findOne({ slug })
}

module.exports = {
  getAllShops,
  getShopBySlug
}
