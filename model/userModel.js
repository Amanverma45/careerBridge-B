const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    skills: String,
    experience: String,
    bio: String, 
    resume: {
        type: String,
        default: ""
    }
})
const user = new mongoose.model('user', userSchema)
module.exports = user