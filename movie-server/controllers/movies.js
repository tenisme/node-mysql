const connection = require("../db/mysql_connection.js");
const chalk = require("chalk");

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

// @desc    즐겨찾기 설정 with auth
// @route   POST /api/v1/movies/set_fav?movie_id=1
// @req     movie_id
exports.saveFavorite = async (req, res, next) => {
  console.log(
    chalk.bold(
      "--------------------<  즐겨찾기 설정 api 실행됨  >--------------------"
    )
  );
  let user_id = req.user.user_id;
  let movie_id = req.query.movie_id;

  if (!user_id) {
    res.status(400).json({ success: false, message: "잘못된 접근" });
    return;
  }

  let query = `select * from movie where id = ${movie_id}`;

  try {
    [rows] = await connection.query(query);

    if (rows.length == 0) {
      res.status(200).json({
        success: false,
        message: "해당되는 id의 영화가 존재하지 않습니다",
      });
      return;
    }

    query = `insert into favorite_movie (user_id, movie_id) values ?`;
    values = [user_id, movie_id];

    try {
      [result] = await connection.query(query, [[values]]);

      res.status(200).json({
        success: true,
        message: "선택한 영화가 즐겨챶기에 추가되었습니다",
      });
    } catch (e) {
      if (e.errno == 1062) {
        // 1062 : 중복 에러
        res.status(400).json({
          success: false,
          errno: 1,
          message: `즐겨찾기에 이미 저장된 영화입니다`,
        });
        return;
      }

      res.status(500).json({ success: false, error: e });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    즐겨찾기 가져오기 with auth
// @route   GET /api/v1/movies/get_fav?offset=0&limit=25
// @req     offset, limit
exports.viewFavorite = async (req, res, next) => {
  console.log(
    chalk.bold(
      "--------------------<  즐겨찾기 가져오기 api 실행됨  >--------------------"
    )
  );
  let user_id = req.user.user_id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  if (!user_id) {
    res.status(400).json({ success: false, message: "잘못된 접근" });
    return;
  }

  query = `select m.* from favorite_movie as f join movie as m on f.movie_id = m.id 
           where f.user_id = ${user_id} limit ${offset}, ${limit}`;

  try {
    [rows] = await connection.query(query);

    if (rows.length == 0) {
      res
        .status(200)
        .json({ success: true, message: "즐겨찾기한 영화가 없습니다" });
      return;
    }

    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    즐겨찾기 삭제 with auth
// @route   DELETE /api/v1/movies/delete_fav&movie_id=1
// @req     movie_id
exports.deleteFavorite = async (req, res, next) => {
  console.log(
    chalk.bold(
      "--------------------<  즐겨찾기 삭제 api 실행됨  >--------------------"
    )
  );
  let user_id = req.user.user_id;
  let movie_id = req.query.movie_id;

  if (!user_id) {
    res.status(400).json({ success: false, message: "잘못된 접근" });
    return;
  }

  let query = `delete from favorite_movie where user_id = ${user_id} and movie_id = ${movie_id}`;

  try {
    [result] = await connection.query(query);

    if (result.affectedRows == 0) {
      res.status(200).json({
        success: false,
        message: "id에 해당하는 영화가 존재하지 않습니다.",
      });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "선택한 영화가 삭제되었습니다." });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
