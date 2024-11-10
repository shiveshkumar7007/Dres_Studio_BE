const express = require('express');
const {
  getAnotherUserProfile,
  getUserProfile,
  updateUserProfile,
} = require('./profile.controller');

const profileRouter = express.Router();

profileRouter.get('/:userId', getAnotherUserProfile);
profileRouter.get('/', getUserProfile);
profileRouter.put('/', updateUserProfile);

module.exports = profileRouter;
