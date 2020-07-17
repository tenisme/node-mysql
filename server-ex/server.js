// 웹서버 동작시키는 코드
// 파일 실행시키고 Ctrl+C 누르고 나오면 서버 끊어짐.
// 서버가 돌고 있으면 터미널이 멈춰있는 게 맞음.

// 선행 0-1. config 폴더/ ~.env 환경설정 파일 만들기.
// 선행 0-2. routes 폴더/ ~.js 라우터 파일 만들기.

// 1. express 가져오기 - express : 웹 서버를 동작시키는 프레임워크
const express = require("express");
// 2. dotenv 가져오기 - dotenv : config.env 파일을 가져와서 사용할 수 있는 모듈
const dotenv = require("dotenv");

// 3. 직접 만든 라우터 파일을 가져온다.
const bootcamps = require("./routes/bootcamps.js");

// 4. 라우터 연결 : .env(환경 설정 파일)의 내용을 dotenv.config({path:경로.env})로 불러온다.
dotenv.config({ path: "./config/config.env" });

// 5. 웹서버 프레임워크인 익스프레스를 express()로 가져와 app에 저장한다.
const app = express();

// next 파라미터 실습
// 5.5. 로그 찍는 로거 함수를 만든다.
const logger = (req, res, next) => {
  req.hello = "Hello World";
  console.log("미들웨어 실행됨.");
  next();
};
// 미들웨어 연결 : 로거 함수를 express에 연결.
//   express().use(logger)의 위치는 아래의 라우터 연결 전이어야 한다.
app.use(logger);

// 6. 라우터 연결 : "사용할 url의 path"와 "라우터 파일"을 app.use("url의 path", 라우터변수)으로 연결한다. 이걸 여러개 쓸 수 있다.
app.use("/api/v1/bootcamps", bootcamps);
// 여러개 쓰기 예시
// app.use("/api/v1/shirts", shirts);
// app.use("/api/v1/books", books);
// app.use("/api/v2/bootcamps", bootcamps);

// 7. 환경설정 파일인 config.env 파일에 있는 내용 중 PORT를 불러와 저장한다.
const PORT = process.env.PORT || 5000;

// 8. 위에서 저장한 PORT를 아래 파라미터에 추가해서 서버를 구동한다 - .listen(포트번호, ()=>{연결시 행동}) : 서버 구동 함수
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
