import sql from 'mssql'
import stationAutoDao from './dao/stationAutoDao'
import importData, { getDataImport, insertMany, deleteMany } from './libs/import-data'
import config from './config'
import warningConfigs from './constants/warning-config'
import * as _ from 'lodash'
import moment from 'moment'
import createQueue from './libs/queue'
import createDataStationModel from './models/DataStationAuto'
import dataStationAutoDao from './dao/dataStationAutoDao'

const qStation = createQueue(10)
qStation.on('task_finish', function (taskId, result, stats) {
  console.log('task_finish station: ', taskId, q.getStats().total)
})
qStation.on('task_failed', function (taskId, err, stats) {
  console.log('task_failed station: ', taskId, err.message)
})
const q = createQueue()
// q.on('task_finish', function (taskId, result, stats) {
//   console.log('task_finish ===>>>>  ', taskId, result)
// })
q.on('task_failed', function (taskId, err, stats) {
  console.log('task_failed: ', taskId, err.message)
})

async function importStation({station}) {
  const lastLogs = await exeSqlServer(`SELECT * FROM [DL_${station.key}] ORDER BY ThoiGian asc`)
  console.log('object', lastLogs.length)
  // const lastLogs = await exeSqlServer(`SELECT TOP 50000 * FROM [DL_${station.key}] ORDER BY ThoiGian asc LIMIT number_rows 30000`)
  const tableCurrent =  await Promise.all(
    lastLogs.map(async item => {
      const receivedAt = item.ThoiGian
      const measureData = []
      _.mapKeys(item, (value, key) => {
        if (key !== 'OBJECTID' && key !== 'ThoiGian') {
          measureData.push({
            measureName: key,
            value,
            time: receivedAt,
            statusDevice: 0 
          })
        }
        
        return key
      });
      q.push({
        params: {
          station, receivedAt, measureData, warningConfigs, q, isAwait: true
        },
        func: importData
      })
      //await importData({station, receivedAt, measureData, warningConfigs})
      return item
    })
  )
  // console.log('SUCCESS: ', station.name, lastLogs.length)
  return lastLogs
} 

async function importStationMany({station}) {
  const start = moment()
  // const lastLogs = await exeSqlServer(`SELECT * FROM [DL_${station.key}] ORDER BY ThoiGian asc`)
 
  let lastLogs = await exeSqlServer(`SELECT * FROM [DL_${station.key}] ORDER BY ThoiGian asc`)
  
  
  // ---------------- Vuot qua 250.000 Records -------------
  // const limit = 250000
  // const page = 1
  // lastLogs = _.slice(lastLogs, limit * (page - 1)), limit * page)
  // console.log('object', lastLogs.length)
  // ---------- END -------------

  const list = lastLogs.map(item => {
    const receivedAt = item.ThoiGian
    const measureData = [] 
    
    _.mapKeys(item, (value, key) => {
      if (key !== 'OBJECTID' && key !== 'ThoiGian') {
        measureData.push({
          measureName: key,
          value,
          time: receivedAt,
          statusDevice: 0 
        })
      }
      
      return key
    });
    return getDataImport({ station, receivedAt, measureData, warningConfigs })
  })

  const rs = await insertMany(station.key, list)
  
  console.log('SUCCESS: ', rs.success, '  ', station.key, ' TOTAL RECORD ', list.length, ' TIMES: ', moment().diff(start) ,'ms', `${rs.success ? '' : rs.message}`)
}

async function checkData (filter = {}) {
  let stations = await stationAutoDao.allMergeLogger(filter)
  _.forEach(stations, async ({key}) => {
    console.log('TABLE', key)
    let rs = await exeSqlServer(`SELECT COUNT (*) FROM [DL_${key}]`)
    rs = _.values(rs[0])[0]
    const dataModel = createDataStationModel(key)
    const mongoC = await dataStationAutoDao.count(dataModel)
    if (rs !== mongoC) console.log(key, '\t', rs, '\t', mongoC)
    
  })
  
}


function exeSqlServer(query) {
  return new Promise(async (resolve, reject) => {
    try {
      // const pool = new sql.ConnectionPool(config.SQLSERVER);
      // const connect = await pool.connect()
      // const req = connect.request()
      const req = new sql.Request();
      const { recordset } = await req.query(query)
      // connect.close()
      resolve(recordset)
    } catch (error) {
      reject(error)
    }
  })  
}


async function readAndDelete(filter = {}) {
  let stations = await stationAutoDao.allMergeLogger(filter)
  stations.map(async station => {
    qStation.push({
      id: station.key,
      params: {
        stationKey: station.key, qStation, isAwait: true
      },
      func: deleteMany
    })
  })
}

async function readAndInsert(filter = {}) {
  let stations = await stationAutoDao.allMergeLogger(filter)
  stations.map(async station => {
    qStation.push({
      id: station.key,
      params: {
        station, qStation, isAwait: true
      },
      func: importStation
    })
  })
}

async function readAndInsertMany(filter = {}) {
  let stations = await stationAutoDao.allMergeLogger(filter)
  stations.map(async station => {
    qStation.push({
      id: station.key,
      params: {
        station, qStation, isAwait: true
      },
      func: importStationMany
    })
  })
}
// NT_Chiline 0
// task_finish station:  NT_HonDa1 0
// task_finish station:  NT_KCNKhaiQuang 0
// task_finish station:  NT_NuocThaiThanhPho 0

export default async function run() {
  // readAndInsert({'stationType.key': 'AIR_QUALITY'})
  // readAndDelete({'stationType.key': 'AIR_QUALITY'})
  // readAndInsertMany({'stationType.key': {$ne: 'AIR_QUALITY'}}) //khong phai tram  AIR_QUALITY // {'stationType.key': 'AIR_QUALITY'}
  // readAndInsertMany({'stationType.key': 'WASTE_WATER'}) // doc cac tram khong khi
   // 0readAndDelete({'stationType.key': 'AIR_QUALITY'})
  //  moment().zone('+07:00')
   
  const filter = {'key': 'B12HaLong'}
  readAndDelete(filter)
  // readAndInsert(filter) // doc cac tram khong khi
  readAndInsertMany(filter)
  checkData(filter) // WASTE_WATER AIR_QUALITY SURFACE_WATER
}

process.on('exit', () => {
  q.destroy(() => {})
})

process.on('SIGINT', () => {
  process.exit(2)
})