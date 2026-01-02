const { placeOrder } = require("./order.service")

async function createOrder(req, res) {
  try {
    const order = await placeOrder()
    res.status(201).json({
      success: true,
      orderId: order._id,
      message: "Order placed successfully"
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    })
  }
}

module.exports = {
  createOrder
}
