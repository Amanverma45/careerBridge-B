const mongoose = require('mongoose')
const dns = require("dns") 
dns.setServers(['8.8.8.8', '8.8.4.4'])

const User = require('./model/userModel.js')
const db = 'mongodb+srv://amanar:passwordamanar@cluster0.x8tokja.mongodb.net/CareerBridge?appName=Cluster0';

const run = async () => {
    try {
        await mongoose.connect(db)
        const user = await User.findOne({ email: 'cg@gmail.com' })
        console.log("USER RECORD FOR cg@gmail.com:")
        console.log(JSON.stringify(user, null, 2))
        process.exit(0)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

run()
