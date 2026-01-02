const express = require("express")
const router = express.Router()
const controller = require("./product.controller")

router.post("/", controller.createProduct)
router.post("/bulk", controller.createBulkProducts)

module.exports = router
