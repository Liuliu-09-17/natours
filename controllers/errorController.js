const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  // console.log(value);
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid inputt data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () =>
  new AppError('Your Token has expired! Please log in again!', 401);

const sendErrorDev = (err, req, res) => {
  // A) Api
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // B) Rendered website
  console.error('ERROR 🤯', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};
const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operatioanl, trusted error: send mesage to the clint
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) programming or other unknow error: dont want leak error details
    // 1) log error
    console.error('ERROR 🤯', err);
    // 2) Send generit message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  // B) Rendered website
  // A) Operatioanl, trusted error: send mesage to the clint
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // B) Programming or other unknow error: dont want leak error details
  // 1) log error
  console.error('ERROR 🤯', err);
  // 2) Send generit message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  //   console.log(err.stack); // where the error happens
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }; // hardcopy// 我试了 也可以不用定义error，直接用err
    // console.log('Encountered a CastError:', error);
    // error = handleCastErrorDB(err);
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // if (err.name === 'CastError') error = handleCastErrorDB(error);
    // if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    // // if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    // if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    // if (err.name === 'JsonWebTokenError') error = handleJWTError();
    // if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // console.log('NOT Encountered a CastError!!!');
    sendErrorProd(error, req, res);
    // sendErrorProd(err, res);
  }
};
