const router = require("express").Router()
const { createOrder } = require("./order.controller")

router.post("/", createOrder)

module.exports = router