import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import BuddyChatDrawer from './BuddyChatDrawer';

const BuddyChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [discovered, setDiscovered] = useState(() => localStorage.getItem('buddy-discovered') === 'true');

  const handleOpen = () => {
    setIsOpen(true);
    if (!discovered) {
      setDiscovered(true);
      localStorage.setItem('buddy-discovered', 'true');
    }
  };

  return (
    <>
      {/* Desktop FAB only — mobile uses BottomNav */}
      {!isOpen && (
        <motion.button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-40 hidden md:flex items-center gap-2 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 transition-colors px-4 h-14"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            boxShadow: discovered
              ? '0 10px 15px -3px rgba(0,0,0,0.1)'
              : [
                  '0 0 0 0 rgba(99,102,241,0.4)',
                  '0 0 0 12px rgba(99,102,241,0)',
                  '0 0 0 0 rgba(99,102,241,0.4)',
                ],
          }}
          transition={
            discovered
              ? { duration: 0.3 }
              : { boxShadow: { repeat: Infinity, duration: 2 }, duration: 0.3 }
          }
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Chat with Buddy"
        >
          <MessageCircle size={22} />
          {!discovered && <span className="text-sm font-medium whitespace-nowrap">Ask Buddy</span>}
        </motion.button>
      )}

      <BuddyChatDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default BuddyChat;
