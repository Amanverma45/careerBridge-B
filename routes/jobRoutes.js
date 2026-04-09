const jobController = require('../controller/jobController.js')
const express = require('express')
const router = express.Router()

router.post('/createJob',jobController.createJob)
router.get('/getJob',jobController.getJob)
router.delete('/deletejob/:id',jobController.deleteJob)
router.put('/updatejob/:id',jobController.updateJob)
router.get('/recruiterJobs/:userId',jobController.getRecruiterJobs)

module.exports = router