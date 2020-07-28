const express = require("express");
const auth = require("../middleware/auth.js");

const router = express.Router();

const {
  getMovies,
  searchMovies,
  getMoviesByYear,
  getMoviesByAttnd,
  saveFavorite,
  viewFavorite,
  deleteFavorite,
} = require("../controllers/movies.js");

router.route("/").get(getMovies);
router.route("/search").get(searchMovies);
router.route("/year").get(getMoviesByYear);
router.route("/attnd").get(getMoviesByAttnd);
router.route("/set_fav").post(auth, saveFavorite);
router.route("/get_fav").get(auth, viewFavorite);
router.route("/delete_fav").delete(auth, deleteFavorite);

module.exports = router;
