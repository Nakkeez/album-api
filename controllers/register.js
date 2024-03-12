const { StatusCodes } = require('http-status-codes');

const User = require('../models/User');
const NotFoundError = require('../errors/notfound');
const BadRequestError = require('../errors/badrequest');
const UnauthorizedError = require('../errors/unauthorized.js');
const APIError = require('../errors/apierror');

const isValidId = (id) => {
  if (typeof id === 'string') {
    if (id.length == 24 || /^[0-9a-fA-F]{24}$/.test(id)) return true;
  }
  else if (id instanceof Uint8Array) {
    if (id.length == 12) return true;
  } else if (typeof id === 'number') {
    if (Number.isInteger(id)) return true;
  }
  return false;
};

const getUsers = async (req, res) => {
  const users = await User.find({}, 'username role albums')
    .populate('albums', {artist: 1, title: 1});
  res.status(StatusCodes.OK).json({ success: true, data: users });
};

const getUser = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    throw new BadRequestError(
      'Id must be a 24 character hex string, 12 byte Uint8Array, or an integer'
    );
  }

  const user = await User.findById(id, 'username role albums')
    .populate('albums', {artist: 1, title: 1});
  if (!user) {
    throw new NotFoundError(`No user found with id ${id}`);
  }

  res.status(StatusCodes.OK).json({ success: true, data: user });
};

const createUser = async (req, res) => {
  const { username, email, role, password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm || password != passwordConfirm) {
    throw new BadRequestError('Given passwords do not match');
  }

  const isUsernameInUse = await User.findOne({ username });
  const isEmailInUse = await User.findOne({ email });
  if (isUsernameInUse) {
    throw new APIError(
      `Username ${username} is already in use`, StatusCodes.CONFLICT
    );
  }
  if (isEmailInUse) {
    throw new APIError(
      `Email ${email} is already in use`, StatusCodes.CONFLICT
    );
  }

  const user = new User ({ username, email, role, passwordHash: password });

  const createdUser = await user.save();
  res.status(StatusCodes.CREATED).json({ success: true, data: createdUser });
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, passwordConfirm } = req.body;
  const userId = req.user.id;
  const role = req.user.role;

  if (!isValidId(id)) {
    throw new BadRequestError(
      'Id must be a 24 character hex string, 12 byte Uint8Array, or an integer'
    );
  }

  if (role != 'admin' && id != userId) {
    throw new UnauthorizedError('Unsufficient access rights');
  }

  if (!password || !passwordConfirm || password != passwordConfirm) {
    throw new BadRequestError('Given passwords do not match');
  }
  // Only check if username is in use for other users
  const userWithSameUsername = await User.findOne({ username });
  if (userWithSameUsername && userWithSameUsername._id.toString() !== id) {
    throw new APIError(
      `username ${username} is already in use`, StatusCodes.CONFLICT
    );
  }
  
  const userWithSameEmail = await User.findOne({ email });
  if (userWithSameEmail && userWithSameEmail._id.toString() !== id) {
    throw new APIError(
      `Email ${email} is already in use`, StatusCodes.CONFLICT
    );
  }

  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError(`No user found with id ${id}`);
  }

  if (username) user.username = username;
  if (email) user.email = email;
  user.passwordHash = password;

  const updatedUser = await user.save();

  res.status(StatusCodes.CREATED).json({ success: true, data: updatedUser });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  if (!isValidId(id)) {
    throw new BadRequestError(
      'Id must be a 24 character hex string, 12 byte Uint8Array, or an integer'
    );
  }

  if (role != 'admin' && id != userId) {
    throw new UnauthorizedError('Unsufficient access rights');
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new NotFoundError(`No user found with id ${id}`);
  }

  res.status(StatusCodes.OK).json({ success: true, data: user });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
};