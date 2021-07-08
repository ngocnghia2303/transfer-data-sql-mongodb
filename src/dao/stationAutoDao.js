import StationAuto from '../models/StationAuto'
import * as _ from 'lodash'

export default {
	all: async (filter = {}) => {
		const rs = await StationAuto.find(filter)
		return rs
  },
  findByKey: async key => {
    const rs = await StationAuto.findOne({key})
		return rs
  },
  allMergeLogger: async (filter = {}) => {
    const rs = await StationAuto.find(filter)
    const list = _.map(rs, item => {
      const measureObj = _.keyBy(_.get(item, 'measuringList', []), 'key')
      let measuringLogger = _.get(item, 'configLogger.measuringList', [])
      item.measuringList = measuringLogger.map(m => ({ ...m, ...measureObj[m.measuringDes] }))
      return item
    })
		return rs
	},
	add: async (params) => {
		const exists = await StationAuto.findOne({ key: params.key })
		if (exists) {
			return true
		} else {
			const rs = await StationAuto.create(params)
			return !!rs
		}
	},
	updateLastLog: async (key, { receivedAt, measuringLogs }) => {
    let stationAuto = await StationAuto.findOne({ key })
    if (!stationAuto) return false
    let lastLogDB = stationAuto.lastLog
    let receivedAtClient = new Date(receivedAt)
    if (lastLogDB && lastLogDB.receivedAt) {
      let receivedAtDB = new Date(lastLogDB.receivedAt)
      // Neu du lieu gui ve la thoi gian truoc do => khong update vao lastLog
      if (receivedAtDB > receivedAtClient) return null
    }
    let item = await StationAuto.findOneAndUpdate(
      { key },
      {
        $set: {
          lastLog: { receivedAt, measuringLogs }
        }
      },
      { new: true }
    )
    return item
  }
}