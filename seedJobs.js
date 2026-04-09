const mongoose = require('mongoose')
const jobModel = require('./model/jobModel')
const userModel = require('./model/userModel')
require('./db/connection')

mongoose.connection.once('open', async () => {
  try {
    await userModel.deleteMany({ role: "recruiter" })

    const recruiter = await userModel.create({
      name: "Seed Recruiter",
      email: "recruiter@test.com",
      password: "123456",
      role: "recruiter"
    })

    const jobs = [
      {
        title: "Backend Developer",
        company: "CodeNest Pvt Ltd",
        location: "Bangalore",
        salary: "70000",
        description: "Looking for Node.js & MongoDB developer",
        jobType: "Full-Time",
        postedBy: recruiter._id   
      },
      {
        title: "UI/UX Designer",
        company: "PixelCraft",
        location: "Mumbai",
        salary: "60000",
        description: "Figma expert with 2+ years experience",
        jobType: "Full-Time",
        postedBy: recruiter._id
      }
    ]

    await jobModel.deleteMany()
    await jobModel.insertMany(jobs)

    console.log("Jobs seeded successfully 🚀")
    process.exit()

  } catch (error) {
    console.log(error)
    process.exit(1)
  }
})