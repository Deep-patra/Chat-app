const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cors = require('cors');
const router = require('./routes/extra');
const loginRouter = require('./routes/login');
const signupRouter = require('./routes/signup');
const homeRouter = require('./routes/home');
const groupRouter = require('./routes/group');
const friendRouter = require('./routes/friend');
const searchRouter = require('./routes/search');
const logoutRouter = require('./routes/logout');
require('dotenv').config({ path: path.resolve(process.cwd(), ".env") });
const app = express();


const store = new MongoDBStore({
  uri: `${process.env.MONGODB_URL}/sessions`,
  collection: 'mySessions',
});

store.on('error', (error) => {
  console.log('Error in the store :', error);
  process.exit(1);
});

const auth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(404);
  }
};

app.use(require('express-session')({
  secret: 'Shhhh... its a secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
  store,
}));

const corsOrigin = {
  origin: false,
};

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOrigin));

app.use("/", express.static(path.join(process.cwd(), './build')));


app.use(loginRouter);

app.use(signupRouter);

app.use(homeRouter);

app.use(auth, router);

app.use(auth, groupRouter);

app.use(auth, friendRouter);

app.use(auth, searchRouter);

app.use(auth, logoutRouter);

module.exports = app;
