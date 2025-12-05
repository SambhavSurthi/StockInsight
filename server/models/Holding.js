const mongoose = require("mongoose");

const HoldingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    screenerId: { type: Number, required: true },
    name: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  },
  { timestamps: true }
);

HoldingSchema.index({ userId: 1, screenerId: 1 }, { unique: true });

module.exports = mongoose.model("Holding", HoldingSchema);


