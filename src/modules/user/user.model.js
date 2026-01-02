const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    name: {
      type: String
    },

    email: {
      type: String
    },

    avatar: {
      type: String // image URL
    },

    isProfileComplete: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("User", userSchema)
