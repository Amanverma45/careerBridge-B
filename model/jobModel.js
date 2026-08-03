const mongoose = require('mongoose')
const jobSchema = new mongoose.Schema({
    title: String,
    company: String,
    location: String,
    salary: String,
    description: String,
    jobType: {
        type: String,
        enum: ["full-time", "part-time", "internship"]
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    skills: {
        type: String,
        default: ""
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})
const job = new mongoose.model('job', jobSchema)
module.exports = job