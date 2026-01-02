const { firebaseLogin } = require("./auth.service")

async function firebaseLoginHandler(req, res) {
  try {
    const { idToken } = req.body

    const data = await firebaseLogin(idToken)

    res.json({
      success: true,
      ...data
    })
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message
    })
  }
}

module.exports = { firebaseLoginHandler }
