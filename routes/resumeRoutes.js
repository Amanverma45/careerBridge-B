const express = require("express")
const resumeController = require('../controller/resumeController.js')
const router = express.Router()

const upload = require("../middleware/multer")

const { uploadResume, deleteResume } = require("../controller/resumeController")

router.post("/uploadResume", upload.single("resume"), resumeController.uploadResume)
router.get("/viewResume/:id", resumeController.viewResume);
router.delete("/deleteResume/:id", resumeController.deleteResume)

module.exports = router