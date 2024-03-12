const express = require('express');
const router = express.Router();

const getAllAlbums = require('../controllers/getAllAlbums');

router.route('/').get(getAllAlbums);

module.exports = router;
