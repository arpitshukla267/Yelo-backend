const Order = require("./order.model")
const User = require("../user/user.model")

/**
 * Get all orders for admin with full details
 */
async function getAllAdminOrders(req, res) {
  try {
    const { status } = req.query
    
    // Build query
    const query = {}
    if (status) {
      query.orderStatus = status.toUpperCase()
    }
    
    // Fetch orders with full population
    const orders = await Order.find(query)
      .populate({
        path: "userId",
        select: "name phone email avatar fullName"
      })
      .populate({
        path: "items.productId",
        select: "name slug images price brand vendorSlug sizes colors description"
      })
      .sort({ createdAt: -1 })
      .lean()
    
    // Manually populate vendor information from vendorSlug
    const Vendor = require("../vendors/vendors.model")
    const vendorCache = new Map() // Cache vendors to avoid duplicate queries
    
    for (const order of orders) {
      for (const item of order.items || []) {
        if (item.productId && item.productId.vendorSlug) {
          // Check cache first
          if (vendorCache.has(item.productId.vendorSlug)) {
            item.productId.vendorId = vendorCache.get(item.productId.vendorSlug)
          } else {
            const vendor = await Vendor.findOne({ slug: item.productId.vendorSlug })
              .select("name slug email phone address")
              .lean()
            if (vendor) {
              vendorCache.set(item.productId.vendorSlug, vendor)
              item.productId.vendorId = vendor
            }
          }
        }
      }
    }
    
    res.json({
      success: true,
      data: orders,
      count: orders.length
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Get single order by ID for admin
 */
async function getAdminOrderById(req, res) {
  try {
    const { id } = req.params
    
    const order = await Order.findById(id)
      .populate({
        path: "userId",
        select: "name phone email avatar fullName"
      })
      .populate({
        path: "items.productId",
        select: "name slug images price brand vendorSlug sizes colors description"
      })
      .lean()
    
    // Manually populate vendor information from vendorSlug
    const Vendor = require("../vendors/vendors.model")
    if (order && order.items) {
      for (const item of order.items) {
        if (item.productId && item.productId.vendorSlug) {
          const vendor = await Vendor.findOne({ slug: item.productId.vendorSlug })
            .select("name slug email phone address")
            .lean()
          if (vendor) {
            item.productId.vendorId = vendor
          }
        }
      }
    }
    
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

/**
 * Update order status (admin only)
 */
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params
    const { status } = req.body
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      })
    }
    
    const validStatuses = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED"]
    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      })
    }
    
    const order = await Order.findByIdAndUpdate(
      id,
      { 
        orderStatus: status.toUpperCase(),
        $push: {
          statusHistory: {
            status: status.toUpperCase(),
            updatedAt: new Date()
          }
        }
      },
      { new: true }
    )
      .populate({
        path: "userId",
        select: "name phone email avatar fullName"
      })
      .populate({
        path: "items.productId",
        select: "name slug images price brand vendorSlug sizes colors description"
      })
      .lean()
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }
    
    // Manually populate vendor information from vendorSlug (same as getAllAdminOrders)
    const Vendor = require("../vendors/vendors.model")
    const vendorCache = new Map()
    
    for (const item of order.items || []) {
      if (item.productId && item.productId.vendorSlug) {
        if (vendorCache.has(item.productId.vendorSlug)) {
          item.productId.vendorId = vendorCache.get(item.productId.vendorSlug)
        } else {
          const vendor = await Vendor.findOne({ slug: item.productId.vendorSlug })
            .select("name slug email phone address")
            .lean()
          if (vendor) {
            vendorCache.set(item.productId.vendorSlug, vendor)
            item.productId.vendorId = vendor
          }
        }
      }
    }
    
    res.json({
      success: true,
      message: "Order status updated successfully",
      data: order
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Reassign order to shop (admin only)
 */
async function reassignOrderToShop(req, res) {
  try {
    const { id } = req.params
    const { shopSlug } = req.body
    
    if (!shopSlug) {
      return res.status(400).json({
        success: false,
        message: "shopSlug is required"
      })
    }
    
    const order = await Order.findByIdAndUpdate(
      id,
      { assignedShop: shopSlug },
      { new: true }
    )
      .populate({
        path: "userId",
        select: "name phone email"
      })
      .lean()
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }
    
    res.json({
      success: true,
      message: "Order reassigned to shop successfully",
      data: order
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Complete order (admin only)
 */
async function completeOrderAdmin(req, res) {
  try {
    const { id } = req.params
    
    const order = await Order.findById(id)
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      })
    }

    // Check if order is already completed
    if (order.orderStatus === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Order is already completed"
      })
    }

    // Check if order is cancelled
    if (order.orderStatus === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cannot complete a cancelled order"
      })
    }

    // Update order status to COMPLETED
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { 
        orderStatus: "COMPLETED",
        $push: {
          statusHistory: {
            status: "COMPLETED",
            updatedAt: new Date()
          }
        }
      },
      { new: true }
    )
      .populate({
        path: "userId",
        select: "name phone email avatar fullName"
      })
      .populate({
        path: "items.productId",
        select: "name slug images price brand vendorSlug sizes colors description"
      })
      .lean()
    
    // Manually populate vendor information from vendorSlug
    const Vendor = require("../vendors/vendors.model")
    const vendorCache = new Map()
    
    for (const item of updatedOrder.items || []) {
      if (item.productId && item.productId.vendorSlug) {
        if (vendorCache.has(item.productId.vendorSlug)) {
          item.productId.vendorId = vendorCache.get(item.productId.vendorSlug)
        } else {
          const vendor = await Vendor.findOne({ slug: item.productId.vendorSlug })
            .select("name slug email phone address")
            .lean()
          if (vendor) {
            vendorCache.set(item.productId.vendorSlug, vendor)
            item.productId.vendorId = vendor
          }
        }
      }
    }
    
    res.json({
      success: true,
      message: "Order marked as completed successfully",
      data: updatedOrder
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

module.exports = {
  getAllAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  reassignOrderToShop,
  completeOrderAdmin
}

