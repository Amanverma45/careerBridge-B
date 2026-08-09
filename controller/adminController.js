const User = require('../model/userModel.js');
const Job = require('../model/jobModel.js');
const Application = require('../model/applicationModel.js');

// Fetch all candidates
const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' });
        res.status(200).json(users);
    } catch (error) {
        console.error("Admin getUsers error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

// Fetch all recruiters
const getRecruiters = async (req, res) => {
    try {
        const recruiters = await User.find({ role: 'recruiter' });
        res.status(200).json(recruiters);
    } catch (error) {
        console.error("Admin getRecruiters error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

// Fetch all jobs
const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate('recruiterId', 'name email companyName');
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Admin getJobs error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

// Delete user (candidate or recruiter)
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete user
        await User.findByIdAndDelete(id);

        // If recruiter, delete their posted jobs & applications
        if (userToDelete.role === 'recruiter') {
            const recruiterJobs = await Job.find({ recruiterId: id });
            const jobIds = recruiterJobs.map(job => job._id);
            
            await Job.deleteMany({ recruiterId: id });
            await Application.deleteMany({ jobId: { $in: jobIds } });
        } else {
            // If candidate, delete their job applications
            await Application.deleteMany({ userId: id });
        }

        res.status(200).json({ message: "User and associated records deleted successfully" });
    } catch (error) {
        console.error("Admin deleteUser error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

// Delete job posting
const deleteJob = async (req, res) => {
    const { id } = req.params;
    try {
        const jobToDelete = await Job.findById(id);
        if (!jobToDelete) {
            return res.status(404).json({ message: "Job not found" });
        }

        await Job.findByIdAndDelete(id);
        await Application.deleteMany({ jobId: id });

        res.status(200).json({ message: "Job and associated applications deleted successfully" });
    } catch (error) {
        console.error("Admin deleteJob error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    getUsers,
    getRecruiters,
    getJobs,
    deleteUser,
    deleteJob
};
