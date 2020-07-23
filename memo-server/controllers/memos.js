const connection = require("../db/mysql_connection.js");
const chalk = require("chalk");
// mysql은 커넥션 파일에 require()되어있고 여기서 그 파일을 불러왔기 때문에 여기서 require('mysql')을 할 필요 없다.

// @desc    모든 메모 가져오기
// @route   GET /api/v1/memos
exports.getMemos = async (req, res, next) => {
  // 1. 데이터베이스에 접속해서 쿼리한다.
  // 2. 그 결과를 res에 담아서 클라이언트에 보내준다.
  let query = `select * from memos where user_id = ${req.user.user_id}`;

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, results: { items: rows } });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    메모 생성하기
// @route   POST /api/v1/memos
// @body    {title: "안녕", content: "좋다"}
exports.createMemo = async (req, res, next) => {
  let user_id = req.user.user_id;
  let title = req.body.title;
  let content = req.body.content;

  // 쿼리 인서트 방법1 : 루프 인서트는 youtube 폴더 참고
  let query = "insert into memos (user_id, title, content) values ?";

  let values = [user_id, title, content];

  try {
    [result] = await connection.query(query, [[values]]);
    console.log(chalk.blueBright(JSON.stringify(result)));
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    메모 갱신하기
// @route   PUT /api/v1/memos/:id
// @body    {title: "안녕", content: "좋다"}
exports.updateMemo = async (req, res, next) => {
  let id = req.params.id;
  let title = req.body.title;
  let content = req.body.content;

  // // 쿼리 인서트 방법 2
  // let query = `update memos set title = "${title}", content = "${content}" where id = ${id}`

  // 쿼리 인서트 방법 1
  let query2 = "update memos set title = ?, content = ? where id = ?";

  try {
    [result] = await connection.query(query2, [title, content, id]);
    console.log(chalk.blueBright(JSON.stringify(result)));
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    메모 지우기
// @route   DELETE /api/v1/memos/:id
exports.deleteMemo = async (req, res, next) => {
  let id = req.params.id;

  let query = `delete from memos where id = ${id}`;

  try {
    [result] = await connection.query(query);
    console.log(chalk.blueBright(JSON.stringify(result)));
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
