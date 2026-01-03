# Postman Guide - Adding Products to Test Orders

## Quick Start

1. **Import the Postman Collection**
   - Open Postman
   - Click "Import" → Select `POSTMAN_PRODUCTS.json`
   - Or copy the JSON content and import it

2. **Set Your Base URL**
   - In Postman, select the imported collection
   - Go to "Variables" tab
   - Set `baseUrl` to your backend URL:
     - Local: `http://localhost:5000`
     - Production: `https://yelo-backend.onrender.com`

3. **Delete Existing Dummy Products (Optional)**
   - Run: `Delete All Products` request
   - This removes all existing products from database

4. **Add 30 Test Products**
   - Run: `Create Bulk Products (30 Products)` request
   - This adds 30 diverse products covering:
     - Men's wear (shirts, jeans, blazers, trousers)
     - Women's wear (dresses, sarees, kurta sets, skirts)
     - Kids wear (t-shirts)
     - Footwear (running shoes, sneakers)
     - Accessories (bags, watches, jewelry, sunglasses)
     - Different price ranges (₹299 to ₹8999)
     - Various categories and brands

## Product Categories Included

- **Shirts & Tops:** White shirt, polo shirt, t-shirts
- **Bottoms:** Jeans, shorts, trousers, track pants, skirts
- **Dresses & Ethnic:** Floral dress, maxi dress, saree, kurta set, jumpsuit
- **Footwear:** Running shoes, high-top sneakers
- **Outerwear:** Hoodie, denim jacket, blazer
- **Accessories:** Handbag, backpack, wallet, belt, cap, scarf, tie
- **Jewelry:** Earrings, necklace, anklet
- **Watches & Sunglasses:** Luxury watch, aviator sunglasses
- **Kids:** Cartoon print t-shirt

## Manual Request Format

If you prefer to create requests manually:

### Delete All Products
```
POST {{baseUrl}}/api/products/admin/delete-all
Content-Type: application/json
```

### Create Bulk Products
```
POST {{baseUrl}}/api/products/bulk
Content-Type: application/json

Body: [array of 30 products - see POSTMAN_PRODUCTS.json]
```

### Single Product Format Example
```json
{
  "name": "Product Name",
  "baseSlug": "product-name-slug",
  "vendorSlug": "yelo-fashion",
  "description": "Product description",
  "price": 999,
  "originalPrice": 1499,
  "discount": 33,
  "audience": {
    "gender": "MEN",
    "ageGroup": "ADULT"
  },
  "productType": "shirt",
  "occasion": ["office", "casual"],
  "material": ["cotton"],
  "fit": "regular",
  "category": "shirts",
  "brand": "Yelo Fashion",
  "rating": 4.5,
  "reviews": 127,
  "sizes": ["S", "M", "L", "XL"],
  "colors": [
    { "name": "White", "value": "#FFFFFF" }
  ],
  "images": [
    {
      "url": "https://images.unsplash.com/photo-...",
      "alt": "Product image",
      "isPrimary": true
    }
  ],
  "isTrending": true,
  "isActive": true
}
```

## Important Fields

- **Required:** `name`, `baseSlug`, `vendorSlug`, `price`
- **Auto-generated:** `slug` (from baseSlug + vendorSlug), `majorCategory` (based on price ≤1000 = AFFORDABLE, >1000 = LUXURY)
- **Gender options:** `MEN`, `WOMEN`, `KIDS`, `UNISEX`
- **Age group:** `ADULT`, `KIDS`
- **Prices:** Products range from ₹299 to ₹8999 to test both AFFORDABLE and LUXURY categories

## Testing Order Flow

After adding products:

1. **View Products:**
   ```
   GET {{baseUrl}}/api/products
   ```

2. **Get Single Product:**
   ```
   GET {{baseUrl}}/api/products/{slug}
   ```

3. **Add to Cart:**
   ```
   POST {{baseUrl}}/api/cart
   Body: { productId, quantity, size, color }
   ```

4. **Create Order:**
   ```
   POST {{baseUrl}}/api/orders
   Body: { items: [...], shippingAddress: {...} }
   ```

## Notes

- All products use `vendorSlug: "yelo-fashion"` - change if needed
- Images are from Unsplash (free to use)
- Products are set to `isActive: true` by default
- Some products are marked as `isTrending: true`
- Sizes and colors vary per product type

## Troubleshooting

**Error: "slug already exists"**
- Delete all products first, then create new ones
- Or change the `baseSlug` for duplicates

**Error: "vendorSlug is required"**
- Make sure `vendorSlug` field is included in all products

**Products not showing in frontend:**
- Check if `isActive: true`
- Verify API is returning products: `GET /api/products`
- Check frontend ProductsContext is fetching from API

