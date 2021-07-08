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
    const key = 'NTKCNHoaKhanh'
    const keys = [
      // key
      'CtySoiTheKyMoi'
      // 'NT_NMXLNTHoTay'
      // 'NT_NMXLNTKimLien'
      // 'NT_NMXLNTTrucBach'
      // 'NT_NMXLNTYenSo',
      // 'NT_MinhDuc'
      // 'NT_Urenco'
      // 'NT_KCNThangLong'
      // 'NT_MeiKoThachThat'
      // 'NT_VinNuocNgam_BBOI'
      // 'NT_VinNuocNgam_TCAT'
      // 'NT_VinNuocNgam_HUDU'
      // 'NT_VinNuocNgam_NGQU'
      // 'KK_CCBVMT'
      // 'KK_HangDau'
      // 'KK_HoanKiem'

      // 'CONGTONMPM1',
      // 'CONGTONMPM2_1',
      // 'CONGTONMPM4',
      // 'CONGTONMPM_21MR',

      // 'NUOCTHAINMPM1',
      // 'NUOCTHAINMPM2_1',
      // 'NUOCTHAINMPM2_1MR',
      // 'NUOCTHAINMPM4',
      // 'TRAMXA',
    ]
    transferData(key)

    // repairData()
    // transferDataMongoDB(key)
  } catch (error) {
    console.log('App ERROR', error)
  }
}

main()


