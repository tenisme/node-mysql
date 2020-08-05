const validator = require("validator");
const chalk = require("chalk");

const connection = require("../db/mysql_connection.js");

// @desc    모든 주소록 조회 with auth
// @route   GET /api/v1/contacts
// @req     user_id(auth), offset, limit
// @res     success, items : [{contact_id, name, phone, comment}], cnt
exports.getContacts = async (req, res, next) => {
  console.log(chalk.bold("<<  모든 주소록 조회 api 실행됨  >>"));

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
    "select contact_id, name, phone, comment from contacts where user_id = ? \
               order by contact_id limit ?, ?";
  let values = [user_id, offset, limit];

  try {
    [rows] = await connection.query(query, values);

    if (rows.length == 0) {
      res
        .status(200)
        .json({ success: true, message: "저장된 연락처가 없습니다" });
      return;
    }

    let cnt = rows.length;

    res.status(200).json({ success: true, items: rows, cnt: cnt });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
  }
};

// @desc    주소록 1개 저장 api with auth
// @route   POST /api/v1/contacts
// @req     user_id(auth), name, phone, comment
// @res     success, message, error
exports.createContact = async (req, res, next) => {
  console.log(chalk.bold("<<  주소록 1개 저장 api 실행됨  >>"));

  let user_id = req.user.user_id;
  let name = req.body.name;
  let phone = req.body.phone;
  let comment = req.body.comment;

  if (!user_id) {
    res.status(401).json({ success: false, message: "잘못된 접근" });
    return;
  }

  if (!name || !phone) {
    res
      .status(400)
      .json({ success: false, message: "이름과 전화번호 입력은 필수입니다" });
    return;
  }

  if (name.length > 20) {
    res
      .status(400)
      .json({ success: false, message: "이름은 20자 이내로 작성헤야 합니다" });
    return;
  }

  if (!validator.isMobilePhone(phone) || phone.length > 30) {
    res.status(400).json({
      success: false,
      message: "올바른 번호 입력 요청. 번호는 최대 30자 이내로 입력해주세요",
    });
    return;
  }

  if (!comment) {
    comment = "";
  }

  if (comment.length > 100) {
    res.status(400).json({
      success: false,
      message: "메모 길이는 100자 이내로 작성해야 합니다",
    });
    return;
  }

  query = "insert into contacts (user_id, name, phone, comment) values ?";
  let values = [user_id, name, phone, comment];

  try {
    [result] = await connection.query(query, [[values]]);

    if (result.affectedRows == 0) {
      res
        .status(500)
        .json({ success: false, message: "연락처 저장에 실패했습니다" });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "연락처를 성공적으로 저장했습니다" });
  } catch (e) {
    if (e.errno == 1062) {
      res.status(400).json({
        success: false,
        message: "해당 연락처는 이미 저장되어 있습니다.",
      });
    }

    res.status(500).json({ success: false, message: "DB ERROR", error: e });
  }
};

// @desc    주소록 1개 수정 api with auth
// @route   PUT /api/v1/contacts
// @req     user_id(auth), contact_id, name, phone, comment
// @res     success, message, error
exports.updateContact = async (req, res, next) => {
  console.log(chalk.bold("<<  주소록 1개 수정 api 실행됨  >>"));

  let user_id = req.user_id;
  let contact_id = req.body.contact_id;
  let name = req.body.name;
  let phone = req.body.phone;
  let comment = req.body.comment;

  if (!user_id) {
    res.status(401).json({ success: false, message: "잘못된 접근" });
    return;
  }

  if (!contact_id) {
    res
      .status(400)
      .json({ success: false, message: "수정할 연락처의 id를 입력해주세요" });
    return;
  }

  if (!name || !phone) {
    res
      .status(400)
      .json({ success: false, message: "이름과 전화번호 입력은 필수입니다" });
    return;
  }

  if (name.length > 20) {
    res
      .status(400)
      .json({ success: false, message: "이름은 20자 이내로 작성헤야 합니다" });
    return;
  }

  if (!validator.isMobilePhone(phone) || phone.length > 30) {
    res.status(400).json({
      success: false,
      message: "올바른 번호 입력 요청. 번호는 최대 30자 이내로 입력해주세요",
    });
    return;
  }

  if (!comment) {
    comment = "";
  }

  if (comment.length > 100) {
    res.status(400).json({
      success: false,
      message: "메모 길이는 100자 이내로 작성해야 합니다",
    });
    return;
  }

  let query = "select * from contacts where contact_id = ? and user_id = ?";
  let values = [contact_id, user_id];

  try {
    [rows] = await connection.query(query, values);

    if (rows.length == 0) {
      res
        .status(400)
        .json({ success: false, message: "이 데이터는 존재하지 않습니다" });
      return;
    }

    phone = rows[0].phone;
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
    return;
  }

  query =
    "update contacts set name = ?, phone = ?, comment = ? \
           where contact_id = ? and user_id = ?";
  values = [name, phone, comment, contact_id, user_id];

  try {
    [result] = await connection.query(query, values);

    res.status(200).json({ success: true, result: result });
  } catch (e) {
    if (e.errno == 1062) {
      res
        .status(500)
        .json({ success: false, message: "이미 저장되어있는 번호입니다" });
      return;
    }

    res.status(500).json({ success: false, message: "DB ERROR", error: e });
  }
};

// @desc    주소록 1개 삭제 api with auth
// @route   DELETE /api/v1/contacts
// @req     user_id(auth), contact_id
// @res     success, message, error
exports.deleteContact = async (req, res, next) => {
  console.log(chalk.bold("<<  주소록 1개 삭제 api 실행됨  >>"));

  let user_id = req.user.user_id;
  let contact_id = req.body.contact_id;

  if (!user_id) {
    res.status(401).json({ success: false, message: "잘못된 접근" });
    return;
  }

  if (!contact_id) {
    res
      .status(400)
      .json({ success: false, message: "삭제할 연락처 id를 입력해주세요" });
    return;
  }

  let query = "delete from contacts where user_id = ? and contact_id = ?";
  let values = [user_id, contact_id];

  try {
    [result] = await connection.query(query, values);

    if (result.affectedRows == 0) {
      res
        .status(400)
        .json({ success: false, message: "삭제할 데이터가 없습니다" });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "연락처가 성공적으로 삭제되었습니다" });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
  }
};

// @desc    이름 or 폰번호 검색 api with auth
// @route   GET /api/v1/contacts/search
// @req     user_id(auth), keyword
// @res     success, message, items : [{contact_id, name, phone, comment}], cnt
exports.searchContact = async (req, res, next) => {
  console.log(chalk.bold("<<  이름 or 폰번호 검색 api 실행됨  >>"));

  let user_id = req.user.user_id;
  let keyword = req.query.keyword;

  if (!user_id) {
    res.status(401).json({ success: false, message: "잘못된 접근" });
    return;
  }

  let query =
    "select contact_id, name, phone, comment from contacts where user_id = ? \
     and (name like '%?%' or phone like '%?%')";
  let values = [user_id, keyword, keyword];

  try {
    [rows] = await connection.query(query, values);

    if (rows.length == 0) {
      res.status(400).json({
        success: false,
        message: "일치하는 데이터가 존재하지 않습니다",
      });
      return;
    }

    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
  }
};
