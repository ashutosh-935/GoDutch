import { useState } from 'react';
import { printReceiptAsPDF } from './ReceiptPDF';

export default function ReceiptCard({ member, members, expenses, transactions, groupName, groupId, currentDate }) {
  const [shareStatus, setShareStatus] = useState('');

  const getMemberName = (id) => members.find(m => m._id === id)?.name || '?';

  // What this member paid for others
  const paidExpenses = expenses.filter(e => e.paidBy === member._id);
  const totalPaid = paidExpenses.reduce((sum, e) => sum + e.amount, 0);

  // This member's share across all expenses they participated in
  const totalOwed = expenses
    .filter(e => e.participants.includes(member._id))
    .reduce((sum, e) => sum + e.amount / e.participants.length, 0);

  const netBalance = totalPaid - totalOwed;

  // Settlement rows for this member
  const toCollect = transactions.filter(t => t.to === member._id);
  const toPay     = transactions.filter(t => t.from === member._id);

  const handleShare = async () => {
    const lines = [
      `GO DUTCH — ${groupName}`,
      `RECEIPT FOR: ${member.name.toUpperCase()}`,
      `DATE: ${currentDate}`,
      `ID: #${groupId.toUpperCase()}`,
      ``,
      `PAID BY YOU:   ₹${totalPaid.toFixed(2)}`,
      `YOUR SHARE:    ₹${totalOwed.toFixed(2)}`,
      ``,
      netBalance >= 0.01
        ? `YOU RECEIVE:   ₹${netBalance.toFixed(2)}`
        : netBalance <= -0.01
        ? `YOU PAY:       ₹${Math.abs(netBalance).toFixed(2)}`
        : `ALL SETTLED UP`,
      ``,
      `SETTLEMENTS:`,
      ...toCollect.map(t => `  ← ${getMemberName(t.from)} pays you  ₹${t.amount}`),
      ...toPay.map(t => `  → You pay ${getMemberName(t.to)}  ₹${t.amount}`),
      (toCollect.length === 0 && toPay.length === 0) ? `  All settled up!` : '',
      ``,
      `THANK YOU FOR GOING DUTCH`,
    ].filter(l => l !== undefined).join('\n');

    if (navigator.share) {
      try {
        await navigator.share({ title: `GoDutch — ${member.name}`, text: lines });
        setShareStatus('SHARED!');
      } catch {
        setShareStatus('');
      }
    } else {
      await navigator.clipboard.writeText(lines);
      setShareStatus('COPIED!');
    }
    setTimeout(() => setShareStatus(''), 2500);
  };

  const handlePrint = () => {
    printReceiptAsPDF({ member, members, expenses, transactions, groupName, groupId, currentDate });
  };

  return (
    <div className="receipt-paper w-full p-6" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* Header */}
      <div className="text-center mb-3">
        <p className="text-xs uppercase tracking-widest font-bold">GO DUTCH</p>
        <hr className="receipt-separator" />
        <p className="text-xs uppercase tracking-wider mt-2 text-gray-600">RECEIPT FOR</p>
        <p className="text-2xl font-bold uppercase tracking-wide mt-1">{member.name}</p>
        <p className="text-xs text-gray-500 mt-1">{currentDate} · #{groupId.toUpperCase()}</p>
      </div>

      <hr className="receipt-separator" />

      {/* Group */}
      <div className="flex justify-between text-xs mb-3">
        <span className="uppercase text-gray-500">Group</span>
        <span className="font-bold">{groupName}</span>
      </div>

      <hr className="receipt-separator" />

      {/* Paid by this member */}
      {paidExpenses.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-bold uppercase mb-2">PAID BY YOU</p>
          <div className="space-y-1">
            {paidExpenses.map(e => (
              <div key={e._id} className="flex justify-between text-xs">
                <span className="flex-1 mr-2 truncate">{e.description}</span>
                <span className="font-bold">₹{e.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs mt-2 pt-1 border-t border-dashed border-gray-400">
            <span className="uppercase">Subtotal</span>
            <span className="font-bold">₹{totalPaid.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Share of expenses */}
      <div className="flex justify-between text-xs mb-4">
        <span className="uppercase text-gray-500">Your Share of All Expenses</span>
        <span className="font-bold">₹{totalOwed.toFixed(2)}</span>
      </div>

      <hr className="receipt-separator" />

      {/* Net balance — prominent */}
      <div className="text-center py-4">
        {Math.abs(netBalance) < 0.01 ? (
          <>
            <p className="text-xs uppercase tracking-widest text-gray-500">STATUS</p>
            <p className="text-2xl font-bold uppercase mt-1">ALL SETTLED</p>
          </>
        ) : netBalance > 0 ? (
          <>
            <p className="text-xs uppercase tracking-widest text-gray-500">YOU RECEIVE</p>
            <p className="text-4xl font-bold mt-1">₹{netBalance.toFixed(2)}</p>
          </>
        ) : (
          <>
            <p className="text-xs uppercase tracking-widest text-gray-500">YOU PAY</p>
            <p className="text-4xl font-bold mt-1">₹{Math.abs(netBalance).toFixed(2)}</p>
          </>
        )}
      </div>

      <hr className="receipt-separator" />

      {/* Settlements */}
      <div className="mb-4">
        <p className="text-xs font-bold uppercase mb-2">SETTLEMENTS</p>
        {toCollect.length === 0 && toPay.length === 0 ? (
          <p className="text-xs italic text-gray-500">Nothing to settle.</p>
        ) : (
          <div className="space-y-2">
            {toCollect.map((t, i) => (
              <div key={`c-${i}`} className="flex justify-between text-xs">
                <span>← {getMemberName(t.from)} pays you</span>
                <span className="font-bold">₹{t.amount}</span>
              </div>
            ))}
            {toPay.map((t, i) => (
              <div key={`p-${i}`} className="flex justify-between text-xs">
                <span>→ You pay {getMemberName(t.to)}</span>
                <span className="font-bold">₹{t.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className="receipt-separator" />

      {/* Footer */}
      <p className="text-center text-xs font-bold uppercase tracking-widest mt-3 mb-4">
        THANK YOU FOR GOING DUTCH
      </p>

      {/* Actions */}
      <div className="flex gap-2 no-print">
        <button
          onClick={handleShare}
          className="pos-button flex-1 py-2 text-xs"
        >
          {shareStatus || 'SHARE'}
        </button>
        <button
          onClick={handlePrint}
          className="pos-button flex-1 py-2 text-xs"
        >
          SAVE PDF
        </button>
      </div>
    </div>
  );
}
