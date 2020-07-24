const express = require("express");

const router = express.Router();

const {
  getMovies,
  searchMovies,
  getMoviesOrderYear,
  getMoviesOrderAttnd,
} = require("../controllers/movie.js");

router.route("/").get(getMovies);

router.route("/search").post(searchMovies);

router.route("/search_by_year").post(getMoviesOrderYear);

router.route("/search_by_attnd").post(getMoviesOrderAttnd);
module.exports = router;
