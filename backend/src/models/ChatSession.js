const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500
    }
  },
  { _id: false, timestamps: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    messages: {
      type: [chatMessageSchema],
      default: []
    }
  },
  { timestamps: true }
);

chatSessionSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
