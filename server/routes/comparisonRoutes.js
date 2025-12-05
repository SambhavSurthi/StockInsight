const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getComparisons,
  getComparison,
  saveComparison,
  updateComparison,
  deleteComparison,
} = require('../controllers/comparisonController');

router.get('/', auth, getComparisons);
router.get('/:id', auth, getComparison);
router.post('/', auth, saveComparison);
router.put('/:id', auth, updateComparison);
router.delete('/:id', auth, deleteComparison);

module.exports = router;

