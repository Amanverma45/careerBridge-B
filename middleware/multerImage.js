const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    return {
      folder: "profile_photos",
      resource_type: "image",
      access_mode: "public",
      public_id: "profile_" + (req.body.userId || "user") + "_" + Date.now(),
      format: ext === 'jpeg' ? 'jpg' : ext,
    };
  },
});

const uploadImage = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images (JPEG/PNG/WEBP) are allowed"), false);
    }
  },
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB limit
});

module.exports = uploadImage;
