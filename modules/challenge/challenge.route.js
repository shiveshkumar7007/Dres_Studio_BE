const express = require('express');
const {
  createNewChallenge,
  getUserChallenges,
  updateChallenge,
} = require('./challenge.controller');

const challengeRouter = express.Router();

challengeRouter.post('/', createNewChallenge);
challengeRouter.get('/', getUserChallenges);
challengeRouter.patch('/:challengeId', updateChallenge);

module.exports = challengeRouter;
