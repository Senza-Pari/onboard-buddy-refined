import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Archive, Trash2 } from 'lucide-react';
import type { Employee } from '../stores/employeeStore';

interface EmployeeDeleteDialogProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onConfirm: (employee: Employee, archive: boolean, reason: string) => void;
}

const EmployeeDeleteDialog: React.FC<EmployeeDeleteDialogProps> = ({
  isOpen,
  employee,
  onClose,
  onConfirm,
}) => {
  const [deleteType, setDeleteType] = useState<'archive' | 'permanent'>('archive');
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen || !employee) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (deleteType === 'permanent' && confirmText !== 'DELETE') {
      return;
    }

    if (!reason.trim()) {
      return;
    }

    onConfirm(employee, deleteType === 'archive', reason.trim());
    
    // Reset form
    setDeleteType('archive');
    setReason('');
    setConfirmText('');
    onClose();
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
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-full bg-red-100">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Remove Employee</h3>
            <p className="text-neutral-600 mt-2">
              You are about to remove <strong>{employee.fullName}</strong> from the system.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Delete Type Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Removal Type
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-neutral-50">
                <input
                  type="radio"
                  name="deleteType"
                  value="archive"
                  checked={deleteType === 'archive'}
                  onChange={(e) => setDeleteType(e.target.value as 'archive' | 'permanent')}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <Archive size={16} className="text-yellow-600" />
                    Archive Employee (Recommended)
                  </div>
                  <p className="text-sm text-neutral-600 mt-1">
                    Employee data is preserved but hidden from active lists. Can be restored later.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-neutral-50">
                <input
                  type="radio"
                  name="deleteType"
                  value="permanent"
                  checked={deleteType === 'permanent'}
                  onChange={(e) => setDeleteType(e.target.value as 'archive' | 'permanent')}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2 font-medium text-red-700">
                    <Trash2 size={16} className="text-red-600" />
                    Permanent Deletion
                  </div>
                  <p className="text-sm text-neutral-600 mt-1">
                    Employee data is permanently removed. This action cannot be undone.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Reason for Removal *
            </label>
            <textarea
              required
              className="input-field"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for removing this employee..."
            />
          </div>

          {/* Confirmation for permanent deletion */}
          {deleteType === 'permanent' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Type "DELETE" to confirm permanent removal
              </label>
              <input
                type="text"
                className="input-field"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          )}

          {/* Warning for permanent deletion */}
          {deleteType === 'permanent' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-red-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Warning: Permanent Deletion</p>
                  <p className="text-red-700 mt-1">
                    This will permanently remove all employee data, including onboarding progress, 
                    contact information, and audit history. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !reason.trim() || 
                (deleteType === 'permanent' && confirmText !== 'DELETE')
              }
              className={`px-4 py-2 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                deleteType === 'archive' 
                  ? 'bg-yellow-500 hover:bg-yellow-600' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {deleteType === 'archive' ? 'Archive Employee' : 'Delete Permanently'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EmployeeDeleteDialog;