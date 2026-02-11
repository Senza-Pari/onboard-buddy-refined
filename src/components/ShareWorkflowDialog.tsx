import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Copy, Check, Clock, Settings, X } from 'lucide-react';
import { createShareableLink, revokeShareableLink } from '../lib/sharing';
import type { ShareOptions } from '../lib/sharing';

interface ShareWorkflowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const ShareWorkflowDialog: React.FC<ShareWorkflowDialogProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ShareOptions>({
    expiresIn: 24,
    canEdit: false,
  });

  const handleShare = async () => {
    try {
      setLoading(true);
      const { shareUrl } = await createShareableLink(userId, options);
      setShareUrl(shareUrl);
    } catch (error) {
      console.error('Error creating share link:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async () => {
    try {
      setLoading(true);
      const accessCode = shareUrl.split('/').pop();
      if (accessCode) {
        await revokeShareableLink(accessCode, userId);
        setShareUrl('');
      }
    } catch (error) {
      console.error('Error revoking share link:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Share Onboarding Workflow</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">
              Share Settings
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.canEdit}
                  onChange={(e) => setOptions({ ...options, canEdit: e.target.checked })}
                  className="rounded border-neutral-300"
                />
                <span className="text-sm">Allow editing</span>
              </label>

              <div className="flex items-center gap-2">
                <Clock size={16} className="text-neutral-500" />
                <select
                  value={options.expiresIn}
                  onChange={(e) => setOptions({ ...options, expiresIn: Number(e.target.value) })}
                  className="input-field text-sm py-1"
                >
                  <option value={24}>Expires in 24 hours</option>
                  <option value={72}>Expires in 3 days</option>
                  <option value={168}>Expires in 7 days</option>
                  <option value={0}>Never expires</option>
                </select>
              </div>
            </div>
          </div>

          {!shareUrl ? (
            <button
              onClick={handleShare}
              disabled={loading}
              className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Settings size={20} className="animate-spin mr-2" />
                  Creating link...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Link2 size={20} className="mr-2" />
                  Create Share Link
                </span>
              )}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="input-field flex-1"
                />
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>

              <button
                onClick={handleRevoke}
                disabled={loading}
                className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                Revoke Access
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShareWorkflowDialog;