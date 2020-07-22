const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const contact = require("./router/contact.js");
const logger = require("./middleware/logger.js");
const errorHandler = require("./middleware/error.js");

dotenv.config({ path: "./config/config.env" });

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use("/api/v1/contacts", contact);

const PORT = process.env.PORT || 5300;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
