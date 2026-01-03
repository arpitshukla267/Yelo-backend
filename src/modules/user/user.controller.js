// const User = require("./user.model")

// async function updateProfile(req, res) {
//   try {
//     const userId = req.user.userId
//     const { name, email, avatar } = req.body

//     const user = await User.findByIdAndUpdate(
//       userId,
//       {
//         name,
//         email,
//         avatar,
//         isProfileComplete: true
//       },
//       { new: true }
//     )

//     res.json({ success: true, user })
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message })
//   }
// }

// module.exports = {
//   updateProfile
// }

const User = require("./user.model");

async function updateProfile(req, res) {
  try {
    const userId = req.user.userId;
    const { name, email, avatar } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        avatar,
        isProfileComplete: true
      },
      { new: true }
    ).select("name email phone avatar isProfileComplete");

    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.userId).select(
      "name email phone avatar address city state pincode latitude longitude"
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    res.json({
      success: true,
      user
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

async function updateAddress(req, res) {
  try {
    const userId = req.user.userId;
    const { address, city, state, pincode, latitude, longitude } = req.body;

    // Validate required fields
    if (!address || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Address, city, state, and pincode are required"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        address,
        city,
        state,
        pincode,
        latitude,
        longitude
      },
      { new: true }
    ).select("name email phone avatar isProfileComplete address city state pincode latitude longitude");

    res.json({ 
      success: true, 
      user,
      message: "Address updated successfully"
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
}


module.exports = {
  updateProfile,
  getMe,
  updateAddress
};
