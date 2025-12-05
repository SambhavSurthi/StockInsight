const mongoose = require('mongoose');

const ComparisonSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    screenerIds: [{ type: Number, required: true }], // Array of company screener IDs
    companyNames: [{ type: String, required: true }], // Array of company names for quick reference
    type: { type: String, enum: ['portfolio', 'future', 'mixed'], default: 'mixed' },
  },
  { timestamps: true }
);

// Index to ensure unique comparison names per user
ComparisonSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Comparison', ComparisonSchema);

