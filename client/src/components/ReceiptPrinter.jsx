import { useState, useEffect } from 'react';
import ReceiptAnimation from './ReceiptAnimation';
import ReceiptStack from './ReceiptStack';

/**
 * Modal orchestrator for the receipt printing workflow.
 * Phase 1 — 'printing': shows thermal printer animation
 * Phase 2 — 'viewing':  shows per-member receipt stack
 */
export default function ReceiptPrinter({ isOpen, onClose, members, expenses, transactions, group, currentDate }) {
  const [phase, setPhase] = useState('printing');

  // Reset to animation each time the modal is opened
  useEffect(() => {
    if (isOpen) setPhase('printing');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
    >
      <div className="receipt-paper receipt-shadow w-full max-w-md my-8" style={{ minHeight: '200px' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-xl font-bold uppercase tracking-widest">
            {phase === 'printing' ? 'PRINTING...' : 'RECEIPTS'}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold hover:opacity-50 transition-opacity"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-6 pb-2">
          <hr className="receipt-separator" />
        </div>

        {phase === 'printing' ? (
          <div className="px-6 pb-6">
            <ReceiptAnimation onComplete={() => setPhase('viewing')} />
            <p className="text-center text-xs text-gray-500 uppercase tracking-wider mt-2">
              Generating {members.length} receipt{members.length !== 1 ? 's' : ''}...
            </p>
          </div>
        ) : (
          <div className="px-6 pb-6">
            <ReceiptStack
              members={members}
              expenses={expenses}
              transactions={transactions}
              groupName={group.name}
              groupId={group.groupId}
              currentDate={currentDate}
            />
          </div>
        )}
      </div>
    </div>
  );
}
