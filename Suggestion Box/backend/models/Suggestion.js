const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  emoji: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 1
  }
});

const replySchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    maxlength: [1000, 'Reply cannot exceed 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  }
});

const suggestionSchema = new mongoose.Schema({
  box: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Box',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Suggestion content is required'],
    trim: true,
    maxlength: [2000, 'Suggestion cannot exceed 2000 characters']
  },
  authorEmail: {
    type: String,
    lowercase: true,
    trim: true,
    default: ''
  },
  authorName: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
    default: 'Anonymous'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  reactions: [reactionSchema],
  reaction: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'reacted', 'archived', 'replied'],
    default: 'pending'
  },
  isReadByOwner: {
    type: Boolean,
    default: false
  },
  ownerNote: {
    type: String,
    maxlength: [500, 'Note cannot exceed 500 characters'],
    default: ''
  },
  reply: replySchema
}, {
  timestamps: true
});

// Index for faster lookups
suggestionSchema.index({ box: 1, createdAt: -1 });

// Update suggestion count in box when a new suggestion is added
suggestionSchema.post('save', async function() {
  const Box = mongoose.model('Box');
  const count = await mongoose.model('Suggestion').countDocuments({ box: this.box });
  await Box.findByIdAndUpdate(this.box, { suggestionsCount: count });
});

module.exports = mongoose.model('Suggestion', suggestionSchema);
