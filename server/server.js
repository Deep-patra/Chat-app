const http = require('http');
const app = require('./app');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
const InitializeServer = require('./socket');


mongoose.connect(`${process.env.MONGODB_URL}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, (error) => {
  if (error) {
    console.log('error while connecting to the mongodb server: ', error);
    process.exit(1);
  }

  console.log('mongoose is connected to the mongodb server');
});

const server = http.createServer(app);

InitializeServer(server);

server.listen(process.env.PORT || 5000, (error) => {
  if (error) {
    console.log("Error while listening to the server:", error);
    process.exit(1);
  }

  console.log('Server is listening on the port: ', process.env.PORT || 5000);
});


process.on('uncaughtException', async (error) => {
  console.log("Error occured in the process: ", error);
  server.close();
  await mongoose.disconnect();
  process.exit(1);
});

// listening to the SIGINT event and closing the server graciously
process.on('SIGINT', async () => {
  console.log('SIGINT detected, exiting the process');
  server.close(); // closing the server
  await mongoose.disconnect();
  process.exit(0);
});