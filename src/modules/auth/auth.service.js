const admin = require("../../config/firebaseAdmin")
const User = require("../user/user.model")
const jwt = require("jsonwebtoken")

async function firebaseLogin(idToken) {
  // 1️⃣ Verify Firebase token
  const decoded = await admin.auth().verifyIdToken(idToken)

  const phone = decoded.phone_number

  if (!phone) {
    throw new Error("Phone number missing in token")
  }

  // 2️⃣ Find or create user
  let user = await User.findOne({ phone })

  if (!user) {
    user = await User.create({ phone })
  }

  // 3️⃣ Issue backend JWT
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )

  return {
    token,
    user,
    isProfileComplete: user.isProfileComplete
  }
}

module.exports = { firebaseLogin }
