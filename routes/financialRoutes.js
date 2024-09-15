const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { addFinancialDetail, fetchFinancialDetail, calculateTotalValue } = require('../controllers/financialController');

router.post('/add', authMiddleware, addFinancialDetail);
router.get('/fetch', authMiddleware, fetchFinancialDetail);
router.get('/calculateTotalValue', authMiddleware, calculateTotalValue);

module.exports = router;
