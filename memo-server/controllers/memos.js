const connection = require("../db/mysql_connection.js");
// mysql은 커넥션 파일에 require()되어있고 여기서 그 파일을 불러왔기 때문에 여기서 require('mysql')을 할 필요 없다.

// @desc    모든 메모 가져오기
// @route   GET /api/v1/memos
exports.getMemos = (req, res, next) => {
  // 1. 데이터베이스에 접속해서 쿼리한다.
  // 2. 그 결과를 res에 담아서 클라이언트에 보내준다.
  let query = "select * from memos";

  connection.query(query, (error, results, fields) => {
    console.log("error: ", error);
    console.log(results);
    res.status(200).json({ success: true, results: { items: results } }); // 응답하기. 성공적으로 업데이트되었다고 알려주기.
    connection.end(); // .end()는 안 써도 되지만 써주는 게 안전하다.
  });
};

// @desc    메모 생성하기
// @route   POST /api/v1/memos
// @body    {title: "안녕", content: "좋다"}
exports.createMemo = (req, res, next) => {
  let title = req.body.title;
  let content = req.body.content;

  // 쿼리 인서트 방법1 : 루프 인서트는 youtube 폴더 참고
  let query = "insert into memos (title, content) values ?";

  let values = [];

  values.push([title, content]);

  connection.query(query, [values], (error, results, fields) => {
    console.log("error: ", error);
    console.log(results);
    res.status(200).json({ success: true });
    connection.end();
  });
};

// @desc    메모 갱신하기
// @route   PUT /api/v1/memos/:id
// @body    {title: "안녕", content: "좋다"}
exports.updateMemo = (req, res, next) => {
  let id = req.params.id;
  let title = req.body.title;
  let content = req.body.content;

  // // 쿼리 인서트 방법 2
  // let query = `update memos set title = "${title}", content = "${content}" where id = ${id}`

  // 쿼리 인서트 방법 1
  let query2 = "update memos set title = ?, content = ? where id = ?";

  connection.query(query2, [title, content, id], (error, results, fields) => {
    console.log("error: ", error);
    console.log(results);
    res.status(200).json({ success: true });
    connection.end();
  });
};

// @desc    메모 지우기
// @route   DELETE /api/v1/memos/:id
exports.deleteMemo = (req, res, next) => {
  let id = req.params.id;

  let query = "delete from memos where id = ?";

  connection.query(query, [id], (error, results, fields) => {
    console.log("error: ", error);
    console.log(results);
    res.status(200).json({ success: true });
    connection.end();
  });
};
