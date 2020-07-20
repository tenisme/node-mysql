const mysql = require("mysql2");
const db_config = require("../config/db-config.json");

const pool = mysql.createPool({
  host: db_config.MYSQL_HOST,
  user: db_config.MYSQL_USER,
  password: db_config.DB_PASSWD,
  database: db_config.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

const connection = pool.promise();

module.exports = connection;
