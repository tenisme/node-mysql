// 웹서버 동작시키는 코드
// 파일 실행시키고 Ctrl+C 누르고 나오면 서버 끊어짐.
// 서버가 돌고 있으면 터미널이 멈춰있는 게 맞음.
const express = require("express");
const app = express();

app.get("/", function (req, res) {
  res.send("Let's go home");
});

app.listen(3000);
