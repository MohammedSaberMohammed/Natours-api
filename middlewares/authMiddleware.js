const { promisify } = require('node:util');

const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { User } = require('../models/userModel');

const authenticateUser = catchAsync(async (req, res, next) => {
  let token;
  // ?  1) Getting token and check of it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError(
        'You are not logged in! Please log in to get access.',
        StatusCodes.UNAUTHORIZED,
      ),
    );
  }
  // ?  2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // ?  3) Check if user still exists
  const currenUser = await User.findById(decoded.id);

  if (!currenUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        StatusCodes.UNAUTHORIZED,
      ),
    );
  }

  // ? 4) Check if user changed password after the token was issued
  if (currenUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed password! Please log in again.',
        StatusCodes.UNAUTHORIZED,
      ),
    );
  }

  req.user = currenUser;
  res.locals.user = currenUser;

  next();
});

const isLoggedIn = catchAsync(async (req, res, next) => {
  let token = req.cookies.jwt;

  if (token) {
    token = req.cookies.jwt;

    // ?  1) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // ?  2) Check if user still exists
    const currenUser = await User.findById(decoded.id);

    if (!currenUser) {
      return next();
    }

    // ? 3) Check if user changed password after the token was issued
    if (currenUser.changedPasswordAfter(decoded.iat)) {
      return next();
    }

    // ? THERE IS A LOGGED IN USER (To be available for all PUG templates)
    res.locals.user = currenUser;

    return next();
  }

  next();
});

const restrictTo = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(
      new AppError(
        'You do not have permission to perform this action',
        StatusCodes.FORBIDDEN,
      ),
    );
  }

  next();
};

module.exports = { authenticateUser, restrictTo, isLoggedIn };
