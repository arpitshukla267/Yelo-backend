const router = require("express").Router()
const controller = require("./vendors.controller")

router.post("/", controller.createVendor)
router.get("/", controller.getAllVendors)
router.get("/:id", controller.getVendorById)
router.put("/:id", controller.updateVendor)
router.delete("/:id", controller.deleteVendor)
router.get("/:slug/products", controller.getVendorProducts)

module.exports = router
