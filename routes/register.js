const express = require('express');
const router = express.Router();
const authMiddleware  = require('../middleware/auth');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/register');

router.get('/', authMiddleware, getUsers);
router.get('/:id', authMiddleware, getUser);
router.post('/', createUser);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

module.exports = router;