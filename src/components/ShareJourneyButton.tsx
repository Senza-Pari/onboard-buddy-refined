import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Check, X, Link2 } from 'lucide-react';
import { nanoid } from 'nanoid';

interface ShareJourneyButtonProps {
  userName: string;
  company: string;
  startDate: string;
  taskProgress: number;
  tasksCompleted: number;
  totalTasks: number;
  missionsCompleted: number;
  totalMissions: number;
  peopleMetCount: number;
  journalEntries: number;
  recentTasks: { title: string; completed: boolean; dueDate: string }[];
  recentMissions: { title: string; progress: number }[];
}

const ShareJourneyButton: React.FC<ShareJourneyButtonProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const code = nanoid(10);
    const url = `${window.location.origin}/share/${code}`;
    
    // Store the data in localStorage for the demo
    // In production, this would save to the database
    localStorage.setItem(`shared-journey-${code}`, JSON.stringify({
      userName: props.userName,
      company: props.company,
      startDate: props.startDate,
      taskProgress: props.taskProgress,
      tasksCompleted: props.tasksCompleted,
      totalTasks: props.totalTasks,
      missionsCompleted: props.missionsCompleted,
      totalMissions: props.totalMissions,
      peopleMetCount: props.peopleMetCount,
      journalEntries: props.journalEntries,
      recentTasks: props.recentTasks,
      recentMissions: props.recentMissions,
    }));

    setShareUrl(url);
    setIsOpen(true);
  };

  const handleCopy = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <motion.button
        className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleShare}
      >
        <Share2 size={18} />
        Share with Manager
      </motion.button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Share Your Progress</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-neutral-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-neutral-600 mb-4">
              Share this link with your manager or team to show your onboarding progress.
            </p>

            <div className="flex items-center gap-2 p-3 bg-neutral-100 rounded-lg mb-4">
              <Link2 size={18} className="text-neutral-500 flex-shrink-0" />
              <input
                type="text"
                value={shareUrl || ''}
                readOnly
                className="flex-1 bg-transparent text-sm border-none outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-neutral-200 rounded transition-colors flex-shrink-0"
              >
                {copied ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <Copy size={18} className="text-neutral-500" />
                )}
              </button>
            </div>

            <div className="text-sm text-neutral-500 mb-4">
              This link shows a read-only snapshot of your current progress.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleCopy}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ShareJourneyButton;
