//# sourceMappingURL=app.js.map
const path = require('path');
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { StatusCodes } = require('http-status-codes');
const AppError = require('./utils/appError');
const { globalErrorMiddleware } = require('./middlewares/errorMiddleware');
const { tourRouter } = require('./routes/tourRoutes');
const { userRouter } = require('./routes/userRoutes');
const { reviewRouter } = require('./routes/reviewRoutes');
const { viewsRouter } = require('./routes/viewsRoutes');
const { authRouter } = require('./routes/authRoutes');
const { bookingRouter } = require('./routes/bookingRoutes');
const { authenticateUser } = require('./middlewares/authMiddleware');
const { webhookCheckout } = require('./controllers/bookingController');

const app = express();

app.enable('trust proxy');
app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);

// ? 1) GLOBAL MIDDLEWARES
// ? Implement CORS
app.use(cors());
app.options('*', cors());

// ? Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// ? Set security HTTP headers
app.use(helmet());

// ? Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ? Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  webhookCheckout,
);

// ? Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ? Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// ? Data sanitization against XSS
app.use(xss());

// ? Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// ? Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  res.set(
    'Content-Security-Policy',
    "default-src 'self' https://*.mapbox.com https://js.stripe.com/v3/; base-uri 'self'; block-all-mixed-content; font-src 'self' https:; frame-ancestors 'self'; img-src 'self' blob: data:; object-src 'none'; script-src 'unsafe-inline' https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob:; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests;",
  );

  next();
});

// ? compress all responses
app.use(compression());

// ? 3) ROUTES
app.use('/', viewsRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', authenticateUser, userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', authenticateUser, bookingRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server!`,
      StatusCodes.NOT_FOUND,
    ),
  );
});

app.use(globalErrorMiddleware);

module.exports = app;
