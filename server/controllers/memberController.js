const Member = require('../models/Member');
const Expense = require('../models/Expense');

const getMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const members = await Member.find({ groupId });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    if (req.body.members && Array.isArray(req.body.members)) {
      // Bulk import
      const memberNames = req.body.members
        .map(name => name.trim())
        .filter(name => name.length > 0);
      
      if (memberNames.length === 0) {
        return res.status(400).json({ message: 'No valid member names provided' });
      }
      
      // Remove duplicates
      const uniqueNames = [...new Set(memberNames)];
      
      // Create members
      const membersToAdd = uniqueNames.map(name => ({ groupId, name }));
      const newMembers = await Member.insertMany(membersToAdd);
      
      res.status(201).json({ members: newMembers, count: newMembers.length });
    } else {
      // Single member (backwards compatible)
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'Member name is required' });
      }
      
      const member = new Member({ groupId, name });
      await member.save();
      
      res.status(201).json(member);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;

    const expenses = await Expense.find({ groupId });
    const isInvolved = expenses.some(expense => 
      expense.paidBy === memberId || expense.participants.includes(memberId)
    );

    if (isInvolved) {
      return res.status(400).json({ message: 'Cannot delete member involved in expenses' });
    }

    const member = await Member.findByIdAndDelete(memberId);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMembers, addMember, deleteMember };
