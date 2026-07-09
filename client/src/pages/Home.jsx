import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Modal from '../components/Modal';
import Button from '../components/Button';
import POSTerminal from '../components/POSTerminal';
import { useTerminal } from '../components/TerminalContext';
import { useSound } from '../components/SoundManager';

export default function Home() {
  const navigate  = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName]     = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const { addTerminalLog, markLogComplete } = useTerminal();
  const { isMuted, setIsMuted, playConfirmBeep, playKeyboardClick } = useSound();

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    const logId = addTerminalLog(['> CREATE GROUP', `> ${groupName}`, '> PROCESSING...'], 'working');
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/groups', { name: groupName });
      markLogComplete(logId, true);
      playConfirmBeep();
      navigate(`/group/${res.data.groupId}`);
    } catch (err) {
      markLogComplete(logId, false);
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="machine-body w-full max-w-sm">

        {/* ── Top Bar ── */}
        <div className="machine-topbar">
          <div className="flex gap-2 items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" style={{ boxShadow: '0 0 4px rgba(239,68,68,0.6)' }} />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" style={{ boxShadow: '0 0 4px rgba(250,204,21,0.6)' }} />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 4px rgba(74,222,128,0.6)' }} />
          </div>
          <p className="text-xs font-mono tracking-widest uppercase" style={{ color: '#555' }}>GoDutch POS v1.2</p>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-xs font-mono hover:text-gray-300 transition-colors"
            style={{ color: '#555' }}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* ── CRT Screen ── */}
        <div className="screen-bezel">
          <POSTerminal embedded />
        </div>

        <div className="machine-sep" />

        {/* ── Receipt Display ── */}
        <div className="machine-display" style={{ maxHeight: '260px' }}>
          <div className="text-center mb-3">
            <p className="text-xs tracking-widest" style={{ color: '#888' }}>━━━━━━━━━━━━━━━━━━━━</p>
            <h1 className="text-3xl font-bold uppercase tracking-widest mt-2 mb-1">GO DUTCH</h1>
            <p className="text-xs tracking-widest" style={{ color: '#888' }}>━━━━━━━━━━━━━━━━━━━━</p>
          </div>

          <hr className="receipt-separator" />

          <div className="text-center my-4 space-y-1">
            <p className="text-xs uppercase tracking-wider" style={{ color: '#444' }}>Split expenses with friends</p>
            <p className="text-xs" style={{ color: '#777' }}>No accounts needed</p>
            <p className="text-xs" style={{ color: '#777' }}>Just share and split</p>
          </div>

          <hr className="receipt-separator" />

          <div className="text-center mt-3">
            <p className="text-xs font-bold uppercase tracking-widest">THANK YOU FOR GOING DUTCH</p>
          </div>
        </div>

        <div className="machine-sep" />

        {/* ── Keypad ── */}
        <div className="machine-keypad">
          <button
            className="machine-key machine-key-accent"
            onClick={() => setIsModalOpen(true)}
          >
            + NEW GROUP
          </button>
        </div>

        <div className="machine-sep" />

        {/* ── Receipt Slot ── */}
        <div className="receipt-slot" />

      </div>

      {/* ── Modal (receipt-paper style, appears over machine) ── */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setError(''); setGroupName(''); }} title="New Group">
        <form onSubmit={handleCreateGroup}>
          <div className="mb-4">
            <label className="block text-sm font-bold uppercase mb-2">GROUP NAME</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => { setGroupName(e.target.value); if (e.target.value) playKeyboardClick(); }}
              placeholder="e.g. Goa Trip"
              className="w-full px-3 py-2 border-2 border-gray-800 bg-white font-mono focus:outline-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateGroup(e);
                }
              }}
              autoFocus
            />
          </div>
          {error && <p className="text-red-700 text-sm mb-4 uppercase">{error}</p>}
          <div className="flex gap-3">
            <Button type="button" onClick={() => { setIsModalOpen(false); setError(''); setGroupName(''); }} className="flex-1">
              CANCEL
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'CREATING...' : 'CREATE'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
