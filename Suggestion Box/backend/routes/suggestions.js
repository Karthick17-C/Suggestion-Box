const express = require('express');
const router = express.Router();
const {
  createSuggestion,
  getSuggestions,
  updateSuggestion,
  addReaction,
  deleteSuggestion,
  replyToSuggestion,
  getInbox,
  markReplyAsRead,
  clearAllSuggestions
} = require('../controllers/suggestionController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/:boxId', createSuggestion);
router.post('/:id/react', addReaction);

// Protected routes
router.get('/user/inbox', protect, getInbox);
router.put('/:id/read', protect, markReplyAsRead);

// Protected routes (box owner only)
router.delete('/:boxId/clear', protect, clearAllSuggestions);
router.get('/:boxId', protect, getSuggestions);
router.put('/:id', protect, updateSuggestion);
router.delete('/:id', protect, deleteSuggestion);
router.post('/:id/reply', protect, replyToSuggestion);

module.exports = router;
