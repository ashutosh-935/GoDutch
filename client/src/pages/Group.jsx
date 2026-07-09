import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import POSTerminal from '../components/POSTerminal';
import { useTerminal } from '../components/TerminalContext';
import { useSound } from '../components/SoundManager';
import ReceiptPrinter from '../components/ReceiptPrinter';

/* ── Balance algorithm (unchanged) ── */
function calculateBalances(members, expenses) {
  const balances = {};
  members.forEach(m => (balances[m._id] = 0));
  expenses.forEach(expense => {
    const per = expense.amount / expense.participants.length;
    balances[expense.paidBy] += expense.amount;
    expense.participants.forEach(id => { balances[id] -= per; });
  });
  const debtors = [], creditors = [];
  Object.entries(balances).forEach(([id, bal]) => {
    if (bal < -0.01) debtors.push({ id, amount: -bal });
    else if (bal > 0.01) creditors.push({ id, amount: bal });
  });
  const transactions = [];
  while (debtors.length > 0 && creditors.length > 0) {
    const d = debtors[0], c = creditors[0];
    const amt = Math.min(d.amount, c.amount);
    transactions.push({ from: d.id, to: c.id, amount: Math.round(amt * 100) / 100 });
    d.amount -= amt; c.amount -= amt;
    if (d.amount < 0.01) debtors.shift();
    if (c.amount < 0.01) creditors.shift();
  }
  return transactions;
}

