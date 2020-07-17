const mysql = require("mysql");
const connection = require("../db/mysql_connection.js");

// @desc    모든 메모 정보를 다 조회
// @route   GET /api/v1/memos
// @access  Public
exports.getMemos = (req, res, next) => {
  let select_query = "select * from memos";

  connection.query(select_query, [], function (error, results, fields) {
    if (error != null) {
      console.log("error: " + error);
      return;
    } else {
      console.log("success : select all");
    }

    res.status(200).json({ success: true, type: "select_all", msg: results });

    connection.end();
  });
};

// @desc    특정 메모 id의 정보 조회
// @route   GET /api/v1/memos/:id
// @access  Public
exports.getMemo = (req, res, next) => {
  let select_query = `select * from memos where id = ${req.params.id}`;

  connection.query(select_query, [], function (error, results, fields) {
    if (error != null) {
      console.log("error: " + error);
      return;
    } else {
      console.log(`success : select id = ${req.params.id}`);
    }

    res.status(200).json({
      success: true,
      type: "select",
      msg: results,
      selected_id: req.params.id,
    });

    connection.end();
  });
};

// @desc    새로운 메모를 insert
// @route   POST /api/v1/memos/:title/:content
// @access  Public
exports.createMemo = (req, res, next) => {
  let insert_query = `insert into memos (title, content) values ("${req.params.title}","${req.params.content}")`;

  connection.query(insert_query, [], function (error, results, fields) {
    if (error != null) {
      console.log("error: " + error);
      return;
    } else {
      console.log(`success : insert title = ${req.params.title}`);
    }

    let select_query = `select * from memos where id = ${results.insertId}`;

    connection.query(select_query, [], function (error, results, fields) {
      res.status(200).json({
        success: true,
        type: "insert",
        msg: results,
      });
    });

    connection.end();
  });
};

// @desc    기존 메모를 update
// @route   PUT /api/v1/memos/:id/:title/:content
// @access  Public
exports.updateMemo = (req, res, next) => {
  let update_query = `update memos set title = "${req.params.title}", content = "${req.params.content}" where id = ${req.params.id}`;

  connection.query(update_query, [], function (error, results, fields) {
    if (error != null) {
      console.log("error: " + error);
      return;
    } else {
      console.log(`success : update id = ${req.params.id}`);
    }

    let select_query = `select * from memos where id = ${req.params.id}`;

    connection.query(select_query, [], function (error, results, fields) {
      res.status(200).json({
        success: true,
        type: "update",
        msg: results,
      });
    });

    connection.end();
  });
};

// @desc    해당 경로(id)의 메모를 delete
// @route   DELETE /api/v1/memos/:id
// @access  Public
exports.deleteMemo = (req, res, next) => {
  let delete_query = `delete from memos where id = ${req.params.id}`;

  connection.query(delete_query, [], function (error, results, fields) {
    if (error != null) {
      console.log("error: " + error);
      return;
    } else {
      console.log(`success : delete id = ${req.params.id}`);
    }

    res.status(200).json({
      success: true,
      type: "delete",
      msg: results,
    });

    connection.end();
  });
};
