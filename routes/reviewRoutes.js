const express = require('express');
const {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  setTourUserIds,
} = require('../controllers/reviewController');
const { restrictTo } = require('../middlewares/authMiddleware');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserIds, createReview);

reviewRouter
  .route('/:id')
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

module.exports = { reviewRouter };
