// npm 패키지 require
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

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

// morgan 사용
app.use(morgan("dev"));

app.use("/api/v1/movies", movies);
app.use("/api/v1/users", users);
app.use("/api/v1/favorites", favorites);
app.use("/api/v1/replies", replies);
app.use("/api/v1/reservations", reservations);

const PORT = process.env.PORT || 5100;

app.listen(PORT, console.log(`App listening on port ${PORT}!`));
