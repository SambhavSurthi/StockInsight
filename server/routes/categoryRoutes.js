const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCompanyCategory,
} = require('../controllers/categoryController');

router.get('/', auth, getCategories);
router.post('/', auth, createCategory);
router.put('/:id', auth, updateCategory);
router.delete('/:id', auth, deleteCategory);
router.post('/update-company-category', auth, updateCompanyCategory);

module.exports = router;

