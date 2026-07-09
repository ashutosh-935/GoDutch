import { useEffect, useState } from 'react';

/**
 * Plays a brief thermal printer animation then fires onComplete.
 * The receipt paper "feeds out" of the printer slot via CSS keyframe.
 */
export default function ReceiptAnimation({ onComplete }) {
  const [dots, setDots] = useState('.');

  // Animate ellipsis while printing
  useEffect(() => {
    const iv = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 400);
    return () => clearInterval(iv);
  }, []);

  // Auto-advance after animation duration
  useEffect(() => {
    const t = setTimeout(onComplete, 2000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center py-4" aria-label="Printing receipts">
      {/* Printer body */}
      <div
        className="rounded-xl p-4 w-64 shadow-2xl border-b-4"
        style={{ backgroundColor: '#3a3a3a', borderColor: '#222' }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" style={{ animation: 'pulseGreen 1s infinite' }} />
          </div>
          <p className="text-xs font-mono uppercase" style={{ color: '#aaa' }}>THERMAL PRN</p>
        </div>

        {/* Status LED strip */}
        <div
          className="flex items-center justify-center gap-1 mb-3 px-2 py-1 rounded"
          style={{ backgroundColor: '#222' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: 'pulseGreen 0.8s infinite' }} />
          <span className="text-xs font-mono" style={{ color: '#33ff33', textShadow: '0 0 4px #33ff33' }}>
            PRINTING{dots}
          </span>
        </div>

        {/* Paper slot */}
        <div
          className="rounded h-3 flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          <div
            className="h-full"
            style={{
              width: '60%',
              background: '#f8f4e8',
              animation: 'slotPulse 0.4s ease-in-out infinite alternate',
            }}
          />
        </div>
      </div>

      {/* Receipt paper feeding out */}
      <div
        className="overflow-hidden shadow-lg"
        style={{
          width: '200px',
          backgroundColor: '#f8f4e8',
          animation: 'feedOut 1.8s cubic-bezier(0.4,0,0.2,1) forwards',
          transformOrigin: 'top center',
        }}
      >
        {/* Simulated receipt lines */}
        {[
          '80%', '55%', '70%', '40%', '80%', '60%',
          '100%', '50%', '65%', '80%', '40%', '70%',
        ].map((w, i) => (
          <div
            key={i}
            style={{
              height: '7px',
              width: w,
              backgroundColor: i === 6 ? '#aaa' : '#ccc',
              margin: '6px 12px',
              borderRadius: '2px',
              opacity: 0.8,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes feedOut {
          0%   { max-height: 0px;   opacity: 0; }
          15%  { opacity: 1; }
          100% { max-height: 200px; opacity: 1; }
        }
        @keyframes pulseGreen {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @keyframes slotPulse {
          from { opacity: 0.3; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
