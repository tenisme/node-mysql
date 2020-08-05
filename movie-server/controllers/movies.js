const chalk = require("chalk");
const validator = require("validator");

const connection = require("../db/mysql_connection.js");

// @desc    영화 데이터 조회 api
// @route   GET /api/v1/movies
// @req     offset, limit
// @res     success, items : [{id, title, genre, attendance, year, cnt_comments, avg_rating}], cnt
exports.getMovies = async (req, res, next) => {
  console.log(chalk.bold("<<  영화 데이터 조회 api 실행됨  >>"));

  let offset = req.query.offset;
  let limit = req.query.limit;

  if (!offset || !limit) {
    res.status(400).json({ success: false, message: "파라미터 셋팅 에러" });
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

  let query = `select m.*, count(r.comments) as cnt_comments,
  ifnull(round(avg(r.rating), 2), "unrated") as avg_rating
  from movies as m
  left join replies as r
  on m.id = r.movie_id
  group by m.id
  order by m.id
  limit ?, ?`;
  let values = [offset, limit];

  try {
    [rows] = await connection.query(query, values);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, message: `DB ERROR`, error: e });
  }
};

// @desc    영화명으로 조회 api
// @route   GET /api/v1/movies/search
// @req     keyword, offset, limit
// @res     success, items : [{id, title, genre, attendance, year, cnt_comments, avg_rating}, cnt]
exports.searchMovies = async (req, res, next) => {
  console.log(chalk.bold("<<  영화명 검색 api 실행됨  >>"));

  let keyword = req.query.keyword;
  let offset = req.query.offset;
  let limit = req.query.limit;

  if (!offset || !limit) {
    res.status(400).json({ message: "파라미터 셋팅 에러" });
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

  if (!keyword || keyword == "") {
    res.status(400).json({ message: "검색어를 입력해주세요" });
    return;
  }

  let query = `select m.*, count(r.comments) as cnt_comments, 
  ifnull(round(avg(r.rating), 2), "unrated") as avg_rating 
  from movie as m 
  left join movie_reply as r 
  on m.id = r.movie_id 
  where m.title like "%?%" 
  group by m.id 
  order by m.id 
  limit ?, ?`;
  let values = [keyword, offset, limit];

  try {
    [rows] = await connection.query(query, values);

    if (rows.length == 0) {
      res.status(200).json({
        success: true,
        message: "검색 조건에 해당하는 영화가 없습니다",
      });
      return;
    }

    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    연도 정렬 조회 api
// @route   GET /api/v1/movies/year
// @req     필수 - offset, limit 선택 - order : asc / desc(디폴트 내림차순), keyword(디폴트 "")
// @res     success, items : [{id, title, genre, attendance, year, cnt_comments, avg_rating}, cnt]
exports.getMoviesByYear = async (req, res, next) => {
  console.log(chalk.bold("<<  연도 정렬 조회 api 실행됨  >>"));

  let offset = req.query.offset;
  let limit = req.query.limit;
  let order = req.query.order;
  let keyword = req.query.keyword;

  if (!offset || !limit) {
    res.status(400).json({ message: "파라미터 셋팅 에러" });
    return;
  }

  let offsetIsNum = validator.isNumeric(offset);
  let limitIsNum = validator.isNumeric(limit);
  let orderIsNum = validator.isNumeric(order);

  if (!offsetIsNum || !limitIsNum || !orderIsNum) {
    res.status(400).json({
      success: false,
      message: "offset, limit, order에는 숫자만 입력이 가능합니다",
    });
    return;
  }

  if (limit <= 0) {
    res
      .status(400)
      .json({ success: false, message: "1 이상의 숫자를 입력해야 합니다" });
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

  offset = Number(offset);
  limit = Number(limit);
  order = Number(order);

  let query = `select m.*, count(r.comments) as cnt_comments, 
  ifnull(round(avg(r.rating), 2), "unrated") as avg_rating 
  from movie as m 
  left join movie_reply as r 
  on m.id = r.movie_id 
  where m.title like "%?%" 
  group by m.id 
  order by m.year ? 
  limit ?, ?`;
  let values = [keyword, order, offset, limit];

  try {
    [rows] = await connection.query(query, values);

    if (rows.length == 0) {
      res.status(200).json({
        success: true,
        message: "검색 조건에 해당하는 영화가 없습니다",
      });
      return;
    }

    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, message: `DB ERROR`, error: e });
  }
};

// @desc    관객수 정렬 조회 api
// @route   GET /api/v1/movies/attnd
// @req     필수 - offset, limit 선택 - order : asc / desc(디폴트 내림차순), keyword(디폴트 "")
// @res     success, items : [{id, title, genre, attendance, year, cnt_comments, avg_rating}, cnt]
exports.getMoviesByAttnd = async (req, res, next) => {
  console.log(chalk.bold("<<  관객수 정렬 조회 api 실행됨  >>"));

  let offset = req.query.offset;
  let limit = req.query.limit;
  let order = req.query.order;
  let keyword = req.query.keyword;

  if (!offset || !limit) {
    res.status(400).json({ message: "파라미터 셋팅 에러" });
    return;
  }

  let offsetIsNum = validator.isNumeric(offset);
  let limitIsNum = validator.isNumeric(limit);
  let orderIsNum = validator.isNumeric(order);

  if (!offsetIsNum || !limitIsNum || !orderIsNum) {
    res.status(400).json({
      success: false,
      message: "offset, limit, order에는 숫자만 입력이 가능합니다",
    });
    return;
  }

  if (limit <= 0) {
    res
      .status(400)
      .json({ success: false, message: "1 이상의 숫자를 입력해야 합니다" });
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

  offset = Number(offset);
  limit = Number(limit);
  order = Number(order);

  let query = `select m.*, count(r.comments) as cnt_comments, 
  ifnull(round(avg(r.rating), 2), "unrated") as avg_rating 
  from movie as m 
  left join movie_reply as r 
  on m.id = r.movie_id 
  where m.title like "%?%" 
  group by m.id 
  order by m.attendance ? 
  limit ?, ?`;
  let values = [keyword, order, offset, limit];

  try {
    [rows] = await connection.query(query, values);

    if (rows.length == 0) {
      res.status(200).json({
        success: true,
        message: "검색 조건에 해당하는 영화가 없습니다",
      });
      return;
    }

    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, message: `DB ERROR`, error: e });
  }
};
