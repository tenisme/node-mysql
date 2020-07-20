const express = require("express");
const dotenv = require("dotenv");
const contact = require("./router/contact.js");
const logger = require("./middleware/logger.js");
const errorHandler = require("./middleware/error.js");

const app = express();
const PORT = process.env.PORT || 5300;

dotenv.config({ path: "./config/config.env" });

app.use(express.json());

app.use(logger);

app.use("/api/v1/contacts", contact);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
