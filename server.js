const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { createNotificationNamespace, setupNotificationInterval } = require('./sockets/notifications');
// const {initializeApp, applicationDefault } = require('firebase-admin/app');
// const{ getMessaging } = require('firebase-admin/messaging');

// process.env.GOOGLE_APPLICATION_CREDENTIALS;









// initializeApp({
//   credential: applicationDefault(),
//   projectId: 'potion-for-creators',
// });





process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
const socketIo = require('socket.io');

dotenv.config({ path: './.env' });
const app = require('./app');
































const io = socketIo(app,    {cors: {
  // origin: 'http://109.106.244.229',
  origin: 'http://localhost:3000',
    // Allow only this origin
    // Allow only this origin
  
}});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

require('./sockets/getauctionsdetails')(io);
require('./sockets/socket')(io);


const notificationNamespace = createNotificationNamespace(io);
setupNotificationInterval(notificationNamespace);
// mongoose
//   .connect('mongodb+srv://adalaapp:123456789ma@cluster0.a93vbj1.mongodb.net/metaa', {
//     // useUnifiedTopology: true ,
//     // useNewUrlParser: true,
//     // useCreateIndex: true,
//     // useFindAndModify: false
//   })
//   .then(() => console.log(`DB connection successful! ${process.env.NODE_ENV_docker}`)).catch(err => {
//     console.log(err);
//   });
mongoose
  .connect(DB, {
    // useUnifiedTopology: true ,
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false
  })
  .then(() => console.log(`DB connection successful! ${process.env.NODE_ENV_docker}`)).catch(err => {
    console.log(err);
  });

// mongoose
//   .connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@mongo:27017/${process.env.NODE_ENV_DOCKER === 'production' ? 'mazadat-prod' : 'mazadates-dev'}`, {
//     // useUnifiedTopology: true,
//     // useNewUrlParser: true,
//     // useCreateIndex: true,
//     // useFindAndModify: false,
//   })
//   .then(() => console.log(`DB connection successful! Environment: ${process.env.NODE_ENV_DOCKER}`))
//   .catch(err => {
//     console.error('DB connection error:', err);
//   });









const dbName = process.env.NODE_ENV_docker === 'production' ? 'mazadat-prod' : 'mazadates-dev';
// .connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@mongo:27017/${dbName}?authSource=admin`, {

// mongoose
//   .connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:27017/mazadates-dev?authSource=admin`, {
//     useUnifiedTopology: true,
//     useNewUrlParser: true,
    
//     // useCreateIndex: true,
//     // useFindAndModify: false,
//   })
//   .then(() => console.log(`DB connection successful! Environment: ${process.env.NODE_ENV_docker}`))
//   .catch(err => {
//     console.error('DB connection error:', err);
//   });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});