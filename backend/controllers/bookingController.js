const bookingService = require('../services/bookingService');

async function createBooking(req, res, next) {
  try {
    const { eventId, quantity, totalPrice } = req.body;
    const userId = req.user.userId;
    const booking = await bookingService.createBooking({ userId, eventId, quantity, totalPrice });
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
}

async function listUserBookings(req, res, next) {
  try {
    const userId = req.user.userId;
    const bookings = await bookingService.listUserBookings(userId);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

async function listAllBookings(req, res, next) {
  try {
    const bookings = await bookingService.listAllBookings();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createBooking,
  listUserBookings,
  listAllBookings,
};
