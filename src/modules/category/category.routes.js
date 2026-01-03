const router = require("express").Router()
const controller = require("./category.controller")

router.get("/", controller.getAllCategories)
router.get("/:slug", controller.getCategoryBySlug)
router.post("/update-counts", controller.updateCounts)

module.exports = router

