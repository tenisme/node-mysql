const chalk = require("chalk");

const connection = require("../db/mysql_connection.js");
const sendEmail = require("../utils/sendemail.js");

// @desc    연락처 공유 api with auth
// @route   POST /api/v1/share
// @req     user_id(auth), login_id(auth), shared_user_id, contact_id[]
// @res     success, message, shared_id, shared_user_id
exports.shareContacts = async (req, res, next) => {
  console.log(chalk.bold("<<  연락처 공유 api 실행됨  >>"));

  // 필요한 데이터 let으로 가져오기
  let user_id = req.user.user_id;
  let login_id = req.user.login_id;
  let shared_user_id = req.body.shared_user_id;
  let contact_id = req.body.contact_id;

  // 올바른 유저인지 체크
  //   auth로 user_id를 불러와서 체크

  // 필요한 req(user_id(공유용), contact_id)가 있는지 체크
  // 공유할 유저의 id(shared_user_id)가 DB에 존재하는지 체크
  //   contact_users 테이블에서 공유할 유저의 id를 where로 select
  //   if(rows.affectedRows == 0) 이면 res.status(400) 하고 return
  // 공유할 연락처가 DB에 존재하는지 체크 및 데이터 저장
  //   contacts 테이블에서 공유할 연락처를 select로 불러온다
  //   불러와서 let으로 저장
  //   let name, let phone
  // 공유할 연락처의 id(contact_id)와 공유할 유저의 id(shared_user_id)를 contact_share 테이블에 저장
  //   저장 성공시 공유한 유저에게 이메일로 공유 내용(login_id(보내는유저), name, phone)을 보냄
  //   공유 요청한 클라이언트에게 공유 취소를 위해서 shared_id와 shared_user_id를 묶은 데이터들을 res한다
};

// @desc    연락처 공유 해제 api with auth
// @route   DELETE /api/v1/share
// @req
// @res     success, message
exports.unShareContacts = async (req, res, next) => {
  console.log(chalk.bold("<<  연락처 공유 해제 api 실행됨  >>"));
};
