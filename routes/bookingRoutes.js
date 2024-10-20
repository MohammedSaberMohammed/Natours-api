const express = require('express');
const {
  getCheckoutSession,
  getAllBookings,
  createBooking,
  getBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const { restrictTo } = require('../middlewares/authMiddleware');

const bookingRouter = express.Router();

bookingRouter.get('/checkout-session/:tourId', getCheckoutSession);

bookingRouter.use(restrictTo('admin', 'lead-guide'));

bookingRouter.route('/').get(getAllBookings).post(createBooking);

bookingRouter
  .route('/:id')
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking);

module.exports = { bookingRouter };
