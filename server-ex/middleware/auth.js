// 클라이언트의 헤더에 셋팅된 Authorization(token)값을 확인하여 인증한다.
const jwt = require("jsonwebtoken"); // 얘가 있어야 토큰값 decode 가능
const chalk = require("chalk");
const connection = require("../db/mysql_connection.js");

const auth = async (req, res, next) => {
  console.log("인증 미들웨어 실행");

  // 헤더에서 토큰값 빼오는 방법
  let token = req.header("Authorization");
  token = token.replace("Bearer ", ""); // "Bearer "를 뺀다.
  console.log("token : " + token);

  // 빼온 토큰값 decode해서 user_id값 빼오기
  let user_id;
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(decoded);
    user_id = decoded.user_id;
  } catch (e) {
    res.status(401).json({ error: "형식에 맞지 않는 토큰" });
    return;
  }

  // 빼온 user_id값으로 DB에서 유저 정보 select하기
  let query = `select * from token where user_id = ${user_id}`;

  try {
    [rows, fields] = await connection.query(query);
    console.log(chalk.blueBright(JSON.stringify(rows)));
  } catch (e) {
    res.status(401).json({ error: "인증 먼저 하십시오" });
    return;
  }

  // 가져온 토큰과 가져온 유저 아이디가 잘 맞는지를 반복문을 돌면서 체크한다.
  let isCorrect = false;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].user_id == user_id && rows[i].token == token) {
      isCorrect = true;
      break; // for문을 빠져나온다.
    }
  }

  if (isCorrect) {
    // 유효한 토큰이 맞을 경우, "user" 정보를 db에서 가져온다.
    let query = `select * from user where id = ${user_id}`;
    try {
      [rows, fields] = await connection.query(query);
      // 유저 정보를 req에 셋팅해서 next()한다.
      //   왜? 인증하면서, 유저 정보를 아예 가져와서 req에 저장하기 때문에
      //   API함수에서는 DB에서 유저 정보를 가져오는 코드를 작성할 필요가 없다.
      console.log(chalk.blueBright(JSON.stringify(rows[0])));
      let user = rows[0];
      // 패스워드 정보는 필요 없으므로 빼고
      delete user.passwd;
      // req에 user 영역을 만들어 rows[0](select한 유저 정보)를 저장한다.
      req.user = user;
      next();
    } catch (e) {
      res.status(500).json({ error: "DB 에러" });
    }
  } else {
    res.status(401).json({ error: "인증이 안 된 토큰입니다." });
  }
};

module.exports = auth;
