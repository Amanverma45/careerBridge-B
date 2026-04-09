const User = require("../model/userModel")

exports.uploadResume = async (req, res) => {
  try {
    const userId = req.body.userId

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID missing" })
    }

    // const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    const protocol = req.headers["x-forwarded-proto"] || "https";
   const fileUrl = req.file.secure_url 
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { resume: fileUrl },
      { new: true }
    )

    res.json({
      message: "Resume uploaded successfully",
      user: updatedUser
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}