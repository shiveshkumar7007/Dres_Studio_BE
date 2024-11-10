const ContentModel = require('../../models/content.model');
const UserModel = require('../../models/user.model');
const ChallengeModel = require('../../models/challenge.model');

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

async function getUserChallenges(req, res) {
  try {
    const { userId } = req.user;
    const findQuery = { $or: [{ 'user1.id': userId }, { 'user2.id': userId }] };
    const challenges = await ChallengeModel.find(findQuery)
      .sort({ startTime: -1 })
      .lean();
    const currentDate = new Date();
    const userIdSet = new Set();
    challenges.forEach((challenge) => {
      const { user1, user2 } = challenge;
      userIdSet.add(user1.id.toString());
      userIdSet.add(user2.id.toString());
      challenge.isChallenged = user2.id.toString() === userId;
      if (currentDate > challenge.startTime && currentDate < challenge.endTime) {
        challenge.timeStatus = 'live';
      } else if (challenge.startTime > currentDate) {
        challenge.timeStatus = 'upcoming';
      } else if (challenge.endTime < currentDate) {
        challenge.timeStatus = 'past';
      }
    });
    const { userDataMap } = await getUserDataMap({
      userIds: Array.from(userIdSet),
    });
    challenges.forEach((challenge) => {
      const { user1, user2 } = challenge;
      const user1Data = userDataMap[user1.id] || {};
      const user2Data = userDataMap[user2.id] || {};
      Object.assign(user1, user1Data);
      Object.assign(user2, user2Data);
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

module.exports = {
  createNewChallenge,
  getUserChallenges,
};
