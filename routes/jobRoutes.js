const jobController = require('../controller/jobController.js')
const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/authMiddleware.js')

router.post('/createJob', verifyToken, jobController.createJob)
router.get('/getJob', jobController.getJob)
router.delete('/deletejob/:id', verifyToken, jobController.deleteJob)
router.put('/updatejob/:id', verifyToken, jobController.updateJob)
router.get('/recruiterJobs/:userId', verifyToken, jobController.getRecruiterJobs)

module.exports = router