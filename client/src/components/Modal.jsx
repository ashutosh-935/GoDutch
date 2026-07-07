export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="receipt-paper receipt-shadow w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold uppercase tracking-wider">{title}</h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold hover:opacity-60"
          >
            ×
          </button>
        </div>
        <hr className="receipt-separator" />
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
