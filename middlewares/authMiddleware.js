const jwt = require('jsonwebtoken');

async function validateAuthToken(req, res, next) {
  try {
    const authToken = req.headers.authorization;
    if (!authToken) {
      return res.status(401).send({
        message: 'Unauthorized Access',
        data: {},
      });
    }
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      message: error.message || 'Unauthorized Access',
      data: {},
    });
  }
}

module.exports = {
  validateAuthToken,
};
