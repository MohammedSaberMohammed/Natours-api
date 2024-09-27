const { StatusCodes } = require('http-status-codes');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { APIFeatures } = require('../utils/apiFeatures');

const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError('No document found with that ID', StatusCodes.NOT_FOUND),
      );
    }

    res.status(StatusCodes.NO_CONTENT).json({
      status: 'success',
      data: null,
    });
  });

const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new AppError('No document found with that ID', StatusCodes.NOT_FOUND),
      );
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: doc,
    });
  });

const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: doc,
    });
  });

const getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (populateOptions) {
      query = query.populate(populateOptions);
    }

    const doc = await query;

    if (!doc) {
      return next(
        new AppError('No document found with that ID', StatusCodes.NOT_FOUND),
      );
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: doc,
    });
  });

const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    res.status(StatusCodes.OK).json({
      status: 'success',
      results: docs.length,
      data: docs,
    });
  });

module.exports = {
  getAll,
  getOne,
  deleteOne,
  updateOne,
  createOne,
};
