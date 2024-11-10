const express = require('express');
const {
  createNewChallenge,
  getUserChallenges,
} = require('./challenge.controller');

const challengeRouter = express.Router();

challengeRouter.post('/', createNewChallenge);
challengeRouter.get('/', getUserChallenges);

module.exports = challengeRouter;
