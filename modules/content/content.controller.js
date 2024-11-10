const ContentModel = require('../../models/content.model');
const UserModel = require('../../models/user.model');
const ContentRatingModel = require('../../models/contentRating.model');
const { CONTENT_TYPES } = require('../../constant');

async function createNewContent(req, res) {
  try {
    const { userId } = req.user;
    const {
      title,
      description = '',
      type,
      text,
      fileUrl,
      thumbnailUrl = '',
    } = req.body;
    if (!title || !Object.values(CONTENT_TYPES).includes(type)) {
      return res.status(400).send({
        message: 'Please provide all required fields',
        data: {},
      });
    }
    const contentObj = {
      title,
      description,
      userId,
      type,
      thumbnailUrl,
    };
    if (type === CONTENT_TYPES.AUDIO) {
      contentObj.fileUrl = fileUrl;
    }
    if (type === CONTENT_TYPES.LYRICS) {
      contentObj.text = text;
    }
    const content = new ContentModel(contentObj);
    await content.save();
    return res.status(200).send({
      message: 'Content created successfully',
      data: { content },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: error.message || 'Internal Server Error',
      data: {},
    });
  }
}

async function getUserContents(req, res) {
  try {
    const { userId } = req.user;
    const contents = await ContentModel.find({ userId })
      .sort({ _id: -1 })
      .lean();
    return res.status(200).send({
      message: 'User content fectched successfully',
      data: { contents },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: error.message || 'Internal Server Error',
      data: {},
    });
  }
}

async function getContentData(req, res) {
  try {
    const { userId } = req.user;
    const { contentId } = req.params;
    const contentData = await ContentModel.findOne({ _id: contentId }).lean();
    if (!contentData) {
      return res.status(400).send({
        message: 'Content not found',
        data: {},
      });
    }
    const { userId: contentCreatorId } = contentData;
    const [userData, userRatingData, ratingData] = await Promise.all([
      UserModel.findOne(
        { _id: contentCreatorId },
        { name: 1, email: 1, profilePhotoUrl: 1, coverPhotoUrl: 1 }
      ).lean(),
      ContentRatingModel.findOne({ userId, contentId }, { rating: 1 }).lean(),
      ContentRatingModel.aggregate([
        { $match: { contentId } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ]),
    ]);
    const avgRating = ratingData.length ? ratingData[0].avgRating : null;
    const userRating = userRatingData ? userRatingData.rating : null;
    return res.status(200).send({
      message: 'Content fectched successfully',
      data: { contentData, userData, userRating, avgRating },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: error.message || 'Internal Server Error',
      data: {},
    });
  }
}

async function getTopArtists(req, res) {
  try {
    const topArtists = await ContentModel.aggregate([
      { $group: { _id: '$userId', contentCount: { $sum: 1 } } },
      { $sort: { contentCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userData',
        },
      },
      { $unwind: '$userData' },
      {
        $project: {
          _id: 0,
          contentCount: 1,
          userId: '$_id',
          name: '$userData.name',
          email: '$userData.email',
          profilePhotoUrl: '$userData.profilePhotoUrl',
        },
      },
    ]);
    return res.status(200).send({
      message: 'Top artists fectched successfully',
      data: { topArtists },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: error.message || 'Internal Server Error',
      data: {},
    });
  }
}

async function getLatestReleases(req, res) {
  try {
    const latestReleases = await ContentModel.aggregate([
      { $sort: { _id: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'contentratings',
          localField: '_id',
          foreignField: 'contentId',
          as: 'ratings',
        },
      },
      { $unwind: { path: '$ratings', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          description: { $first: '$description' },
          userId: { $first: '$userId' },
          type: { $first: '$type' },
          text: { $first: '$text' },
          fileUrl: { $first: '$fileUrl' },
          thumbnailUrl: { $first: '$thumbnailUrl' },
          rating: { $avg: '$ratings.rating' },
        },
      },
      { $sort: { _id: -1 } },
    ]);
    return res.status(200).send({
      message: 'Latest releases fectched successfully',
      data: { latestReleases },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: error.message || 'Internal Server Error',
      data: {},
    });
  }
}

async function updateContentRating(req, res) {
  try {
    const { userId } = req.user;
    const { contentId, rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).send({
        message: 'Please provide valid rating',
        data: {},
      });
    }
    const contentExists = await ContentModel.countDocuments({ _id: contentId });
    if (!contentExists) {
      return res.status(400).send({
        message: 'Content not found',
        data: {},
      });
    }
    await ContentRatingModel.findOneAndUpdate(
      { userId, contentId },
      { rating, review },
      { upsert: true },
    );
    return res.status(200).send({
      message: 'Rating updated successfully',
      data: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: error.message || 'Internal Server Error',
      data: {},
    });
  }
}

module.exports = {
  createNewContent,
  getUserContents,
  getTopArtists,
  getLatestReleases,
  getContentData,
  updateContentRating,
};
