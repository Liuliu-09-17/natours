// 启动： npm start, 具体的command可以在package.json里改scripts
const path = require('path');
const express = require('express');
const morgan = require('morgan'); // required here
const rateLimit = require('express-rate-limit'); //npm i express-rate-limit
const helmet = require('helmet'); //npm i helmet
const mongoSanitize = require('express-mongo-sanitize'); // npm i express-mongo-sanitize
const xss = require('xss-clean'); // npm i xss-clean
const hpp = require('hpp'); //npm i hpp
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

// Start express app
const app = express();

app.set('view engine', 'pug'); //npm i pug
app.set('views', path.join(__dirname, 'views'));

// 1. global middlewares
// console.log(process.env.NODE_ENV);
//Serving static files
app.use(express.static(path.join(__dirname, 'public')));
//Set security Http heasers
app.use(helmet());

// 添加 CSP 配置 => 关于地图的配置！！！麻烦死了！
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        'https://api.mapbox.com',
        'https://events.mapbox.com',
        'https://cdnjs.cloudflare.com',
      ],
      connectSrc: [
        "'self'",
        'https://api.mapbox.com',
        'https://events.mapbox.com',
        'https://api.mapbox.com/styles/v1/mapbox/streets-v12',
        'ws://127.0.0.1:61895/',
        'ws://127.0.0.1:62785/',
        'ws://127.0.0.1:51863/',
      ],
      workerSrc: ["'self'", 'blob:'],
    },
  }),
);

//Development login
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // use here
}

// allow 100 requests from the same ip in one hour
//Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100,
  message: 'Too many requests from this IP! Please try again in one hour! 😵‍💫',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
// parser the data from the body
app.use(express.json({ limit: '10kb' })); //middleware， calling json methods
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// parser the data from cookie
app.use(cookieParser());

// Data sanitization against NoSQL query injection  // npm i express-mongo-sanitize
app.use(mongoSanitize());

// Data sanitization against XSS // npm i xss-clean
app.use(xss()); // clean any user input from malicious HTML code 恶意代码

// Prevent parameter pollution, 只能实现最后一个条件, 有whitelist就可以实现所有的条件， 不然就是hpp()
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// app.use((req, res, next) => {
//   console.log('Hello form the middleware 🤟');
//   next(); //没有next，他就卡在这里了
// });

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3. routes
app.use('/', viewRouter);
//api routes
app.use('/api/v1/tours', tourRouter); // mount routers
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // * means all situation urls, get, patch, post... app.get, app.patch....
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
//error handling middleware
app.use(globalErrorHandler);

// 4. start the server
module.exports = app;
