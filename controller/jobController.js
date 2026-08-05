const jobModel = require('../model/jobModel.js')
const express = require('express')

// job seeker
const createJob = async (req, res) => {
    const { title, company, location, salary, description, jobType, postedBy, skills, isPremium } = req.body

    try {
        if (!title || !company || !location || !salary || !description || !jobType || !postedBy) {
            return res.status(400).json({ message: "All Fields are Required" })
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