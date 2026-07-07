const express = require('express');
const { getExpenses, addExpense, deleteExpense } = require('../controllers/expenseController');
const router = express.Router();

router.get('/:groupId/expenses', getExpenses);
router.post('/:groupId/expenses', addExpense);
router.delete('/expenses/:expenseId', deleteExpense);

module.exports = router;
