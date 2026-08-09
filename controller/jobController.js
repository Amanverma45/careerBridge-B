const jobModel = require('../model/jobModel.js')
const express = require('express')
const { validateText, validateSalary } = require('../helper/validationHelper.js')

// job seeker
const createJob = async (req, res) => {
    const { title, company, location, salary, description, jobType, postedBy, skills, isPremium } = req.body

    // Authorization checks
    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Only recruiters and admins can post jobs." })
    }
    if (req.user._id.toString() !== postedBy && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. You cannot post a job on behalf of another user." })
    }

    try {
        if (!title || !company || !location || !salary || !description || !jobType || !postedBy) {
            return res.status(400).json({ message: "All Fields are Required" })
        }

        // Validate text and salary fields
        const titleError = validateText(title, "Job Title");
        if (titleError) return res.status(400).json({ message: titleError });

        const companyError = validateText(company, "Company Name");
        if (companyError) return res.status(400).json({ message: companyError });

        const locationError = validateText(location, "Location");
        if (locationError) return res.status(400).json({ message: locationError });

        const salaryError = validateSalary(salary);
        if (salaryError) return res.status(400).json({ message: salaryError });

        const descriptionError = validateText(description, "Job Description");
        if (descriptionError) return res.status(400).json({ message: descriptionError });

        if (skills) {
            const skillsError = validateText(skills, "Required Skills");
            if (skillsError) return res.status(400).json({ message: skillsError });
        }
        const newJob = new jobModel({
            title,
            company,
            location,
            salary,
            description,
            jobType,
            postedBy: postedBy,
            skills: skills || "",
            isPremium: isPremium || false
        })
        await newJob.save()
        res.status(201).json({ message: "Job created successfully", job: newJob })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "server error" })

    }
}

// requiter
const getJob = async (req, res) => {
    try {
        const jobs = await jobModel.find().sort({ createdAt: -1 })
        res.status(200).json({ count: jobs.length, jobs: jobs })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "server error" })
    }
}
const getRecruiterJobs = async (req, res) => {
    const { userId } = req.params
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. You can only view your own jobs." })
    }
    try {
        const jobs = await jobModel.find({ postedBy: userId }).sort({ createdAt: -1 })
        res.status(201).json(jobs)
    } catch (error) {
        console.log(error.message)
        res.status(501).json({ message: "server error" })
    }
}

const deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id

        const job = await jobModel.findById(jobId)
        if (!job) {
            return res.status(404).json({ message: "job not found" })
        }

        if (req.user._id.toString() !== job.postedBy.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. You can only delete your own jobs." })
        }

        const deletejob = await jobModel.findByIdAndDelete(jobId)

        if (!deletejob) {
            res.status(404).json({ message: "job not found" })
        }
        return res.status(201).json({ message: "job deleted successfully" })

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "something went wrong" })

    }
}
const updateJob = async (req, res) => {
    try {
        const jobId = req.params.id
        const { title, company, location, salary, description, jobType, skills, isPremium } = req.body

        const job = await jobModel.findById(jobId)
        if (!job) {
            return res.status(404).json({ message: "Job not found" })
        }

        if (req.user._id.toString() !== job.postedBy.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. You can only update your own jobs." })
        }

        // Validate text and salary fields
        if (title) {
            const titleError = validateText(title, "Job Title");
            if (titleError) return res.status(400).json({ message: titleError });
        }
        if (company) {
            const companyError = validateText(company, "Company Name");
            if (companyError) return res.status(400).json({ message: companyError });
        }
        if (location) {
            const locationError = validateText(location, "Location");
            if (locationError) return res.status(400).json({ message: locationError });
        }
        if (salary) {
            const salaryError = validateSalary(salary);
            if (salaryError) return res.status(400).json({ message: salaryError });
        }
        if (description) {
            const descriptionError = validateText(description, "Job Description");
            if (descriptionError) return res.status(400).json({ message: descriptionError });
        }
        if (skills) {
            const skillsError = validateText(skills, "Required Skills");
            if (skillsError) return res.status(400).json({ message: skillsError });
        }

        const updatedJob = await jobModel.findByIdAndUpdate(
            jobId,
            {
                title,
                company,
                location,
                salary,
                description,
                jobType,
                skills,
                isPremium
            },
            { new: true }
        )

        if (!updatedJob) {
            return res.status(404).json({ message: "Job not found" })
        }

        return res.status(200).json({
            message: "Job updated successfully",
            job: updatedJob
        })

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Server error" })
    }
}
module.exports = { createJob, getJob, getRecruiterJobs, deleteJob , updateJob}