const express = require("express");
const dotenv = require("dotenv");

const memos = require("./routes/memos.js");

dotenv.config({ path: "./config/config.env" });

const app = express();

app.use("/api/v1/memos", memos);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
