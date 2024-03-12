const { StatusCodes } = require('http-status-codes');

const Album = require('../models/Album');

const getAllAlbums = async (req, res) => {
  const albums = await Album.find({}).populate('owners', { username: 1 });
  res.status(StatusCodes.OK).json({ success: true, data: albums });
};

module.exports = getAllAlbums;