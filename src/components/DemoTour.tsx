import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import useDemoTourStore from '../stores/demoTourStore';
import { TOUR_STEPS } from '../data/demoTourSteps';

const DemoTour: React.FC = () => {
  const { isActive, currentStep, next, prev, skip } = useDemoTourStore();
  const navigate = useNavigate();
  const location = useLocation();

  const step = TOUR_STEPS[currentStep];
  const isInteractive = step?.interactive === true;

  // Navigate to the correct route when step changes
  useEffect(() => {
    if (isActive && step && location.pathname !== step.route) {
      navigate(step.route);
    }
  }, [isActive, currentStep, step, location.pathname, navigate]);

  if (!isActive || !step) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Overlay: hidden on interactive steps, click-to-advance on others */}
        {!isInteractive && (
          <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={next} />
        )}

        {/* Tour card: top banner on interactive steps, centered card otherwise */}
        <motion.div
          className={`pointer-events-auto ${
            isInteractive
              ? 'fixed top-4 left-4 right-4 md:left-auto md:right-6 md:top-6 md:max-w-sm md:rounded-2xl rounded-2xl shadow-xl bg-white'
              : 'fixed left-0 right-0 bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:rounded-2xl rounded-t-2xl bg-white shadow-xl'
          }`}
          initial={{ y: isInteractive ? -60 : 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: isInteractive ? -60 : 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          key={currentStep}
        >
          {/* Progress bar */}
          <div className="h-1 bg-neutral-100 rounded-t-2xl overflow-hidden">
            <motion.div
              className="h-full bg-primary-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </div>
              <button
                onClick={skip}
                className="p-1 -mr-1 -mt-1 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-neutral-900 mb-2">{step.title}</h3>
            <p className="text-neutral-600 leading-relaxed mb-2">{step.body}</p>

            {step.actionHint && (
              <p className="text-sm text-primary-600 font-medium mb-4 bg-primary-50 rounded-lg px-3 py-2">
                💡 {step.actionHint}
              </p>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 gap-3">
              <button
                onClick={prev}
                disabled={currentStep === 0}
                className="flex items-center gap-1 px-4 min-h-[44px] text-sm font-medium text-neutral-600 hover:text-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <ChevronLeft size={16} />
                Back
              </button>

              <button
                onClick={skip}
                className="text-sm text-neutral-500 hover:text-neutral-700 min-h-[44px] px-3"
              >
                Skip tour
              </button>

              <button
                onClick={next}
                className="flex items-center gap-1 px-5 min-h-[44px] text-sm font-bold bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                {currentStep === TOUR_STEPS.length - 1 ? 'Get Started!' : 'Next'}
                {currentStep < TOUR_STEPS.length - 1 && <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DemoTour;
