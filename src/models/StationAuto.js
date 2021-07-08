import mongoose from 'mongoose'

export default mongoose.model('station-autos',
  new mongoose.Schema({
    key: String,
    name: String,
    stationType: Object,
    address: String,
    mapLocation: Object,
    emails: Object,
    phones: Object,
    options: Object,
    measuringList: Object,
    lastLog: Object,
    image: Object,
    standardsVN: Object,
    province: Object,
    note: String,
    dataFrequency: Number,
    activatedAt: { type: Date },
    configLogger: {
      type: Object,
      default: { fileName: '', path: '', measuringList: [] }
    },
    removeStatus: {
      type: Object,
      default: { allowed: false, removeAt: null }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  })
)
