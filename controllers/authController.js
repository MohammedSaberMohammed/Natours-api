const crypto = require('crypto');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { Email } = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    // ? headers['x-forwarded-proto'] Heroku specific
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });
  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    data: {
      token,
      user,
    },
  });
};

const signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(user, url).sendWelcome();

  createSendToken(user, StatusCodes.CREATED, req, res);
});

const logout = (req, res) => {
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(StatusCodes.OK).json({ status: 'success' });
};

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError(
        'Please provide email and password!',
        StatusCodes.BAD_REQUEST,
      ),
    );
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError('Incorrect email or password', StatusCodes.UNAUTHORIZED),
    );
  }

  createSendToken(user, StatusCodes.OK, req, res);
});

const forgotPassword = catchAsync(async (req, res, next) => {
  // ? 1) Get user based on posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError(
        'There is no user with email address.',
        StatusCodes.NOT_FOUND,
      ),
    );
  }

  // ? 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // ? 3) Send it to user's email
  try {
    // Todo: This route should be a page not an api route
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        StatusCodes.INTERNAL_SERVER_ERROR,
      ),
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  // ? 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // ? 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(
      new AppError('Token is invalid or has expired', StatusCodes.BAD_REQUEST),
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // ? 3) Update changedPasswordAt property for the user

  // ? 4) Log the user in, send JWT
  createSendToken(user, StatusCodes.OK, req, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
  // ? 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // ? 2) Check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError('Your current password is wrong.', StatusCodes.UNAUTHORIZED),
    );
  }
  // ? 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // ? 4) Log user in, send JWT
  createSendToken(user, StatusCodes.OK, req, res);
});

module.exports = {
  login,
  logout,
  signup,
  forgotPassword,
  resetPassword,
  updatePassword,
};
