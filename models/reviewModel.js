const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
      minLength: [10, 'Review must be at least 10 characters'],
      maxLength: [250, 'Review must can not be more than 250 characters'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: -1 }, { unique: true });

// ? Statistic Middleware
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRatings: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats.length ? stats[0].nRatings : 0,
    ratingsAverage: stats.length ? stats[0].avgRatings : 4.5,
  });
};
// ? Document Middleware
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

// ? Query Middleware
reviewSchema.pre('find', function (next) {
  // this.populate('tour', 'name').populate('user', 'name photo');
  this.populate('user', 'name photo');

  next();
});

// ? To be used with findByIdAndUpdate() and findByIdAndDelete()
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.review = await this.clone().findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, function () {
  this.review.constructor.calcAverageRatings(this.review.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = { Review };
