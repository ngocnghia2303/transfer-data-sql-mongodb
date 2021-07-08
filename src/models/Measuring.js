const mongoose = require('mongoose')


const MeasureSchema = new mongoose.Schema({
  key: String,
  name: String,
  unit: String,
  numericalOrder: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export default mongoose.model('measurings', MeasureSchema)
