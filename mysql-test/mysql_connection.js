
const mysql = require("mysql")

const connection = mysql.createConnection(
    {
        host : "aws-mysql.c8urw0tytlbj.ap-northeast-2.rds.amazonaws.com",
        user : "node_user",
        password : "",
        database : "my_test"
    }
)

module.exports = connection