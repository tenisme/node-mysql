// promise로 개발된 mysql2 패키지를 설치하고 로딩.
const mysql = require("mysql2");

// db-config.json에 저장된 중요 정보를 여기서 셋팅.
const db_config = require("../config/db-config.json");

// 커넥션 풀(Connection Pool)을 만든다.
//   풀이 알아서 커넥션 연결을 컨트롤하기 때문에 커넥션 풀을 만든다.
const pool = mysql.createPool({
  host: db_config.MYSQL_HOST,
  user: db_config.MYSQL_USER,
  password: db_config.DB_PASSWD,
  database: db_config.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// await으로 사용하기 위해 프라미스로 저장. 이렇게 해야 에러 처리 및 유지보수가 쉽다.
const connection = pool.promise();

module.exports = connection;

// 커넥션은 컨트롤러에서 사용함.
