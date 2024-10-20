const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout,
} = require('../controllers/authController');
const { authenticateUser } = require('../middlewares/authMiddleware');

const authRouter = express.Router();

authRouter.route('/login').post(login);
authRouter.route('/logout').post(logout);
authRouter.route('/signup').post(signup);
authRouter.route('/forgot-password').post(forgotPassword);
authRouter.route('/reset-password/:token').patch(resetPassword);
authRouter.route('/update-password').patch(authenticateUser, updatePassword);

module.exports = { authRouter };
