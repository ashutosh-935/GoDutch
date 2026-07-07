import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import Button from '../components/Button';
import Modal from '../components/Modal';

function calculateBalances(members, expenses) {
  const balances = {};
  members.forEach(m => balances[m._id] = 0);

  expenses.forEach(expense => {
    const amountPerPerson = expense.amount / expense.participants.length;
    balances[expense.paidBy] += expense.amount;
    expense.participants.forEach(id => {
      balances[id] -= amountPerPerson;
    });
  });

  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([id, balance]) => {
    if (balance < -0.01) {
      debtors.push({ id, amount: -balance });
    } else if (balance > 0.01) {
      creditors.push({ id, amount: balance });
    }
  });

  const transactions = [];

  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];
    const amount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      from: debtor.id,
      to: creditor.id,
      amount: Math.round(amount * 100) / 100,
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) debtors.shift();
    if (creditor.amount < 0.01) creditors.shift();
  }

  return transactions;
}

export default function Group() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [addMemberModal, setAddMemberModal] = useState(false);
  const [addExpenseModal, setAddExpenseModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: '',
    participants: [],
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [groupRes, membersRes, expensesRes] = await Promise.all([
        api.get(`/groups/${groupId}`),
        api.get(`/groups/${groupId}/members`),
        api.get(`/groups/${groupId}/expenses`),
      ]);
      setGroup(groupRes.data);
      setMembers(membersRes.data);
      setExpenses(expensesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    try {
      await api.post(`/groups/${groupId}/members`, { name: newMemberName });
      setNewMemberName('');
      setAddMemberModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleDeleteMember = async (memberId) => {
    try {
      await api.delete(`/groups/${groupId}/members/${memberId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete member');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount || !newExpense.paidBy || newExpense.participants.length === 0) {
      return;
    }

    try {
      await api.post(`/groups/${groupId}/expenses`, {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
      });
      setNewExpense({ description: '', amount: '', paidBy: '', participants: [] });
      setAddExpenseModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await api.delete(`/groups/expenses/${expenseId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const balances = calculateBalances(members, expenses);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="receipt-paper receipt-shadow w-full max-w-md p-8 text-center">
          <p className="text-lg uppercase">LOADING...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="receipt-paper receipt-shadow w-full max-w-md p-8 text-center">
          <p className="text-red-800 text-lg uppercase mb-4">{error || 'GROUP NOT FOUND'}</p>
          <Link to="/">
            <Button>← BACK HOME</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 py-12">
      <div className="receipt-paper receipt-shadow w-full max-w-md p-8 relative">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold uppercase tracking-widest">GO DUTCH</h1>
        </div>
        
        <hr className="receipt-separator" />
        
        {/* Group Info */}
        <div className="mb-6">
          <div className="mb-4">
            <p className="text-sm font-bold uppercase tracking-wider">GROUP</p>
            <p className="text-lg mt-1">{group.name}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm font-bold uppercase tracking-wider">DATE</p>
            <p className="text-lg mt-1">{currentDate}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm font-bold uppercase tracking-wider">RECEIPT ID</p>
            <p className="text-lg mt-1">#{group.groupId.toUpperCase()}</p>
          </div>
        </div>
        
        <hr className="receipt-separator" />
        
        {/* Members */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4">MEMBERS</h2>
          {members.length === 0 ? (
            <p className="text-gray-600 text-sm italic">No members yet</p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member._id} className="flex items-center justify-between">
                  <span>• {member.name}</span>
                  <button
                    onClick={() => handleDeleteMember(member._id)}
                    className="text-xs text-red-700 hover:underline"
                  >
                    [X]
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <hr className="receipt-separator" />
        
        {/* Expenses */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4">EXPENSES</h2>
          {expenses.length === 0 ? (
            <p className="text-gray-600 text-sm italic">No expenses yet</p>
          ) : (
            <div className="space-y-6">
              {expenses.map((expense) => {
                const paidByMember = members.find(m => m._id === expense.paidBy);
                const participantNames = expense.participants
                  .map(id => members.find(m => m._id === id)?.name)
                  .filter(Boolean);
                return (
                  <div key={expense._id} className="typewriter">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-xs text-gray-600 mt-1">Paid by {paidByMember?.name}</p>
                        {participantNames.length > 0 && (
                          <div className="mt-1">
                            <p className="text-xs text-gray-600">Split:</p>
                            {participantNames.map((name, i) => (
                              <p key={i} className="text-xs text-gray-700">  {name}</p>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold">₹{expense.amount}</p>
                        <button
                          onClick={() => handleDeleteExpense(expense._id)}
                          className="text-xs text-red-700 hover:underline mt-1 block"
                        >
                          [X]
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <hr className="receipt-separator" />
        
        {/* Total */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2">TOTAL SPENT</h2>
          <p className="text-2xl font-bold">₹{totalSpent}</p>
        </div>
        
        <hr className="receipt-separator" />
        
        {/* Balances */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4">BALANCES</h2>
          {balances.length === 0 ? (
            <p className="text-gray-600 text-sm italic">All settled up!</p>
          ) : (
            <div className="space-y-4">
              {balances.map((balance, index) => {
                const fromMember = members.find(m => m._id === balance.from);
                const toMember = members.find(m => m._id === balance.to);
                return (
                  <div key={index} className="typewriter">
                    <p>{fromMember?.name}</p>
                    <p className="ml-4">→ owes {toMember?.name}</p>
                    <p className="ml-8 font-bold">₹{balance.amount}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <hr className="receipt-separator" />
        
        {/* Buttons */}
        <div className="space-y-3 mt-6">
          <Button onClick={() => setAddMemberModal(true)} className="w-full">
            + ADD MEMBER
          </Button>
          <Button onClick={() => setAddExpenseModal(true)} disabled={members.length === 0} className="w-full">
            + ADD EXPENSE
          </Button>
          <Button onClick={copyLink} className="w-full">
            COPY GROUP LINK
          </Button>
          <Link to="/" className="block">
            <Button className="w-full">← BACK HOME</Button>
          </Link>
        </div>
        
        {/* Footer */}
        <div className="mt-10 text-center">
          <hr className="receipt-separator" />
          <p className="text-sm uppercase tracking-wider mt-4 font-bold">
            THANK YOU FOR GOING DUTCH
          </p>
        </div>
      </div>

      <Modal isOpen={addMemberModal} onClose={() => setAddMemberModal(false)} title="Add Member">
        <form onSubmit={handleAddMember}>
          <div className="mb-4">
            <label className="block text-sm font-bold uppercase mb-2">NAME</label>
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Enter name"
              className="w-full px-3 py-2 border-2 border-gray-800 bg-white font-mono focus:outline-none"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" onClick={() => setAddMemberModal(false)} className="flex-1">
              CANCEL
            </Button>
            <Button type="submit" className="flex-1">ADD</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={addExpenseModal} onClose={() => setAddExpenseModal(false)} title="Add Expense">
        <form onSubmit={handleAddExpense}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold uppercase mb-2">DESCRIPTION</label>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder="What was it for?"
                className="w-full px-3 py-2 border-2 border-gray-800 bg-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase mb-2">AMOUNT (₹)</label>
              <input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="0"
                step="0.01"
                className="w-full px-3 py-2 border-2 border-gray-800 bg-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase mb-2">PAID BY</label>
              <select
                value={newExpense.paidBy}
                onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-800 bg-white font-mono focus:outline-none"
              >
                <option value="">Select who paid</option>
                {members.map(member => (
                  <option key={member._id} value={member._id}>{member.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold uppercase mb-2">SPLIT BETWEEN</label>
              <div className="space-y-2">
                {members.map(member => (
                  <label key={member._id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newExpense.participants.includes(member._id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setNewExpense(prev => ({
                          ...prev,
                          participants: checked
                            ? [...prev.participants, member._id]
                            : prev.participants.filter(id => id !== member._id),
                        }));
                      }}
                      className="rounded border-2 border-gray-800"
                    />
                    <span>{member.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button type="button" onClick={() => setAddExpenseModal(false)} className="flex-1">
              CANCEL
            </Button>
            <Button type="submit" className="flex-1">ADD</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
