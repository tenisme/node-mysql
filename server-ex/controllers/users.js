const connection = require("../db/mysql_connection.js");
const ErrorResponse = require("../utils/errorResponse.js");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const chalk = require("chalk");
const sendEmail = require("../utils/sendemail.js");
const crypto = require("crypto");

// @desc    회원가입
// @route   POST /api/v1/users
// @parameters  email, passwd
exports.createUser = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  // 패스워드 암호화 (bcrypt)
  // 비밀번호는 단방향 암호화를 해야 한다. 그래야 복호화가 안 되서 안전하다.
  const hashedPasswd = await bcrypt.hash(passwd, 8); // 8번 암호화가 제일 빠르고 안전하다.

  // 이메일이 정상적인가 체크
  if (!validator.isEmail(email)) {
    res.status(500).json({ success: false });
    return; // 리턴 까먹지 말기
  }

  // 유저 인서트
  let query = "insert into user (email, passwd) values ?";
  let values = [email, hashedPasswd];
  let user_id;

  try {
    [result] = await connection.query(query, [[values]]);
    console.log(chalk.blueBright(JSON.stringify(result)));
    user_id = result.insertId;
  } catch (e) {
    if (e.errno == 1062) {
      // 1062 : 이메일 중복 에러
      res.status(400).json({
        success: false,
        errno: 1,
        message: `${email}은 이미 가입된 이메일입니다`,
      });
      return;
    } else {
      res.status(500).json({ success: false, error: e });
      return;
    }
  }

  // 토큰 만들기 / DB저장하기
  let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);

  query = `insert into token (token, user_id) values ('${token}',${user_id})`;

  try {
    [result] = await connection.query(query);

    // 가입 환영 이메일 보내기
    const message = "환영합니다";
    try {
      await sendEmail({
        email: "iamchoma@gmail.com",
        subject: "회원가입축하",
        message: message,
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e });
      return;
    }

    res
      .status(200)
      .json({ success: true, token: token, result: "가입을 환영합니다" });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    로그인
// @route   POST /api/v1/users/login
// @parameters  email, passwd
exports.login = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  // 입력한 이메일로 유저 찾기 쿼리
  let query = `select * from user where email = '${email}'`;

  try {
    [rows, fields] = await connection.query(query);

    // 등록된 이메일인지 체크
    if (rows.length == 0) {
      res
        .status(400)
        .json({ success: false, message: "등록되지 않은 이메일입니다" });
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

    // 토큰 생성 (jwt)
    let token = jwt.sign(
      { user_id: rows[0].id },
      process.env.ACCESS_TOKEN_SECRET
    );

    // DB에 토큰 저장 쿼리
    query = `insert into token (token, user_id) values ('${token}',${rows[0].id})`;

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

// @desc    패스워드 변경
// @route   PUT /api/v1/users/change_passwd
// @parameters  email, passwd
exports.changePasswd = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  let query = `select passwd from user where email = '${email}'`;

  try {
    [rows, fields] = await connection.query(query);

    if (rows.length == 0) {
      res
        .status(400)
        .json({ success: false, message: "등록되지 않은 이메일입니다" });
      return;
    }

    let isMatch = await bcrypt.compare(passwd, rows[0].passwd);

    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: "기존 암호를 정확하게 입력해주십시오.",
      });
      return;
    }

    let new_passwd = req.body.new_passwd;

    if (passwd == new_passwd) {
      res.status(400).json({
        success: false,
        message: "기존 암호와 다른 암호를 입력하세요",
      });
      return;
    }

    const hashedPasswd = await bcrypt.hash(new_passwd, 8);

    query = `update user set passwd = '${hashedPasswd}' where email = '${email}'`;

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

// @desc    회원 정보(내 정보) 가져오기
// @route   GET /api/v1/users
exports.getMyInfo = async (req, res, next) => {
  console.log("내 정보 가져오는 API 실행됨");

  res.status(200).json({ success: true, result: req.user });
};

// @desc    로그아웃 api : DB에서 해당 유저의 현재 토큰값을 삭제
// @route   POST /api/v1/users/logout
exports.logout = async (req, res, next) => {
  // 토큰 테이블에서 현재 이 헤더에 있는 토큰을 삭제한다.
  let token = req.user.token;
  let user_id = req.user.id;

  let query = `delete from token where user_id = ${user_id} and token = "${token}"`;

  console.log(query);

  try {
    [result] = await connection.query(query);
    if (result.affectedRows == 1) {
      res.status(200).json({ success: true, result: result });
    } else {
      res.status(400).json({ success: false });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    현재 로그인한 기기를 제외한 로그인된 모든 기기에서 로그아웃하기
// @route   POST /api/v1/users/logout/all
exports.logoutAll = async (req, res, next) => {
  let token = req.user.token;
  let user_id = req.user.id;

  let query = `delete from token where user_id = ${user_id} and not token = "${token}"`;

  try {
    [result] = await connection.query(query);

    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    회원탈퇴 : DB에서 해당 회원의 유저 정보 삭제, 유저 정보가 있는 다른 테이블도 정보 삭제.
// @route   DELETE /api/v1/users
exports.deleteUser = async (req, res, next) => {
  let user_id = req.user.id;

  let query = `delete from user where id = ${user_id}`;

  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();
    // 첫번째 테이블에서 정보 삭제
    [result] = await conn.query(query);
    // 두번째 테이블에서 정보 삭제
    query = `delete from token where user_id=${user_id}`;
    [result] = await conn.query(query);
    await conn.commit();
    res.status(200).json({ success: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ success: false, error: e });
  } finally {
    await conn.release();
  }
};

// 1. 클라이언트가 패스워드 분실했다고 서버한테 요청
// 서버가 패스워드를 변경할 수 있는 url을 클라이언트한테 보내준다.
// (경로에 암호화된 문자열을 보내준다. 토큰 역할임.)

// @desc    패스워드 분실/리셋 요청
// @route   POST /api/v1/users/forgotpasswd
exports.forgotPasswd = async (req, res, next) => {
  let user = req.user;

  // 리셋 토큰 설정
  // 암호화된 문자열 만드는 방법
  // const resetToken = crypto.randomBytes(20).toString("hex");
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetPasswdToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // DB에 리셋 패스워드 토큰 저장 : 유저 테이블에 reset_passwd_token 컬럼에 저장.
  let query = `update user set reset_passwd_token = '${resetPasswdToken}' where id = ${user.id}`;

  try {
    [result] = await connection.query(query);
    user.reset_passwd_token = resetPasswdToken;
    res.status(200).json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// 2. 클라이언트는 해당 암호화된 주소를 받아서, 새로운 비밀번호를 함께 서버로 보낸다.
// 서버는 이 주소가 진짜 유효한지 확인해서, 새로운 비밀번호로 셋팅한다.

// @desc    비번 초기화(reset password) api : 리셋 패스워드 토큰을 경로로 만들어서 바꿀 비번과 함께 요청
// @route   POST /api/v1/users/resetpasswd/:resetPasswdToken
// @req     resetPasswdToken, passwd
exports.resetPasswd = async (req, res, next) => {
  const resetPasswdToken = req.params.resetPasswdToken;
  const user_id = req.user.id;

  let query = `select * from user where id = ${user_id}`;

  try {
    [rows] = await connection.query(query);
    savedResetPasswdToken = rows[0].reset_passwd_token;

    if (savedResetPasswdToken !== resetPasswdToken) {
      res.status(400).json({ success: false });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }

  let passwd = req.body.passwd; // 유저에게 새 비밀번호를 입력받음
  const hashedPasswd = await bcrypt.hash(passwd, 8); // 비밀번호를 암호화

  // 기존 암호를 변경한 암호로 업데이트 & 리셋 패스워드 토큰 초기화(삭제)
  query = `update user set passwd = '${hashedPasswd}', reset_passwd_token = '' where id = ${user_id}`;

  delete req.user.reset_passwd_token;

  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, data: req.user });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
