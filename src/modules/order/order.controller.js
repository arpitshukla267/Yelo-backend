const Order = require("./order.model")
const User = require("../user/user.model")
const { placeOrder } = require("./order.service")
const PDFDocument = require("pdfkit")

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

async function downloadInvoice(req, res) {
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

    // Get user details
    const user = await User.findById(userId).lean()

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id.toString().slice(-8)}.pdf`)
    
    // Pipe PDF to response
    doc.pipe(res)

    // Company/Store Header
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('Yelo Fashion', 50, 50, { align: 'center' })
    
    doc.fontSize(12)
       .font('Helvetica')
       .text('Invoice', 50, 80, { align: 'center' })
    
    doc.moveDown()

    // Invoice Details
    const orderNumber = order._id.toString().slice(-8).toUpperCase()
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    doc.fontSize(10)
       .font('Helvetica')
       .text(`Order Number: #${orderNumber}`, 50, 130)
       .text(`Order Date: ${orderDate}`, 50, 145)
       .text(`Status: ${order.orderStatus || 'PLACED'}`, 50, 160)

    // Customer Details
    let customerY = 130
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Bill To:', 400, customerY)
    
    customerY += 20
    doc.fontSize(10)
       .font('Helvetica')
    
    if (order.deliveryAddress) {
      if (order.deliveryAddress.address) {
        doc.text(order.deliveryAddress.address, 400, customerY, { width: 150 })
        customerY += 15
      }
      const addressLine = [
        order.deliveryAddress.city,
        order.deliveryAddress.state,
        order.deliveryAddress.pincode
      ].filter(Boolean).join(', ')
      if (addressLine) {
        doc.text(addressLine, 400, customerY, { width: 150 })
        customerY += 15
      }
    }
    
    if (user?.phone) {
      doc.text(`Phone: ${user.phone}`, 400, customerY, { width: 150 })
    }

    // Items Table Header
    let tableY = 220
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Item', 50, tableY)
       .text('Quantity', 300, tableY)
       .text('Price', 380, tableY)
       .text('Total', 450, tableY)
    
    // Table Line
    doc.moveTo(50, tableY + 15)
       .lineTo(550, tableY + 15)
       .stroke()

    // Items
    tableY += 25
    doc.font('Helvetica')
    
    order.items.forEach((item) => {
      const product = item.productId || item
      const productName = typeof product === 'object' ? product.name : 'Product'
      const quantity = item.quantity || 1
      const price = item.price || item.priceAtAdd || 0
      const itemTotal = quantity * price

      doc.text(productName, 50, tableY, { width: 240 })
      doc.text(quantity.toString(), 300, tableY)
      doc.text(`₹${price.toFixed(2)}`, 380, tableY)
      doc.text(`₹${itemTotal.toFixed(2)}`, 450, tableY)
      
      tableY += 20

      // Page break if needed
      if (tableY > 700) {
        doc.addPage()
        tableY = 50
      }
    })

    // Total
    tableY += 10
    doc.moveTo(50, tableY)
       .lineTo(550, tableY)
       .stroke()
    
    tableY += 15
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Total Amount:', 300, tableY)
       .text(`₹${(order.totalAmount || 0).toFixed(2)}`, 450, tableY)

    // Payment Information
    tableY += 30
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Payment Method: ${order.paymentMethod || 'Not specified'}`, 50, tableY)
       .text(`Payment Status: ${order.paymentStatus || 'PENDING'}`, 50, tableY + 15)

    // Footer
    doc.fontSize(8)
       .font('Helvetica')
       .text('Thank you for your order!', 50, 750, { align: 'center' })
       .text('For queries, contact: support@yeloindia.com', 50, 765, { align: 'center' })

    // Finalize PDF
    doc.end()

  } catch (err) {
    console.error('Error generating invoice:', err)
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  downloadInvoice
}
