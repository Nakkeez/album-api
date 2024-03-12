const { StatusCodes } = require('http-status-codes');

const APIError = require('./apierror');

class UnauthorizedError extends APIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

module.exports = UnauthorizedError;
