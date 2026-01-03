# Fix Existing Products - Quick Guide

## Problem
Products added via Postman have empty `assignedShops` arrays, so they don't appear on the website. Also, categories and subcategories need to be created from existing products.

## Solution

### Step 1: Seed Shops (Important!)

First, ensure all shops exist in the database:

```
POST https://yelo-backend.onrender.com/api/products/admin/seed-shops
```

This creates/updates all shops including:
- `under-999`, `best-sellers`, `deals`, `new-arrivals`
- `super-savers`, `price-spot`, `todays-deal`, `fresh-arrival`
- All luxury shops

### Step 2: Reassign Products to Shops and Create Categories

Use this API endpoint in Postman:

```
POST https://yelo-backend.onrender.com/api/products/admin/reassign-and-sync
```

Or if running locally:
```
POST http://localhost:5000/api/products/admin/reassign-and-sync
```

**No body required** - just send an empty POST request.

This will:
1. ✅ Seed shops (if not already done)
2. ✅ Reassign all active products to appropriate shops (multiple shops per product!)
3. ✅ Create categories from product.category fields
4. ✅ Create subcategories from product.productType fields
5. ✅ Update category product counts

### Step 2: Create Categories Only (if needed)

If you only want to create categories without reassigning:

```
POST https://yelo-backend.onrender.com/api/products/admin/create-categories-from-products
```

### Step 3: Verify Products Appear

After running the above:
1. Check products are assigned to shops: `GET /api/products?limit=10`
2. Check categories were created: `GET /api/categories`
3. Products should now appear on the website!

## What Gets Created

Based on your products:
- **Categories**: `shirts`, `skirts`, `accessories`, etc.
- **Subcategories**: `polo`, `skirt`, `belt`, etc.

All categories will have proper product counts and will only show on frontend if they have products.

## Future Products

All new products created via:
- `POST /api/products` (single product)
- `POST /api/products/bulk` (multiple products)

Will automatically:
- ✅ Be assigned to shops
- ✅ Create categories/subcategories if they don't exist
- ✅ Have `isActive: true` set by default

