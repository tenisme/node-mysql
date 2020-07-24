const connection = require("../db/mysql_connection.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const chalk = require("chalk");

// @desc    회원가입
// @route   POST /api/v1/memos/user
// parameters   login_id, password
exports.createUser = async (req, res, next) => {
  console.log("회원가입 API 실행");

  let login_id = req.body.login_id;
  let password = req.body.password;

  // 패스워드 암호화
  const hashedPasswd = await bcrypt.hash(password, 8);

  // memo_user DB에 유저 추가
  let query = "insert into memo_user (login_id, password) values ?";
  let values = [login_id, hashedPasswd];
  let insert_id;

  try {
    [result] = await connection.query(query, [[values]]);
    console.log(chalk.blueBright(JSON.stringify(result)));
    insert_id = result.insertId;
  } catch (e) {
    if (e.errno == 1062) {
      // 1062 : 이메일 중복 에러
      res.status(400).json({
        success: false,
        errno: 1,
        message: `이미 존재하는 아이디입니다.`,
      });
      return;
    } else {
      res.status(500).json({ success: false, error: e });
      return;
    }
  }

  // 토큰 만들기 / memo_token DB에 저장하기
  let token = jwt.sign({ user_id: insert_id }, process.env.ACCESS_TOKEN_SECRET);

  query = `insert into memo_token (token, user_id) values ('${token}',${insert_id})`;

  try {
    [result] = await connection.query(query);
    res
      .status(200)
      .json({ success: true, token: token, result: "가입을 환영합니다" });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    로그인
// @route   POST /api/v1/memos/user/login
// @parameters  login_id, password
exports.loginUser = async (req, res, next) => {
  console.log("로그인 API 실행");

  let login_id = req.body.login_id;
  let password = req.body.password;

  // 입력한 아이디로 유저 찾기 쿼리
  let query = `select * from memo_user where login_id = '${login_id}'`;

  try {
    [row] = await connection.query(query);

    // 등록된 아이디인지 체크
    if (row.length == 0) {
      res
        .status(400)
        .json({ success: false, message: "등록되지 않은 아이디입니다" });
      return;
    }

    // 기존 비밀번호와 맞는지 체크 (bcrypt)
    let isMatch = await bcrypt.compare(password, row[0].password);

    if (!isMatch) {
      res.status(400).json({
        success: false,
        result: isMatch,
        message: "비밀번호가 맞지 않습니다",
      });
      return;
    }

    // 토큰 생성 (jwt)
    let token = jwt.sign(
      { user_id: row[0].user_id },
      process.env.ACCESS_TOKEN_SECRET
    );

    // DB에 토큰 저장 쿼리
    query = `insert into memo_token (token, user_id) values ('${token}',${row[0].user_id})`;

    try {
      [result] = await connection.query(query);
      res.status(200).json({
        success: true,
        result: isMatch,
        token: token,
        message: "환영합니다",
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    사용자 개인 정보 조회
// @url   GET /api/v1/memos/user/my_info
// @request
// @response  id, email, created_at
exports.getUserInfo = (req, res, next) => {
  console.log("회원 정보 조회 API 실행");

  res.status(200).json({ success: true, result: req.user });
};

// @desc    패스워드 변경
// @route   PUT /api/v1/memos/user/change_password
// @parameters  login_id, password
// @public  auth
exports.changePasswd = async (req, res, next) => {
  console.log("패스워드 변경 API 실행");

  let login_id = req.body.login_id;
  let password = req.body.password;

  let query = `select password from memo_user where login_id = '${login_id}'`;

  try {
    [row] = await connection.query(query);

    if (row.length == 0) {
      res
        .status(400)
        .json({ success: false, message: "등록되지 않은 이메일입니다" });
      return;
    }

    let isMatch = await bcrypt.compare(password, row[0].password);

    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: "기존 암호를 정확하게 입력해주십시오.",
      });
      return;
    }

    let new_passwd = req.body.new_passwd;

    if (password == new_passwd) {
      res.status(400).json({
        success: false,
        message: "기존 암호와 다른 암호를 입력하세요",
      });
      return;
    }

    const hashedPasswd = await bcrypt.hash(new_passwd, 8);

    query = `update memo_user set password = '${hashedPasswd}' where login_id = '${login_id}'`;

    try {
      [result] = await connection.query(query);
      console.log(chalk.blueBright(JSON.stringify(result)));

      if (result.affectedRows == 1) {
        res
          .status(200)
          .json({ success: true, message: "비밀번호가 변경되었습니다" });
        return;
      } else {
        res
          .status(200)
          .json({ success: false, message: "비밀번호 변경이 실패했습니다" });
        return;
      }
    } catch (e) {
      res.status(500).json({ success: false, error: e });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
