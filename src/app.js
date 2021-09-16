import 'dotenv/config';
import sql from 'mssql'
require('moment-timezone').tz.setDefault('Asia/Ho_Chi_Minh')
// import moment from 'moment'
// moment.tz.setDefault('Asia/Ho_Chi_Minh')
import moment from 'moment'
import manageConnectDatabase from './utils/db'
import readStation from './read-station'
import { connectSql, reconnect, readDataAsync } from './utils/db-exe'
import runMeasure, { runDB } from './read-mesuring'
import transferData from './transfer-big-data'
import config from './config';
import * as _ from 'lodash'
import repairData, { transferDataMongoDB } from './repair-data'

// connect DB
manageConnectDatabase()

async function main() {
  try {
    console.log('connect sql')
    await sql.connect(config.SQLSERVER)

    // 1. Cập nhật thống số từ sql server sang mongoDB 
    // runMeasure()

    // 2. Chuyển danh sách trạm sang
    // readStation()

    // 3. Chuyển dữ liệu từ sql server sáng mongoDB
    const key = 'Formosa_Nhiet_dien_lo_khi_so_1'
    const keys = [
      // key
      /*
      KT_CanNong1,
      KT_CanNong2,
      KT_CanNong3,
      KT_CanNong4,
      KT_CanPhucHop,
      Formosa_Nhiet_dien_lo_khi_so_1
      */
    ]
    // transferData(key)

    // repairData()
    // transferDataMongoDB(key)
  } catch (error) {
    console.log('App ERROR', error)
  }
}

main()


