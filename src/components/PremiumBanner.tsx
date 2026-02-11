import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const PremiumBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-primary-800">
            <Info size={16} className="text-primary-500" />
            <span>
              Enhance your team's experience with an Onboarding Buddy - {' '}
              <Link to="/pricing" className="font-medium hover:text-primary-600">
                Learn More
              </Link>
            </span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-primary-500 hover:text-primary-600 p-1"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PremiumBanner;