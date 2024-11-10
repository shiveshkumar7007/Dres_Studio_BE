const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserModel = require('../../models/user.model');

async function signupUser(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).send({
        message: 'Please provide all required fields',
        data: {},
      });
    }
    const isExistingUser = await UserModel.countDocuments({ email });
    if (isExistingUser) {
      return res.status(400).send({
        message: 'User already exists',
        data: {},
      });
    }
    const encryptedPassword = bcrypt.hashSync(password, 5);
    const user = new UserModel({ name, email, password: encryptedPassword });
    await user.save();
    return res.status(201).send({
      message: 'User created successfully',
      data: { user },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: error.message || 'Internal Server Error',
      data: {},
    });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        message: 'Please provide all required fields',
        data: {},
      });
    }
    const userData = await UserModel.findOne({ email }).lean();
    if (!userData) {
      return res.status(400).send({
        message: 'User does not exist',
        data: {},
      });
    }
    const { _id: userId, name, password: userPassword } = userData;
    if (!bcrypt.compareSync(password, userPassword)) {
      return res.status(400).send({
        message: 'Invalid credentials',
        data: {},
      });
    }
    const authToken = jwt.sign({ userId, email }, process.env.JWT_SECRET);
    return res.status(200).send({
      message: 'User authenticated successfully',
      data: { userId, name, email, authToken },
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
  signupUser,
  loginUser,
};
