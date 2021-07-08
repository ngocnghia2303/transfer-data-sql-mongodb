import sql from 'mssql'
import config from '../config'
import * as _ from 'lodash'

export function connectSql (cb) {
	// sql.connect(config.SQLSERVER, function (err) {
	// 	if (err) {
	// 		console.log('SQL connect error: ', err.message)
	// 	} else {
	// 		console.log('SQL connected')
	// 		cb()
	// 	}
	// });
	// sql.connect(config.SQLSERVER, conn => {
	// 	conn.once('connect', err => { err ? console.error(err) : console.log('mssql connected')})
	// 	conn.once('end', err => { err ? console.error(err) : console.log('mssql disconnected')})
	// })


	// const pool = new sql.ConnectionPool(config.SQLSERVER);

	sql.connect(config.SQLSERVER, conn => {
		conn.once('connect', err => { err ? console.error(err) : cb()})
		conn.once('end', err => { err ? console.error(err) : console.log('mssql disconnected')})
	})

	// const query = 'Select * from ThongSo'
	// return new Promise(async (resolve, reject) => {
	// 	try {
	// 		const pool = new sql.ConnectionPool(config.SQLSERVER);
	// 		const connect = await pool.connect()
	// 		const req = connect.request()
	// 		const { recordset } = await req.query(query)
	// 		console.log(recordset)
	// 		connect.close()
	// 		// resolve(recordset)
	// 	} catch (error) {
	// 		console.log('LOI', error)
	// 		// reject(error)
	// 	}
	// })  
} 

export function reconnect (cb) {
	return new Promise((resolve, reject) => {
		const request = new sql.Request();
		if (!request.connected) {
			connectSql(() => cb())
		} else {
			cb()
		}
	})
}

export function readDataAsync ({ table, filter = ' 1 = 1', fields = '*'}) {
	return new Promise((resolve, reject) => {
		readDataBySql (` SELECT ${fields} FROM ${table} WHERE ${filter}`)
		.then(rs => resolve(rs))
		.catch(err => reject(err))
		// const request = new sql.Request();
		// request.query(`SELECT ${fields} FROM ${table} WHERE ${filter} `, (err, { recordset }) => {
		// 	if (err) {
		// 		reject(err)
		// 	} else {
		// 		resolve(recordset)
		// 	}
		// });
	})
}

export function readDataBySql (query) {
	return new Promise((resolve, reject) => {
		const request = new sql.Request();
		request.query(query, function (err, {recordset}) {
			if (err) reject(err)
			resolve(recordset);
		});
	})
}

export default async function readData({ table, filter = ' 1 = 1', fields = '*'}, cb) {
	readDataAsync({ table, filter, fields })
		.then(data => cb({ status: true, data }))
		.catch(err => cb({ status: false, message: err.message }))
};
