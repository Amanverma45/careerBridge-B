const express = require("express")
const router = express.Router()

const upload = require("../middleware/multer")

const { uploadResume } = require("../controller/resumeController")

router.post("/uploadResume", upload.single("resume"), uploadResume)
module.exports = router