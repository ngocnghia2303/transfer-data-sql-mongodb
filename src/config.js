import "dotenv/config";
const MONGO_HOST = process.env.MONGO_HOST || '192.168.0.7'
const MONGO_PORT = process.env.MONGO_PORT || 27017
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'ilotusland_demo'
const MONGO_DB_USR = process.env.MONGO_DB_USR || 'dev'
const MONGO_DB_PWD = process.env.MONGO_DB_PWD || '506b04d39d168bbfa3725221c1522d04'
export default {
  MONGODB: {
    database: `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB_NAME}`,
    // database: `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB_NAME}`,
    db_options: {
      native_parser: true,
      poolSize: 5,
      user: MONGO_DB_USR,
      pass: MONGO_DB_PWD,
      useNewUrlParser: true,
      promiseLibrary: require("bluebird"),
      autoReconnect: true
    }
  },
  SQLSERVER: {
    user: process.env.SQL_USER || 'sa',
    password: process.env.SQL_PASS || 'Nghiadeptrai',
    server: process.env.SQL_SERVER || 'localhost',
    database: process.env.SQL_DB || 'LINDA-HTV',
    port: process.env.SQL_PORT || '1433',
  },
  QUEUE_TOTAL_READ: process.env.QUEUE_TOTAL_READ,
  QUEUE_TOTAL_READ_CHILD: process.env.QUEUE_TOTAL_READ_CHILD
};
