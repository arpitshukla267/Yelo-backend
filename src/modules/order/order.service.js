const Order = require("./order.model")
const VendorOrder = require("./vendorOrder.model")
const Cart = require("../cart/cart.model")
const Vendor = require("../vendors/vendors.model")

const TEMP_USER_ID = "000000000000000000000001"

async function placeOrder() {
  // 1) Fetch cart
  const cart = await Cart.findOne({ userId: TEMP_USER_ID })
    .populate("items.productId")
    .populate("items.vendorId")

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty")
  }

  // 2) Create master order
  const orderItems = cart.items.map(i => ({
    productId: i.productId._id,
    quantity: i.quantity,
    price: i.priceAtAdd
  }))

  const totalAmount = cart.items.reduce(
    (sum, i) => sum + i.quantity * i.priceAtAdd,
    0
  )

  const order = await Order.create({
    userId: TEMP_USER_ID,
    items: orderItems,
    totalAmount
  })

  // 3) Group items by vendorId
  const byVendor = {}
  for (const i of cart.items) {
    const vId = i.vendorId._id.toString()
    if (!byVendor[vId]) byVendor[vId] = []
    byVendor[vId].push(i)
  }

  // 4) Create VendorOrders
  for (const vendorId of Object.keys(byVendor)) {
    const vendor = await Vendor.findById(vendorId)
    const items = byVendor[vendorId]

    const vendorItems = items.map(i => ({
      productId: i.productId._id,
      quantity: i.quantity,
      price: i.priceAtAdd
    }))

    const subtotal = items.reduce(
      (sum, i) => sum + i.quantity * i.priceAtAdd,
      0
    )

    await VendorOrder.create({
      orderId: order._id,
      vendorId,
      vendorName: vendor ? vendor.name : "Unknown Vendor",
      items: vendorItems,
      subtotal
    })
  }

  // 5) Clear cart
  cart.items = []
  await cart.save()

  return order
}

module.exports = {
  placeOrder
}
