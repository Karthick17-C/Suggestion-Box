const express = require('express');
const router = express.Router();
const {
  createBox,
  getPublicBoxes,
  getMyBoxes,
  getBox,
  verifyPasskey,
  updateBox,
  deleteBox
} = require('../controllers/boxController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getPublicBoxes);
router.get('/:boxId', getBox);
router.post('/:boxId/verify', verifyPasskey);

// Protected routes
router.post('/', protect, createBox);
router.get('/user/my', protect, getMyBoxes);
router.put('/:boxId', protect, updateBox);
router.delete('/:boxId', protect, deleteBox);

module.exports = router;
