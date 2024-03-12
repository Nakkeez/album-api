const express = require('express');
const router = express.Router();

const {
  getAlbums,
  getAlbum,
  createAlbum,
  updateAlbum,
  deleteAlbum
} = require('../controllers/albums');

router.get('/', getAlbums);
router.get('/:id', getAlbum);
router.post('/', createAlbum);
router.put('/:id', updateAlbum);
router.delete('/:id', deleteAlbum);

module.exports = router;