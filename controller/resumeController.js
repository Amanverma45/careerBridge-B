const User = require("../model/userModel")
const cloudinary = require("../config/cloudinary")

exports.uploadResume = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    if (!userId) return res.status(400).json({ message: "User ID missing" });

    const user = await User.findById(userId);

    if (user && user.resumePublicId) {
      await cloudinary.uploader.destroy(user.resumePublicId, { resource_type: "raw" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        resume: req.file.path, 
        resumePublicId: req.file.filename 
      }, 
      { new: true } // Ab ye sahi kaam karega
    );

    res.status(200).json({
      message: "Resume uploaded successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteResume = async (req, res) => {
  console.log("DELETE API HIT");
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    console.log("RESUME URL =", user.resume)
console.log("PUBLIC ID =", user.resumePublicId)

    if (!user || !user.resumePublicId) {
      return res.status(404).json({ message: "No resume found to delete" });
    }

    await cloudinary.uploader.destroy(user.resumePublicId, { resource_type: "raw" });

    user.resume = "";
    user.resumePublicId = "";
    await user.save();

    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
  console.error("DELETE ERROR:", error);
  res.status(500).json({
    message: error.message,
    stack: error.stack
  });
}
};

exports.viewResume = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user || !user.resume) {
      return res.status(404).json({
        message: "Resume not found"
      });
    }

    res.status(200).json({
      resume: user.resume,
      resumePublicId: user.resumePublicId
    });

  } catch (error) {
    console.error("VIEW ERROR:", error);
    res.status(500).json({
      message: error.message
    });
  }
};
