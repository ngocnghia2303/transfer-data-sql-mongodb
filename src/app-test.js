import 'dotenv/config';

import queue from 'better-queue'
import manageConnectDatabase from './utils/db'

manageConnectDatabase()
const q = new queue(async (input, cb) => {
  // console.log(input)
  cb(null, input)
}, { concurrent: 3, batchSize: 4 })

q.on('task_finish', function (taskId, result, stats) {
  console.log('task_finish: ', taskId, q.getStats().total)
})
q.on('task_failed', function (taskId, err, stats) {
  console.log('task_failed: ', taskId, err.message)
})

q.push({ id: 'steve', age: 21 });
q.push({ id: 'john', age: 34 });
q.push({ id: 'joe', age: 18 });
q.push({ id: 'mary', age: 23 });
q.push({ id: 'steve1', age: 21 });
q.push({ id: 'john1', age: 34 });
q.push({ id: 'joe1', age: 18 });
q.push({ id: 'mary1', age: 23 });