export default function Group() {
  const { groupId } = useParams();
  const [group,    setGroup]    = useState(null);
  const [members,  setMembers]  = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  /* Console state */
  const [activeMode, setActiveMode] = useState('idle'); // 'idle' | 'add_member' | 'add_expense' | 'edit_expense'
  const [receiptPrinterOpen, setReceiptPrinterOpen] = useState(false);

  /* Member input */
  const [newMemberInput,   setNewMemberInput]   = useState('');
  const [newMemberPreview, setNewMemberPreview] = useState([]);
  const [showMemberSuccess, setShowMemberSuccess] = useState(null);
  const [deleteError,       setDeleteError]       = useState('');
  const [copySuccess,       setCopySuccess]       = useState(false);

  /* Expense input */
  const [newExpense, setNewExpense] = useState({
    description: '', amount: '', paidBy: '', participants: [], splitMode: 'everyone',
  });
  const [editExpenseId, setEditExpenseId] = useState(null);

  const { addTerminalLog, markLogComplete } = useTerminal();
  const { isMuted, setIsMuted, playConfirmBeep } = useSound();

  /* ── Data fetching ── */
  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [gRes, mRes, eRes] = await Promise.all([
        api.get(`/groups/${groupId}`),
        api.get(`/groups/${groupId}/members`),
        api.get(`/groups/${groupId}/expenses`),
      ]);
      setGroup(gRes.data); setMembers(mRes.data); setExpenses(eRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load group');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, [groupId]);

  /* Parse member textarea input */
  useEffect(() => {
    if (!newMemberInput) { setNewMemberPreview([]); return; }
    const names = [...new Set(
      newMemberInput.split(/[\n,]/).map(n => n.trim()).filter(n => n.length > 0)
    )];
    setNewMemberPreview(names);
  }, [newMemberInput]);

  /* Auto-select all on 'everyone' split mode */
  useEffect(() => {
    if (newExpense.splitMode === 'everyone') {
      setNewExpense(prev => ({ ...prev, participants: members.map(m => m._id) }));
    }
  }, [newExpense.splitMode, members]);

  /* ── Handlers ── */
  const handleAddMember = async (e) => {
    if (e) e.preventDefault();
    if (newMemberPreview.length === 0) return;
    const logId = addTerminalLog([`> ADD MEMBER`, `> ${newMemberPreview.join(', ')}`, '> PROCESSING...'], 'working');
    try {
      const res = await api.post(`/groups/${groupId}/members`, { members: newMemberPreview });
      markLogComplete(logId, true); playConfirmBeep();
      setNewMemberInput(''); setNewMemberPreview([]);
      setShowMemberSuccess(res.data.count);
      setTimeout(() => setShowMemberSuccess(null), 3000);
      setActiveMode('idle'); fetchData();
    } catch (err) {
      markLogComplete(logId, false);
      setError(err.response?.data?.message || 'Failed to add members');
    }
  };

  const handleDeleteMember = async (memberId) => {
    const name = members.find(m => m._id === memberId)?.name || 'member';
    const logId = addTerminalLog([`> REMOVE MEMBER`, `> ${name}`], 'working');
    setDeleteError('');
    try {
      await api.delete(`/groups/${groupId}/members/${memberId}`);
      markLogComplete(logId, true); fetchData();
    } catch (err) {
      markLogComplete(logId, false);
      setDeleteError(err.response?.data?.message || 'Cannot delete member involved in expenses');
      setTimeout(() => setDeleteError(''), 4000);
    }
  };

  const handleAddExpense = async (e) => {
    if (e) e.preventDefault();
    const participants = newExpense.splitMode === 'everyone'
      ? members.map(m => m._id)
      : newExpense.participants;
    if (!newExpense.description || !newExpense.amount || !newExpense.paidBy || participants.length === 0) return;
    const paidByName = members.find(m => m._id === newExpense.paidBy)?.name || '?';
    const logId = addTerminalLog(
      [`> ADD EXPENSE`, `> ${newExpense.description}`, `> ₹${newExpense.amount} — ${paidByName}`],
      'working'
    );
    try {
      await api.post(`/groups/${groupId}/expenses`, {
        ...newExpense, amount: parseFloat(newExpense.amount), participants,
      });
      markLogComplete(logId, true); playConfirmBeep();
      setNewExpense({ description: '', amount: '', paidBy: '', participants: [], splitMode: 'everyone' });
      setActiveMode('idle'); fetchData();
    } catch (err) {
      markLogComplete(logId, false);
      setError(err.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleEditExpenseSubmit = async (e) => {
    if (e) e.preventDefault();
    const participants = newExpense.splitMode === 'everyone'
      ? members.map(m => m._id)
      : newExpense.participants;
    if (!newExpense.description || !newExpense.amount || !newExpense.paidBy || participants.length === 0) return;
    const paidByName = members.find(m => m._id === newExpense.paidBy)?.name || '?';
    const logId = addTerminalLog(
      [`> EDIT EXPENSE`, `> ${newExpense.description}`, `> ₹${newExpense.amount} — ${paidByName}`],
      'working'
    );
    try {
      await api.put(`/groups/expenses/${editExpenseId}`, {
        ...newExpense, amount: parseFloat(newExpense.amount), participants,
      });
      markLogComplete(logId, true); playConfirmBeep();
      setNewExpense({ description: '', amount: '', paidBy: '', participants: [], splitMode: 'everyone' });
      setEditExpenseId(null);
      setActiveMode('idle'); fetchData();
    } catch (err) {
      markLogComplete(logId, false);
      setError(err.response?.data?.message || 'Failed to edit expense');
    }
  };

  const initiateEditExpense = (expense) => {
    setNewExpense({
      description: expense.description,
      amount: expense.amount,
      paidBy: expense.paidBy,
      participants: expense.participants,
      splitMode: expense.participants.length === members.length ? 'everyone' : 'custom',
    });
    setEditExpenseId(expense._id);
    setActiveMode('edit_expense');
  };

  const handleDeleteExpense = async (expenseId) => {
    const desc = expenses.find(e => e._id === expenseId)?.description || 'expense';
    const logId = addTerminalLog([`> VOID EXPENSE`, `> ${desc}`], 'working');
    try {
      await api.delete(`/groups/expenses/${expenseId}`);
      markLogComplete(logId, true); fetchData();
    } catch (err) {
      markLogComplete(logId, false);
      setError(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    addTerminalLog(['> COPY LINK', '> URL COPIED TO CLIPBOARD'], 'success');
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handlePrintReceipt = () => window.print();

  /* ── Derived data ── */
  const balances   = calculateBalances(members, expenses);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).toUpperCase();

  /* ── Loading / Error ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="machine-body w-full max-w-sm">
          <div className="machine-display text-center py-12">
            <p className="text-sm uppercase tracking-widest">LOADING...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="machine-body w-full max-w-sm">
          <div className="machine-display text-center py-10">
            <p className="text-sm uppercase font-bold mb-4" style={{ color: '#b00' }}>{error || 'GROUP NOT FOUND'}</p>
            <Link to="/"><button className="machine-key" style={{ width: 'auto', padding: '8px 20px' }}>← BACK HOME</button></Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 py-8 lg:p-12">
      {/* Container switches from mobile layout (max-w-sm) to desktop dashboard (max-w-6xl) */}
      <div className="machine-body w-full max-w-sm lg:max-w-6xl transition-all duration-300">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* ── COLUMN 1: CRT Screen & Status (lg:col-span-4) ── */}
          <div className="flex flex-col lg:col-span-4 h-full">
            {/* Top Bar */}
            <div className="machine-topbar mb-4">
              <div className="flex gap-2 items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" style={{ boxShadow: '0 0 4px rgba(239,68,68,0.6)' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" style={{ boxShadow: '0 0 4px rgba(250,204,21,0.6)' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 4px rgba(74,222,128,0.6)' }} />
              </div>
              <p className="text-xs font-mono tracking-widest uppercase" style={{ color: '#555' }}>GoDutch POS</p>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-xs hover:text-gray-300 transition-colors"
                style={{ color: '#555' }}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>

            {/* CRT Screen */}
            <div className="screen-bezel flex-1 min-h-[250px] lg:min-h-[400px] flex flex-col">
              <div className="flex-1 overflow-hidden relative">
                 <POSTerminal embedded />
              </div>
            </div>

            <div className="machine-sep hidden lg:block my-6" />

            {/* Status Messages */}
            <div className="machine-status no-print py-2">
              {showMemberSuccess && <span style={{ color: '#7ee87e' }}>✓ ADDED {showMemberSuccess} MEMBER{showMemberSuccess !== 1 ? 'S' : ''}</span>}
              {deleteError && <span style={{ color: '#ff7070' }}>{deleteError}</span>}
              {copySuccess && <span style={{ color: '#7ee87e' }}>✓ LINK COPIED!</span>}
              {error       && <span style={{ color: '#ff7070' }}>{error}</span>}
            </div>

            {/* Quick Actions at bottom left */}
            <div className="grid grid-cols-2 gap-2 mt-auto no-print pt-4">
              <button className="machine-key" onClick={copyLink}>COPY LINK</button>
              <Link to="/" style={{ display: 'block' }}>
                <button className="machine-key" style={{ fontSize: '10px' }}>← BACK HOME</button>
              </Link>
            </div>
          </div>

          <div className="machine-sep lg:hidden my-4" />

          {/* ── COLUMN 2: The Console / Keypad (lg:col-span-4) ── */}
          <div className="flex flex-col lg:col-span-4 lg:border-l lg:border-r lg:border-[#222] lg:px-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-center mb-6 hidden lg:block" style={{ color: '#666' }}>Input Console</h2>
            
            {activeMode === 'idle' && (
              <div className="machine-keypad no-print mt-4 flex-1 justify-center">
                <button className="machine-key mb-6 py-5 text-sm" onClick={() => setActiveMode('add_member')}>
                  + ADD MEMBER
                </button>
                <button
                  className="machine-key mb-6 py-5 text-sm"
                  onClick={() => setActiveMode('add_expense')}
                  disabled={members.length === 0}
                >
                  + ADD EXPENSE
                </button>
                <button
                  className="machine-key machine-key-accent py-5 text-sm"
                  onClick={() => setReceiptPrinterOpen(true)}
                  disabled={members.length === 0 || expenses.length === 0}
                >
                  PRINT RECEIPTS
                </button>
              </div>
            )}

            {activeMode === 'add_member' && (
              <form onSubmit={handleAddMember} className="flex flex-col flex-1 text-[#ccc]">
                <div className="mb-4">
                  <label className="block text-sm font-bold uppercase mb-1 text-[#999]">ENTER MEMBER NAMES</label>
                  <p className="text-xs mb-2" style={{ color: '#666' }}>Separate with commas or new lines</p>
                  <textarea
                    value={newMemberInput}
                    onChange={e => setNewMemberInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddMember(e);
                      }
                    }}
                    placeholder={"Ashutosh\\nRahul, Aman"}
                    rows={5}
                    className="w-full px-3 py-2 border-2 border-[#1a1a1a] bg-[#0a0a0a] font-mono focus:outline-none focus:border-[#333] resize-none text-sm text-[#4ade80] rounded"
                    style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}
                    autoFocus
                  />
                </div>
                {newMemberPreview.length > 0 && (
                  <div className="mb-4 bg-[#0a0a0a] p-3 border-2 border-[#1a1a1a] rounded" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
                    <label className="block text-xs font-bold uppercase mb-2 text-[#999]">MEMBERS TO ADD ({newMemberPreview.length})</label>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {newMemberPreview.map((name, i) => (
                        <p key={i} className="text-xs text-[#4ade80]">✓ {name}</p>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 mt-auto pt-4 no-print">
                  <button type="button" onClick={() => { setNewMemberInput(''); setNewMemberPreview([]); setActiveMode('idle'); }} className="machine-key flex-1">
                    CANCEL
                  </button>
                  <button type="submit" disabled={newMemberPreview.length === 0} className="machine-key machine-key-accent flex-1">
                    ADD {newMemberPreview.length > 0 ? `(${newMemberPreview.length})` : ''}
                  </button>
                </div>
              </form>
            )}

            {(activeMode === 'add_expense' || activeMode === 'edit_expense') && (
              <form onSubmit={activeMode === 'edit_expense' ? handleEditExpenseSubmit : handleAddExpense} className="flex flex-col flex-1 text-[#ccc] pr-1">
                <div className="space-y-4 flex-1 overflow-y-auto">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1 text-[#999]">DESCRIPTION</label>
                    <input
                      type="text"
                      value={newExpense.description}
                      onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          activeMode === 'edit_expense' ? handleEditExpenseSubmit(e) : handleAddExpense(e);
                        }
                      }}
                      placeholder="What was it for?"
                      className="w-full px-3 py-2 border-2 border-[#1a1a1a] bg-[#0a0a0a] font-mono focus:outline-none focus:border-[#333] text-sm text-[#4ade80] rounded"
                      style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1 text-[#999]">AMOUNT (₹)</label>
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          activeMode === 'edit_expense' ? handleEditExpenseSubmit(e) : handleAddExpense(e);
                        }
                      }}
                      placeholder="0"
                      step="0.01"
                      className="w-full px-3 py-2 border-2 border-[#1a1a1a] bg-[#0a0a0a] font-mono focus:outline-none focus:border-[#333] text-sm text-[#4ade80] rounded"
                      style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1 text-[#999]">PAID BY</label>
                    <select
                      value={newExpense.paidBy}
                      onChange={e => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-[#1a1a1a] bg-[#0a0a0a] font-mono focus:outline-none focus:border-[#333] text-sm text-[#4ade80] rounded"
                      style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}
                    >
                      <option value="" className="text-gray-500">Select who paid</option>
                      {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1 text-[#999]">SPLIT MODE</label>
                    <div className="flex gap-4">
                      {['everyone', 'custom'].map(mode => (
                        <label key={mode} className="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                          <input
                            type="radio" name="splitMode" value={mode}
                            checked={newExpense.splitMode === mode}
                            onChange={e => setNewExpense({ ...newExpense, splitMode: e.target.value })}
                            className="accent-green-600"
                          />
                          <span className="capitalize">{mode}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {newExpense.splitMode === 'custom' && (
                    <div className="bg-[#0a0a0a] p-3 border-2 border-[#1a1a1a] rounded max-h-32 overflow-y-auto" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
                      <label className="block text-xs font-bold uppercase mb-2 text-[#999]">SPLIT BETWEEN</label>
                      <div className="space-y-1">
                        {members.map(m => (
                          <label key={m._id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                            <input
                              type="checkbox"
                              checked={newExpense.participants.includes(m._id)}
                              onChange={e => setNewExpense(prev => ({
                                ...prev,
                                participants: e.target.checked
                                  ? [...prev.participants, m._id]
                                  : prev.participants.filter(id => id !== m._id),
                              }))}
                              className="accent-green-600"
                            />
                            <span className="text-[#4ade80]">{m.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4 pb-2 no-print">
                  <button type="button" onClick={() => { setNewExpense({ description: '', amount: '', paidBy: '', participants: [], splitMode: 'everyone' }); setEditExpenseId(null); setActiveMode('idle'); }} className="machine-key flex-1">
                    CANCEL
                  </button>
                  <button type="submit" className="machine-key machine-key-accent flex-1">
                    {activeMode === 'edit_expense' ? 'UPDATE' : 'ADD'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="machine-sep lg:hidden my-4" />

          {/* ── COLUMN 3: Receipt Printer (lg:col-span-4) ── */}
          <div className="flex flex-col lg:col-span-4 h-[60vh] lg:h-full relative">
            <h2 className="text-xs font-bold uppercase tracking-wider text-center mb-6 hidden lg:block" style={{ color: '#666' }}>Output Roll</h2>
            <div className="machine-display flex-1 overflow-y-auto relative z-10" style={{ maxHeight: '100%' }}>

              {/* Header */}
              <div className="text-center mb-3">
                <p className="text-xs tracking-widest" style={{ color: '#888' }}>━━━━━━━━━━━━━━━━━━━━</p>
                <h1 className="text-xl font-bold uppercase tracking-widest mt-1 mb-1">GO DUTCH</h1>
                <p className="text-xs tracking-widest" style={{ color: '#888' }}>━━━━━━━━━━━━━━━━━━━━</p>
              </div>

              <hr className="receipt-separator" />

              {/* Group info */}
              <div className="mb-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold uppercase tracking-wide">Group</span>
                  <span>{group.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-bold uppercase tracking-wide">Date</span>
                  <span>{currentDate}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-bold uppercase tracking-wide">Receipt ID</span>
                  <span>#{group.groupId.toUpperCase()}</span>
                </div>
              </div>

              <hr className="receipt-separator" />

              {/* Members */}
              <div className="mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider mb-2">MEMBERS</h2>
                {members.length === 0 ? (
                  <p className="text-xs italic" style={{ color: '#888' }}>No members yet</p>
                ) : (
                  <div className="space-y-1">
                    {members.map(m => (
                      <div key={m._id} className="flex items-center justify-between text-xs">
                        <span>• {m.name}</span>
                        <button
                          onClick={() => handleDeleteMember(m._id)}
                          className="no-print hover:underline text-xs"
                          style={{ color: '#b00' }}
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
              <div className="mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider mb-2">EXPENSES</h2>
                {expenses.length === 0 ? (
                  <p className="text-xs italic" style={{ color: '#888' }}>No expenses yet</p>
                ) : (
                  <div className="space-y-3">
                    {expenses.map(expense => {
                      const paidBy = members.find(m => m._id === expense.paidBy);
                      const parts  = expense.participants
                        .map(id => members.find(m => m._id === id)?.name)
                        .filter(Boolean);
                      return (
                        <div key={expense._id} className="typewriter">
                          <div className="flex justify-between items-start text-xs">
                            <div className="flex-1 mr-3">
                              <p className="font-bold">{expense.description}</p>
                              <p style={{ color: '#666' }}>Paid by {paidBy?.name}</p>
                              {parts.length > 0 && (
                                <p style={{ color: '#888' }}>Split: {parts.join(', ')}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold">₹{expense.amount}</p>
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => initiateEditExpense(expense)}
                                  className="no-print hover:underline text-xs"
                                  style={{ color: '#0077b6' }}
                                >
                                  [EDIT]
                                </button>
                                <button
                                  onClick={() => handleDeleteExpense(expense._id)}
                                  className="no-print hover:underline text-xs"
                                  style={{ color: '#b00' }}
                                >
                                  [X]
                                </button>
                              </div>
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
              <div className="flex justify-between items-baseline mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider">TOTAL SPENT</h2>
                <p className="text-lg font-bold">₹{totalSpent}</p>
              </div>

              <hr className="receipt-separator" />

              {/* Balances */}
              <div className="mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider mb-2">BALANCES</h2>
                {balances.length === 0 ? (
                  <p className="text-xs italic" style={{ color: '#888' }}>All settled up!</p>
                ) : (
                  <div className="space-y-2">
                    {balances.map((b, i) => {
                      const from = members.find(m => m._id === b.from);
                      const to   = members.find(m => m._id === b.to);
                      return (
                        <div key={i} className="typewriter text-xs">
                          <p className="font-bold">{from?.name}</p>
                          <p className="ml-3" style={{ color: '#555' }}>→ owes {to?.name}</p>
                          <p className="ml-6 font-bold">₹{b.amount}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <hr className="receipt-separator" />

              <p className="text-center text-xs font-bold uppercase tracking-widest mt-2 mb-4">
                THANK YOU FOR GOING DUTCH
              </p>
            </div>
            
            {/* The slot from which the receipt comes out */}
            <div className="receipt-slot mt-2 lg:mt-4 z-20" />
            
            <div className="text-center mt-2 lg:hidden">
              <button className="machine-key" onClick={handlePrintReceipt}>PRINT PAGE</button>
            </div>
          </div>

        </div>
      </div>

      {/* ── ReceiptPrinter modal ── */}
      <ReceiptPrinter
        isOpen={receiptPrinterOpen}
        onClose={() => setReceiptPrinterOpen(false)}
        members={members}
        expenses={expenses}
        transactions={balances}
        group={group}
        currentDate={currentDate}
      />
    </div>
  );
}
