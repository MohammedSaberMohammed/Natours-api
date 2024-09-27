const { StatusCodes } = require('http-status-codes');
const { catchAsync } = require('../utils/catchAsync');
const { User } = require('../models/userModel');
const { AppError } = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const getMe = async (req, res, next) => {
  req.params.id = req.user.id;

  next();
};

const updateMe = catchAsync(async (req, res, next) => {
  // ? 1) create error if user POSTS password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        StatusCodes.BAD_REQUEST,
      ),
    );
  }

  // ? 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, ['name', 'email']);

  // ? 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: updatedUser,
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(StatusCodes.NO_CONTENT).json({
    status: 'success',
    data: null,
  });
});

const getAllUsers = factory.getAll(User);
const getUser = factory.getOne(User);
// Don't update passwords with this!
const updateUser = factory.updateOne(User);
const deleteUser = factory.deleteOne(User);

const createUser = (req, res) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: 'This route is not yet defined! Please use /signup instead',
  });
};

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
  updateMe,
  deleteMe,
  getMe,
};
