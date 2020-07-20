const connection = require("../db/mysql_connection.js");
const ErrorResponse = require("../utils/errorResponse.js");

// "행동"들을 이 파일에 저장해놓고 가져다 쓸 것임.
//      라우터의 "액션"들을 빼서 컨트롤러에 담아놓는다.
// 함수별로 하나씩 exports한다. (nodejs문법 : exports.함수이름 = 함수내용)

// @desc    모든 정보를 다 조회
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = async (req, res, next) => {
  // await을 품고 있는 함수는 앞에 async를 써줘야한다.
  try {
    // 여기서 rows는 array이다. await 뒤의 쿼리가 성공하면 rows에 정보가 담겨져 들어온다.
    [rows, fields] = await connection.query("select * from bootcamp");
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    next(new ErrorResponse("부트캠프 전부 가져오는데 에러 발생", 400));
  }
};

// @desc    해당 아이디의 정보 조회
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = async (req, res, next) => {
  let id = req.params.id;

  let query = "select * from bootcamp where id = ?";

  try {
    [rows, fields] = await connection.query(query, [id]);
    if (rows.length != 0) {
      // rows의 길이가 0이 아니면(돌아오는 정보가 있으면) status code 200
      res.status(200).json({ success: true, items: rows[0] });
    } else {
      // rows의 길이가 0이면(돌아오는 정보가 없으면) status code 400
      return next(new ErrorResponse("아이디값 잘못 보냄", 400));
    }
  } catch (e) {
    next(new ErrorResponse("부트캠프 가져오는데 DB 에러 발생", 500));
  }
};

// @desc    새로운 정보를 insert
// @route   POST /api/v1/bootcamps
// @access  Public
exports.createBootcamp = async (req, res, next) => {
  let title = req.body.title;
  let subject = req.body.subject;
  let teacher = req.body.teacher;
  let start_time = req.body.start_time;

  let query =
    "insert into bootcamp (title, subject, teacher, start_time) values ?";
  let values = [];
  values.push([title, subject, teacher, start_time]);

  try {
    [rows, fields] = await connection.query(query, [values]);
    res.status(200).json({ success: true, user_id: rows.insertId });
    console.log(rows.insertId);
  } catch (e) {
    next(new ErrorResponse("부트캠프 추가하는데 DB 에러 발생", 500));
  }
};

// @desc    기존 정보를 update
// @route   PUT /api/v1/bootcamps/:id
// @access  Public
exports.updateBootcamp = async (req, res, next) => {
  let id = req.params.id;

  let title = req.body.title;
  let subject = req.body.subject;
  let teacher = req.body.teacher;
  let start_time = req.body.start_time;

  let query =
    "update bootcamp set title = ?, subject = ?, teacher = ?, start_time = ? where id = ?";
  let data = [title, subject, teacher, start_time, id];

  try {
    [rows, fields] = await connection.query(query, data);
    res.status(200).json({ success: true });
  } catch (e) {
    next(new ErrorResponse("부트캠프 가져오는데 DB 에러 발생", 500)); // 서버 에러의 기본 status : 500
  }
};

// @desc    해당 경로를 delete
// @route   DELETE /api/v1/bootcamps/:id
// @access  Public
exports.deleteBootcamp = async (req, res, next) => {
  let id = req.params.id;

  let query = `delete from bootcamp where id = ${id}`;

  try {
    [result] = await connection.query(query);
    console.log(result);
    if (result.affectedRows == 1) {
      // affectedRows: 0 => 처리할 게 없다
      res.status(200).json({ success: true });
    } else {
      return next(new ErrorResponse("아이디값 잘못 보냄", 400));
    }
  } catch (e) {
    next(new ErrorResponse("부트캠프 가져오는데 DB 에러 발생", 500));
  }
};
