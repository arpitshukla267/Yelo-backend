const Order = require("./order.model")
const { placeOrder } = require("./order.service")

async function getOrders(req, res) {
  try {
    const userId = req.user.userId
    
    const orders = await Order.find({ userId })
      .populate("items.productId", "name slug images price")
      .sort({ createdAt: -1 })
      .lean()

    res.json({
      success: true,
      data: orders
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

async function getOrderById(req, res) {
  try {
    const { id } = req.params
    const userId = req.user.userId
    
    const order = await Order.findOne({ _id: id, userId })
      .populate("items.productId", "name slug images price brand")
      .lean()

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }

    res.json({
      success: true,
      data: order
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

async function createOrder(req, res) {
  try {
    const userId = req.user.userId
    const order = await placeOrder(userId, req.body)
    
    res.status(201).json({
      success: true,
      data: order,
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
  getOrders,
  getOrderById,
  createOrder
}
