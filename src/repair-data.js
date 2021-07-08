import sql from 'mssql'
import stationAutoDao from './dao/stationAutoDao'
import importData, { getDataImport, insertMany, deleteMany } from './libs/import-data'
import config from './config'
import warningConfigs from './constants/warning-config'
import * as _ from 'lodash'
import moment from 'moment'
import createDataStationModel from './models/DataStationAuto'
import dataStationAutoDao from './dao/dataStationAutoDao'
import { toPages } from './utils/my-helper'
import fs from 'fs'
import chalk from 'chalk'

import DataDao from './dao/data-station-dao'

export async function transferDataMongoDB (key) {

  const dbInfoN = {
    address: '27.74.251.0', port: '27018', name: 'ilotusland_stnmt_quangninh', user: 'dev', pwd: 'happy2code' 
  }

  const dbInfoD = {
    address: '192.168.0.81', port: '27017', name: 'ilotusland_stnmt_quangninh', user: 'dev', pwd: 'happy2code' 
  }

  const filter = {receivedAt: {$gte: '2019-03-26 08:00:02.000+07:00', $lte: '2019-03-28 08:00:02.000+07:00'}}

  const dataDaoN = new DataDao(key, dbInfoN)

  const dataDaoD = new DataDao(key, dbInfoD)

  // 1. Lấy dữ liệu từ server nguồn
  const ls = await dataDaoN.find(filter)
  console.log('Len', _.size(ls))
  // 2. Xóa dữ liệu trên server đích
  await dataDaoD.deleteMany(filter)

  // 3. Insert dữ liệu vào server mới
  const inRs = await dataDaoD.insertMany(ls)
  const ls1 = await dataDaoD.find(filter)
  console.log('Len2', _.size(ls1))

}





export default async function repairData (key) {
  const {configLogger, measuringList} = await stationAutoDao.findByKey(key)
  const obj = _.keyBy(_.merge(configLogger.measuringList), 'measuringDes')
  const dataModel = createDataStationModel(key)
  const filter = {receivedAt: {$gte: '2019-03-26 09:00:02.000+07:00'}} //, $lte: '2019-03-27 16:42:02.000+07:00'}}
  
  const records = await dataStationAutoDao.all(dataModel, filter)
  _.forEach(records, record => {
    _.forEach(measuringList, item => {
      const ratio = _.get(obj, [item.key, 'ratio'], 1)
      if(record.measuringLogs[item.key]) {
        record.measuringLogs[item.key].value = record.measuringLogs[item.key].value * ratio
        record.measuringLogs[item.key].approvedValue = record.measuringLogs[item.key].approvedValue * ratio
      }
    })

    dataStationAutoDao.update(record, dataModel).then(rs => console.log('success', record._id)).catch(err => console.log(err))
  })
}

