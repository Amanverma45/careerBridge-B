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
    resumePublicId: String
})
const user = new mongoose.model('user', userSchema)
module.exports = user