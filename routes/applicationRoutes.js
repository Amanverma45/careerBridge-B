const applicationController = require('../controller/applicationController.js')
const express = require('express')
const router = express.Router()

router.post('/applyJob',applicationController.applyJob)
router.get('/appliedJobs/:userId',applicationController.getAppliedJobs)
router.get('/applicants/:jobId', applicationController.getApplicants)
router.put("/status/:id", applicationController.updateStatus)
module.exports = router