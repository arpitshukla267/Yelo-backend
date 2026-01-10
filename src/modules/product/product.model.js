const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    // base slug from product name (not unique)
    // Auto-generated from name if not provided
    baseSlug: {
      type: String,
      required: false, // Will be auto-generated in pre-validate hook
      lowercase: true,
      trim: true
    },

    // FINAL slug used in URL (unique)
    // Auto-generated from baseSlug and vendorSlug if not provided
    slug: {
      type: String,
      required: false, // Will be auto-generated in pre-validate hook
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
    // Optional - if not provided, slug will use timestamp for uniqueness
    vendorSlug: {
      type: String,
      required: false, // Optional - will use timestamp in slug if missing
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
  // Auto-generate baseSlug from name if not provided
  if (!this.baseSlug && this.name) {
    this.baseSlug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  }

  // Generate slug as baseSlug-vendorSlug for database uniqueness
  // Frontend will construct vendor-slug/product-slug URLs for SEO
  if (!this.slug) {
    if (this.baseSlug && this.vendorSlug) {
      this.slug = `${this.baseSlug}-${this.vendorSlug}`
    } else if (this.baseSlug) {
      // If vendorSlug is missing, use baseSlug with timestamp to ensure uniqueness
      this.slug = `${this.baseSlug}-${Date.now()}`
    }
  }

  // Ensure slug and baseSlug are set (validation will fail if not)
  if (!this.baseSlug) {
    throw new Error('baseSlug is required. Provide either baseSlug or name field.')
  }
  if (!this.slug) {
    throw new Error('slug is required. Provide either slug or both baseSlug and vendorSlug fields.')
  }

  this.majorCategory = this.price <= 2000 ? "AFFORDABLE" : "LUXURY"
  
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
    
    // Update category counts in background (non-blocking)
    const { updateCategoryCounts } = require("../category/category.service")
    updateCategoryCounts().catch(err => {
      console.error('Error updating category counts after product save:', err.message)
    })
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
      
      // Update category counts in background (non-blocking)
      const { updateCategoryCounts } = require("../category/category.service")
      updateCategoryCounts().catch(err => {
        console.error('Error updating category counts after product update:', err.message)
      })
    } catch (error) {
      console.error(`Error auto-assigning product ${doc._id} to shops:`, error.message)
    }
  }
})

// Update category counts after product deletion (for findOneAndDelete, findByIdAndDelete, etc.)
productSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    try {
      const { updateCategoryCounts } = require("../category/category.service")
      // Run in background - don't block deletion
      updateCategoryCounts().catch(err => {
        console.error('Error updating category counts after product delete:', err.message)
      })
    } catch (error) {
      console.error('Error in post-delete hook:', error.message)
    }
  }
})

// Update category counts after product removal (for document.remove())
productSchema.post('remove', async function() {
  try {
    const { updateCategoryCounts } = require("../category/category.service")
    // Run in background - don't block deletion
    updateCategoryCounts().catch(err => {
      console.error('Error updating category counts after product remove:', err.message)
    })
  } catch (error) {
    console.error('Error in post-remove hook:', error.message)
  }
})

module.exports = mongoose.model("Product", productSchema)
