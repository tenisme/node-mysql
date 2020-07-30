const express = require("express");
const auth = require("../middleware/auth.js");

const {
  getMovieSeats,
  seatsReservation,
  cancelReservation,
} = require("../controllers/reservations.js");

const router = express.Router();

router
  .route("/")
  .get(getMovieSeats)
  .post(auth, seatsReservation)
  .put(auth, cancelReservation);

module.exports = router;
