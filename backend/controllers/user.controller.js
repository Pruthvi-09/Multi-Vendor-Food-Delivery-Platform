const User = require("../models/user.model");

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ message: "userId not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: `get current user error${error}` });
  }
};

//----------------update current user---------------------

const updateUserLocation = async (req, res) => {
  try {
    const { lat, lon } = req.body;

    if (
      lat === undefined ||
      lon === undefined ||
      lat === null ||
      lon === null
    ) {
      return res
        .status(400)
        .json({ message: "latitude and longitude are required in req.body" });
    }

    const latNum = Number(lat);
    const lonNum = Number(lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      return res
        .status(400)
        .json({ message: "latitude and longitude must be valid numbers" });
    }

    const mongoose = require("mongoose");
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    // 1. Completely destroy the broken location field
    await User.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(req.userId) },
      { $unset: { location: "" } },
    );

    // Set proper GeoJSON Point location compatible with the Mongoose schema
    await User.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(req.userId) },
      { $set: { location: { type: "Point", coordinates: [lonNum, latNum] } } },
    );

    const updatedUser = await User.findById(req.userId);

    return res.status(200).json({ message: "location update", user: updatedUser });
  } catch (error) {
    console.error("Update location error:", error);
    return res
      .status(400)
      .json({ message: `update user location error: ${error.message}` });
  }
};

// const updateUserLocation = async (req, res) => {
//   try {
//     const { lat, lon } = req.body;

//     if (lat == null || lon == null) {
//       return res.status(400).json({
//         message: "Latitude and longitude are required",
//       });
//     }

//     const user = await User.findByIdAndUpdate(
//       req.userId,
//       {
//         location: {
//           type: "Point",
//           coordinates: [Number(lon), Number(lat)],
//         },
//       },
//       { new: true },
//     );

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//       });
//     }

//     res.status(200).json({
//       message: "Location updated successfully",
//       user,
//     });
//   } catch (error) {
//     console.error("Update location error:", error);

//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };
module.exports = { getCurrentUser, updateUserLocation };
