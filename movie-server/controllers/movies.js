const connection = require("../db/mysql_connection.js");

// @desc    영화 데이터 불러오기
// @url     GET /api/v1/movies
// @request offset, limit (?offset=0&limit=25)
// @response success, error, items : [{ id, title, genre, attendance, year }, cnt]
exports.getMovies = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;

  if (!offset || !limit) {
    res.status(400).json({ message: "파라미터 셋팅 에러" });
    return;
  }

  let query = `select * from movie limit ${offset}, ${limit}`;

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    영화명 검색해서 가져오기
// @url     GET /api/v1/movies/search
// @request keyword, offset, limit (?offset=0&limit=25&keyword=war)
// @response success, error, items : [{ id, title, genre, attendance, year }, cnt]
exports.searchMovies = async (req, res, next) => {
  let keyword = req.query.keyword;
  let offset = req.query.offset;
  let limit = req.query.limit;

  if (!offset || !limit) {
    res.status(400).json({ message: "파라미터 셋팅 에러" });
    return;
  }

  if (!keyword) {
    keyword = "";
  }

  let query = `select * from movie where title like '%${keyword}%' limit ${offset}, ${limit};`;
  console.log(query);

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    연도 정렬해서 가져오기
// @url     GET /api/v1/movies/year
// @request offset, limit, order : asc / desc (디폴트 오름차순), keyword
//          (&offset=0&limit=25&order=0&keyword=war)
// @response success, error, items : [{ id, title, genre, attendance, year }, cnt]
exports.getMoviesByYear = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let order = req.query.order;
  let keyword = req.query.keyword;

  if (!offset || !limit) {
    res.status(400).json({ message: "파라미터 셋팅 에러" });
    return;
  }

  if (!order || order == 0) {
    order = "asc";
  } else if (order == 1) {
    order = "desc";
  }

  if (!keyword) {
    keyword = "";
  }

  let query = `select * from movie where title like '%${keyword}%' order by year ${order} limit ${offset}, ${limit}`;
  console.log(query);

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    관객수 정렬해서 가져오기
// @url     GET /api/v1/movies/attnd
// @request offset, limit, order : asc / desc (디폴트 오름차순), keyword
//          (&offset=0&limit=25&order=0&keyword=war)
// @response success, error, items : [{ id, title, genre, attendance, year }, cnt]
exports.getMoviesByAttnd = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let order = req.query.order;
  let keyword = req.query.keyword;

  if (!offset || !limit) {
    res.status(400).json({ message: "파라미터 셋팅 에러" });
    return;
  }

  if (!order || order == 1) {
    order = "desc";
  } else if (order == 0) {
    order = "asc";
  }

  if (!keyword) {
    keyword = "";
  }

  query = `select * from movie where title like '%${keyword}%' order by attendance ${order} limit ${offset}, ${limit}`;
  console.log(query);

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
