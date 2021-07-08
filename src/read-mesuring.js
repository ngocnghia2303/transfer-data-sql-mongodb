import { readDataBySql } from './utils/db-exe'
import * as _ from 'lodash'
import measuringDao from './dao/measuringDao';
import MEASURE from './constants/measuring-data' // Dât nay la giong với du lieu tỏng mongo a nhé

const measureObj = _.keyBy(MEASURE, 'key')

const MEASURE_SQL = ['CU', 'Do_Duc', 'Nhiet_Do', 'PM', 'PM2_5', 'Flow_Out', 'Q', 'pH1', 'Temp1' ]
// const MEASURE_SQL = ['CU', 'Do_Duc', 'Nhiet_Do', 'PM', 'PM2_5', 'Flow_Out', 'Q']

export default function runExeMeasuring () {
	const sqlQuery = `SELECT DISTINCT ddts.MaThongSo, ddts.MaThongSo as TenThongSo, ts.DonVi from DiemDo_ThongSo ddts INNER JOIN ThongSo ts ON ddts.MaThongSo = ts.MaThongSo`
	readDataBySql(sqlQuery)
		.then(rs => {
			console.log('data: ', _.size(rs))
			_.forEach(_.orderBy(rs, 'MaThongSo'), async ({ MaThongSo, TenThongSo, DonVi }, numericalOrder) => {
				const params = {
					key: MaThongSo, name: TenThongSo, unit: DonVi, numericalOrder
				}
				
				if (!_.includes(MEASURE_SQL, MaThongSo) && !measureObj[MaThongSo]) {
					console.log('insert: ', MaThongSo)
					const result = await measuringDao.add(params)
					if (!result) console.log(params.key)
				}

				return null
			})
	}).catch (err => console.log(err.message))
}

export async function runDB () {
	_.forEach(MEASURE, async (item) => {
		await measuringDao.add(item)
	})
}