/* eslint-disable no-unused-vars */
const { StatusCodes } = require('http-status-codes');

const APIError = require('../errors/apierror');

const errorHandler = (err, req, res, _next) => {
  console.log(err);

  if (err instanceof APIError) {
    return res
      .status(err.statusCode)
      .json({ success: false, info: err.message });
  }

  else if (err.name === 'ValidationError') {
    let errors = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, info: errors });
  }
  
  res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ success: false, info: 'Something went wrong' });
};

module.exports = errorHandler;
