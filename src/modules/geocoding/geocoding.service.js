/**
 * Google Maps Geocoding Service
 * Handles server-side geocoding requests
 */

let axios;
try {
  axios = require('axios');
} catch (error) {
  console.error('ERROR: axios module not found. Please run: npm install axios');
  throw new Error('axios module is required. Please install it with: npm install axios');
}

/**
 * Get Google Maps API key from environment
 */
function getGoogleMapsApiKey() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured in backend environment variables. Please add GOOGLE_MAPS_API_KEY to your environment variables.');
  }
  return apiKey;
}

/**
 * Reverse geocode: Convert latitude/longitude to address
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{address: string, city: string, state: string, pincode: string, fullAddress: string}>}
 */
async function reverseGeocode(latitude, longitude) {
  console.log('[Geocoding] Starting reverse geocode for:', { latitude, longitude });
  
  const apiKey = getGoogleMapsApiKey();
  console.log('[Geocoding] API key found:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    console.log('[Geocoding] Making request to Google Maps API...');
    
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
    });
    
    console.log('[Geocoding] Response status:', response.status);

    const data = response.data;

    // Handle different API response statuses
    if (data.status === 'ZERO_RESULTS') {
      throw new Error('No address found for this location. Please try selecting a different location.');
    } else if (data.status === 'OVER_QUERY_LIMIT') {
      throw new Error('Geocoding API quota exceeded. Please try again later.');
    } else if (data.status === 'REQUEST_DENIED') {
      console.error('Geocoding API request denied. Status:', data.status, 'Error message:', data.error_message);
      throw new Error(`Geocoding API access denied: ${data.error_message || 'Please check API key configuration and ensure Geocoding API is enabled.'}`);
    } else if (data.status === 'INVALID_REQUEST') {
      console.error('Invalid geocoding request. Status:', data.status, 'Error message:', data.error_message);
      throw new Error(`Invalid location coordinates: ${data.error_message || 'Please try again.'}`);
    } else if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('Geocoding API error. Status:', data.status, 'Error message:', data.error_message);
      throw new Error(`Failed to reverse geocode location: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`);
    }

    const result = data.results[0];
    const addressComponents = result.address_components;

    // Extract address components
    let address = result.formatted_address || '';
    let city = '';
    let state = '';
    let pincode = '';

    addressComponents.forEach((component) => {
      const types = component.types;

      if (types.includes('postal_code')) {
        pincode = component.long_name;
      } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      }
    });

    // Extract street address (first line)
    const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name || '';
    const route = addressComponents.find(c => c.types.includes('route'))?.long_name || '';
    const streetAddress = [streetNumber, route].filter(Boolean).join(' ');

    return {
      address: streetAddress || address.split(',')[0] || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      fullAddress: address,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    
    // Handle axios-specific errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const data = error.response.data;
      console.error('Google Maps API HTTP error:', status, data);
      throw new Error(`Google Maps API error: ${status} - ${data?.error_message || 'Unknown error'}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response from Google Maps API:', error.message);
      throw new Error('Failed to connect to Google Maps API. Please check your internet connection and try again.');
    } else if (error.code === 'ECONNABORTED') {
      // Request timeout
      throw new Error('Request to Google Maps API timed out. Please try again.');
    } else {
      // Something happened in setting up the request
      throw error;
    }
  }
}

/**
 * Geocode: Convert address to latitude/longitude
 * @param {string} address
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
async function geocodeAddress(address) {
  const apiKey = getGoogleMapsApiKey();

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
    
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
    });

    const data = response.data;

    // Handle different API response statuses
    if (data.status === 'ZERO_RESULTS') {
      throw new Error('No location found for this address. Please try a different address.');
    } else if (data.status === 'OVER_QUERY_LIMIT') {
      throw new Error('Geocoding API quota exceeded. Please try again later.');
    } else if (data.status === 'REQUEST_DENIED') {
      console.error('Geocoding API request denied. Status:', data.status, 'Error message:', data.error_message);
      throw new Error(`Geocoding API access denied: ${data.error_message || 'Please check API key configuration and ensure Geocoding API is enabled.'}`);
    } else if (data.status === 'INVALID_REQUEST') {
      console.error('Invalid geocoding request. Status:', data.status, 'Error message:', data.error_message);
      throw new Error(`Invalid address format: ${data.error_message || 'Please try again.'}`);
    } else if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('Geocoding API error. Status:', data.status, 'Error message:', data.error_message);
      throw new Error(`Failed to geocode address: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`);
    }

    const location = data.results[0].geometry.location;
    return {
      latitude: location.lat,
      longitude: location.lng,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    
    // Handle axios-specific errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const data = error.response.data;
      console.error('Google Maps API HTTP error:', status, data);
      throw new Error(`Google Maps API error: ${status} - ${data?.error_message || 'Unknown error'}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response from Google Maps API:', error.message);
      throw new Error('Failed to connect to Google Maps API. Please check your internet connection and try again.');
    } else if (error.code === 'ECONNABORTED') {
      // Request timeout
      throw new Error('Request to Google Maps API timed out. Please try again.');
    } else {
      // Something happened in setting up the request
      throw error;
    }
  }
}

module.exports = {
  reverseGeocode,
  geocodeAddress,
};

