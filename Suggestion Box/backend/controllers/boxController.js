const Box = require('../models/Box');
const bcrypt = require('bcryptjs');

// @desc    Create a new suggestion box
// @route   POST /api/boxes
// @access  Private
exports.createBox = async (req, res) => {
  try {
    const { title, description, logoUrl, isPublic, passkey, theme } = req.body;

    // Create box data
    const boxData = {
      owner: req.user.id,
      title,
      description,
      logoUrl: logoUrl || '',
      isPublic: isPublic !== false,
      theme
    };

    // Hash passkey if provided for private boxes
    if (!isPublic && passkey) {
      const salt = await bcrypt.genSalt(10);
      boxData.passkey = await bcrypt.hash(passkey, salt);
    }

    const box = await Box.create(boxData);

    res.status(201).json({
      success: true,
      message: 'Suggestion box created successfully',
      data: {
        boxId: box.boxId,
        title: box.title,
        description: box.description,
        logoUrl: box.logoUrl,
        isPublic: box.isPublic,
        theme: box.theme,
        createdAt: box.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating box',
      error: error.message
    });
  }
};

// @desc    Get all boxes (public and private)
// @route   GET /api/boxes
// @access  Public
exports.getPublicBoxes = async (req, res) => {
  try {
    const { page = 1, limit = 12, search } = req.query;

    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const boxes = await Box.find(query)
      .select('boxId title description logoUrl isPublic theme suggestionsCount createdAt')
      .populate('owner', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Box.countDocuments(query);

    res.status(200).json({
      success: true,
      data: boxes,
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
      message: 'Server error fetching boxes',
      error: error.message
    });
  }
};

// @desc    Get user's boxes
// @route   GET /api/boxes/my
// @access  Private
exports.getMyBoxes = async (req, res) => {
  try {
    const boxes = await Box.find({ owner: req.user.id })
      .select('boxId title description logoUrl isPublic theme suggestionsCount isActive createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: boxes,
      boxLimit: req.user.boxLimit,
      boxCount: boxes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching your boxes',
      error: error.message
    });
  }
};

// @desc    Get single box by boxId
// @route   GET /api/boxes/:boxId
// @access  Public
exports.getBox = async (req, res) => {
  try {
    const box = await Box.findOne({ boxId: req.params.boxId, isActive: true })
      .select('boxId title description logoUrl isPublic theme suggestionsCount createdAt owner')
      .populate('owner', 'name');

    if (!box) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion box not found'
      });
    }

    res.status(200).json({
      success: true,
      data: box
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching box',
      error: error.message
    });
  }
};

// @desc    Verify passkey for private box
// @route   POST /api/boxes/:boxId/verify
// @access  Public
exports.verifyPasskey = async (req, res) => {
  try {
    const { passkey } = req.body;

    const box = await Box.findOne({ boxId: req.params.boxId, isActive: true })
      .select('+passkey');

    if (!box) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion box not found'
      });
    }

    if (box.isPublic) {
      return res.status(200).json({
        success: true,
        message: 'This is a public box, no passkey needed'
      });
    }

    const isMatch = await bcrypt.compare(passkey, box.passkey);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid passkey'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Access granted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error verifying passkey',
      error: error.message
    });
  }
};

// @desc    Update box
// @route   PUT /api/boxes/:boxId
// @access  Private (Owner only)
exports.updateBox = async (req, res) => {
  try {
    let box = await Box.findOne({ boxId: req.params.boxId });

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
        message: 'Not authorized to update this box'
      });
    }

    const { title, description, logoUrl, isPublic, passkey, theme, isActive } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (theme) updateData.theme = theme;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update passkey if changing to private
    if (isPublic === false && passkey) {
      const salt = await bcrypt.genSalt(10);
      updateData.passkey = await bcrypt.hash(passkey, salt);
    }

    box = await Box.findOneAndUpdate(
      { boxId: req.params.boxId },
      updateData,
      { new: true, runValidators: true }
    ).select('boxId title description logoUrl isPublic theme isActive suggestionsCount createdAt');

    res.status(200).json({
      success: true,
      message: 'Box updated successfully',
      data: box
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating box',
      error: error.message
    });
  }
};

// @desc    Delete box
// @route   DELETE /api/boxes/:boxId
// @access  Private (Owner only)
exports.deleteBox = async (req, res) => {
  try {
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
        message: 'Not authorized to delete this box'
      });
    }

    await Box.findOneAndDelete({ boxId: req.params.boxId });

    // Also delete all suggestions for this box
    const Suggestion = require('../models/Suggestion');
    await Suggestion.deleteMany({ box: box._id });

    res.status(200).json({
      success: true,
      message: 'Box and all its suggestions deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting box',
      error: error.message
    });
  }
};
