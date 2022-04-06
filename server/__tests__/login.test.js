const mongoose = require('mongoose');
const { User } = require('../models');
const express = require('express');
const loginRouter = require('../routes/login');
const request = require('supertest');
const bcrypt = require('bcryptjs');


jest.setTimeout(20000);

describe("checking login router", () => {
  let user = null;
  let server = null;
  const app = express();

   beforeAll((done) => {
    app.use(express.json());
    app.use(loginRouter);
    server = app.listen(5000);
    bcrypt.hash("Deepl234@69", 10, async (err, hash) => {
       if (err) console.log(err);
       
       await mongoose.connect('mongodb://127.0.0.1:27017/test')
       .catch(err => { throw err; } );

       user = await User.createNew('Deep patra', hash);
       await user.save();
       done();
     });
   }, 10000);

   afterAll(async () => {
     await server.close();
     await mongoose.connection.db.dropDatabase();
     await mongoose.disconnect();
   }, 10000);


   test("POST /login", async () => {
     const response = await request(app)
      .post('/login')
      .send(JSON.stringify({ username: "Deep patra", password: "Deepl234@69" }))
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .catch(err => console.log(err));

      expect(response.status).toEqual(200);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body.userId).toEqual(user._id.toString());
   }, 5000);
});

