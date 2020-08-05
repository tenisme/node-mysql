// npm 패키지 require
const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const morgan = require("morgan");

// 라우터 require
const contact = require("./router/contact.js");
const users = require("./router/user.js");
const share = require("./router/share_contact.js");

// 기타 파일 셋팅
const auth = require("./middleware/auth.js");

const app = express();

app.use(express.json());

app.use(morgan("dev"));

app.use("/api/v1/users", users);

app.use(auth);
app.use("/api/v1/contacts", contact);
app.use("/api/v1/share", share);

const PORT = process.env.PORT || 5300;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
