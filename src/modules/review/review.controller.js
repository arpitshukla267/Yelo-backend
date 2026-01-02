const mongoose = require("mongoose")
const Review = require("./review.model")
const { recalculateProductRating } = require("./review.service")
const { reassignSingleProduct } = require("../assignment/assignment.service")

async function createReview(req, res) {
  const { productId, rating, comment } = req.body

  // ✅ Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({
      message: "Invalid productId"
    })
  }

  const review = await Review.create({
    productId,
    userId: "TEMP_USER_ID", // will come from auth later
    rating,
    comment
  })

  // Update rating & review count
  await recalculateProductRating(productId)

  // Reassign ONLY this product
  await reassignSingleProduct(productId)

  res.status(201).json(review)
}

async function getReviews(req, res) {
  const { productId } = req.query

  const filter = {}
  if (productId && mongoose.Types.ObjectId.isValid(productId)) {
    filter.productId = productId
  }

  const reviews = await Review.find(filter).sort({ createdAt: -1 })
  res.json(reviews)
}

module.exports = {
  createReview,
  getReviews
}
