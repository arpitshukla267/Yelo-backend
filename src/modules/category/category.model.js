const mongoose = require("mongoose")

const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    icon: String,
    image: String,
    productCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    icon: String,
    image: String,
    subcategories: [subcategorySchema],
    productCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    majorCategory: {
      type: String,
      enum: ["AFFORDABLE", "LUXURY", "ALL"],
      default: "ALL",
      index: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Category", categorySchema)

