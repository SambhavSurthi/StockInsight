const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: '#3b82f6' }, // Default blue color
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }, // For hierarchical structure
  },
  { timestamps: true }
);

// Index to ensure unique category names per user
CategorySchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);

