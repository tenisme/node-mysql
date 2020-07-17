const express = require("express");
const dotenv = require("dotenv");
const memos = require("./routes/memos.js");

// 환경설정 파일 로딩
dotenv.config({ path: "./config/config.env" });

const app = express();

app.use(express.json()); // post 사용시, body를 json으로 사용하겠다

app.use("/api/v1/memos", memos); // 연결은 .use()

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`App listening on port ${PORT}!`));
