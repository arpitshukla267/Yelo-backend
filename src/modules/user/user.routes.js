const router = require("express").Router();
const { updateProfile, getMe } = require("./user.controller");
const auth = require("../../middlewares/auth.middleware");

router.put("/profile", auth, updateProfile);
router.get("/me", auth, getMe); // for frontend use only

module.exports = router;
