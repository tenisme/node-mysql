// 웹서버 동작시키는 코드
// 파일 실행시키고 Ctrl+C 누르고 나오면 서버 끊어짐.
// 서버가 돌고 있으면 터미널이 멈춰있는 게 맞음.

// express : 웹 서버를 동작시키는 프레임워크
const express = require("express");
const dotenv = require("dotenv"); // config.js를 가져올 수 있게 해주는 모듈

// 환경 설정 파일의 내용을 로딩한다.
dotenv.config({ path: "./config/config.env" }); // config.js 파일을 여기에 불러옴

// 웹서버 프레임워크인 익스프레스를 가져온다.
const app = express();

// 환경설정 파일인 config.env 파일에 있는 내용을 불러오는 방법.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
