const User = require("../model/userModel")
const cloudinary = require("../config/cloudinary")

exports.uploadResume = async (req, res) => {
  try {
    const { userId } = req.body

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID missing" })
    }

    const user = await User.findById(userId)

    if (user?.resume) {
      const publicId = user.resume.split("/").pop().split(".")[0]
      await cloudinary.uploader.destroy(`resumes/${publicId}`, {
        resource_type: "auto"
      })
    }

    const fileUrl = req.file.secure_url

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { resume: fileUrl },
      { new: true }
    )

    res.status(200).json({
      message: "Resume uploaded successfully",
      user: updatedUser
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}

// const User = require("../model/userModel")
// const cloudinary = require("../config/cloudinary")

exports.deleteResume = async (req, res) => {
  try {
    const userId = req.params.id

    if (!userId) {
      return res.status(400).json({ message: "User ID missing" })
    }

    const user = await User.findById(userId)

    if (!user || !user.resume) {
      return res.status(404).json({ message: "No resume found" })
    }

    const publicId = user.resume.split("/resumes/")[1]?.split(".")[0]

    await cloudinary.uploader.destroy(`resumes/${publicId}`, {
      resource_type: "auto"
    })

    user.resume = ""
    await user.save()

    res.status(200).json({
      message: "Resume deleted successfully"
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}

