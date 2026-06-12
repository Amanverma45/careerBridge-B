const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => { 
    return {
      folder: "resumes",
      resource_type: "raw",
      access_mode: "public",
      public_id: file.originalname.split('.')[0] + "_" + Date.now(), 
      format: file.originalname.split('.').pop(), 
    };
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF/DOC/DOCX allowed"), false);
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 }
});

module.exports = upload;