const mongoose = require('mongoose')
const dns = require("dns") 
dns.setServers(['8.8.8.8', '8.8.4.4'])

const db = 'mongodb+srv://amanar:passwordamanar@cluster0.x8tokja.mongodb.net/CareerBridge?appName=Cluster0';
mongoose.connect(db,{

}).then(()=>console.log('mongodb connected successfuly'))
.catch((error)=>console.log(error.message))