const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { StatusCodes } = require('http-status-codes');
const Tour = require('../models/tourModel');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { Booking } = require('../models/bookingModel');
const factory = require('./handlerFactory');

const getCheckoutSession = catchAsync(async (req, res, next) => {
  // ? 1) Get currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(
      new AppError('No tour found with that ID', StatusCodes.NOT_FOUND),
    );
  }

  // ? 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
            ],
          },
        },
      },
    ],
  });

  // ? 3) Create session as response
  res.status(StatusCodes.OK).json({
    status: 'success',
    session,
  });
});

const createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) {
    return next();
  }

  await Booking.create({ tour, user, price });

  res.redirect(`${req.protocol}://${req.get('host')}/my-tours`);
});

const getBooking = factory.getOne(Booking);
const getAllBookings = factory.getAll(Booking);
const createBooking = factory.createOne(Booking);
const updateBooking = factory.updateOne(Booking);
const deleteBooking = factory.deleteOne(Booking);

module.exports = {
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getAllBookings,
  getCheckoutSession,
  createBookingCheckout,
};
