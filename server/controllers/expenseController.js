const Expense = require('../models/Expense');

const getExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;
    const expenses = await Expense.find({ groupId }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addExpense = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { description, amount, paidBy, participants } = req.body;

    if (!description || !amount || !paidBy || !participants || participants.length === 0) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const expense = new Expense({ groupId, description, amount, paidBy, participants });
    await expense.save();

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const expense = await Expense.findByIdAndDelete(expenseId);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const editExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { description, amount, paidBy, participants } = req.body;

    if (!description || !amount || !paidBy || !participants || participants.length === 0) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const expense = await Expense.findByIdAndUpdate(
      expenseId,
      { description, amount, paidBy, participants },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getExpenses, addExpense, deleteExpense, editExpense };
