const Suggestion = require('../models/Suggestion');
const Box = require('../models/Box');

// @desc    Create a new suggestion
// @route   POST /api/suggestions/:boxId
// @access  Public (with email)
exports.createSuggestion = async (req, res) => {
  try {
    const { content, authorEmail, authorName, isAnonymous, userId } = req.body;

    // Find the box
    const box = await Box.findOne({ boxId: req.params.boxId, isActive: true });

    if (!box) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion box not found'
      });
    }

    // Prevent owner from adding suggestions to their own box
    if (userId && box.owner.toString() === userId) {
      return res.status(403).json({
        success: false,
        message: 'You cannot add suggestions to your own box'
      });
    }

    // Create suggestion
    const suggestion = await Suggestion.create({
      box: box._id,
      content,
      authorEmail,
      authorName: isAnonymous ? 'Anonymous' : (authorName || 'Anonymous'),
      isAnonymous: isAnonymous || false
    });

    res.status(201).json({
      success: true,
      message: '🎉 Thank you for your suggestion! It has been submitted successfully.',
      data: {
        id: suggestion._id,
        createdAt: suggestion.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error submitting suggestion',
      error: error.message
    });
  }
};

// @desc    Get suggestions for a box (owner only)
// @route   GET /api/suggestions/:boxId
// @access  Private (Box owner only)
exports.getSuggestions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, sort = 'newest' } = req.query;

    // Find the box
    const box = await Box.findOne({ boxId: req.params.boxId });

    if (!box) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion box not found'
      });
    }

    // Check ownership
    if (box.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view suggestions for this box'
      });
    }

    // Build query
    const query = { box: box._id };
    if (status) query.status = status;

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'reactions') sortOption = { 'reactions.length': -1, createdAt: -1 };

    const suggestions = await Suggestion.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Suggestion.countDocuments(query);

    // Get status counts
    const statusCounts = await Suggestion.aggregate([
      { $match: { box: box._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const counts = {
      pending: 0,
      reacted: 0,
      archived: 0,
      replied: 0,
      total
    };
    
    statusCounts.forEach(s => {
      counts[s._id] = s.count;
    });

    res.status(200).json({
      success: true,
      data: suggestions,
      counts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching suggestions',
      error: error.message
    });
  }
};

// @desc    Update suggestion status (owner only)
// @route   PUT /api/suggestions/:id
// @access  Private (Box owner only)
exports.updateSuggestion = async (req, res) => {
  try {
    const { status, ownerNote, reaction } = req.body;

    let suggestion = await Suggestion.findById(req.params.id).populate('box');

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    if (suggestion.box.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this suggestion'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (ownerNote !== undefined) updateData.ownerNote = ownerNote;
    if (reaction !== undefined) updateData.reaction = reaction;

    suggestion = await Suggestion.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Suggestion updated successfully',
      data: suggestion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating suggestion',
      error: error.message
    });
  }
};

// @desc    Add reaction to suggestion
// @route   POST /api/suggestions/:id/react
// @access  Public
exports.addReaction = async (req, res) => {
  try {
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required'
      });
    }

    const suggestion = await Suggestion.findById(req.params.id);

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    // Find existing reaction with same emoji
    const existingReaction = suggestion.reactions.find(r => r.emoji === emoji);

    if (existingReaction) {
      existingReaction.count += 1;
    } else {
      suggestion.reactions.push({ emoji, count: 1 });
    }

    // Auto-update status to 'reacted' if not already replied or archived
    if (suggestion.status === 'pending') {
      suggestion.status = 'reacted';
    }

    await suggestion.save();

    res.status(200).json({
      success: true,
      message: 'Reaction added',
      data: suggestion.reactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error adding reaction',
      error: error.message
    });
  }
};

// @desc    Delete suggestion (owner only)
// @route   DELETE /api/suggestions/:id
// @access  Private (Box owner only)
exports.deleteSuggestion = async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id).populate('box');

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    // Check ownership through box
    if (suggestion.box.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this suggestion'
      });
    }

    await Suggestion.findByIdAndDelete(req.params.id);

    // Update suggestion count
    const count = await Suggestion.countDocuments({ box: suggestion.box._id });
    await Box.findByIdAndUpdate(suggestion.box._id, { suggestionsCount: count });

    res.status(200).json({
      success: true,
      message: 'Suggestion deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting suggestion',
      error: error.message
    });
  }
};

// @desc    Reply to suggestion (owner only)
// @route   POST /api/suggestions/:id/reply
// @access  Private (Box owner only)
exports.replyToSuggestion = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }

    let suggestion = await Suggestion.findById(req.params.id).populate('box');

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    // Check ownership through box
    if (suggestion.box.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reply to this suggestion'
      });
    }

    // Check if there's an email to reply to
    if (!suggestion.authorEmail) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reply: this suggestion was submitted anonymously without an email'
      });
    }

    suggestion = await Suggestion.findByIdAndUpdate(
      req.params.id,
      { 
        reply: { message: message.trim(), createdAt: new Date(), isRead: false },
        status: 'replied'
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      data: suggestion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error sending reply',
      error: error.message
    });
  }
};

// @desc    Get inbox (replies to user's suggestions)
// @route   GET /api/suggestions/inbox
// @access  Private (authenticated user)
exports.getInbox = async (req, res) => {
  try {
    // Get user's email from authenticated user
    const userEmail = req.user.email;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email not found'
      });
    }

    const suggestions = await Suggestion.find({ 
      authorEmail: userEmail.toLowerCase(),
      reply: { $exists: true, $ne: null }
    })
    .populate({
      path: 'box',
      select: 'boxId title logoUrl theme owner',
      populate: { path: 'owner', select: 'name' }
    })
    .sort({ 'reply.createdAt': -1 });

    // Count unread
    const unreadCount = suggestions.filter(s => !s.reply?.isRead).length;

    res.status(200).json({
      success: true,
      data: suggestions,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching inbox',
      error: error.message
    });
  }
};

// @desc    Mark reply as read
// @route   PUT /api/suggestions/:id/read
// @access  Private
exports.clearAllSuggestions = async (req, res) => {
  try {
    const box = await Box.findOne({ boxId: req.params.boxId });

    if (!box) {
      return res.status(404).json({
        success: false,
        message: 'Box not found'
      });
    }

    if (box.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await Suggestion.deleteMany({ box: box._id });
    await Box.findByIdAndUpdate(box._id, { suggestionsCount: 0 });

    res.status(200).json({
      success: true,
      message: 'All suggestions cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.markReplyAsRead = async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id).populate('box');

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }

    // Check if user is the suggestion author (checking by email)
    if (suggestion.authorEmail === req.user.email) {
      // Mark reply as read by the suggestion author
      if (suggestion.reply) {
        suggestion.reply.isRead = true;
        await suggestion.save();
      }
    } else if (suggestion.box.owner.toString() === req.user.id) {
      // Mark as read by the box owner
      suggestion.isReadByOwner = true;
      await suggestion.save();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
