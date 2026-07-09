import { useState } from 'react';
import ReceiptCard from './ReceiptCard';

export default function ReceiptStack({ members, expenses, transactions, groupName, groupId, currentDate }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (members.length === 0) {
    return <p className="text-sm italic text-gray-600">No members yet.</p>;
  }

  const selected = members[selectedIndex];

  return (
    <div>
      {/* Member selector tabs */}
      <div className="mb-1">
        <p className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-600">SELECT MEMBER</p>
        <div className="flex flex-wrap gap-2">
          {members.map((m, i) => (
            <button
              key={m._id}
              onClick={() => setSelectedIndex(i)}
              className="pos-button px-3 py-1 text-xs"
              style={selectedIndex === i ? { backgroundColor: '#111', color: '#f8f4e8' } : {}}
            >
              {m.name.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <hr className="receipt-separator" />

      {/* Individual receipt */}
      <ReceiptCard
        key={selected._id}
        member={selected}
        members={members}
        expenses={expenses}
        transactions={transactions}
        groupName={groupName}
        groupId={groupId}
        currentDate={currentDate}
      />
    </div>
  );
}
