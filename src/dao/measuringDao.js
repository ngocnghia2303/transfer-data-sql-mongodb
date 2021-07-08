import Measuring from '../models/Measuring'

export default {
	all: async () => {
		const rs = await Measuring.find()
		return rs
	},
	add: async (params) => {
		const exists = await Measuring.findOne({ key: params.key })
		if (exists) {
			return true
		} else {
			const rs = await Measuring.create(params)
			return !!rs
		}
	}
}