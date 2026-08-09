const applicationController = require('../controller/applicationController.js')
const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/authMiddleware.js')

router.post('/applyJob', verifyToken, applicationController.applyJob)
router.get('/appliedJobs/:userId', verifyToken, applicationController.getAppliedJobs)
router.get('/applicants/:jobId', verifyToken, applicationController.getApplicants)
router.put("/status/:id", verifyToken, applicationController.updateStatus)
module.exports = router