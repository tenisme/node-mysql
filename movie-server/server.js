// npm 패키지 require
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

// 라우터 require
const movie = require("./routes/movie.js");

// 환경설정 파일 로딩
dotenv.config({ path: "./config/config.env" });

const app = express();

// body 사용시 body를 json으로 사용하겠다
app.use(express.json());

// morgan 사용
app.use(morgan("dev"));

app.use("/api/v1/movie", movie);

const PORT = process.env.PORT || 5100;

app.listen(PORT, console.log(`App listening on port ${PORT}!`));
