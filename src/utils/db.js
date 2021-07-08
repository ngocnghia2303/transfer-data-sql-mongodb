import mongoose from 'mongoose'

import config from '../config'

let connect = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(config.MONGODB.database, config.MONGODB.db_options,
      (err, result) => {
        if (err) return reject(err)
        return resolve(result)
      }
    )
  })
}
export default function manageConnectDatabase () {
  let db = mongoose.connection
  db.on('connecting', () => console.log('connecting to MongoDB...'))
  db.on('error', error => {
    console.error('Error in MongoDb connection: ' + error)
    mongoose.disconnect()
  })
  db.on('connected', () =>
    console.log(
      'Mongoose default connection open to: ' + config.MONGODB.database
    )
  )
  db.once('open', () => console.log('MongoDB connection opened!'))
  db.on('reconnected', () => console.log('MongoDB reconnected!'))
  db.on('disconnected', async () => {
    console.log('MongoDB disconnected!')
    connect()
      .then(result => console.log('connect success !!!'))
      .catch(err =>
        console.log('lost Internet connection - no connect to mongodb ' + err)
      )
  })
  connect()
    .then(result => console.log('connect success !!!'))
    .catch(err =>
      console.log('lost Internet connection - no connect to mongodb ' + err)
    )
  process.on('SIGINT', function () {
    mongoose.connection.close(() => {
      console.log(
        'Mongoose default connection disconnected through app termination'
      )
      process.exit(0)
    })
  })
}
