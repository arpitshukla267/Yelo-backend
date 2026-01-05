const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    // base slug from product name (not unique)
    baseSlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    // FINAL slug used in URL (unique)
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true
    },

    description: String,

    price: {
      type: Number,
      required: true,
      index: true
    },

    originalPrice: Number,

    discount: {
      type: Number,
      default: 0
    },
    audience: {
      gender: {
        type: String,
        enum: ["MEN", "WOMEN", "KIDS", "UNISEX"],
        index: true
      },
      ageGroup: {
        type: String,
        enum: ["ADULT", "KIDS"],
        index: true
      }
    },
    
    productType: {
      type: String, // shirt, tshirt, jeans
      index: true
    },
    
    subcategory: {
      type: String, // tshirts, jackets, sneakers (for category pages)
      index: true
    },
    
    occasion: {
      type: [String], // party, office, casual
      index: true
    },
    
    material: {
      type: [String], // cotton, linen, nylon
      index: true
    },
    
    fit: {
      type: String // slim, regular, loose
    },
    
    category: {
      type: String,
      index: true
    },

    brand: String,

    rating: {
      type: Number,
      default: 0,
      index: true
    },

    reviews: {
      type: Number,
      default: 0,
      index: true
    },

    sizes: [String],

    colors: [
      {
        name: String,
        value: String
      }
    ],

    images: [
      {
        url: {
          type: String,
          required: true
        },
        alt: String,
        isPrimary: {
          type: Boolean,
          default: false
        }
      }
    ],

    isTrending: {
      type: Boolean,
      default: false,
      index: true
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    dateAdded: {
      type: Date,
      default: Date.now,
      index: true
    },

    majorCategory: {
      type: String,
      enum: ["AFFORDABLE", "LUXURY"],
      index: true
    },

    assignedShops: {
      type: [String],
      index: true
    },

    // vendor identifier
    vendorSlug: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true
    }
  },
  { timestamps: true }
)

/**
 * Auto-generate:
 * 1. final slug = baseSlug + vendorSlug (for backward compatibility)
 *    But also support vendor-slug/product-slug format in URLs for SEO
 * 2. majorCategory
 */
productSchema.pre("validate", function () {
  // Generate slug as baseSlug-vendorSlug for database uniqueness
  // Frontend will construct vendor-slug/product-slug URLs for SEO
  if (this.baseSlug && this.vendorSlug) {
    this.slug = `${this.baseSlug}-${this.vendorSlug}`
  }

  this.majorCategory = this.price <= 1000 ? "AFFORDABLE" : "LUXURY"
  
  // Auto-populate subcategory from productType if not set
  if (this.productType && !this.subcategory) {
    // Normalize productType to subcategory format
    this.subcategory = this.productType.toLowerCase().replace(/\s+/g, '-')
  }
})

// Virtual for SEO-friendly URL format
productSchema.virtual('seoUrl').get(function() {
  if (this.vendorSlug && this.baseSlug) {
    return `${this.vendorSlug}/${this.baseSlug}`
  }
  return this.slug
})

// Auto-assign products to shops after save (create or update)
productSchema.post('save', async function() {
  try {
    const { assignProductToShops } = require("../assignment/assignment.service")
    await assignProductToShops(this)
  } catch (error) {
    console.error(`Error auto-assigning product ${this._id} to shops:`, error.message)
    // Don't throw - assignment failure shouldn't prevent product save
  }
})

// Auto-assign products to shops after update
productSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    try {
      const { assignProductToShops } = require("../assignment/assignment.service")
      await assignProductToShops(doc)
    } catch (error) {
      console.error(`Error auto-assigning product ${doc._id} to shops:`, error.message)
    }
  }
})

module.exports = mongoose.model("Product", productSchema)
