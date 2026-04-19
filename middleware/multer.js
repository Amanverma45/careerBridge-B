const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary")

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "resumes",
    resource_type: "auto", 
    public_id: file.originalname.split('.')[0] + "_" + Date.now(),
    format: file.originalname.split('.').pop(),
    // allowed_formats: ['pdf', 'doc', 'docx'], 
  }
})

const upload = multer({
  storage,
  
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Only PDF/DOC/DOCX allowed"), false)
    }
  },

  limits: { fileSize: 2 * 1024 * 1024 }
})

module.exports = upload