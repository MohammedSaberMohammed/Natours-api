const { StatusCodes } = require('http-status-codes');
const { AppError } = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', StatusCodes.UNAUTHORIZED);

const handleJWTExpiredError = () =>
  new AppError(
    'Your token has expired. Please log in again',
    StatusCodes.UNAUTHORIZED,
  );

const handleDuplicateFieldDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;

  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors)
    .map((el) => el.message)
    .join(', ');

  return new AppError(errors, StatusCodes.BAD_REQUEST);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
};

const globalErrorMiddleware = (err, req, res, next) => {
  // console.log('stack', err.stack);
  err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = {
      ...err,
      message: err.message,
      name: err.name,
    };

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error, res);
    }

    // Duplications
    if (err.code === 11000) {
      error = handleDuplicateFieldDB(error, res);
    }

    // Validation Error
    if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(error, res);
    }

    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError(error, res);
    }

    if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError(error, res);
    }

    sendErrorProd(error, res);
  }
};

module.exports = { globalErrorMiddleware };
