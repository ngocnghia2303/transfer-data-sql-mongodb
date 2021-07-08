import { modelNames, Model } from "mongoose";

export default {
  all: async (Model, filter = {}) => {
    const rs = await Model.find(filter)
    return rs
  },
  count: async (Model, filter = {}) => {
    const rs = await Model.countDocuments(filter)
    return rs
  },
  remove: (Model, filter) => {
    return Model.remove(filter)
  },
	createOrUpdate: async ({receivedAt, measuringLogs}, Model) => {
		const item = await Model.findOneAndUpdate(
      { receivedAt },
      {
        $set: {
          receivedAt,
          measuringLogs,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      },
      { upsert: true, new: true, runValidators: true }
    )
    return !!item
  },
  update: (data, Model) => {
    return Model.findOneAndUpdate({_id: data._id}, data)
  },
  deleteMany: async (Model, filter = {}) => {
    const rs = await Model.deleteMany(filter)
    return rs
  },
  insertMany: async (Model, list) => {
    const rs = await Model.insertMany(list)
    return rs
  }
}
