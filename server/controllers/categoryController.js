const Category = require('../models/Category');
const Holding = require('../models/Holding');
const FutureAnalysisItem = require('../models/FutureAnalysisItem');

// Get all categories for a user
exports.getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const categories = await Category.find({ userId }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, color, parentId } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check if category with same name already exists for this user
    const existing = await Category.findOne({ userId, name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    // Validate parentId if provided
    if (parentId) {
      const parent = await Category.findOne({ _id: parentId, userId });
      if (!parent) {
        return res.status(400).json({ message: 'Invalid parent category' });
      }
    }

    const category = new Category({
      userId,
      name: name.trim(),
      color: color || '#3b82f6',
      parentId: parentId || null,
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Category with this name already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, color, parentId } = req.body;

    const category = await Category.findOne({ _id: id, userId });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name && name.trim() !== '') {
      // Check if another category with same name exists
      const existing = await Category.findOne({
        userId,
        name: name.trim(),
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
      category.name = name.trim();
    }

    if (color) {
      category.color = color;
    }

    if (parentId !== undefined) {
      if (parentId === null) {
        category.parentId = null;
      } else {
        // Prevent circular reference
        if (parentId === id) {
          return res.status(400).json({ message: 'Category cannot be its own parent' });
        }
        const parent = await Category.findOne({ _id: parentId, userId });
        if (!parent) {
          return res.status(400).json({ message: 'Invalid parent category' });
        }
        category.parentId = parentId;
      }
    }

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const category = await Category.findOne({ _id: id, userId });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has companies in portfolio
    const portfolioCount = await Holding.countDocuments({ userId, categoryId: id });
    if (portfolioCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. It has ${portfolioCount} company(ies) in portfolio. Please move or remove them first.`,
      });
    }

    // Check if category has companies in future analysis
    const futureCount = await FutureAnalysisItem.countDocuments({ userId, categoryId: id });
    if (futureCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. It has ${futureCount} company(ies) in future analysis. Please move or remove them first.`,
      });
    }

    // Check if category has child categories
    const childCount = await Category.countDocuments({ userId, parentId: id });
    if (childCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. It has ${childCount} sub-category(ies). Please delete or move them first.`,
      });
    }

    await Category.deleteOne({ _id: id, userId });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update company's category
exports.updateCompanyCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { screenerId, categoryId, type } = req.body; // type: 'portfolio' or 'future'

    if (!screenerId || !categoryId) {
      return res.status(400).json({ message: 'screenerId and categoryId are required' });
    }

    // Verify category belongs to user
    const category = await Category.findOne({ _id: categoryId, userId });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (type === 'portfolio') {
      const holding = await Holding.findOne({ userId, screenerId });
      if (!holding) {
        return res.status(404).json({ message: 'Company not found in portfolio' });
      }
      holding.categoryId = categoryId;
      await holding.save();
      res.json({ message: 'Category updated successfully', holding });
    } else if (type === 'future') {
      const futureItem = await FutureAnalysisItem.findOne({ userId, screenerId });
      if (!futureItem) {
        return res.status(404).json({ message: 'Company not found in future analysis' });
      }
      futureItem.categoryId = categoryId;
      await futureItem.save();
      res.json({ message: 'Category updated successfully', futureItem });
    } else {
      return res.status(400).json({ message: 'Invalid type. Must be "portfolio" or "future"' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

