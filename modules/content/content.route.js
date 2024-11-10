const express = require('express');
const {
  createNewContent,
  getUserContents,
  getTopArtists,
  getLatestReleases,
  getContentData,
  updateContentRating,
} = require('./content.controller');

const contentRouter = express.Router();

contentRouter.post('/', createNewContent);
contentRouter.get('/top-artists', getTopArtists);
contentRouter.get('/latest-releases', getLatestReleases);
contentRouter.get('/:contentId', getContentData);
contentRouter.get('/', getUserContents);
contentRouter.put('/rate', updateContentRating);

module.exports = contentRouter;
