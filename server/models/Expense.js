const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paidBy: {
    type: String,
    required: true,
  },
  participants: [{
    type: String,
    required: true,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Expense', expenseSchema);
