const express = require('express');
const morgan = require('morgan');

const passport = require('passport');
const session = require('express-session');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorcontroller/errorController');
const bodyParser = require('body-parser');
const cors = require('cors')
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const handleMulterErrors = require('./controllers/errorcontroller/multerErrors');
const { googleCallback, generateJWT } = require('./controllers/authcontroller/authcontroller');
const CategoryRoute = require('./routes/CategoryRoute');
const ItemsRoute = require('./routes/ItemsRoute');
const authRoute = require('./routes/authrouter');
const DepositRoute = require('./routes/depositesroute');
const subcategory = require('./routes/subercategoryRoute');
const appfeatures = require('./routes/appfeatures');
const splashroute = require('./routes/splashrouter');
const bidingroute = require('./routes/bidroute');
const getwinners = require('./routes/winnerroute');
const notificationsroute = require('./routes/notificationsroute');
const testrout = require('./routes/testrouting');
const bookingfiles = require('./routes/bookingfilesRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const permissionRoutes = require('./routes/permissions');
const apppermissionRoutes = require('./routes/permissionRoutes');
const tabbyRoutes = require('./routes/testingfortabby');
const adminNotificationRoutes = require('./routes/adminNotificationRoutes');

const privacyPolicyRoutes = require('./routes/privacyPolicy');
const socialMediaLinkRoutes = require('./routes/socialMediaLink');
const phoneNumberRoutes = require('./routes/phoneNumber');
const appShareLinkRoutes = require('./routes/appShareLink');
const chargewallet = require('./routes/walletCharger');
const walletcontroller = require('./routes/WalletControllerRoute');
const refundRoutes = require('./routes/refundRoutes');
const paymentMethodinfo = require('./routes/paymentMethodRoutes');
const refundedDeposite = require('./routes/depositeRefundedRoute');
const subcategoryRouter = require('./routes/TestingLosersroute'); 
const notificationAdminRoutes = require('./routes/notificationAdminRoutes');
require('./controllers/NotifcationAdminController/sendScheduledNotifications');
// const allowedOrigins = ['http://localhost:3000', 'http://localhost:8888'];

// const {initializeApp, applicationDefault } = require('firebase-admin/app');
// const{ getMessaging } = require('firebase-admin/messaging');
// const admin = require('firebase-admin');

// process.env.GOOGLE_APPLICATION_CREDENTIALS;


console.log("aaaaaa",process.env.GOOGLE_APPLICATION_CREDENTIALS);
const path = require('path');

// app.post("/api/v1/send", function (req, res) {
//   const receivedToken = 'eEQj-fiHDJHXSxeWxkV4X6:APA91bFKWyToFnXNtVuqGnmCLCzhaGQXuW4V7tM2yIqwaF-StpUMo3cHB2Z7nb_TPlLKdOnRZlwqgCKsxzf5dekLRog5rZY-6-c2n50_L8RKWaccqscNCEKR9G7GjTP8IP4t9AaaMar0';
  
//   const message = {
//     notification: {
//       title: "Notif",
//       body: 'This is a Test Notification'
//     },

//   };
  
//   getMessaging()
//     .sendToDevice(receivedToken,message)
//     .then((response) => {
//       res.status(200).json({
//         message: "Successfully sent message",
//         token: receivedToken,
//       });
//       console.log("Successfully sent message:", response);
//     })
//     .catch((error) => {
//       res.status(400);
//       res.send(error);
//       console.log("Error sending message:", error);
//     });
  
  
// });
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true); // Allow requests with no origin (e.g. mobile apps, curl requests)
//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   optionsSuccessStatus: 200 // Some legacy browsers choke on 204
// };

// app.use(cors(corsOptions));

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
// app.use(express.static(`${__dirname}/public`));
app.use('/images', express.static(path.join(__dirname, 'Mazdadat Masr/images')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use((req, res, next) => {

  req.requestTime = new Date().toISOString();

  next();
});

// app.get('/', (req, res) => {
//   res.send('Welcome to the Online Auction System API MAZADAsssT'+ process.env.NODE_ENV_docker);
// });


app.use('/api/v1/tab', tabbyRoutes);
app.use('/api/v1/refundedDeposite', refundedDeposite);
app.use('/api/v1/admin-notifications', adminNotificationRoutes);


app.use('/api/v1/privacyPolicy', privacyPolicyRoutes);
app.use('/api/v1/walletcontroller', walletcontroller);
app.use('/api/v1', refundRoutes);
app.use('/api/v1/paymentmethodinfo', paymentMethodinfo);

app.use('/api/v1/walletcharge', chargewallet);

app.use('/api/v1/socialMediaLink', socialMediaLinkRoutes);
app.use('/api/v1/phoneNumber', phoneNumberRoutes);
app.use('/api/v1/appShareLink', appShareLinkRoutes);

app.use('/api/v1/notificationsadmin', notificationAdminRoutes);






app.use('/api/subcategories', subcategoryRouter);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/apppermissions', apppermissionRoutes);
app.use('/api/v1/permissions', permissionRoutes);
app.use('/api/v1/categories', CategoryRoute);
app.use('/api/v1/notifications', notificationsroute);
app.use('/api/v1/test', testrout);
app.use('/api/v1/payfiles', bookingfiles);



app.use('/api/v1/mylots', getwinners);

app.use('/api/v1/bid', bidingroute);

app.use('/api/v1/splash', splashroute);

app.use('/api/v1/appfeatures', appfeatures);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/subcategory', subcategory);
app.use('/api/v1/deposite', DepositRoute);
app.use('/api/v1/items', ItemsRoute);
app.use('/api/v1/auth', authRoute);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Mazdadat Masr', 'index.html'));
});

app.use(express.static(path.join(__dirname, './build')));
app.get('/*', async(req, res) => {
  await res.sendFile(path.resolve('./build/index.html'))
  
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// app.use(handleMulterErrors);
app.use(globalErrorHandler);
module.exports = server;