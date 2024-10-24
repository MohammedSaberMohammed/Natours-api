const express = require('express');
const {
  getTour,
  getOverview,
  getLoginForm,
  getAccount,
  getMyTours,
} = require('../controllers/viewsController');
const {
  isLoggedIn,
  authenticateUser,
} = require('../middlewares/authMiddleware');

const viewsRouter = express.Router();

viewsRouter.get('/', isLoggedIn, getOverview);
viewsRouter.get('/tour/:slug', isLoggedIn, getTour);
viewsRouter.get('/login', isLoggedIn, getLoginForm);
viewsRouter.get('/me', authenticateUser, getAccount);
viewsRouter.get('/my-tours', authenticateUser, getMyTours);

module.exports = { viewsRouter };
