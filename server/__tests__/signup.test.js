const express = require('express');
const mongoose = require('mongoose');
const { User } = require('../models');
const request = require('supertest');
const signupRouter = require('../routes/signup');

describe('checking the signup router', () => {
  let server = null;
  const app = express();

  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/test_app', {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
      .catch(err => console.log(err));

    app.use(express.json());
    app.use(signupRouter);
    
    server = app.listen(5000);
  });

  afterAll(async () => {
    await server.close();
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  test('POST /signup', async () => {
    const response = await request(app)
      .post('/signup')
      .send(JSON.stringify({ username: "Deep patra", password: "Deep@1234@" }))
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .catch(err => console.log(err));

      const user = await User.findOne({ username: 'Deep patra' }).lean();

      expect(response.status).toEqual(200);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body.userId).toEqual(user._id.toString());
  });
});