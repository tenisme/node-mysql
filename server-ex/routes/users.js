// 각 "경로"별로 router를 셋팅하는 파일
const express = require("express");
const auth = require("../middleware/auth.js");

const {
  createUser,
  login,
  changePasswd,
  getMyInfo,
  logout,
  logoutAll,
  deleteUser,
  sendEmail,
} = require("../controllers/users.js"); // 함수단위로 여러개를 exports했으므로 json으로 함수들을 가져왔다.

// next 파라미터는 미들 웨어랑 관련이 있다.

const router = express.Router();

// 각 경로별로 데이터를 가져올 수 있도록 router를 셋팅한다.
// http 상태 코드 : status()로 상태 코드를 셋팅 가능
// http 통신 프로토콜 메소드
//   get : 클라이언트가 서버의 정보를 요청할 때(가져올 때, db에서 select해라)
//   post : 클라이언트가 서버에 새로운 정보를 보내고 이걸 저장해야 할 때. db의 insert
//   put : db의 update
//   delete : 삭제 관련 메소드

// 인증이 필요한 api에 'auth, '를 추가한다.
router
  .route("/")
  .post(createUser)
  .get(auth, getMyInfo)
  .delete(auth, deleteUser); // "/"로 들어올 때 처리하는 프로토콜들은 각각 이런 함수로 처리하겠다.
router.route("/login").post(login);
router.route("/change_passwd").put(changePasswd);
router.route("/logout").post(auth, logout);
router.route("/logout/all").post(auth, logoutAll);

// exports 처리
module.exports = router;
