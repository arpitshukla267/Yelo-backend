const {
  getAllShops,
  getShopBySlug
} = require("./shop.service")

const { getProductsByShop } = require("../product/product.service")

async function fetchAllShops(req, res) {
  const shops = await getAllShops()
  res.json(shops)
}

async function fetchShopBySlug(req, res) {
  const { slug } = req.params

  const shop = await getShopBySlug(slug)
  if (!shop) {
    return res.status(404).json({ message: "Shop not found" })
  }

  res.json(shop)
}

async function fetchShopProducts(req, res) {
  const { slug } = req.params
  const { sort, ...filters } = req.query

  const data = await getProductsByShop({
    shopSlug: slug,
    sort,
    filters
  })

  res.json(data)
}



module.exports = {
  fetchAllShops,
  fetchShopBySlug,
  fetchShopProducts 
}
