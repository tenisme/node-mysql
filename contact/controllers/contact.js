const connection = require("../db/mysql_connection.js");
const ErrorResponse = require("../utils/errorResponse.js");

// @desc    모든 주소록 가져오기
// @route   GET /api/v1/contacts?offset=0&limit=5
exports.getContacts = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;

  let query = `select * from contact limit ${offset}, ${limit}`;

  try {
    [rows, fields] = await connection.query(query);
    let count = rows.length;
    console.log("length_count : " + count);
    res.status(200).json({ success: true, items: rows, count: count });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
  }
};

// @desc    주소록 1개 추가하기
// @route   POST /api/v1/contacts
// @parameters  name, phone
exports.createContact = async (req, res, next) => {
  let name = req.body.name;
  let phone = req.body.phone;

  let query = "insert into contact (name, phone) values ?";
  let values = [name, phone];

  try {
    [result] = await connection.query(query, [[values]]);
    console.log(
      "affectedRows : " +
        result.affectedRows +
        ", insertId : " +
        result.insertId
    );
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
  }
};

// @desc    주소록 1개 수정하기
// @route   PUT /api/v1/contacts
// @parameters  id, name, phone
exports.updateContact = async (req, res, next) => {
  let id = req.body.id;
  let name = req.body.name;
  let phone = req.body.phone;

  let query = "update contact set name = ?, phone = ? where id = ?";
  let values = [name, phone, id];

  try {
    [result] = await connection.query(query, values);
    console.log(
      "affectedRows : " +
        result.affectedRows +
        ", changedRows : " +
        result.changedRows
    );
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
  }
};

// @desc    주소록 1개 삭제하기
// @route   DELETE /api/v1/contacts
// @parameters  id
exports.deleteContact = async (req, res, next) => {
  let id = req.body.id;

  let query = "delete from contact where id = ?";
  let values = [id];

  try {
    [result] = await connection.query(query, values);
    console.log(
      "affectedRows : " +
        result.affectedRows +
        ", warningStatus : " +
        result.warningStatus
    );
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
  }
};

// @desc    이름이나 폰번호로 검색하기
// @route   GET /api/v1/contacts/search?keyword=
exports.searchContact = async (req, res, next) => {
  let keyword = req.query.keyword;

  let query = `select * from contact where name like "%${keyword}%" or phone like "%${keyword}%"`;

  try {
    [rows, fields] = await connection.query(query);
    console.log(rows);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: "DB ERROR", error: e });
  }
};
