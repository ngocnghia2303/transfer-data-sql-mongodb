import { createConnection, createModel } from '../utils/db-test'
import mongoose from 'mongoose'

const prefix = 'data-station-'

const DataStationSchema = new mongoose.Schema({
  receivedAt: { type: Date, default: Date.now },
  measuringLogs: Object,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})


export default class DataStationOldDao {
  constructor(key, dbInfo) {
    this.dbInfo = dbInfo
    const conn = createConnection(dbInfo)
    this.model = createModel(conn, prefix + key, DataStationSchema)
  }

  remove (filter) {
    return this.model.remove(filter)
  }

  find (filter) {
    console.log('DB info', this.dbInfo.address)
    return this.model.find(filter)
  }

  deleteMany (filter = {}) {
    return this.model.deleteMany(filter)
  }

  insertMany (list) {
    return this.model.insertMany(list)
  }
}