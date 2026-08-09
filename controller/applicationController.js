const Application = require('../model/applicationModel.js')

const applyJob = async (req, res) => {
    const { userId, jobId } = req.body
    try {
        if (!userId || !jobId) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const existingApplication = await Application.findOne({ userId, jobId })
        if (existingApplication) {
            return res.status(400).json({ message: "already applied" })
        }
        const newApplication = new Application({
            userId,
            jobId
        })
        await newApplication.save()
        return res.status(201).json({ message: "Application saved successfully " })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" })
    }
}

const getAppliedJobs = async (req, res) => {
    const { userId } = req.params
    try {
        const application = await Application.find({ userId })
            .populate('jobId')
        const validApplications = application.filter(app => app.jobId !== null)
        res.status(200).json(validApplications)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "server error" })
    }
}

const getApplicants = async(req,res)=>{
    const {jobId} = req.params

    try{
        const applicants = await Application.find({jobId})
        .populate('userId')
        .populate('jobId','title company')

        res.status(200).json(applicants)
    }catch(error){
        console.log(error)
        res.status(500).json({message:"server error"})
    }
}
const { sendStatusEmail } = require('../helper/emailHelper.js')

const updateStatus = async (req,res)=>{
  const {id} = req.params
  const {status} = req.body

  try {
    const updated = await Application.findByIdAndUpdate(
      id,
      {status},
      {new:true}
    ).populate('userId').populate('jobId')

    if (updated && (status === "shortlisted" || status === "rejected")) {
      sendStatusEmail(
        updated.userId?.email,
        updated.userId?.name,
        updated.jobId?.company || "Company",
        updated.jobId?.title || "Position",
        status
      ).catch(err => console.error("Error sending status email:", err));
    }

    res.json(updated)
  } catch (error) {
    console.error("updateStatus error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
module.exports = { applyJob, getAppliedJobs,getApplicants,updateStatus }