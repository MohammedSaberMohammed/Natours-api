const express = require('express');
const { reviewRouter } = require('./reviewRoutes');
const {
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getAllTours,
  aliasTopTours,
  getTourStatistics,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
} = require('../controllers/tourController');
const {
  restrictTo,
  authenticateUser,
} = require('../middlewares/authMiddleware');

const tourRouter = express.Router();

// Tour - Review stuff
tourRouter.use('/:tourId/reviews', authenticateUser, reviewRouter);

tourRouter
  .route('/monthly-plan/:year')
  .get(
    authenticateUser,
    restrictTo('admin', 'lead-guide', 'guide'),
    getMonthlyPlan,
  );

tourRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours);

tourRouter.route('/tour-statistics').get(getTourStatistics);

tourRouter.route('/distances/:latlng/unit/:unit').get(getDistances);

tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

tourRouter
  .route('/')
  .get(getAllTours)
  .post(authenticateUser, restrictTo('admin', 'lead-guide'), createTour);

tourRouter
  .route('/:id')
  .get(getTour)
  .patch(authenticateUser, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(authenticateUser, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = { tourRouter };
