// npm 패키지
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const chalk = require("chalk");
const validator = require("validator");

// 파일 참조
const connection = require("../db/mysql_connection.js");
const sendEmail = require("../utils/sendemail.js");

// @desc    회원 가입 api
// @route   POST /api/v1/users
// @req     login_id, email, passwd
exports.createUser = async (req, res, next) => {
  console.log(chalk.bold("<<  회원 가입 api 실행됨  >>"));

  // body에서 id/email/passwd 가져오기
  let login_id = req.body.login_id;
  let email = req.body.email;
  let passwd = req.body.passwd;

  // 패스워드 암호화
  const hashedPasswd = await bcrypt.hash(passwd, 8);

  // 이메일이 정상적인가 체크
  if (!validator.isEmail(email)) {
    res.status(500).json({
      success: false,
      message: "정상적인 이메일 형식으로 입력해주세요",
    });
    return;
  }

  // DB에 유저 정보 insert
  let query = `insert into movie_user (login_id, email, passwd) values ?`;
  let values = [login_id, email, hashedPasswd];

  // 트랜잭션 셋팅
  const conn = await connection.getConnection();
  // 트랜잭션 시작
  await conn.beginTransaction();

  try {
    [result] = await conn.query(query, [[values]]);

    if (result.affectedRows == 0) {
      await conn.rollback();
      res.status(500).json({ success: false, message: "가입 실패" });
      return;
    }

    user_id = result.insertId;
  } catch (e) {
    await conn.rollback();
    if (e.errno == 1062) {
      res.status(400).json({
        success: false,
        errno: 0,
        message: "이미 존재하는 아이디입니다",
      });
      return;
    }

    res.status(500).json({ success: false, error: e });
    return;
  }

  // 토큰 만들기 / DB에 토큰 저장하기
  let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);

  query = `insert into movie_token (token, user_id) values ('${token}',${user_id})`;

  try {
    [result] = await conn.query(query);

    if (result.affectedRows == 0) {
      await conn.rollback();
      res.status(500).json({ success: false, message: "회원 가입 실패" });
      return;
    }

    // 가입 환영 이메일 보내기
    const message = "환영합니다";
    try {
      await sendEmail({
        email: email,
        subject: "회원가입 축하",
        message: message,
      });
    } catch (e) {
      await conn.rollback();
      res.status(500).json({ success: false, error: e });
      return;
    }

    // 트랜잭션 - 저장
    await conn.commit();

    res
      .status(200)
      .json({ success: true, token: token, result: "가입을 환영합니다" });

    console.log(
      chalk.yellowBright.bold("User join on") +
        chalk.cyanBright(` - user_id : ${user_id}, login_id : ${login_id}`)
    );
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ success: false, error: e });
  }

  // 트랜잭션 - (DB) 커넥션 반환
  await conn.release();
};

