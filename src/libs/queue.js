import Queue from 'better-queue'
import config from '../config'

export default function createQueue (afterProcessDelay = 1) {
  const qChild = new Queue(
    async function (inputChild, cbChild) {
      const { func, params } = inputChild
      if (params.isAwait) {
        await func(params)
      } else {
        func(params)
      }
      cbChild(null)
    },
    {
      afterProcessDelay,//config.QUEUE_TOTAL_READ_CHILD,
      maxRetries: 50,
      retryDelay: 300
    }
  )

  const queue = new Queue(
    async function (input, cb) {
      for (let i = 0; i < input.length; i++) {
        qChild.push(input[i])
        //console.log('ID: ', input[i].params.id)
        // const { func, params } = input[i]
        // func(params)
      }
      cb(null)
    },
    {
      batchSize: config.QUEUE_TOTAL_READ,
      batchDelayTimeout: 10000,
      afterProcessDelay: 5
    }
  )
  return queue
}

