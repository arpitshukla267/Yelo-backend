# Fix for 500 Error on Render Deployment

## Problem
The geocoding endpoint returns a 500 error because:
1. `fetch` API is not available in the Node.js version on Render
2. The `axios` package needs to be installed

## Solution Applied
✅ Replaced `fetch` with `axios` for better Node.js compatibility
✅ Added `axios` to `package.json`
✅ Improved error handling and logging

## Steps to Fix on Render

### 1. Install Axios (if deploying from git)
After pushing the updated code:
```bash
# Render will automatically run npm install, which will install axios
```

### 2. Add Environment Variable in Render Dashboard

1. Go to your Render Dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add the following environment variable:

```
Key: GOOGLE_MAPS_API_KEY
Value: AIzaSyDVkcu1ki6ufugY9xbtEyOlL_a89uzn6Ic
```

5. Click **Save Changes**

### 3. Redeploy the Service

After adding the environment variable:
1. Go to **Manual Deploy** tab (or it will auto-deploy if connected to Git)
2. Click **Deploy latest commit** (or trigger a new deployment)

### 4. Verify Installation

Check Render logs to ensure:
- ✅ `axios` package is installed (you'll see it in npm install logs)
- ✅ Environment variable `GOOGLE_MAPS_API_KEY` is loaded
- ✅ Server starts without errors

## Testing After Deployment

Test the endpoint:
```bash
curl "https://yelo-backend.onrender.com/api/geocoding/reverse?latitude=25.448870576504593&longitude=78.54061532522952"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "address": "...",
    "city": "...",
    "state": "...",
    "pincode": "...",
    "fullAddress": "..."
  }
}
```

## Common Issues

### Issue: Still getting 500 error
**Solution:** 
- Check Render logs for the exact error message
- Verify `GOOGLE_MAPS_API_KEY` is set correctly in environment variables
- Ensure Geocoding API is enabled in Google Cloud Console

### Issue: "Module not found: axios"
**Solution:**
- Make sure you've pushed the updated `package.json` to your repository
- Render should automatically run `npm install` on deploy
- Check deployment logs to confirm axios installation

### Issue: "Google Maps API key is not configured"
**Solution:**
- Double-check the environment variable name: `GOOGLE_MAPS_API_KEY` (exact case)
- Verify it's set in Render's environment variables, not `.env` file
- After adding/updating, redeploy the service

### Issue: "Geocoding API access denied"
**Solution:**
- Go to Google Cloud Console → APIs & Services → Credentials
- Check API key restrictions:
  - **Application restrictions:** Should be "None" or "IP addresses" (NOT HTTP referrers)
  - **API restrictions:** Must include "Geocoding API" in allowed APIs

## Next Steps

1. ✅ Push updated code to repository (if using Git deployment)
2. ✅ Add `GOOGLE_MAPS_API_KEY` to Render environment variables
3. ✅ Redeploy backend service
4. ✅ Test the endpoint
5. ✅ Verify frontend can successfully call the geocoding API

