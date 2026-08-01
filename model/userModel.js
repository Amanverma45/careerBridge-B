const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    skills: String,
    experience: String,
    bio: String, 
    companyName: {
        type: String,
        default: ""
    },
    companyWebsite: {
        type: String,
        default: ""
    },
    companyDescription: {
        type: String,
        default: ""
    },
    resume: {
        type: String,
        default: ""
    },
    resumePublicId: {
    type: String,
    default: ""
}
})
const user = new mongoose.model('user', userSchema)
module.exports = user