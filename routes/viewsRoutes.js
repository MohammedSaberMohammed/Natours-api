const express = require('express');
const {
  getTour,
  getOverview,
  getLoginForm,
} = require('../controllers/viewsController');

const viewsRouter = express.Router();

viewsRouter.get('/', getOverview);
viewsRouter.get('/tour/:slug', getTour);
viewsRouter.get('/login', getLoginForm);

module.exports = {
  viewsRouter,
};
