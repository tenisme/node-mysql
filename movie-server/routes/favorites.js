const express = require("express");
const auth = require("../middleware/auth.js");

const {
  addFavorite,
  getFavorites,
  deleteFavorite,
} = require("../controllers/favorites.js");

const router = express.Router();

router
  .route("/")
  .post(auth, addFavorite)
  .get(auth, getFavorites)
  .delete(auth, deleteFavorite);

module.exports = router;
