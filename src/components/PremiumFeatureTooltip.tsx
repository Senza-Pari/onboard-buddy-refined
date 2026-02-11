import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PremiumFeatureTooltipProps {
  children: React.ReactNode;
  title: string;
  description: string;
  benefits?: string[];
  className?: string;
}

const PremiumFeatureTooltip: React.FC<PremiumFeatureTooltipProps> = ({
  children,
  title,
  description,
  benefits = [],
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="cursor-pointer"
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="absolute z-50 w-80 p-4 bg-white rounded-xl shadow-xl border border-neutral-200 top-full left-1/2 transform -translate-x-1/2 mt-2"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                <Crown size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-neutral-900">{title}</h4>
                <p className="text-sm text-neutral-600 mt-1">{description}</p>
              </div>
            </div>

            {benefits.length > 0 && (
              <div className="mb-4">
                <h5 className="text-xs font-medium text-neutral-700 mb-2 uppercase tracking-wide">
                  Premium Benefits:
                </h5>
                <ul className="space-y-1">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="text-xs text-neutral-600 flex items-center gap-2">
                      <div className="w-1 h-1 bg-primary-500 rounded-full" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link
              to="/pricing"
              className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all text-sm font-medium"
            >
              Upgrade to Premium
              <ArrowRight size={14} />
            </Link>

            {/* Arrow pointing up */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-neutral-200 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PremiumFeatureTooltip;