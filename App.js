const express = require('express')
const app = express()
const cors = require('cors')

app.set("trust proxy", true);
const path = require("path")
require("dotenv").config()

require('./db/connection.js')

const resumeRoutes = require("./routes/resumeRoutes")

const port = 5000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('server is start')
})

app.use('/api', require('./routes/userRoutes.js'))
app.use('/job', require('./routes/jobRoutes.js'))
app.use('/application', require('./routes/applicationRoutes.js'))
app.use('/admin', require('./routes/adminRoutes.js'))

app.use("/api", resumeRoutes)

app.use("/uploads", express.static("uploads"))

app.listen(port, () => {
    console.log('server is running on port 5000')
})