import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Button from '../components/Button';
import Modal from '../components/Modal';

export default function Home() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/groups', { name: groupName });
      navigate(`/group/${response.data.groupId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
      <div className="receipt-paper receipt-shadow w-full max-w-md p-8 relative">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold uppercase tracking-widest">GO DUTCH</h1>
          <p className="text-sm mt-2 text-gray-700">Split expenses with friends</p>
        </div>
        
        <hr className="receipt-separator" />
        
        {/* Welcome message */}
        <div className="my-8 text-center">
          <p className="text-sm text-gray-700 leading-relaxed">
            Create a new group,<br />
            share the receipt link,<br />
            and start splitting bills!
          </p>
        </div>
        
        <hr className="receipt-separator" />
        
        {/* Create group button */}
        <div className="mt-8 text-center">
          <Button onClick={() => setIsModalOpen(true)} className="w-full">
            + NEW GROUP
          </Button>
        </div>
        
        {/* Footer */}
        <div className="mt-10 text-center">
          <hr className="receipt-separator" />
          <p className="text-xs text-gray-600 mt-4 uppercase tracking-wider">
            No accounts needed
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Just share and split
          </p>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Group">
        <form onSubmit={handleCreateGroup}>
          <div className="mb-4">
            <label className="block text-sm font-bold uppercase mb-2">GROUP NAME</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Goa Trip"
              className="w-full px-3 py-2 border-2 border-gray-800 bg-white font-mono focus:outline-none"
              autoFocus
            />
          </div>
          {error && <p className="text-red-700 text-sm mb-4">{error}</p>}
          <div className="flex gap-3">
            <Button type="button" onClick={() => setIsModalOpen(false)} className="flex-1">
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
