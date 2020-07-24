const connection = require("../db/mysql_connection.js");

// @desc    영화 데이터 불러오기
// @url     GET /api/v1/movie?offset=0&limit=25
// @request offset, limit
// @response success, error, items : [{ id, title, genre, attendance, year }]
exports.getMovies = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;

  let query = `select * from movie limit ${offset}, ${limit}`;

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    영화명 검색해서 가져오기
// @url     POST /api/v1/movie/search?offset=0&limit=25
// @request title, offset, limit
// @response success, error, items : [{ id, title, genre, attendance, year }]
exports.searchMovies = async (req, res, next) => {
  let title = req.body.title;
  let offset = req.query.offset;
  let limit = req.query.limit;

  let query = `select * from movie where title like '%${title}%' limit ${offset}, ${limit};`;
  console.log(query);

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    연도 정렬해서 가져오기
// @url     POST /api/v1/movie/search_by_year&order=0&offset=0&limit=25
// @request 필수 : order, offset, limit, 옵션 : title
// @response success, error, items : [{ id, title, genre, attendance, year }]
exports.getMoviesOrderYear = async (req, res, next) => {
  let order = req.query.order;
  let offset = req.query.offset;
  let limit = req.query.limit;

  let query;

  if (order == 0) {
    order = "asc";
  } else if (order == 1) {
    order = "desc";
  }

  let title = req.body.title;

  if (title == undefined) {
    query = `select * from movie order by year ${order} limit ${offset}, ${limit}`;
  } else {
    query = `select * from movie where title like '%${title}%' order by year ${order} limit ${offset}, ${limit}`;
  }

  console.log(query);

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    관객수 정렬해서 가져오기
// @url     POST /api/v1/movie/search_by_attnd?&order=0&offset=0&limit=25
// @request 필수 : order, offset, limit, 옵션 : title
// @response success, error, items : [{ id, title, genre, attendance, year }]
exports.getMoviesOrderAttnd = async (req, res, next) => {
  let order = req.query.order;
  let offset = req.query.offset;
  let limit = req.query.limit;

  let query;

  if (order == 0) {
    order = "asc";
  } else if (order == 1) {
    order = "desc";
  }

  let title = req.body.title;

  if (title == undefined) {
    query = `select * from movie order by attendance ${order} limit ${offset}, ${limit}`;
  } else {
    query = `select * from movie where title like '%${title}%' order by attendance ${order} limit ${offset}, ${limit}`;
  }

  console.log(query);

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
