import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Star, PartyPopper } from 'lucide-react';

interface MilestoneCelebrationProps {
  progress: number;
  userName?: string;
  onDismiss: () => void;
}

const MILESTONES = [25, 50, 75, 100];

const getMilestoneMessage = (milestone: number, name: string) => {
  switch (milestone) {
    case 25:
      return { title: "You're off to a great start!", subtitle: `Keep it up, ${name}! 🚀` };
    case 50:
      return { title: "Halfway there!", subtitle: `You're crushing it, ${name}! 💪` };
    case 75:
      return { title: "Almost done!", subtitle: `The finish line is in sight, ${name}! 🏁` };
    case 100:
      return { title: "Onboarding Complete!", subtitle: `Congratulations, ${name}! You did it! 🎉` };
    default:
      return { title: "Great progress!", subtitle: "Keep going!" };
  }
};

const Confetti: React.FC = () => {
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F97316', '#22C55E'];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-3 h-3"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={{
            y: ['0vh', '100vh'],
            rotate: [0, piece.rotation + 720],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 3,
            delay: piece.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({
  progress,
  userName = 'there',
  onDismiss,
}) => {
  const [celebratedMilestones, setCelebratedMilestones] = useState<number[]>(() => {
    const stored = localStorage.getItem('celebrated-milestones');
    return stored ? JSON.parse(stored) : [];
  });
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);

  useEffect(() => {
    // Check if we've hit a new milestone
    const hitMilestone = MILESTONES.find(
      (m) => progress >= m && !celebratedMilestones.includes(m)
    );

    if (hitMilestone) {
      setActiveMilestone(hitMilestone);
      const updated = [...celebratedMilestones, hitMilestone];
      setCelebratedMilestones(updated);
      localStorage.setItem('celebrated-milestones', JSON.stringify(updated));
    }
  }, [progress, celebratedMilestones]);

  useEffect(() => {
    if (activeMilestone) {
      const timer = setTimeout(() => {
        setActiveMilestone(null);
        onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeMilestone, onDismiss]);

  const message = activeMilestone ? getMilestoneMessage(activeMilestone, userName) : null;

  return (
    <AnimatePresence>
      {activeMilestone && message && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setActiveMilestone(null);
            onDismiss();
          }}
        >
          <Confetti />
          <motion.div
            className="relative bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="absolute -top-6 left-1/2 -translate-x-1/2"
              animate={{ rotate: [0, -10, 10, -10, 0], y: [0, -5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            >
              {activeMilestone === 100 ? (
                <PartyPopper size={48} className="text-yellow-500" />
              ) : (
                <Trophy size={48} className="text-yellow-500" />
              )}
            </motion.div>

            <div className="mt-6 mb-4">
              <motion.div
                className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-lg font-bold"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Star size={20} className="fill-current" />
                {activeMilestone}% Complete
                <Star size={20} className="fill-current" />
              </motion.div>
            </div>

            <h2 className="text-2xl font-bold text-neutral-900 mb-2">{message.title}</h2>
            <p className="text-neutral-600 text-lg">{message.subtitle}</p>

            <motion.button
              className="mt-6 px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveMilestone(null);
                onDismiss();
              }}
            >
              <span className="flex items-center gap-2">
                <Sparkles size={18} />
                Keep Going!
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MilestoneCelebration;
