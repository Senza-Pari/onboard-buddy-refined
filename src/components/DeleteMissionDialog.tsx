import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface DeleteMissionDialogProps {
  isOpen: boolean;
  missionTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteMissionDialog: React.FC<DeleteMissionDialogProps> = ({
  isOpen,
  missionTitle,
  onClose,
  onConfirm
}) => {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText === 'DELETE') {
      onConfirm();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-lg p-6 max-w-md w-full"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-red-100">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Delete Mission</h3>
            <p className="text-neutral-600 mt-2">
              Are you sure you want to delete "{missionTitle}"? This action cannot be undone
              and all associated progress will be lost.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Type DELETE to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            className="input-field"
            placeholder="DELETE"
          />

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={confirmText !== 'DELETE'}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Mission
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default DeleteMissionDialog;