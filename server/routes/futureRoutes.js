const express = require("express");
const auth = require("../middleware/authMiddleware");
const FutureAnalysisItem = require("../models/FutureAnalysisItem");
const Holding = require("../models/Holding");
const Category = require("../models/Category");

const router = express.Router();

// Get Future Analysis list
router.get("/", auth, async (req, res) => {
  try {
    const items = await FutureAnalysisItem.find({ userId: req.user.id })
      .populate('categoryId', 'name color')
      .sort({ name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch future analysis list" });
  }
});

// Add item to Future Analysis
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

    const existingHolding = await Holding.findOne({ userId: req.user.id, screenerId });
    if (existingHolding) {
      return res.status(409).json({ message: "Company already in portfolio" });
    }

    const existing = await FutureAnalysisItem.findOne({ userId: req.user.id, screenerId });
    if (existing) {
      return res.status(409).json({ message: "Company already in future analysis" });
    }

    const item = await FutureAnalysisItem.create({
      userId: req.user.id,
      screenerId,
      name,
      categoryId,
    });
    
    const populatedItem = await FutureAnalysisItem.findById(item._id).populate('categoryId', 'name color');
    res.status(201).json(populatedItem);
  } catch (err) {
    res.status(500).json({ message: "Failed to add to future analysis" });
  }
});

// Bulk delete from Future Analysis
router.post("/bulk-delete", auth, async (req, res) => {
  const { screenerIds } = req.body;
  if (!Array.isArray(screenerIds)) {
    return res.status(400).json({ message: "screenerIds must be an array" });
  }

  try {
    await FutureAnalysisItem.deleteMany({ userId: req.user.id, screenerId: { $in: screenerIds } });
    res.json({ message: "Selected companies removed from future analysis" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove from future analysis" });
  }
});

// Move from Future Analysis to Portfolio
router.post("/move-to-portfolio", auth, async (req, res) => {
  const { screenerIds } = req.body;
  if (!Array.isArray(screenerIds)) {
    return res.status(400).json({ message: "screenerIds must be an array" });
  }

  try {
    const items = await FutureAnalysisItem.find({
      userId: req.user.id,
      screenerId: { $in: screenerIds },
    });

    for (const item of items) {
      const existingHolding = await Holding.findOne({
        userId: req.user.id,
        screenerId: item.screenerId,
      });
      if (!existingHolding) {
        await Holding.create({
          userId: req.user.id,
          screenerId: item.screenerId,
          name: item.name,
          categoryId: item.categoryId, // Preserve category when moving
        });
      }
    }

    await FutureAnalysisItem.deleteMany({
      userId: req.user.id,
      screenerId: { $in: screenerIds },
    });

    res.json({ message: "Selected companies moved to portfolio" });
  } catch (err) {
    res.status(500).json({ message: "Failed to move to portfolio" });
  }
});

module.exports = router;


