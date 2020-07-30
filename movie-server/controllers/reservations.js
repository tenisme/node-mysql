const connection = require("../db/mysql_connection.js");
const chalk = require("chalk");

// @desc    좌석 정보 조회 api
// @route   GET /api/v1/reservations
// @req     movie_id, screening_order
// @res     success, items : [movie_id, title, {start_at, seat_num, reservation}, cnt]
exports.getMovieSeats = async (req, res, next) => {
  console.log(chalk.bold("<<  좌석 정보 조회 api 실행됨  >>"));

  let movie_id = req.query.movie_id;
  let screening_order = req.query.screening_order;

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

  if (!screening_order) {
    query = `select screening_order, start_at, seat_num, 
                case
                    when reservation = 0 then "예약 가능"
                    else "예약됨"
                end as reservation
            from reservation where movie_id = ${movie_id} 
            order by screening_order, seat_num`;
  } else {
    query = `select screening_order, start_at, seat_num, 
                case
                    when reservation = 0 then "예약 가능"
                    else "예약됨"
                end as reservation
            from reservation where movie_id = ${movie_id} and screening_order = ${screening_order} 
            order by screening_order, seat_num`;
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
// @req     user_id, movie_id, screening_order, seat_num
exports.seatsReservation = async (req, res, next) => {
  console.log(chalk.bold("<<  좌석 예약 api 실행됨  >>"));

  let user_id = req.user.user_id;
  let movie_id = req.body.movie_id;
  let screening_order = req.body.screening_order;
  let seat_num = req.body.seat_num;

  if (!user_id) {
    res.status(401).json({ success: false, message: "잘못된 접근" });
    return;
  }

  if (!movie_id) {
    res.status(500).json({ success: false, message: "영화 선택은 필수입니다" });
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

  if (!screening_order) {
    res
      .status(500)
      .json({ success: false, message: "영화의 상영 시간을 선택해주세요" });
    return;
  }

  if (!seat_num) {
    res
      .status(500)
      .json({ success: false, message: "예약할 좌석을 선택해주세요" });
    return;
  }

  query = `select * from reservation where movie_id = ${movie_id} and 
           screening_order = ${screening_order} and seat_num = ${seat_num}`;
  let start_at;
  let reserve_id;

  try {
    [rows] = await connection.query(query);

    if (rows.length == 0) {
      res
        .status(500)
        .json({ success: false, message: "선택하신 좌석은 존재하지 않습니다" });
      return;
    }

    if (rows[0].reservation == 1) {
      res.status(500).json({
        success: false,
        message: "해당 좌석은 이미 예약되어 있습니다",
      });
      return;
    }

    start_at = rows[0].start_at;
    reserve_id = rows[0].reserve_id;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }

  query = `update reservation set reservation = true, reserving_user = ${user_id}
           where movie_id = ${movie_id} and screening_order = ${screening_order} and seat_num = ${seat_num}`;

  // 트랜잭션 셋팅
  const conn = await connection.getConnection();
  // 트랜잭션 시작
  await conn.beginTransaction();

  try {
    [result] = await conn.query(query);

    if (result.affectedRows == 0) {
      await conn.rollback();
      res.status(500).json({ success: false, message: "예약에 실패했습니다." });
      return;
    }
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ success: false, error: e });
    return;
  }

  query = `insert into manage_reservation (reserving_user, reserve_id) values ?`;
  values = [user_id, reserve_id];

  try {
    [result] = await conn.query(query, [[values]]);

    if (result.affectedRows == 0) {
      await conn.rollback();
      res.status(500).json({ success: false, message: "예약에 실패했습니다" });
      return;
    }

    await conn.commit();

    res.status(200).json({
      success: true,
      message:
        "성공적으로 예약되었습니다. 예약은 30분 전까지만 취소가 가능합니다.",
      info: {
        reserve_id: reserve_id,
        title: title,
        start_at: start_at,
        seat_num: seat_num,
      },
    });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ success: false, error: e });
  }

  await conn.release();
};

// @desc    좌석 예약 취소 api with auth
// @route   PUT /api/v1/reservations
// @req     user_id, reserve_id
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
