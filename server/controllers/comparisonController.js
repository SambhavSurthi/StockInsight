const Comparison = require('../models/Comparison');

// Get all saved comparisons for a user
exports.getComparisons = async (req, res) => {
  try {
    const userId = req.user.id;
    const comparisons = await Comparison.find({ userId }).sort({ createdAt: -1 });
    res.json(comparisons);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific comparison
exports.getComparison = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const comparison = await Comparison.findOne({ _id: id, userId });
    if (!comparison) {
      return res.status(404).json({ message: 'Comparison not found' });
    }
    res.json(comparison);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Save a new comparison
exports.saveComparison = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, screenerIds, companyNames, type } = req.body;

    if (!name || !screenerIds || !Array.isArray(screenerIds) || screenerIds.length === 0) {
      return res.status(400).json({ message: 'Name and screenerIds array are required' });
    }

    if (screenerIds.length < 2 || screenerIds.length > 3) {
      return res.status(400).json({ message: 'You can compare 2-3 companies at a time' });
    }

    // Check if comparison with same name already exists
    const existing = await Comparison.findOne({ userId, name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'Comparison with this name already exists' });
    }

    const comparison = new Comparison({
      userId,
      name: name.trim(),
      screenerIds,
      companyNames: companyNames || [],
      type: type || 'mixed',
    });

    await comparison.save();
    res.status(201).json(comparison);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Comparison with this name already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Update a comparison
exports.updateComparison = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, screenerIds, companyNames, type } = req.body;

    const comparison = await Comparison.findOne({ _id: id, userId });
    if (!comparison) {
      return res.status(404).json({ message: 'Comparison not found' });
    }

    if (name && name.trim() !== '') {
      // Check if another comparison with same name exists
      const existing = await Comparison.findOne({
        userId,
        name: name.trim(),
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({ message: 'Comparison with this name already exists' });
      }
      comparison.name = name.trim();
    }

    if (screenerIds && Array.isArray(screenerIds)) {
      if (screenerIds.length < 2 || screenerIds.length > 3) {
        return res.status(400).json({ message: 'You can compare 2-3 companies at a time' });
      }
      comparison.screenerIds = screenerIds;
    }

    if (companyNames && Array.isArray(companyNames)) {
      comparison.companyNames = companyNames;
    }

    if (type) {
      comparison.type = type;
    }

    await comparison.save();
    res.json(comparison);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a comparison
exports.deleteComparison = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const comparison = await Comparison.findOne({ _id: id, userId });
    if (!comparison) {
      return res.status(404).json({ message: 'Comparison not found' });
    }

    await Comparison.deleteOne({ _id: id, userId });
    res.json({ message: 'Comparison deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

