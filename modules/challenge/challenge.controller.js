const ContentModel = require('../../models/content.model');
const UserModel = require('../../models/user.model');
const ChallengeModel = require('../../models/challenge.model');
const { CHALLENGE_STATUS } = require('../../constant');

async function createNewChallenge(req, res) {
  try {
    const { userId: challengerId } = req.user;
    const { title, startTime, endTime, userId } = req.body;
    if (!title || !startTime || !endTime) {
      return res.status(400).send({
        message: 'Please provide all required fields',
        data: {},
      });
    }
    const challengeObj = {
      title,
      user1: { id: challengerId },
      user2: { id: userId },
      startTime,
      endTime,
    };
    const challenge = new ChallengeModel(challengeObj);
    await challenge.save();
    return res.status(200).send({
      message: 'Challenge created successfully',
      data: { challenge },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: error.message || 'Internal Server Error',
      data: {},
    });
  }
}

async function getUserDataMap({ userIds }) {
  const users = await UserModel.find(
    { _id: { $in: userIds } },
    { name: 1, profilePhotoUrl: 1 },
  ).lean();
  const userDataMap = {};
  users.forEach((user) => {
    userDataMap[user._id] = user;
  });
  return { userDataMap };
}

async function getContentDataMap({ contentIds }) {
  const contents = await ContentModel.find(
    { _id: { $in: contentIds } },
    { title: 1, description: 1, type: 1, text: 1, thumbnailUrl: 1 },
  ).lean();
  const contentDataMap = {};
  contents.forEach((content) => {
    contentDataMap[content._id] = content;
  });
  return { contentDataMap };
}

async function getUserChallenges(req, res) {
  try {
    const { userId } = req.user;
    const findQuery = { $or: [{ 'user1.id': userId }, { 'user2.id': userId }] };
    const challenges = await ChallengeModel.find(findQuery)
      .sort({ startTime: -1 })
      .lean();
    const currentDate = new Date();
    const userIdSet = new Set();
    const contentIdSet = new Set();
    challenges.forEach((challenge) => {
      const { user1, user2 } = challenge;
      userIdSet.add(user1.id.toString());
      userIdSet.add(user2.id.toString());
      if (user1.contentId) {
        contentIdSet.add(user1.contentId.toString());
      }
      if (user2.contentId) {
        contentIdSet.add(user2.contentId.toString());
      }
      challenge.isChallenged = user2.id.toString() === userId;
      if (currentDate > challenge.startTime && currentDate < challenge.endTime) {
        challenge.timeStatus = 'live';
      } else if (challenge.startTime > currentDate) {
        challenge.timeStatus = 'upcoming';
      } else if (challenge.endTime < currentDate) {
        challenge.timeStatus = 'past';
      }
    });
    const [{ userDataMap }, { contentDataMap }] = await Promise.all([
      getUserDataMap({ userIds: Array.from(userIdSet) }),
      getContentDataMap({ contentIds: Array.from(contentIdSet) }),
    ]);
    challenges.forEach((challenge) => {
      const { user1, user2 } = challenge;
      const user1Data = userDataMap[user1.id] || {};
      const user2Data = userDataMap[user2.id] || {};
      Object.assign(user1, user1Data);
      Object.assign(user2, user2Data);
      if (user1.contentId) {
        challenge.user1.content = contentDataMap[user1.contentId.toString()];
      }
      if (user2.contentId) {
        challenge.user2.content = contentDataMap[user2.contentId.toString()];
      }
    });
    return res.status(200).send({
      message: 'Challenges fetched successfully',
      data: { challenges },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: error.message || 'Internal Server Error',
      data: {},
    });
  }
}

async function updateChallenge(req, res) {
  try {
    const { userId } = req.user;
    const { challengeId } = req.params;
    const { contentId, status } = req.body;
    if (!challengeId || !(status || contentId)) {
      return res.status(400).send({
        message: 'Please provide all required fields',
        data: {},
      });
    }
    const findQuery = {
      _id: challengeId,
      $or: [
        { 'user1.id': userId },
        { 'user2.id': userId },
      ],
    };
    const challenge = await ChallengeModel.findOne(findQuery).lean();
    if (!challenge) {
      return res.status(400).send({
        message: 'Challenge not found',
        data: {},
      });
    }
    const updateObj = {};
    const user1Id = (challenge.user1.id || '').toString();
    const user2Id = (challenge.user2.id || '').toString();
    if (status && status !== CHALLENGE_STATUS.ACCEPTED && status !== CHALLENGE_STATUS.REJECTED) {
      return res.status(400).send({
        message: 'Invalid status',
        data: {},
      });
    }
    if (status && userId === user1Id) {
      return res.status(400).send({
        message: 'Cannot update status by challenger',
        data: {},
      });
    }
    if (status && challenge.status !== CHALLENGE_STATUS.CHALLENGED) {
      return res.status(400).send({
        message: 'Cannot update status',
        data: {},
      });
    }
    if (status) {
      updateObj.status = status;
    }
    if (contentId) {
      const contentExists = await ContentModel.countDocuments({
        _id: contentId,
        userId,
      });
      if (!contentExists) {
        return res.status(400).send({
          message: 'Invalid content',
          data: {},
        });
      }
      if (userId === user1Id) {
        updateObj['user1.contentId'] = contentId;
      } else {
        updateObj['user2.contentId'] = contentId;
      }
    }
    const updatedChallenge = await ChallengeModel.findOneAndUpdate(
      { _id: challengeId },
      { $set: updateObj },
      { new: true },
    );
    return res.status(200).send({
      message: 'Challenge updated successfully',
      data: { challenge: updatedChallenge },
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
  createNewChallenge,
  getUserChallenges,
  updateChallenge,
};
