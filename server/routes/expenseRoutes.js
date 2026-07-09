const express = require('express');
const { getExpenses, addExpense, deleteExpense, editExpense } = require('../controllers/expenseController');
const router = express.Router();

router.get('/:groupId/expenses', getExpenses);
router.post('/:groupId/expenses', addExpense);
router.put('/expenses/:expenseId', editExpense);
router.delete('/expenses/:expenseId', deleteExpense);

module.exports = router;
