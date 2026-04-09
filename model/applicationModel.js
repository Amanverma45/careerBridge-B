const mongoose = require('mongoose')

const applySchema = new mongoose.Schema({
   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
   },
   jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "job",
      required: true
   },
   appliedAt: {
      type: Date,
      default: Date.now
   },
   status: {
      type: String,
      default: "pending"
   }
})
const Application = mongoose.model('application', applySchema)
module.exports = Application