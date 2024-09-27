const { StatusCodes } = require('http-status-codes');
const { catchAsync } = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const { AppError } = require('../utils/appError');

const getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(StatusCodes.OK).render('overview', {
    title: 'All Tours',
    tours,
  });
});

const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });

  if (!tour) {
    return next(
      new AppError('There is no tour with that name', StatusCodes.NOT_FOUND),
    );
  }

  res.status(StatusCodes.OK).render('tour', {
    title: tour.name,
    tour,
  });
});

const getLoginForm = (req, res) => {
  res.status(StatusCodes.OK).render('login', {
    title: 'Log into your account',
  });
};

module.exports = {
  getTour,
  getOverview,
  getLoginForm,
};
