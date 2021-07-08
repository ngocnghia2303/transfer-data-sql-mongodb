import mongoose from 'mongoose'
import chalk from 'chalk'
import { PORT, URI_ADMIN_DB, USR_ADMIN_DB, PWD_ADMIN_DB } from '../config'

function mongoOption (user, pwd) {
  return {
    user: user,
    pass: pwd,
    poolSize: 5,
    useNewUrlParser: true,
    promiseLibrary: global.Promise,
    connectTimeoutMS: 1200,
    reconnectTries: Number.MAX_VALUE
  }
}

export function checkConnection (info) {
  return mongoose.connections.find(connect => info.address === connect.address && info.name === connect.name)
}

export function createConnection (dbInfo) {
  const dbConnect = checkConnection(dbInfo)
  if (dbConnect) return dbConnect
  console.log('name db', dbInfo.name, dbInfo.address)
  return mongoose.createConnection(`mongodb://${dbInfo.address}:${dbInfo.port}/${dbInfo.name}`, mongoOption(dbInfo.user, dbInfo.pwd))
}

export function createModel(conn, modelName, modelSchema) {
  if (conn.models[modelName]) return conn.models[modelName]
  return conn.model(modelName, modelSchema)
}

export function createDao (conn, Dao) {
  return new Dao(createModel(conn, Dao.model.name, Dao.model.schema))
}

export function assignDao (objDao, mongoDbConnect) {
  let dao = {}
  Object.keys(objDao).forEach(key => {
    if (objDao[key]) {
      dao[key] = createDao(mongoDbConnect, objDao[key])
    }
  })
  return dao
}
