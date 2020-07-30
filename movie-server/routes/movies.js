const express = require("express");
const auth = require("../middleware/auth.js");

const router = express.Router();

const {
  getMovies,
  searchMovies,
  getMoviesByYear,
  getMoviesByAttnd,
} = require("../controllers/movies.js");

router.route("/").get(getMovies);
router.route("/search").get(searchMovies);
router.route("/year").get(getMoviesByYear);
router.route("/attnd").get(getMoviesByAttnd);

module.exports = router;
