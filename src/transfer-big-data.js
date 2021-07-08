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
import { toPages } from './utils/my-helper'
import fs from 'fs'
import chalk from 'chalk'
// const WHERE_CLAUSE = ` 1 = 1 AND ThoiGian > '2019-02-25' ` // neu gioi han thoi gian
const WHERE_CLAUSE = ` 1 = 1 ` // neu gioi han thoi gian
const PAGE_SIZE = 100000//220000 // Đối với trạm khí giảm số lượng bản ghi xuống khoangt 50-100k record/page

const qStation = createQueue(60)
qStation.on('task_finish', function (taskId, result, stats) {
  // console.log('task_finish station: ', taskId, q.getStats().total)
})
qStation.on('task_failed', function (taskId, err, stats) {
  console.log('task_failed station: ', taskId, err.message)
})
const q = createQueue()
q.on('task_failed', function (taskId, err, stats) {
  console.log('task_failed: ', taskId, err.message)
})

async function importStation({station}) {
  const lastLogs = await exeSqlServer(`SELECT * FROM [DL_${station.key}] ORDER BY ThoiGian asc`)
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

async function insertPages({station, ls, p, totalP}) {
  const lastLogs = ls
  // console.log('lastLogs Objects OK')//thoconsole
  const list = lastLogs.map(item => {
    // console.log('log item in map ok') //thoconsole
    const receivedAt = moment(item.ThoiGian).subtract(7, 'hours').toJSON()
    // console.log('log receivedAt OK ')//thoconsole
    const measureData = [] 
    _.mapKeys(item, (value, key) => {
      // console.log('log key value of item is OK ')//thoconsole
      if (key !== 'OBJECTID' && key !== 'ThoiGian') {
        measureData.push({
          measureName: key,
          value,
          time: receivedAt,
          statusDevice: 0 
        })
      }
    let str = JSON.stringify(measureData)
    // console.log('measuringData is ok')//thoconsole
      
      return key
    });

    return getDataImport({ station, receivedAt, measureData, warningConfigs })
  })

  // console.log('staion key and list is OK')//thoconsole
  const rs = await insertMany(station.key, list)
  if (!rs.success) {
    console.log('rs',rs)
    logError(station.key)
    console.log(chalk.red(`=========${p}/${totalP}========== INSERT ERROR:  ${station.key}    ========================`))
  }
  console.log(chalk.blue(`${station.key} PAGE ${p}/${totalP} :  ${!!rs}`))
  return rs
}

const qData = createQueue(30)

async function importStationMany({station}) {
  const start = moment()
  console.log('BEGIN INSERT: ', station.key, start.format('HH:mm:SS'))
  // const lastLogs = await exeSqlServer(`SELECT * FROM [DL_${station.key}] ORDER BY ThoiGian asc`)
  let lastLogs = await exeSqlServer(`SELECT * FROM [DL_${station.key}] where ${WHERE_CLAUSE} ORDER BY ThoiGian asc`)
  // console.log('log03: ' + lastLogs)//thoconsole
  const pageSize = PAGE_SIZE
  const total = lastLogs.length
  let totalP = 1
  if (total > pageSize) {
    const stationData = toPages(lastLogs, pageSize)
    totalP = stationData.totalPages
    let page = 0
    _.forEach(stationData.pages, ls => {
      qData.push({
        params: { station, isAwait: true, ls, p: ++page, totalP },
        func: insertPages
      })
      // insertPages(station, ls)
    })
    // await Promise.all(_.map(stationData, ls => insertPages(station, ls)))
  } else {
    // console.log('log04: Here')
    await insertPages({station, ls: lastLogs, p: 1, totalP})
    // console.log('log05: Here')
  }
  logSuccess(station.key)
  const info = `Info:  ${station.key} Pages: ${totalP} - TOTAL RECORD: ${lastLogs.length} - TIMES: ${moment().diff(start) }ms`
  logSuccessPage(info)
  console.log(chalk.cyan(info))
}

function log(fileName, content) {
  fs.appendFile(fileName, content, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
}

function logError(content) {
  log('logs/error.log', content+'\n')
}

function logSuccess(content) {
  log('logs/success.log', content+'\n')
}

function logSuccessPage(content) {
  log('logs/success-pages.log', content+'\n')
}

async function checkData (filter = {}) {
  const minList = []
  const maxList = []
  let stations = await stationAutoDao.allMergeLogger(filter)
  await Promise.all(_.map(stations, async ({key}) => {
    // console.log('TABLE', key)
    let rs = await exeSqlServer(`SELECT COUNT (*) FROM [DL_${key}]  where ${WHERE_CLAUSE} `)
    rs = _.values(rs[0])[0]
    console.log(key, 'Total: ', rs)
    // if (rs < 200000) {
    //   minList.push(key)
    // } else {
    //   maxList.push(key)
    // }
    // console.log('Len', key, ': ', `${rs}`.toString())
    // const dataModel = createDataStationModel(key)
    // const mongoC = await dataStationAutoDao.count(dataModel)
    // if (rs !== mongoC) console.log(key, '\t', rs, '\t', mongoC)
    
  }))
  
  return {minList, maxList}
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
  // console.log('log01 station: ' + JSON.stringify(stations)) //thoconsole
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

export default async function run(keys) {
  const filter = { key: {$in: keys} }
  // console.log(filter) //thoconsole
  readAndDelete(filter) // xóa dữ liệu cũ đi nếu xử dụng import dữ liệu kiểu many
  // readAndInsert(filter) // Insert từng bản ghi
  readAndInsertMany(filter) // Lấy hết dữ liệu insert theo phân trang
  checkData(filter) // Check dât xem đã đủ chưa, có thể bỏ qua để tăng hiệu năng
}

process.on('exit', () => {
  q.destroy(() => {})
})

process.on('SIGINT', () => {
  process.exit(2)
})