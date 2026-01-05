const Shop = require("./shop.model")

const shops = [
  {
    slug: "affordable",
    name: "Affordable",
    route: "/affordable",
    majorCategory: "AFFORDABLE",
    shopType: "PRICE_BASED",
    criteria: { priceMax: 1000 },
    defaultSort: "popular",
    hasSidebar: false,
    hasBottomBar: true,
    uiTheme: "affordable"
  },
  {
    slug: "under-999",
    name: "Under ₹999",
    route: "/under-999",
    majorCategory: "AFFORDABLE",
    shopType: "PRICE_BASED",
    criteria: { priceMax: 999 },
    defaultSort: "popular",
    hasSidebar: true,
    hasBottomBar: true
  },
  {
    slug: "best-sellers",
    name: "Best Sellers",
    route: "/best-sellers",
    majorCategory: "AFFORDABLE",
    shopType: "PERFORMANCE_BASED",
    criteria: { priceMax: 5000, minRating: 4, minReviews: 5 },
    defaultSort: "popular",
    hasSidebar: false,
    hasBottomBar: false
  },
  {
    slug: "deals",
    name: "Deals",
    route: "/deals",
    majorCategory: "AFFORDABLE",
    shopType: "DISCOUNT_BASED",
    criteria: { priceMax: 1000, hasDiscount: true },
    defaultSort: "discount-high",
    hasSidebar: false,
    hasBottomBar: false
  },
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    route: "/new-arrivals",
    majorCategory: "AFFORDABLE",
    shopType: "TIME_BASED",
    criteria: { priceMax: 1000, daysSinceAdded: 30 },
    defaultSort: "newest",
    hasSidebar: false,
    hasBottomBar: false
  },
  {
    slug: "offers",
    name: "Offers",
    route: "/offers",
    majorCategory: "AFFORDABLE",
    shopType: "DISCOUNT_BASED",
    criteria: { priceMax: 1000, hasDiscount: true },
    defaultSort: "popular",
    hasSidebar: true,
    hasBottomBar: true
  },
  {
    slug: "trending",
    name: "Trending",
    route: "/trending",
    majorCategory: "AFFORDABLE",
    shopType: "TRENDING_BASED",
    criteria: { priceMax: 1000, isTrending: true },
    defaultSort: "popular",
    hasSidebar: true,
    hasBottomBar: false
  },
  // Price Spot Section - Individual shops for each category
  {
    slug: "price-spot-sweatshirts",
    name: "Sweatshirts",
    route: "/price-spot",
    majorCategory: "AFFORDABLE",
    shopType: "CATEGORY_BASED",
    criteria: { priceMax: 499, categoryMatch: "sweatshirts" },
    defaultSort: "price-low",
    hasSidebar: false,
    hasBottomBar: true
  },
  {
    slug: "price-spot-tshirts",
    name: "Tshirts",
    route: "/price-spot",
    majorCategory: "AFFORDABLE",
    shopType: "CATEGORY_BASED",
    criteria: { priceMax: 299, categoryMatch: "tshirts" },
    defaultSort: "price-low",
    hasSidebar: false,
    hasBottomBar: true
  },
  {
    slug: "price-spot-tracksuits",
    name: "Tracksuits",
    route: "/price-spot",
    majorCategory: "AFFORDABLE",
    shopType: "CATEGORY_BASED",
    criteria: { priceMax: 899, categoryMatch: "tracksuits" },
    defaultSort: "price-low",
    hasSidebar: false,
    hasBottomBar: true
  },
  {
    slug: "price-spot-sweaters",
    name: "Sweaters",
    route: "/price-spot",
    majorCategory: "AFFORDABLE",
    shopType: "CATEGORY_BASED",
    criteria: { priceMax: 599, categoryMatch: "sweaters" },
    defaultSort: "price-low",
    hasSidebar: false,
    hasBottomBar: true
  },
  {
    slug: "price-spot-kurta-sets",
    name: "Kurta Sets",
    route: "/price-spot",
    majorCategory: "AFFORDABLE",
    shopType: "CATEGORY_BASED",
    criteria: { priceMax: 599, categoryMatch: "kurta-sets" },
    defaultSort: "price-low",
    hasSidebar: false,
    hasBottomBar: true
  },
  {
    slug: "price-spot-face-wash",
    name: "Face Wash and Cleanser",
    route: "/price-spot",
    majorCategory: "AFFORDABLE",
    shopType: "CATEGORY_BASED",
    criteria: { priceMax: 199, categoryMatch: "face-wash" },
    defaultSort: "price-low",
    hasSidebar: false,
    hasBottomBar: true
  },
  // Super Savers Section - Individual shops for each category
  {
    slug: "super-savers-jackets",
    name: "Jackets",
    route: "/super-savers",
    majorCategory: "AFFORDABLE",
    shopType: "CATEGORY_BASED",
    criteria: { priceMax: 949, categoryMatch: "jackets", brandMatch: ["HRX", "Adidas"] },
    defaultSort: "price-low",
    hasSidebar: false,
    hasBottomBar: true
  },
  {
    slug: "super-savers-kurta-sets",
    name: "Kurta Sets",
    route: "/super-savers",
    majorCategory: "AFFORDABLE",
    shopType: "CATEGORY_BASED",
    criteria: { priceMax: 1099, categoryMatch: "kurta-sets", brandMatch: ["Anouk", "Jaspere"] },
    defaultSort: "price-low",
    hasSidebar: false,
    hasBottomBar: true
  },
  {
    slug: "super-savers-sneakers",
    name: "Sneakers",
    route: "/super-savers",
    majorCategory: "AFFORDABLE",
    shopType: "CATEGORY_BASED",
    criteria: { priceMax: 1299, categoryMatch: "sneakers", brandMatch: ["Nike", "Puma"] },
    defaultSort: "price-low",
    hasSidebar: false,
    hasBottomBar: true
  },
  {
    slug: "super-savers-sweaters",
    name: "Sweaters",
    route: "/super-savers",
    majorCategory: "AFFORDABLE",
    shopType: "CATEGORY_BASED",
    criteria: { priceMax: 549, categoryMatch: "sweaters", brandMatch: ["Roadster", "Dressberry"] },
    defaultSort: "price-low",
    hasSidebar: false,
    hasBottomBar: true
  },
  {
    slug: "super-savers-kurtas",
    name: "Kurtas",
    route: "/super-savers",
    majorCategory: "AFFORDABLE",
    shopType: "CATEGORY_BASED",
    criteria: { priceMax: 349, categoryMatch: "kurtas", brandMatch: ["Anouk"] },
    defaultSort: "price-low",
    hasSidebar: false,
    hasBottomBar: true
  },
  {
    slug: "super-savers-home-decor",
    name: "Home Decor",
    route: "/super-savers",
    majorCategory: "AFFORDABLE",
    shopType: "CATEGORY_BASED",
    criteria: { priceMax: 799, categoryMatch: "home-decor", brandMatch: ["Home Center"] },
    defaultSort: "price-low",
    hasSidebar: false,
    hasBottomBar: true
  },
  {
    slug: "featured-brands",
    name: "Featured Brands",
    route: "/featured-brands",
    majorCategory: "AFFORDABLE",
    shopType: "BRAND_BASED",
    criteria: { 
      brandMatch: ["Fastrack", "Voylla", "Nike", "Adidas", "Zara", "H&M"],
      priceMax: 5000
    },
    defaultSort: "popular",
    hasSidebar: true,
    hasBottomBar: false
  },
  {
    slug: "todays-deal",
    name: "Today's Deal",
    route: "/todays-deal",
    majorCategory: "AFFORDABLE",
    shopType: "DISCOUNT_BASED",
    criteria: { priceMax: 1000, hasDiscount: true, daysSinceAdded: 7 },
    defaultSort: "discount-high",
    hasSidebar: false,
    hasBottomBar: false
  },
  {
    slug: "fresh-arrival",
    name: "Fresh Arrival",
    route: "/fresh-arrival",
    majorCategory: "AFFORDABLE",
    shopType: "TIME_BASED",
    criteria: { priceMax: 1000, daysSinceAdded: 7 },
    defaultSort: "newest",
    hasSidebar: false,
    hasBottomBar: false
  },
  {
    slug: "luxury-shop",
    name: "Luxury Collection",
    route: "/luxury/shop",
    majorCategory: "LUXURY",
    shopType: "PRICE_BASED",
    criteria: { priceMin: 1000 },
    defaultSort: "newest",
    hasSidebar: false,
    hasBottomBar: false,
    uiTheme: "luxury"
  },
  {
    slug: "luxury-fragrances",
    name: "Luxury Fragrances",
    route: "/luxury/shop/fragrances",
    majorCategory: "LUXURY",
    shopType: "CATEGORY_BASED",
    parentShopSlug: "luxury-shop",
    criteria: { priceMin: 1000, categoryMatch: "fragrances", nameMatch: "fragrances" },
    defaultSort: "newest",
    uiTheme: "luxury"
  },
  {
    slug: "luxury-lipsticks",
    name: "Luxury Lipsticks",
    route: "/luxury/shop/lipsticks",
    majorCategory: "LUXURY",
    shopType: "CATEGORY_BASED",
    parentShopSlug: "luxury-shop",
    criteria: { priceMin: 1000, categoryMatch: "lipsticks", nameMatch: "lipsticks" },
    defaultSort: "newest",
    uiTheme: "luxury"
  },
  {
    slug: "luxury-eyewear",
    name: "Luxury Eyewear",
    route: "/luxury/shop/eyewear",
    majorCategory: "LUXURY",
    shopType: "CATEGORY_BASED",
    parentShopSlug: "luxury-shop",
    criteria: { priceMin: 1000, categoryMatch: "eyewear", nameMatch: "eyewear" },
    defaultSort: "newest",
    uiTheme: "luxury"
  },
  {
    slug: "luxury-foundation",
    name: "Luxury Foundation",
    route: "/luxury/shop/foundation",
    majorCategory: "LUXURY",
    shopType: "CATEGORY_BASED",
    parentShopSlug: "luxury-shop",
    criteria: { priceMin: 1000, categoryMatch: "foundation", nameMatch: "foundation" },
    defaultSort: "newest",
    uiTheme: "luxury"
  },
  {
    slug: "luxury-skincare",
    name: "Luxury Skincare",
    route: "/luxury/shop/skincare",
    majorCategory: "LUXURY",
    shopType: "CATEGORY_BASED",
    parentShopSlug: "luxury-shop",
    criteria: { priceMin: 1000, categoryMatch: "skincare", nameMatch: "skincare" },
    defaultSort: "newest",
    uiTheme: "luxury"
  },
  {
    slug: "luxury-watches",
    name: "Luxury Watches",
    route: "/luxury/shop/watches",
    majorCategory: "LUXURY",
    shopType: "CATEGORY_BASED",
    parentShopSlug: "luxury-shop",
    criteria: { priceMin: 1000, categoryMatch: "watches" },
    defaultSort: "newest",
    uiTheme: "luxury"
  }
]

async function seedShops() {
  await Shop.deleteMany({})
  await Shop.insertMany(shops)
  console.log("✅ Shops seeded successfully")
}

module.exports = seedShops
