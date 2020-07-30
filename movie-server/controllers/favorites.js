const connection = require("../db/mysql_connection.js");
const chalk = require("chalk");

// @desc    즐겨찾기 추가 api (with auth)
// @route   POST /api/v1/favorites
// @req     movie_id
exports.addFavorite = async (req, res, next) => {
  console.log(chalk.bold("<<  즐겨찾기 설정 api 실행됨  >>"));

  let user_id = req.user.user_id;
  let movie_id = req.body.movie_id;

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
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }

  query = `insert into favorite_movie (user_id, movie_id) values ?`;
  values = [user_id, movie_id];

  try {
    [result] = await connection.query(query, [[values]]);

    if (result.affectedRows == 0) {
      res
        .status(500)
        .json({ success: false, message: "즐겨찾기 저장에 실패했습니다" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "선택한 영화가 즐겨챶기에 추가되었습니다",
    });
  } catch (e) {
    if (e.errno == 1062) {
      res.status(500).json({
        success: false,
        message: "즐겨찾기에 이미 등록되어있는 영화입니다",
      });
    }

    res.status(500).json({ success: false, error: e });
  }
};

// @desc    즐겨찾기 조회 api (with auth)
// @route   GET /api/v1/favorites
// @req     offset, limit
// @res     [{id, title, genre, attendance, year}, cnt]
exports.getFavorites = async (req, res, next) => {
  console.log(chalk.bold("<<  즐겨찾기 가져오기 api 실행됨  >>"));

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

    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    즐겨찾기 삭제 api (with auth)
// @route   DELETE /api/v1/favorites
// @req     movie_id
exports.deleteFavorite = async (req, res, next) => {
  console.log(chalk.bold("<<  즐겨찾기 삭제 api 실행됨  >>"));

  let user_id = req.user.user_id;
  let movie_id = req.body.movie_id;

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
        message: "id에 해당하는 영화가 즐겨찾기에 존재하지 않습니다.",
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
