const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid');

// Create custom nanoid for unique box IDs (8 characters, alphanumeric)
const generateBoxId = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

const boxSchema = new mongoose.Schema({
  boxId: {
    type: String,
    unique: true,
    required: true,
    default: () => generateBoxId()
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Box title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  logoUrl: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  passkey: {
    type: String,
    select: false // Hidden by default for security
  },
  theme: {
    primaryColor: {
      type: String,
      default: '#6366f1'
    },
    backgroundColor: {
      type: String,
      default: '#f8fafc'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  suggestionsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster lookups
boxSchema.index({ boxId: 1 });
boxSchema.index({ owner: 1 });

// Ensure boxId uniqueness
boxSchema.pre('save', async function(next) {
  if (this.isNew) {
    let isUnique = false;
    while (!isUnique) {
      const existingBox = await mongoose.models.Box.findOne({ boxId: this.boxId });
      if (!existingBox) {
        isUnique = true;
      } else {
        this.boxId = generateBoxId();
      }
    }
  }
  next();
});

module.exports = mongoose.model('Box', boxSchema);
