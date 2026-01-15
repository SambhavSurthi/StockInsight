const mongoose = require("mongoose");

const CompanyCacheSchema = new mongoose.Schema({
  screenerId: { type: Number, required: true, unique: true },
  data: { type: Object, required: true }, // Stores the full API response
  lastFetched: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CompanyCache", CompanyCacheSchema);
