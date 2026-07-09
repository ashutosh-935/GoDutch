import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="machine-body w-full max-w-sm">

        <div className="machine-topbar">
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <p className="text-xs font-mono tracking-widest uppercase" style={{ color: '#555' }}>GoDutch POS</p>
          <div className="w-6" />
        </div>

        {/* Error screen */}
        <div className="screen-bezel">
          <div
            className="bg-green-950 rounded-lg p-4"
            style={{ fontFamily: 'IBM Plex Mono, monospace', minHeight: '80px' }}
          >
            <p className="text-xs" style={{ color: '#ff5555' }}>✗ RECEIPT NOT FOUND</p>
            <p className="text-xs mt-1" style={{ color: '#33ff33' }}>&gt; ERROR 404</p>
            <p className="text-xs" style={{ color: '#33ff33' }}>&gt; _</p>
          </div>
        </div>

        <div className="machine-sep" />

        <div className="machine-display" style={{ maxHeight: '220px' }}>
          <div className="text-center mb-3">
            <h1 className="text-xl font-bold uppercase tracking-widest">GO DUTCH</h1>
          </div>
          <hr className="receipt-separator" />
          <div className="text-center my-4">
            <p className="text-sm font-bold uppercase mb-3">RECEIPT NOT FOUND</p>
            <p className="text-xs" style={{ color: '#666' }}>We couldn't find this expense group.</p>
          </div>
          <hr className="receipt-separator" />
          <div className="text-xs mt-3" style={{ color: '#555' }}>
            <p className="font-bold uppercase mb-1">Possible reasons:</p>
            <p>· Link is incorrect</p>
            <p>· Group was deleted</p>
            <p>· Receipt has expired</p>
          </div>
        </div>

        <div className="machine-sep" />

        <div className="machine-keypad">
          <Link to="/" style={{ display: 'block' }}>
            <button className="machine-key machine-key-accent">← RETURN HOME</button>
          </Link>
        </div>

        <div className="machine-sep" />
        <div className="receipt-slot" />
      </div>
    </div>
  );
}
