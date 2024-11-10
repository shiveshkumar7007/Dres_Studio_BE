const UserModel = require('../../models/user.model');

async function getAnotherUserProfile(req, res) {
  try {
    const { userId } = req.params;
    const profileData = await UserModel.findOne(
      { _id: userId },
      { name: 1, bio: 1, profilePhotoUrl: 1, coverPhotoUrl: 1 },
    );
    if (!profileData) {
      return res.status(400).send({
        message: 'User not found',
        data: {},
      });
    }
    return res.status(200).send({
      message: 'User data fectched successfully',
      data: { profileData },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: error.message || 'Internal Server Error',
      data: {},
    });
  }
}

async function getUserProfile(req, res) {
  try {
    const { userId } = req.user;
    const profileData = await UserModel.findOne(
      { _id: userId },
      { password: 0 },
    );
    if (!profileData) {
      return res.status(400).send({
        message: 'User not found',
        data: {},
      });
    }
    return res.status(200).send({
      message: 'User data fectched successfully',
      data: { profileData },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: error.message || 'Internal Server Error',
      data: {},
    });
  }
}

async function updateUserProfile(req, res) {
  try {
    const { userId } = req.user;
    const { name, bio, profilePhotoUrl, coverPhotoUrl } = req.body;
    const updateObj = {};
    if (name) {
      updateObj.name = name;
    }
    if (bio) {
      updateObj.bio = bio;
    }
    if (profilePhotoUrl) {
      updateObj.profilePhotoUrl = profilePhotoUrl;
    }
    if (coverPhotoUrl) {
      updateObj.coverPhotoUrl = coverPhotoUrl;
    }
    const profileData = await UserModel.findOneAndUpdate(
      { _id: userId },
      { $set: updateObj },
      { new: true },
    );
    if (!profileData) {
      return res.status(400).send({
        message: 'User not found',
        data: {},
      });
    }
    return res.status(200).send({
      message: 'User data updated successfully',
      data: { profileData },
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
  getAnotherUserProfile,
  getUserProfile,
  updateUserProfile,
};
