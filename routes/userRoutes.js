const express = require('express');
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
  updateMe,
  deleteMe,
  getMe,
} = require('../controllers/userController');
const { restrictTo } = require('../middlewares/authMiddleware');
const {
  uploadUserPhoto,
  resizeUserPhoto,
} = require('../middlewares/attachments');

const userRouter = express.Router();

userRouter.get('/getMe', getMe, getUser);
userRouter.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
userRouter.delete('/deleteMe', deleteMe);

// ? Restrict all routes after this middleware
userRouter.use(restrictTo('admin'));
userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = { userRouter };
