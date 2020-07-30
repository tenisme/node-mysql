// npm 패키지
const chalk = require("chalk");

// 파일 참조
const connection = require("../db/mysql_connection.js");

// @desc    댓글 작성/저장 api (with auth)
// @route   POST /api/v1/reply
// @req     user_id, movie_id, rating, comments
exports.replyMovie = async (req, res, next) => {
  console.log(chalk.bold("<<  댓글 달기 api 실행됨  >>"));

  let user_id = req.user.user_id;
  let movie_id = req.body.movie_id;
  let rating = req.body.rating;
  let comments = req.body.comments;

  if (!user_id) {
    res.status(400).json({ success: false, message: "잘못된 접근" });
    return;
  }

  if (!movie_id) {
    res.status(500).json({
      success: false,
      message: "댓글을 남길 영화의 id 입력이 필요합니다",
    });
    return;
  }

  let query = `select * from movie where id = ${movie_id}`;

  try {
    [rows] = await connection.query(query);

    if (rows.length == 0) {
      res.status(200).json({
        success: false,
        message: "id에 해당되는 영화가 존재하지 않습니다",
      });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }

  if (rating == undefined) {
    res.status(500).json({ success: false, message: "별점을 입력해주세요" });
    return;
  } else if (rating < 0 || rating > 5) {
    res.status(500).json({
      success: false,
      message: "별점은 0점부터 5점까지 줄 수 있습니다",
    });
    return;
  }

  if (comments.length < 21) {
    res.status(500).json({
      success: false,
      message: "댓글은 20자 이상 100자 이내로 작성해 주세요",
    });
    return;
  }

  query = `insert into movie_reply (user_id, movie_id, rating, comments) values ?`;
  let values = [user_id, movie_id, rating, comments];

  try {
    [result] = await connection.query(query, [[values]]);

    if (result.affectedRows == 0) {
      res.status(500).json({ success: false, message: "댓글 입력 실패" });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "입력한 댓글이 저장되었습니다" });
  } catch (e) {
    if (e.errno == 1062) {
      res.status(500).json({
        success: false,
        message: "이 영화의 댓글은 이미 저장되어 있습니다.",
      });
      return;
    }

    res.status(500).json({ success: false, error: e });
  }
};

// @desc    댓글 수정 api (with auth)
// @route   PUT /api/v1/reply
// @req     user_id, reply_id, rating, comments
exports.updateReply = async (req, res, next) => {
  console.log(chalk.bold("<<  댓글 수정 api 실행됨  >>"));
  let user_id = req.user.user_id;
  let reply_id = req.body.reply_id;
  let rating = req.body.rating;
  let comments = req.body.comments;
  let query;

  if (!user_id) {
    res.status(400).json({ success: false, message: "잘못된 접근" });
    return;
  }

  if (!reply_id) {
    res.status(500).json({
      success: false,
      message: "수정할 댓글의 id를 입력해주세요",
    });
    return;
  }

  query = `select * from movie_reply where user_id = ${user_id} and reply_id = ${reply_id}`;

  try {
    [rows] = await connection.query(query);

    if (rows.length == 0) {
      res.status(500).json({
        success: false,
        message: "해당 id의 댓글 없음",
      });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }

  if (rating == undefined) {
    query = `update movie_reply set comments = "${comments}"
    where user_id = ${user_id} and reply_id = ${reply_id};`;
  } else if (rating < 0 || rating > 5) {
    res.status(500).json({
      success: false,
      message: "별점은 0점부터 5점까지 줄 수 있습니다",
    });
    return;
  } else {
    query = `update movie_reply set rating = ${rating}, comments = "${comments}"
    where user_id = ${user_id} and reply_id = ${reply_id};`;
  }

  if (comments.length < 21) {
    res.status(500).json({
      success: false,
      message: "댓글은 20자 이상 100자 이내로 작성해 주세요",
    });
    return;
  }

  console.log(query);

  try {
    [result] = await connection.query(query);

    if (result.affectedRows == 0) {
      res.status(500).json({ success: false, message: "댓글 수정 실패" });
      return;
    }

    res.status(200).json({ success: true, message: "댓글이 수정되었습니다" });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    댓글 삭제 api (with auth)
// @route   DELETE /api/v1/reply
// @req     user_id, reply_id
exports.deleteReply = async (req, res, next) => {
  console.log(chalk.bold("<<  댓글 삭제 api 실행됨  >>"));

  let user_id = req.user.user_id;
  let reply_id = req.body.reply_id;

  if (!user_id) {
    res.status(400).json({ success: false, message: "잘못된 접근" });
    return;
  }

  if (!reply_id) {
    res
      .status(500)
      .json({ success: false, message: "삭제할 댓글의 id를 입력해주세요" });
    return;
  }

  let query = `select * from movie_reply where user_id = ${user_id} and reply_id = ${reply_id}`;

  try {
    [rows] = await connection.query(query);

    if (rows.length == 0) {
      res
        .status(500)
        .json({ success: false, message: "해당 id의 댓글을 찾을 수 없습니다" });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }

  query = `delete from movie_reply where user_id = ${user_id} and reply_id = ${reply_id}`;

  try {
    [result] = await connection.query(query);

    if (result.affectedRows == 0) {
      res.status(500).json({ success: false, message: "댓글 삭제 실패" });
      return;
    }

    res.status(200).json({ success: true, message: "댓글이 삭제되었습니다" });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    특정 영화 댓글 조회 api
// @route   GET /api/v1/reply
// @req     movie_id, offset, limit
// @res     success, movie_id, title,
//          items : [{reply_id, user_id, login_id, rating, comments, reply_time, update_time}, cnt]
exports.getReplies = async (req, res, next) => {
  console.log(chalk.bold("<<  댓글 조회 api 실행됨  >>"));

  let movie_id = req.query.movie_id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  if (!movie_id) {
    res.status(500).json({
      success: false,
      message: "댓글을 조회할 영화의 id를 입력해주세요",
    });
    return;
  }

  let query = `select * from movie where id = ${movie_id}`;
  let title;

  try {
    [rows] = await connection.query(query);

    if (rows.length == 0) {
      res.status(500).json({
        success: false,
        message: "입력한 id에 해당하는 영화가 존재하지 않습니다",
      });
      return;
    }

    title = rows[0].title;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }

  if (!offset || !limit) {
    res.status(400).json({ success: false, message: "파라미터 셋팅 에러" });
    return;
  }

  query = `select r.reply_id, u.user_id, u.login_id, r.rating, r.comments, r.created_at, r.updated_at 
  from movie_reply as r
  join movie as m on r.movie_id = m.id
  join movie_user as u on r.user_id = u.user_id
  where r.movie_id = ${movie_id}
  limit ${offset}, ${limit}`;

  try {
    [rows] = await connection.query(query);

    if (rows.length == 0) {
      res.status(500).json({ success: false, message: "댓글 없음" });
      return;
    }

    res.status(200).json({
      success: true,
      movie_id: movie_id,
      title: title,
      items: rows,
      cnt: rows.length,
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
