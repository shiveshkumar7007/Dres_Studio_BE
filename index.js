require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { validateAuthToken } = require('./middlewares/authMiddleware');
const userRouter = require('./modules/user/user.route');
const profileRouter = require('./modules/profile/profile.route');
const contentRouter = require('./modules/content/content.route');
const challengeRouter = require('./modules/challenge/challenge.route');

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

mongoose
  .connect(process.env.MONGO_URL, {})
  .then(() => {
    console.log('Database Connected!');
  })
  .catch((err) => {
    console.log(err);
  });

app.use('/auth', validateAuthToken);
app.use('/user', userRouter);
app.use('/auth/profile', profileRouter);
app.use('/auth/content', contentRouter);
app.use('/auth/challenge', challengeRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});
