const express = require("express");
const auth = require("../middleware/authMiddleware");
const Holding = require("../models/Holding");
const FutureAnalysisItem = require("../models/FutureAnalysisItem");
const Category = require("../models/Category");

const router = express.Router();

// Get portfolio holdings
router.get("/", auth, async (req, res) => {
  try {
    const holdings = await Holding.find({ userId: req.user.id })
      .populate('categoryId', 'name color')
      .sort({ name: 1 });
    res.json(holdings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch portfolio" });
  }
});

// Add holding to portfolio
router.post("/", auth, async (req, res) => {
  const { screenerId, name, categoryId } = req.body;
  if (!screenerId || !name || !categoryId) {
    return res.status(400).json({ message: "screenerId, name, and categoryId are required" });
  }

  try {
    // Verify category belongs to user
    const category = await Category.findOne({ _id: categoryId, userId: req.user.id });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const existing = await Holding.findOne({ userId: req.user.id, screenerId });
    if (existing) {
      return res.status(409).json({ message: "Company already in portfolio" });
    }

    const holding = await Holding.create({
      userId: req.user.id,
      screenerId,
      name,
      categoryId,
    });

    // If it was in FutureAnalysis, optionally remove it when moved
    await FutureAnalysisItem.deleteOne({ userId: req.user.id, screenerId });

    const populatedHolding = await Holding.findById(holding._id).populate('categoryId', 'name color');
    res.status(201).json(populatedHolding);
  } catch (err) {
    res.status(500).json({ message: "Failed to add to portfolio" });
  }
});

// Bulk delete from portfolio
router.post("/bulk-delete", auth, async (req, res) => {
  const { screenerIds } = req.body;
  if (!Array.isArray(screenerIds)) {
    return res.status(400).json({ message: "screenerIds must be an array" });
  }

  try {
    await Holding.deleteMany({ userId: req.user.id, screenerId: { $in: screenerIds } });
    res.json({ message: "Selected companies removed from portfolio" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove from portfolio" });
  }
});

module.exports = router;