// @desc    로그인 api
// @route   POST /api/v1/users/login
// @req     login_id, passwd
exports.login = async (req, res, next) => {
  console.log(chalk.bold("<<  로그인 api 실행됨  >>"));

  // body에서 id/passwd 가져오기
  let login_id = req.body.login_id;
  let passwd = req.body.passwd;

  let query = `select * from movie_user where login_id = '${login_id}'`;

  try {
    [rows] = await connection.query(query);

    // 등록된 아이디인지 체크
    if (rows.length == 0) {
      res
        .status(400)
        .json({ success: false, message: "등록되지 않은 아이디입니다" });
      return;
    }

    // 기존 비밀번호와 맞는지 체크 (bcrypt)
    let isMatch = await bcrypt.compare(passwd, rows[0].passwd);

    if (!isMatch) {
      res.status(400).json({
        success: false,
        result: isMatch,
        message: "비밀번호가 맞지 않습니다",
      });
      return;
    }

    let user_id = rows[0].user_id;

    // 로그인 토큰 생성 (jwt)
    let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);

    // DB에 로그인시 생성한 토큰을 저장
    query = `insert into movie_token (token, user_id) values ?`;
    values = [token, user_id];

    try {
      [result] = await connection.query(query, [[values]]);

      if (result.affectedRows == 0) {
        res.status(500).json({ success: false, message: "로그인 실패" });
        return;
      }

      res.status(200).json({
        success: true,
        result: isMatch,
        token: token,
        message: "환영합니다",
      });

      console.log(
        chalk.yellowBright.bold("User login") +
          chalk.cyanBright(` - user_id : ${user_id}, login_id : ${login_id}`)
      );
    } catch (e) {
      res.status(500).json({ success: false, error: e });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    내 정보 조회 api (with auth)
// @route   GET /api/v1/users
// @res     { login_id, email, created_at }
exports.viewMyInfo = async (req, res, next) => {
  console.log(chalk.bold("<<  내 정보 조회 api 실행됨  >>"));

  let user_id = req.user.user_id;

  if (!user_id) {
    res.status(400).json({ success: false, message: "잘못된 접근" });
    return;
  }

  let query = `select * from movie_user where user_id = ${user_id}`;

  try {
    [rows] = await connection.query(query);

    if (rows.length == 0) {
      res.status(500).json({ success: false, message: "정보 조회 실패" });
      return;
    }

    delete rows[0].user_id;
    delete rows[0].passwd;
    delete rows[0].reset_passwd_token;

    res.status(200).json({ success: true, message: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    현재 기기 로그아웃 api (with auth)
// @route   POST /api/v1/users/logout
exports.logout = async (req, res, next) => {
  console.log(chalk.bold("<<  현재 기기 로그아웃 api 실행됨  >>"));

  let user_id = req.user.user_id;
  let token = req.user.token;

  if (!user_id) {
    res.status(400).json({ success: false, message: "잘못된 접근" });
    return;
  }

  let query = `delete from movie_token where user_id = ${user_id} and token = "${token}"`;

  try {
    [result] = await connection.query(query);

    if (result.affectedRows == 0) {
      res.status(500).json({ success: false, message: "로그아웃 실패" });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "성공적으로 로그아웃되었습니다." });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    모든 기기 로그아웃 api (with auth)
// @route   POST /api/v1/users/logout_all
exports.logoutAll = async (req, res, next) => {
  console.log(chalk.bold("<<  모든 기기 로그아웃 api 실행됨  >>"));

  let user_id = req.user.user_id;

  if (!user_id) {
    res.status(400).json({ success: false, message: "잘못된 접근" });
    return;
  }

  let query = `delete from movie_token where user_id = ${user_id}`;

  try {
    [result] = await connection.query(query);

    if (result.affectedRows == 0) {
      res.status(500).json({ success: false, message: "로그아웃 실패" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "모든 기기에서 성공적으로 로그아웃되었습니다.",
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    회원 탈퇴 api (with auth)
// @route   DELETE /api/v1/users
exports.deleteUser = async (req, res, next) => {
  console.log(chalk.bold("<<  회원 탈퇴 api 실행됨  >>"));

  // user에 저장된 user_id 가져오기
  let user_id = req.user.user_id;

  if (!user_id) {
    res.status(400).json({ success: false, message: "잘못된 접근" });
    return;
  }

  let query = `delete from movie_user where user_id = ${user_id}`;

  // 트랜잭션 셋팅
  const conn = await connection.getConnection();
  // 트랜잭션 실행
  await conn.beginTransaction();

  try {
    // 첫번째 테이블에서 정보 삭제
    [result] = await conn.query(query);

    // 두번째 테이블에서 정보 삭제
    query = `delete from movie_token where user_id = ${user_id}`;
    [result] = await conn.query(query);

    // 세번째 테이블에서 정보 삭제
    query = `delete from favorite_movie where user_id = ${user_id}`;
    [result] = await conn.query(query);

    await conn.commit();

    res
      .status(200)
      .json({ success: true, message: "정상적으로 탈퇴 처리 되었습니다." });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ success: false, error: e });
  } finally {
    await conn.release();
  }
};

// @desc    패스워드 변경 api : 기존 암호를 아는 경우 (with auth)
// @route   PUT /api/v1/users/updatepasswd
// @req     passwd, new_passwd
exports.updatePasswd = async (req, res, next) => {
  console.log(chalk.bold("<<  패스워드 변경 api 실행됨  >>"));

  let user_id = req.user.user_id;
  let passwd = req.body.passwd;

  if (!user_id) {
    res.status(400).json({ success: false, message: "잘못된 접근" });
    return;
  }

  // 유저 찾기
  let query = `select * from movie_user where user_id = "${user_id}"`;

  try {
    [rows] = await connection.query(query);

    // 기존 암호 일치 여부 확인
    let isMatch = await bcrypt.compare(passwd, rows[0].passwd);

    if (!isMatch) {
      res.status(400).json({
        seccess: false,
        message: "기존 암호를 정확하게 입력해주십시오.",
      });
      return;
    }

    // 새 비밀번호와 기존 비밀번호의 일치 여부 확인
    let new_passwd = req.body.new_passwd;

    if (passwd == new_passwd) {
      res.status(400).json({
        success: false,
        message: "기존 암호와 다른 암호를 입력하세요",
      });
      return;
    }

    // 새 비밀번호 암호화 및 기존 비밀번호 정보 업데이트
    const hashedPasswd = await bcrypt.hash(new_passwd, 8);

    query = `update movie_user set passwd = "${hashedPasswd}" where user_id = ${user_id}`;

    try {
      [result] = await connection.query(query);

      if (result.affectedRows == 0) {
        res
          .status(500)
          .json({ success: false, message: "비밀번호 변경이 실패했습니다" });
      }

      res.status(200).json({
        success: true,
        message: "비밀번호가 성공적으로 변경되었습니다",
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    패스워드 분실 / 리셋 요청 api
// @route   POST /api/v1/users/forgotpasswd
// @req     login_id, email
exports.forgotPasswd = async (req, res, next) => {
  console.log(chalk.bold("<<  패스워드 분실/요청 api 실행됨  >>"));

  let login_id = req.body.login_id;
  let email = req.body.email;

  let query = `select * from movie_user where login_id = "${login_id}" and email = "${email}"`;

  try {
    [rows] = await connection.query(query);

    // 기존 유저가 맞는지 체크하기
    if (rows.length == 0) {
      res
        .status(400)
        .json({ success: false, message: "존재하지 않는 id 혹은 email" });
      return;
    }

    // 리셋 토큰 설정
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetPasswdToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 리셋 토큰을 DB에 저장
    query = `update movie_user set reset_passwd_token = "${resetPasswdToken}" where user_id = ${rows[0].user_id}`;

    try {
      [result] = await connection.query(query);

      if (result.affectedRows == 0) {
        res.status(500).json({ success: false, message: "로그인 실패" });
        return;
      }

      // 비밀번호 변경 이메일 보내기
      const message = `다음의 링크 : localhost:5100/api/v1/users/resetpasswd/${resetPasswdToken} 에서 비밀번호를 변경하세요`;
      try {
        await sendEmail({
          email: email,
          subject: "비밀번호 변경",
          message: message,
        });
      } catch (e) {
        res.status(500).json({ success: false, error: e });
        return;
      }

      res.status(200).json({
        success: true,
        message: `'${email}'을 확인하여 비밀번호를 변경해주세요.`,
      });
    } catch (e) {
      await conn.rollback();
      res.status(500).json({ success: false, error: e });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    패스워드 초기화 api
// @route   POST /api/v1/users/resetpasswd/:resetPasswdToken
// @req     resetPasswdToken, new_passwd
exports.resetPasswd = async (req, res, next) => {
  console.log(chalk.bold("<<  패스워드 초기화 api 실행됨  >>"));

  const resetPasswdToken = req.params.resetPasswdToken;

  let query = `select * from movie_user where reset_passwd_token = "${resetPasswdToken}"`;
  let user_id;

  try {
    [rows] = await connection.query(query);

    if (rows.length == 0) {
      res.status(400).json({ success: false, message: "잘못된 접근입니다" });
      return;
    }

    user_id = rows[0].user_id;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }

  let new_passwd = req.body.new_passwd;
  const hashedPasswd = await bcrypt.hash(new_passwd, 8);

  query = `update movie_user set passwd = "${hashedPasswd}", reset_passwd_token = "" where user_id = ${user_id}`;

  try {
    [result] = await connection.query(query);

    if (result.affectedRows == 0) {
      res.status(500).json({ success: false, message: "로그인 실패" });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "비밀번호가 성공적으로 변경되었습니다" });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
