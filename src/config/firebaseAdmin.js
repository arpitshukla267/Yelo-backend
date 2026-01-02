const admin = require("firebase-admin")

// Build service account object from environment variables
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
}

// Initialize Firebase Admin only if credentials are available
if (!admin.apps.length) {
  // Check if all required Firebase env vars are present
  const hasFirebaseConfig = 
    serviceAccount.project_id &&
    serviceAccount.private_key_id &&
    serviceAccount.private_key &&
    serviceAccount.client_email

  if (hasFirebaseConfig) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
      console.log("✅ Firebase Admin initialized")
    } catch (error) {
      console.warn("⚠️ Firebase Admin initialization failed:", error.message)
      // Don't crash - Firebase might not be needed for all endpoints
    }
  } else {
    console.warn("⚠️ Firebase Admin not initialized - missing environment variables")
  }
}

module.exports = admin
