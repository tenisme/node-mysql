const connection = require("../db/mysql_connection.js");
const ErrorResponse = require("../utils/errorResponse.js");

// @desc    모든 주소록 가져오기
// @route   GET /api/v1/contacts
exports.getContacts = async (req, res, next) => {
  try {
    [rows, fields] = await connection.query("select * from contact");
    console.log(rows);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    next(new ErrorResponse("주소록을 전부 가져오는데 에러 발생", 400));
  }
};

// @desc    새로운 주소를 insert
// @route   POST /api/v1/contacts
// @body    {"name" : "", "phone_number" : ""}
exports.createContact = async (req, res, next) => {
  let name = req.body.name;
  let phone_number = req.body.phone_number;

  let query = "insert into contact (name, phone_number) values ?";
  let values = [];
  values.push([name, phone_number]);

  try {
    [rows, fields] = await connection.query(query, [values]);
    console.log(rows);
    res.status(200).json({ success: true, user_id: rows.insertId });
  } catch (e) {
    next(new ErrorResponse("주소록을 추가하는데 DB 에러 발생", 500));
  }
};

// @desc 주소록을 삭제
// @route DELETE /api/v1/contacts/:id
exports.deleteContact = async (req, res, next) => {
  let id = req.params.id;

  let query = `delete from contact where id = ${id}`;

  try {
    [rows, fields] = await connection.query(query);
    console.log(rows);
    if (rows.affectedRows == 1) {
      res.status(200).json({ success: true });
    } else {
      return next(new ErrorResponse("아이디값 잘못 보냄", 400));
    }
  } catch (e) {
    next(new ErrorResponse("주소록을 가져오는데 DB 에러 발생", 500));
  }
};
