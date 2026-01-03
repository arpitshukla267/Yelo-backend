# Google Maps Backend Integration Summary

This document summarizes how the Google Maps geocoding backend is connected to the frontend.

## Architecture Overview

```
Frontend (React/Next.js)
    ↓
LocationModal Component
    ↓
geocoding.js utility (calls backend API)
    ↓
api.js → geocodingAPI
    ↓
Backend API Endpoint (/api/geocoding/*)
    ↓
geocoding.controller.js
    ↓
geocoding.service.js
    ↓
Google Maps Geocoding API
```

## Backend Endpoints

### 1. Reverse Geocode (Lat/Lng → Address)
- **Endpoint:** `GET /api/geocoding/reverse`
- **Query Parameters:**
  - `latitude` (required): Latitude coordinate
  - `longitude` (required): Longitude coordinate
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "address": "Street address",
      "city": "City name",
      "state": "State name",
      "pincode": "123456",
      "fullAddress": "Complete formatted address"
    }
  }
  ```

### 2. Geocode (Address → Lat/Lng)
- **Endpoint:** `GET /api/geocoding/geocode`
- **Query Parameters:**
  - `address` (required): Address string to geocode
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "latitude": 28.6139,
      "longitude": 77.2090
    }
  }
  ```

## Frontend Usage

### LocationModal Component
The `LocationModal` component uses the geocoding utilities:

```javascript
import { getCurrentLocation, reverseGeocode } from "@/utils/geocoding";

// Get user's current location (browser geolocation)
const { latitude, longitude } = await getCurrentLocation();

// Convert to address (via backend API)
const addressData = await reverseGeocode(latitude, longitude);
```

### Where It's Used
1. **LocationModal** - When user clicks "Use My Current Location"
2. **Header** - When user clicks location icon to change address
3. **Account Page** - When user edits saved address
4. **Checkout Page** - When user adds/edits delivery address

## Configuration Required

### Backend Environment Variables
Add to `backend/.env`:
```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Frontend Configuration
The frontend automatically detects the backend URL:
- **Development:** `http://localhost:5000/api`
- **Production:** Set `NEXT_PUBLIC_API_URL` environment variable or it will use the production backend URL

## Files Changed/Created

### Backend
- ✅ `backend/src/modules/geocoding/geocoding.service.js` - Service layer
- ✅ `backend/src/modules/geocoding/geocoding.controller.js` - Controller layer
- ✅ `backend/src/modules/geocoding/geocoding.routes.js` - Route definitions
- ✅ `backend/src/routes/index.js` - Registered geocoding routes
- ✅ `backend/GOOGLE_MAPS_SETUP.md` - Setup documentation

### Frontend
- ✅ `yelo-fashion/src/utils/geocoding.js` - Updated to use backend API
- ✅ `yelo-fashion/src/utils/api.js` - Added geocodingAPI functions
- ✅ `yelo-fashion/next.config.mjs` - Removed Google Maps CSP restriction

## Testing the Integration

### Test Reverse Geocode
```bash
curl "http://localhost:5000/api/geocoding/reverse?latitude=28.6139&longitude=77.2090"
```

### Test Geocode
```bash
curl "http://localhost:5000/api/geocoding/geocode?address=New%20Delhi"
```

### Test from Frontend
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd yelo-fashion && npm run dev`
3. Open the app and click the location icon in the header
4. Click "Use My Current Location" button
5. Verify address is auto-filled

## Troubleshooting

### Error: "Google Maps API key is not configured"
- **Solution:** Add `GOOGLE_MAPS_API_KEY` to `backend/.env` file

### Error: "Geocoding API is not enabled"
- **Solution:** Enable Geocoding API in Google Cloud Console

### Error: "API keys with referer restrictions cannot be used"
- **Solution:** Configure API key restrictions to use IP restrictions instead of referrer restrictions (for server-side use)

### Error: "fetch is not defined"
- **Solution:** Use Node.js 18+ (which has native fetch) or install `node-fetch` package

## Security Benefits

1. **API Key Protection:** API key is stored on backend, never exposed to clients
2. **No Referrer Restrictions:** Server-side API calls don't need referrer restrictions
3. **Better Control:** Can implement rate limiting and usage monitoring on backend
4. **IP-based Restrictions:** Can use IP restrictions for better security in production

