import * as _ from 'lodash'
import readData, { readDataAsync } from './utils/db-exe'
import stationAutoDao from './dao/stationAutoDao';
import measuringDao from './dao/measuringDao'
import stationTypeObj from './constants/station-type-fake'

function mearureSQLKey2MongoDB (key) {
	switch (key) {
		case 'CU':
			return 'Cu'
		case 'Do_Duc':
			return 'Turbidity'
		case 'Temp1':
		case 'Nhiet_Do':
			return 'Temp'
		case 'PM':
			return 'Dust'
		case 'PM2_5':
			return 'PM2_5'//không đổi với giá trị PM2_5 thopham vì BSON không hiểu key có dấu chấm
		case 'Flow_Out':
		case 'Q':
			return 'FLOW'
		case 'pH1':
			return 'pH'
		default:
			return key
	}
}

export default async function runStation () {

	let measureMongoDB = await measuringDao.all()
	measureMongoDB = _.map(measureMongoDB, ({ key, name, unit }) => ({ key, name, unit }))
	measureMongoDB = _.keyBy(measureMongoDB, 'key')

  readData({ table: 'DiemDo' }, rs => {
  	if (rs.status) {
  		_.forEach(_.orderBy(rs.data, 'MaDiem'), async ({
				MaDiem, TenDiem, DiaChi, KinhDo, ViDo, MoTa, DienThoai = '', Email = '', LoaiDiem
			}, inx) => {
				const measuringListConfigLogger = []
				let measuringList = await readDataAsync({table: 'DiemDo_ThongSo', filter: ` MaDiem = '${MaDiem}' `})
				measuringList = _.map(measuringList, ({ MaThongSo, GTMin, GTMax }) => {
					const MaThongSoDB = mearureSQLKey2MongoDB(MaThongSo)
					const dataMongo = _.get(measureMongoDB, [MaThongSoDB], {key: MaThongSoDB, name: MaThongSoDB})
					measuringListConfigLogger.push({
						measuringDes: MaThongSoDB, // DB moi
						measuringSrc: MaThongSo, // trong file TXT, CSV, SQL
						ratio: 1
					})
					return {
						...dataMongo,
						maxLimit: GTMax,
						minLimit: GTMin
					}
				})
				const station = {
					key: MaDiem,
					name: TenDiem,
					stationType: _.get(stationTypeObj, [LoaiDiem], {}),
					address: DiaChi,
					mapLocation: {
						lat: ViDo,
        		long: KinhDo
					},
					emails: _.split(Email, ';'),
					phones: _.split(DienThoai, ';'),
					options: {},
					measuringList,
					image: '',
					standardsVN: null,
					province: null,
					note: MoTa,
					configLogger: { path: '', fileName: '', measuringList: measuringListConfigLogger }
				}

				console.log(MaDiem)
			// console.log('log station is OK')//thoconsole
  			const result = await stationAutoDao.add(station)
  			if (!result) console.log(params.key)
  		})
  	} else {
  		console.error(rs.message)
  	}
  })
}
