import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Check, Zap, Users, Settings, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  context?: string;
}

const premiumFeatures = [
  {
    icon: Settings,
    title: 'Custom Template Builder',
    description: 'Create unlimited custom onboarding workflows'
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Manage multiple team members and their progress'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track completion rates and onboarding effectiveness'
  },
  {
    icon: Zap,
    title: 'Workflow Automation',
    description: 'Automate task assignments and notifications'
  }
];

const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  isOpen,
  onClose,
  feature,
  context,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
            
            <div className="relative z-10">
              <button
                onClick={onClose}
                className="absolute top-0 right-0 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Crown size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Unlock Premium Features</h2>
                  <p className="text-white/90">Transform your onboarding experience</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                You tried to access: <span className="text-primary-600">{feature}</span>
              </h3>
              {context && (
                <p className="text-neutral-600">{context}</p>
              )}
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {premiumFeatures.map((item, index) => (
                <motion.div
                  key={index}
                  className="p-4 border border-neutral-200 rounded-lg hover:border-primary-200 hover:bg-primary-50 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <item.icon size={16} className="text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900">{item.title}</h4>
                      <p className="text-sm text-neutral-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Benefits */}
            <div className="bg-neutral-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-neutral-900 mb-3">What you get with Premium:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  'Unlimited custom templates',
                  'Advanced team analytics',
                  'Priority customer support',
                  'Custom branding options',
                  'Workflow automation',
                  'Export capabilities'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span className="text-sm text-neutral-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/pricing"
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all text-center font-medium"
                onClick={onClose}
              >
                View Pricing Plans
              </Link>
              <button
                onClick={onClose}
                className="flex-1 border border-neutral-300 text-neutral-700 py-3 px-6 rounded-lg hover:bg-neutral-50 transition-all font-medium"
              >
                Continue Browsing
              </button>
            </div>

            <p className="text-xs text-neutral-500 text-center mt-4">
              Start your free trial today • No credit card required • Cancel anytime
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PremiumUpgradeModal;