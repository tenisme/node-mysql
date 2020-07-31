// npm 패키지 require
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
// 파일 처리를 위한 라이브러리 import
const fileupload = require("express-fileupload");
const path = require("path");

// 라우터 require
const movies = require("./routes/movies.js");
const users = require("./routes/users.js");
const favorites = require("./routes/favorites.js");
const replies = require("./routes/replies.js");
const reservations = require("./routes/reservations.js");

// 기타 파일 셋팅
dotenv.config({ path: "./config/config.env" });

const app = express();

// body 사용시 body를 json으로 사용하겠다
app.use(express.json());

// 아래의 코드로 express가 파일 업로드를 사용할 수 있게 된다.
app.use(fileupload());
// 이미지를 불러올 수 있도록 static 경로를 설정한다.
app.use(express.static(path.join(__dirname, "public")));
// __dirname : server.js 파일이 있는 절대 경로. 서버가 돌아가는 경로의 이름?
// express 웹서버가 웹브라우저에서 public 디렉토리에 접근할 수 있도록 만들겠다.
// public - 퍼블릭 폴더 경로를 의미함.

// morgan 사용
app.use(morgan("dev"));

app.use("/api/v1/movies", movies);
app.use("/api/v1/users", users);
app.use("/api/v1/favorites", favorites);
app.use("/api/v1/replies", replies);
app.use("/api/v1/reservations", reservations);

const PORT = process.env.PORT || 5100;

app.listen(PORT, console.log(`App listening on port ${PORT}!`));
