const connection = require("../db/mysql_connection.js");
const chalk = require("chalk");

// @desc    상영 시간별 좌석 정보 조회 api
// @route   GET /api/v1/reservations
// @req     movie_id, start_at
// @res     success, ~~
exports.getMovieSeats = async (req, res, next) => {
  console.log(chalk.bold("<<  좌석 정보 조회 api 실행됨  >>"));

  let movie_id = req.query.movie_id;
  let start_at = req.query.start_at;

  if (!movie_id) {
    res
      .status(400)
      .json({ success: false, message: "관람할 영화를 선택해주세요" });
    return;
  }

  let query = `select * from movie where id = ${movie_id}`;
  let title;

  try {
    [rows] = await connection.query(query);

    if (rows.length == 0) {
      res.status(500).json({
        success: false,
        message: "id에 해당하는 영화가 존재하지 않습니다",
      });
      return;
    }

    title = rows[0].title;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }

  // 여기 아래서부터 수정하기

  if (!start_at) {
    query = `select seats_id, start_at, seat_no
                case
                    when user_id is null then "예약 가능"
                    else "예약됨"
                end as reservation
            from movie_seats where movie_id = ${movie_id} 
            order by seat_no`;
  } else {
    query = `select seats_id, start_at, seat_no
                case
                    when user_id is null then "예약 가능"
                    else "예약됨"
                end as reservation
            from movie_seats where movie_id = ${movie_id} and start_at = ${start_at} 
            order by seat_no`;
  }

  try {
    [rows] = await connection.query(query);

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

// @desc    좌석 예약 api with auth
// @route   POST /api/v1/reservations
// @req     user_id(auth), movie_id, screening_order, seat_no_arr
exports.seatsReservation = async (req, res, next) => {
  console.log(chalk.bold("<<  좌석 예약 api 실행됨  >>"));

  let user_id = req.user.user_id;
  let movie_id = req.body.movie_id;
  let start_at = req.body.start_at;
  let seat_no_arr = req.body.seat_no_arr;

  if (!user_id) {
    res.status(401).json({ success: false, message: "잘못된 접근" });
    return;
  }

  if (!movie_id) {
    res.status(400).json({ success: false, message: "영화 선택은 필수입니다" });
    return;
  }

  let query = `select * from movie where id = ${movie_id}`;
  let title;

  try {
    [rows] = await connection.query(query);

    if (rows.length == 0) {
      res.status(400).json({
        success: false,
        message: "id에 해당하는 영화가 존재하지 않습니다",
      });
      return;
    }

    title = rows[0].title;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }

  if (!seat_no_arr) {
    res
      .status(400)
      .json({ success: false, message: "예약할 좌석을 선택해주세요" });
    return;
  }

  // 이미 예약된 좌석인지 확인하는 방법 (2번 추천)
  // 1. nodejs에서 select해서 해당 좌석 정보가 있는지 확인 => rows.length == 1
  // 2. 워크벤치에서 테이블에 start_at, movie_id, seat_no를 unique 키로 설정한다.

  query = `insert into movie_seats (movie_id, user_id, seat_no, start_at) values ?`;
  let values = [];

  for (let i = 0; i < seat_no_arr.length; i++) {
    values.push([movie_id, user_id, seat_no_arr[i], start_at]);
  }

  try {
    [result] = await connection.query(query, [values]);

    if (result.affectedRows == 0) {
      await conn.rollback();
      res.status(500).json({ success: false, message: "예약에 실패했습니다." });
      return;
    }

    let seats_id = result.insertId;

    res.status(200).json({
      success: true,
      message:
        "성공적으로 예약되었습니다. 예약은 30분 전까지만 취소가 가능합니다.",
      info: {
        seats_id: seats_id,
        title: title,
        start_at: start_at,
        seat_no: seat_no,
      },
    });
  } catch (e) {
    if (e.errno == 1062) {
      res
        .status(500)
        .json({ success: false, message: "이미 예약되어있는 좌석입니다" });
      return;
    }

    res.status(500).json({ success: false, error: e });
    return;
  }
};

// @desc    내 예약 정보 조회 api with auth
// @route   GET /api/v1/reservations/me
// @req     user_id(auth)
// @res     success, ~~

// @desc    좌석 예약 취소 api with auth
// @route   DELETE /api/v1/reservations
// @req     user_id(auth), reserve_id
exports.cancelReservation = async (req, res, next) => {
  console.log(chalk.bold("<<  좌석 예약 취소 api 실행됨  >>"));

  let user_id = req.user.user_id;
  let reserve_id = req.body.reserve_id;

  if (!user_id) {
    res.status(401).json({ success: false, message: "잘못된 접근" });
    return;
  }

  if (!reserve_id) {
    res
      .status(500)
      .json({ success: false, message: "취소할 예약 번호를 선택해주세요" });
    return;
  }

  let query = `select * from reservation 
               where reserving_user = ${user_id} and reserve_id = ${reserve_id}`;

  try {
    [rows] = await connection.query(query);

    if (rows.length == 0) {
      res.status(500).json({
        success: false,
        message: "해당 id로 예약되어있는 정보가 없습니다",
      });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }

  query = `select if(TIMESTAMPDIFF(MINUTE, DATE_ADD(NOW(), INTERVAL 9 HOUR), start_at) > 30, true, false) 
           as possible_cancel 
           from manage_reservation as m join reservation as r on m.reserve_id = r.reserve_id;`;

  try {
    [rows] = await connection.query(query);

    if (rows.length == 0) {
      res.status(500).json({ success: false });
      return;
    }

    if (rows[0].possible_cancel == 0) {
      res.status(500).json({
        success: false,
        message: "예약 취소 불가 : 시작 시간 30분 전에는 취소가 불가합니다",
      });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }

  // 트랜잭션 셋팅
  const conn = await connection.getConnection();
  // 트랜잭션 시작
  await conn.beginTransaction();

  query = `update reservation set reservation = false, reserving_user = null 
           where reserve_id = ${reserve_id}`;

  try {
    [result] = await conn.query(query);

    if (result.affectedRows == 0) {
      await conn.rollback();
      res.status(500).json({ success: false });
      return;
    }
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ success: false, error: e });
    return;
  }

  query = `update manage_reservation set canceled_at = now() 
           where reserving_user = ${user_id} and reserve_id = ${reserve_id}`;

  try {
    [result] = await conn.query(query);

    if (result.affectedRows == 0) {
      await conn.rollback();
      res.status(500).json({ success: false, message: "예약 취소 실패" });
      return;
    }

    await conn.commit();

    res
      .status(200)
      .json({ success: true, message: "예약이 성공적으로 취소되었습니다" });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ success: false, error: e });
  }

  await conn.release();
};
