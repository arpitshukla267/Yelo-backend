const router = require("express").Router()
const { createReview, getReviews } = require("./review.controller")

// List reviews (optionally filter by ?productId=...)
router.get("/", getReviews)

// Create a new review
router.post("/", createReview)

module.exports = router
