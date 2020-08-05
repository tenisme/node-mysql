const chalk = require("chalk");
const crypto = require("crypto");
const validator = require("validator");

const connection = require("../db/mysql_connection.js");
const sendEmail = require("../utils/sendemail.js");

// @desc    연락처 공유 api with auth
// @route   POST /api/v1/share
// @req     user_id(auth), login_id(auth), shared_user_id, contact_id
// @res     success, message, error, share_id
exports.shareContact = async (req, res, next) => {
  console.log(chalk.bold("<<  연락처 공유 api 실행됨  >>"));

  // 필요한 데이터 let으로 가져오기
  let user_id = req.user.user_id;
  let login_id = req.user.login_id;
  let shared_user_id = req.body.shared_user_id;
  let contact_id = req.body.contact_id;

  // 올바른 유저인지 체크
  if (!user_id) {
    res.status(401).json({ success: false, message: "잘못된 접근" });
    return;
  }

  // 필요한 req(shared_user_id(공유할 유저 id), contact_id)가 있는지 체크
  if (!shared_user_id) {
    res
      .status(400)
      .json({ success: false, message: "공유할 유저의 id를 입력해주세요" });
    return;
  }

  if (!contact_id) {
    res
      .status(400)
      .json({ success: false, message: "공유할 연락처의 id를 입력해주세요" });
    return;
  }

  // 공유할 유저의 id와 자기 자신의 id가 같은지 체크
  if (user_id == shared_user_id) {
    res
      .status(400)
      .json({ success: false, message: "자신의 아이디로 공유할 수 없습니다" });
    return;
  }

  // 공유할 유저의 id(shared_user_id)가 contact_users 테이블(DB)에 존재하는지 체크 및 데이터(email) 저장
  let query = "select * from contact_users where user_id = ?";
  let values = [shared_user_id];
  let email;

  try {
    [rows] = await connection.query(query, values);

    if (rows.length == 0) {
      res.status(400).json({
        success: false,
        message: "요청한 id의 유저는 존재하지 않습니다",
      });
      return;
    }

    email = rows[0].email;
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
    return;
  }

  // 공유할 연락처가 DB에 존재하는지 체크 및 데이터(name, phone) 저장
  query = "select * from contacts where contact_id = ?";
  values = [contact_id];
  let name;

  try {
    [rows] = await connection.query(query);

    if (rows.length == 0) {
      res.status(500).json({
        success: false,
        message: "요청한 id의 연락처는 존재하지 않습니다",
      });
      return;
    }

    name = rows[0].name;
    phone = rows[0].phone;
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
    return;
  }

  // 1. 공유할 연락처의 id(contact_id)와 2. 공유할 유저의 id(shared_user_id) 및
  // 3. 연락처 간단 저장용 share_token을 contact_share 테이블에 저장

  // share_token 설정
  const share_token = crypto.randomBytes(20).toString("hex");
  const share_contact_token = crypto
    .createHash("sha256")
    .update(share_token)
    .digest("hex");

  query =
    "insert into contact_share (contact_id, shared_user_id, share_contact_token) values ?";
  values = [contact_id, shared_user_id, share_contact_token];

  try {
    [result] = await connection.query(query, [[values]]);

    if (result.affectedRows == 0) {
      res.status(500).json({ success: false, message: "연락처 공유 실패" });
      return;
    }

    let message = `    "${login_id}"님이 "${name}"님의 연락처를 공유했습니다.
    아래의 링크로 접속하면 이 연락처를 바로 저장할 수 있습니다.
    localhost:5300/api/v1/contacts/${share_contact_token}`;

    try {
      await sendEmail({
        email: email,
        subject: `"${login_id}"님으로부터 연락처가 공유되었습니다`,
        message: message,
      });
    } catch (e) {
      res.status(500).json({ success: false, message: e });
      return;
    }

    let share_id = result.insertId;

    res.status(200).json({
      success: true,
      message: "연락처가 성공적으로 공유되었습니다",
      share_id: share_id,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
  }
};

// @desc    공유한 연락처 목록 조회 api with auth
// @route   GET /api/v1/share
// @req     user_id(auth), offset, limit
// @res     success, item : [{share_id, contact_id, shared_user_id}], cnt
exports.viewSharedContacts = async (req, res, next) => {
  console.log(chalk.bold("<<  공유한 연락처 목록 조회 api 실행됨  >>"));

  let user_id = req.user.user_id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  if (!user_id) {
    res.status(401).json({ success: false, message: "잘못된 접근" });
    return;
  }

  if (!offset || !limit) {
    res.status(400).json({ success: false, message: "파라미터 미입력 오류" });
    return;
  }

  let offsetIsNum = validator.isNumeric(offset);
  let limitIsNum = validator.isNumeric(limit);

  if (!offsetIsNum || !limitIsNum) {
    res.status(400).json({
      success: false,
      message: "offset 혹은 limit에는 숫자만 입력이 가능합니다",
    });
    return;
  }

  if (limit <= 0) {
    res
      .status(400)
      .json({ success: false, message: "1 이상의 숫자를 입력해야 합니다" });
    return;
  }

  offset = Number(offset);
  limit = Number(limit);

  let query =
    "select s.share_id, s.contact_id, s.shared_user_id from contact_share as s \
     join contacts as c on s.contact_id = c.contact_id where c.user_id = ? limit ?, ?";
  let values = [user_id, offset, limit];

  try {
    [rows] = await connection.query(query, values);

    if (rows.length == 0) {
      res.status(200).json({ success: false, message: "조회 결과 없음" });
      return;
    }

    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
  }
};

// @desc    공유받은 주소록 자동 저장 api with auth
// @route   POST /api/v1/share/:share_contact_token
// @req     user_id(auth)
// @res     success, message, error
exports.saveSharedContact = async (req, res, next) => {
  console.log(chalk.bold("<<  공유받은 주소록 자동 추가 api 실행됨  >>"));

  let user_id = req.user.user_id;
  let share_contact_token = req.params.share_contact_token;

  if (!user_id) {
    res.status(401).json({ success: false, message: "잘못된 접근" });
    return;
  }

  let query =
    "select c.name, c.phone from contact_share as s join contacts as c on s.contact_id = c.contact_id \
     where s.shared_user_id = ? and s.share_contact_token = ?";
  let values = [shared_user_id, share_contact_token];
  let name;
  let phone;

  try {
    [rows] = await connection.query(query, values);

    if (rows.length == 0) {
      res.status(401).json({ success: false, message: "잘못된 접근" });
      return;
    }

    name = rows[0].name;
    phone = rows[0].phone;
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
    return;
  }

  query = "insert into contacts (user_id, name, phone) values ?";
  values = [user_id, name, phone];

  try {
    [result] = await connection.query(query, [[values]]);

    if (result.affectedRows == 0) {
      res
        .status(500)
        .json({ success: false, message: "연락처 저장에 실패했습니다" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "공유받은 연락처가 성공적으로 저장되었습니다",
    });
  } catch (e) {
    if (e.errno == 1062) {
      res
        .status(500)
        .json({ success: false, message: "이미 저장되어있는 연락처입니다" });
      return;
    }

    res.status(500).json({ success: false, error: e });
  }
};

// @desc    연락처 공유 해제 api with auth
// @route   DELETE /api/v1/share
// @req     user_id(auth), share_id
// @res     success, message, error
exports.unShareContact = async (req, res, next) => {
  console.log(chalk.bold("<<  연락처 공유 해제 api 실행됨  >>"));

  let user_id = req.user.user_id;
  let share_id = req.body.share_id;

  if (!user_id) {
    res.status(401).json({ success: false, message: "잘못된 접근" });
    return;
  }

  if (!share_id) {
    res
      .status(400)
      .json({ success: false, message: "삭제할 공유 id를 입력해주세요" });
    return;
  }

  let query =
    "select * from contact_share as s join contacts as c on s.contact_id = c.contact_id \
     where s.share_id = ? and c.user_id = ?";
  let values = [share_id, user_id];

  try {
    [rows] = await connection.query(query, values);

    if (rows.length == 0) {
      res.status(400).json({
        success: false,
        message: "삭제할 데이터가 존재하지 않습니다",
      });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
    return;
  }

  query = "delete from contact_share where share_id = ?";
  values = [share_id];

  try {
    [result] = await connection.query(query, values);

    if (result.affectedRows == 0) {
      res.status(500).json({ success: false, message: "공유 id 삭제 실패" });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "공유가 성공적으로 해제되었습니다" });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
  }
};

// @desc    연락처 공유 전체 해제 api with auth
// @route   DELETE /api/v1/share/unshare_all
// @req     user_id(auth)
// @res     success, message, error
exports.unShareContactsAll = async (req, res, next) => {
  console.log(chalk.bold("<<  연락처 공유 전체 해제 api 실행됨  >>"));

  let user_id = req.user.user_id;

  if (!user_id) {
    res.status(401).json({ success: false, message: "잘못된 접근" });
    return;
  }

  let query =
    "delete s.* from contact_share as s left join contacts as c \
     on s.contact_id = c.contact_id where c.user_id = ?";
  let values = [user_id];

  try {
    [result] = await connection.query(query, values);

    if (result.affectedRows == 0) {
      res
        .status(500)
        .json({ success: false, message: "삭제할 공유 데이터가 없습니다" });
      return;
    }

    res.status(200).json({
      success: false,
      message: "모든 공유가 성공적으로 해제되었습니다",
    });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
  }
};
