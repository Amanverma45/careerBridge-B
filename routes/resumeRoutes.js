const express = require("express")
const router = express.Router()

const upload = require("../middleware/multer")

const { uploadResume, deleteResume } = require("../controller/resumeController")

router.post("/uploadResume", upload.single("resume"), uploadResume)
router.delete("/deleteResume/:id", deleteResume)

module.exports = router