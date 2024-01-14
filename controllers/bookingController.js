const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const stripe = require('stripe');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1) Get currrently booked tour
  const tour = await Tour.findById(req.params.id);

  //2) Create checkout session

  //3) Create session as respons
});
