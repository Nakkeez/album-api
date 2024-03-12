const { StatusCodes } = require('http-status-codes');

const Album = require('../models/Album');

const query = async (req, res) => {
  const { search } = req.query;

  let albums = [];

  if (search) {
    const albumsData = await Album.find({}).populate('owners', { username: 1 });
    let ownerName = '';
    
    albums = albumsData.filter((album) => {
      album.owners.map((owner) => {
        ownerName = owner.username;
      });
      return (
        (album.artist.toLowerCase()).includes(search.toLowerCase()) ||
        (album.title.toLowerCase()).includes(search.toLowerCase()) ||
        ((String(album.year)).toLowerCase()).includes(search.toLowerCase()) ||
        (album.genre.toLowerCase()).includes(search.toLowerCase()) ||
        ((String(album.tracks)).toLowerCase()).includes(search.toLowerCase()) ||
        (ownerName.toLowerCase()).includes(search.toLowerCase())
      );
    });
  }
    
  if (albums.length < 1) {
    return res.status(StatusCodes.OK).json({ success: true, data: [] });
  }

  res.status(StatusCodes.OK).json({ success: true, data: albums });
};

module.exports = { query };
