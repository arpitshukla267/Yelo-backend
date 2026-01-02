// Entry point for Render deployment
// Load environment variables first
require('dotenv').config()

// Then require the actual server file
require('./src/server.js')

