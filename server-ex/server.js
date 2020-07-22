// 웹서버 동작시키는 코드
// 파일 실행시키고 Ctrl+C 누르고 나오면 서버 끊어짐.
// 서버가 돌고 있으면 터미널이 멈춰있는 게 맞음.

// 선행 0-1. config 폴더/ ~.env 환경설정 파일 만들기.
// 선행 0-2. routes 폴더/ ~.js 라우터 파일 만들기.

// 1. express 가져오기 - express : 웹 서버를 동작시키는 프레임워크
const express = require("express");
// 2. dotenv 가져오기 - dotenv : config.env 파일을 가져와서 사용할 수 있는 모듈
const dotenv = require("dotenv");
const morgan = require("morgan"); // 미들웨어 사용
const logger = require("./middleware/logger.js");
const errorHandler = require("./middleware/error.js");

// 3. 직접 만든 라우터 파일을 가져온다.
const bootcamps = require("./routes/bootcamps.js");
const users = require("./routes/users.js");

// 4. 라우터 연결 : .env(환경 설정 파일)의 내용을 dotenv.config({path:경로.env})로 불러온다.
dotenv.config({ path: "./config/config.env" });

// 5. 웹서버 프레임워크인 익스프레스를 express()로 가져와 app에 저장한다.
const app = express();

// body 파싱할 수 있도록 설정해주기
app.use(express.json());

// app.use()는 순서가 중요하다. next()로 순서대로 실행시킨다.
// 미들웨어 연결 : 로거 함수를 express에 연결.
//   express().use(logger)의 위치는 아래의 라우터 연결 전이어야 한다.
app.use(logger);

// app.use((req, res, next) => {
//   // 사이트 접속 막기
//   // res.status(503).send("사이트 점검중입니다.");
//   // 특정 메소드 막기
//   // if (req.method === "GET") {
//   //   // === : isEqual()
//   //   res.json({ alert: "GET requests are disabled" });
//   // } else {
//   //   next(); // 처리하고 밑으로 넘겨라. 이거 없으면 안 넘김.
//   // }
// });

// app.use(morgan("combined"));

// 6. 라우터 연결 : "사용할 url의 path"와 "라우터 파일"을 app.use("url의 path", 라우터변수)으로 연결한다.
//   이걸 여러개 쓸 수 있다.
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/users", users);

// 위의 에러를 처리하기 위해서, 에러 핸들러 미들웨어 연결
app.use(errorHandler);

// 7. 환경설정 파일인 config.env 파일에 있는 내용 중 PORT를 불러와 저장한다.
const PORT = process.env.PORT || 5000;

// 8. 위에서 저장한 PORT를 아래 파라미터에 추가해서 서버를 구동한다.
//   listen(포트번호, ()=>{연결시 행동}) : 서버 구동 함수
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
