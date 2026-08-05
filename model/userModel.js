const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    skills: String,
    experience: String,
    bio: String, 
    companyName: String,
    companyWebsite: String,
    companyDescription: String,
    resume: String,
    resumePublicId: String,
    phone: String,
    location: String,
    educationGrad: String,
    education12: String,
    education10: String,
    experienceCompany: String,
    experienceRole: String,
    linkedin: String,
    github: String,
    portfolio: String,
    certification: String,
    profilePhoto: String,
    profilePhotoPublicId: String,
    isPremium: {
        type: Boolean,
        default: false
    },
    savedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'job'
    }]
})
const user = new mongoose.model('user', userSchema)
module.exports = user