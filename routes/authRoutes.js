const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');
const { authenticateUser } = require('../middlewares/authMiddleware');

const authRouter = express.Router();

authRouter.route('/login').post(login);
authRouter.route('/signup').post(signup);
authRouter.route('/forgot-password').post(forgotPassword);
authRouter.route('/reset-password/:token').patch(resetPassword);
authRouter.route('/update-password').patch(authenticateUser, updatePassword);

module.exports = { authRouter };
