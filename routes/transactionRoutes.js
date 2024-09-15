const express = require('express');
const { addTransaction, fetchTransactions } = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, addTransaction);

router.get('/', authMiddleware, fetchTransactions);

module.exports = router;
