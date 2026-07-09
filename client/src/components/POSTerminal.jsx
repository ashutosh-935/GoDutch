import { useEffect, useRef, useState } from 'react';
import { useTerminal } from './TerminalContext';
import { useSound } from './SoundManager';

/**
 * embedded=false → standalone card (original)
 * embedded=true  → just the screen content, no outer wrapper (used inside machine-bezel)
 */
export default function POSTerminal({ embedded = false }) {
  const { logs } = useTerminal();
  const { isMuted, setIsMuted } = useSound();
  const scrollRef = useRef(null);
  const [isCursorOn, setIsCursorOn] = useState(true);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const iv = setInterval(() => setIsCursorOn(p => !p), 530);
    return () => clearInterval(iv);
  }, []);

  const screen = (
    <div
      className={`bg-green-950 rounded-lg overflow-hidden border border-green-900 relative ${embedded ? 'h-full flex flex-col' : ''}`}
      style={{ boxShadow: 'inset 0 0 20px rgba(0,255,0,0.05), 0 0 12px rgba(0,255,0,0.08)' }}
    >
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
        }}
      />
      {/* Log content */}
      <div
        ref={scrollRef}
        className={`relative z-20 p-3 overflow-y-auto ${embedded ? 'flex-1' : ''}`}
        style={{
          fontFamily: 'IBM Plex Mono, monospace',
          color: '#33ff33',
          minHeight: embedded ? '100%' : '160px',
          maxHeight: embedded ? 'none' : '200px',
        }}
      >
        {logs.map(log => (
          <div key={log.id} className="mb-1.5">
            {log.lines.map((line, i) => (
              <p
                key={i}
                className="text-xs leading-tight"
                style={{ textShadow: '0 0 5px rgba(51,255,51,0.3)' }}
              >
                {line}
              </p>
            ))}
            {log.status === 'success' && (
              <p className="text-xs font-bold" style={{ textShadow: '0 0 5px rgba(51,255,51,0.5)' }}>
                {(() => {
                  const f = log.lines[0] || '';
                  if (f.includes('CREATE GROUP'))  return '✓ GROUP CREATED';
                  if (f.includes('ADD MEMBER'))    return '✓ MEMBER(S) ADDED';
                  if (f.includes('REMOVE MEMBER')) return '✓ MEMBER REMOVED';
                  if (f.includes('ADD EXPENSE'))   return '✓ EXPENSE SAVED';
                  if (f.includes('VOID EXPENSE'))  return '✓ EXPENSE VOIDED';
                  if (f.includes('COPY LINK'))     return '✓ LINK COPIED';
                  return '✓ DONE';
                })()}
              </p>
            )}
            {log.status === 'error' && (
              <p className="text-xs font-bold" style={{ color: '#ff5555' }}>✗ FAILED</p>
            )}
          </div>
        ))}
        <div className="flex items-center gap-1">
          <span className="text-xs" style={{ textShadow: '0 0 5px rgba(51,255,51,0.3)' }}>&gt;</span>
          {isCursorOn && (
            <span
              className="inline-block w-2 h-4 bg-green-400"
              style={{ boxShadow: '0 0 8px rgba(51,255,51,0.8)' }}
            />
          )}
        </div>
      </div>
    </div>
  );

  if (embedded) return screen;

  return (
    <div className="flex justify-center mb-6">
      <div
        className="bg-gray-800 rounded-xl p-4 shadow-2xl border-b-4 border-gray-900 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <p className="text-xs text-gray-400 font-mono uppercase">GoDutch POS</p>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-xs text-gray-400 hover:text-green-400 font-mono uppercase"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
        {screen}
      </div>
    </div>
  );
}
