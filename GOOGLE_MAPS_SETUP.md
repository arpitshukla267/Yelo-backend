# Google Maps API Setup Guide

This guide explains how to set up the Google Maps API key for the backend geocoding service.

## Why Server-Side?

The geocoding API is called from the backend instead of the frontend to:
- Avoid referrer restriction issues
- Keep API keys secure (not exposed to clients)
- Allow IP-based restrictions instead of referrer restrictions
- Better control over API usage and quotas

## Setup Steps

### 1. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **API Key**
5. Copy your API key

### 2. Enable Geocoding API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Geocoding API"
3. Click on it and click **Enable**

### 3. Configure API Key Restrictions (Recommended)

1. Go to **APIs & Services** > **Credentials**
2. Click on your API key to edit it
3. Under **API restrictions**, select **Restrict key**
4. Check only **Geocoding API** (or select the APIs you need)
5. Under **Application restrictions**, you can choose:
   - **None** (for development)
   - **IP addresses** (for production - add your server's IP addresses)
   - **HTTP referrers** (not recommended for server-side API)

**Note:** Since we're using server-side geocoding, you can use IP restrictions or no restrictions. Referrer restrictions won't work for server-side API calls.

### 4. Add API Key to Backend Environment

Add the following to your `backend/.env` file:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

Replace `your_google_maps_api_key_here` with your actual API key.

### 5. For Production (Vercel/Render/etc.)

When deploying to production:

1. Add `GOOGLE_MAPS_API_KEY` as an environment variable in your hosting platform
2. Make sure to enable billing in Google Cloud Console (Geocoding API requires billing)
3. Set up API key restrictions based on your server's IP addresses (if applicable)

## API Endpoints

The backend provides the following geocoding endpoints:

- `GET /api/geocoding/reverse?latitude=XX&longitude=YY` - Convert lat/lng to address
- `GET /api/geocoding/geocode?address=XXX` - Convert address to lat/lng

## Testing

To test if the setup is working:

```bash
# Reverse geocode (lat/lng to address)
curl "http://localhost:5000/api/geocoding/reverse?latitude=28.6139&longitude=77.2090"

# Geocode (address to lat/lng)
curl "http://localhost:5000/api/geocoding/geocode?address=New%20Delhi"
```

## Troubleshooting

### Error: "API keys with referer restrictions cannot be used with this API"

This error occurs when the API key has HTTP referrer restrictions. For server-side API calls, you need to:
- Remove referrer restrictions, OR
- Use IP address restrictions instead

### Error: "Geocoding API is not enabled"

Make sure you've enabled the Geocoding API in Google Cloud Console:
1. Go to APIs & Services > Library
2. Search for "Geocoding API"
3. Click Enable

### Error: "API key is not configured"

Make sure you've added `GOOGLE_MAPS_API_KEY` to your `backend/.env` file and restarted the server.

