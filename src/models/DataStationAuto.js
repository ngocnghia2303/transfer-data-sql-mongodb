import mongoose from 'mongoose'

export const prefix = 'data-station-'

function getTableName(stationName) {
  return prefix + stationName
}

export default function createDataStationModel(stationName) {
  const tableName = getTableName(stationName)
  console.log('log tableName: dataStationModel ' + tableName)//thoconsole
  if (mongoose.models && mongoose.models[tableName]) {
    console.log('log nhanh 1')//thoconsole
    return mongoose.models[tableName]
  } else {
    console.log('log nhanh 2')//thoconsole
    let schema = new mongoose.Schema({
      receivedAt: { type: Date, default: Date.now },
      measuringLogs: Object,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    })
    return mongoose.model(tableName, schema)
  }
}
