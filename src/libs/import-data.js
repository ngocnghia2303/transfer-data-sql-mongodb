import * as _ from 'lodash'
import stationAutoDao from '../dao/stationAutoDao'
import createDataStationModel from '../models/DataStationAuto'
import dataStationAutoDao from '../dao/dataStationAutoDao'
import warningLevels from '../constants/warning-levels'


function repleaceMeasureLog ({ warningConfigs, measureLog }) {
  measureLog.warningLevel = null
  // check vuot nguong va chuan bi vuot nguong
  if (measureLog && measureLog.value && measureLog.maxLimit) {
    // Check vuot nguong
    if (measureLog.value >= measureLog.maxLimit) {
      measureLog.warningLevel = warningLevels.EXCEEDED
    } else if (
      measureLog.value / measureLog.maxLimit * 100 >=
      warningConfigs.exceededPreparing.value
    ) {
      // Check chuan bi vuot
      measureLog.warningLevel = warningLevels.EXCEEDED_PREPARING
    }
  }
  return measureLog
}

export function getDataImport ({
  station,
  receivedAt,
  measureData,
  warningConfigs
}) {
  let dataImport = {
    receivedAt,
    measuringLogs: {}
  }

  station.measuringList.forEach(item => {
    const obj = _.keyBy(measureData, 'measureName')
    // console.log('obj keyby measureData is OK')//thoconsole
    const measureFinded = obj[item.measuringSrc]
    // console.log('measureFinded is OK')//thocosole
    if (measureFinded) {
      const value = measureFinded.value * item.ratio
      dataImport.measuringLogs[`${item.measuringDes}`] = repleaceMeasureLog({
        warningConfigs,
        measureLog: {
          value,
          approvedValue: value,
          hasApproved: false,
          minLimit: item.minLimit,
          maxLimit: item.maxLimit,
          statusDevice: measureFinded.statusDevice
        }
      })
    }
  })
  // console.log('log dataImport is OK')//thoconsole
  return dataImport
}

async function importStationData ({
  stationKey,
  data: { receivedAt, measuringLogs }
}) {
  try {
    const dataStationModel = createDataStationModel(stationKey)
    await dataStationAutoDao.createOrUpdate(
      {
        receivedAt,
        measuringLogs
      },
      dataStationModel
    )
    const resStationAuto = await stationAutoDao.updateLastLog(stationKey, { receivedAt, measuringLogs })
    console.log('insert', true, stationKey)
    return { success: true, data: resStationAuto }
  } catch (e) {
    console.log('ERROR: ', e)
    return { error: true, message: e.message }
  }
}


export async function deleteMany ({stationKey}) {
  try {
    const dataStationModel = createDataStationModel(stationKey)
    await dataStationAutoDao.deleteMany(dataStationModel)
    console.log('success', stationKey)
    return { success: true }
  } catch (e) {
    return { error: true, message: e.message }
  }
}

export async function insertMany (stationKey, data) {
  try {
    const dataStationModel = createDataStationModel(stationKey)
    // console.log('log dataStationModel: ' + JSON.stringify(dataStationModel))//thoconsole
    await dataStationAutoDao.insertMany(dataStationModel, data)
    if (data && _.size(data) > 0) {
      const { receivedAt, measuringLogs } = data[data.length - 1]
      const resStationAuto = await stationAutoDao.updateLastLog(stationKey, { receivedAt, measuringLogs })
    }
    return { success: true }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

export default async function ImportData (
  { station, receivedAt, measureData, warningConfigs }  
) {
  const data = getDataImport({ station, receivedAt, measureData, warningConfigs })
  const rs = await importStationData({stationKey: station.key, data})
  return rs
}