const router = require("express").Router()
const { createOrder, getOrders, getOrderById, downloadInvoice } = require("./order.controller")
const auth = require("../../middlewares/auth.middleware")

// All order routes require authentication
router.get("/", auth, getOrders)
router.get("/:id/invoice", auth, downloadInvoice)
router.get("/:id", auth, getOrderById)
router.post("/", auth, createOrder)

module.exports = router