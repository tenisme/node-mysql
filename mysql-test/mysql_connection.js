const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "aws-mysql.c8urw0tytlbj.ap-northeast-2.rds.amazonaws.com",
  user: "node_user",
  password: "000000000000", // 0-2-10
  database: "my_test",
});

module.exports = connection;
