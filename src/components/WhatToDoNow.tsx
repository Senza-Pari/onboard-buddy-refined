import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import { type Task } from '../stores/taskStore';

interface WhatToDoNowProps {
  tasks: Task[];
  onComplete: (task: Task) => void;
}

const WhatToDoNow: React.FC<WhatToDoNowProps> = ({ tasks, onComplete }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the most urgent incomplete task
  const incompleteTasks = tasks.filter(t => !t.completed);
  
  // Sort by: 1) overdue first, 2) due date ascending, 3) priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedTasks = [...incompleteTasks].sort((a, b) => {
    const aDate = a.dueDate ? new Date(a.dueDate) : null;
    const bDate = b.dueDate ? new Date(b.dueDate) : null;
    const aOverdue = aDate && aDate < today;
    const bOverdue = bDate && bDate < today;

    // Overdue tasks first
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    // Then by due date
    if (aDate && bDate) {
      const dateDiff = aDate.getTime() - bDate.getTime();
      if (dateDiff !== 0) return dateDiff;
    }

    // Finally by priority
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const nextTask = sortedTasks[0];

  if (!nextTask) {
    return (
      <motion.div
        className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-6 text-white shadow-lg mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <Sparkles size={28} />
          <div>
            <h2 className="text-xl font-bold">You're all caught up!</h2>
            <p className="text-white/90 text-sm">No pending tasks. Great work! 🎉</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const dueDate = nextTask.dueDate ? new Date(nextTask.dueDate) : null;
  const isOverdue = dueDate && dueDate < today;
  const isDueToday = dueDate && dueDate.toDateString() === today.toDateString();

  return (
    <motion.div
      className={`rounded-xl p-6 shadow-lg mb-6 ${
        isOverdue 
          ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white' 
          : isDueToday
          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
          : 'bg-gradient-to-r from-primary-400 to-primary-600 text-white'
      }`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isOverdue ? (
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <AlertTriangle size={20} />
              </motion.div>
            ) : (
              <Clock size={20} />
            )}
            <span className="text-sm font-medium uppercase tracking-wide opacity-90">
              {isOverdue ? 'Overdue!' : isDueToday ? 'Due Today' : 'Up Next'}
            </span>
          </div>
          <h2 className="text-xl font-bold mb-1">{nextTask.title}</h2>
          <p className="text-sm opacity-90">
            {nextTask.description || `Due: ${nextTask.dueDate}`}
          </p>
          {nextTask.department && (
            <span className="inline-block mt-2 px-2 py-1 bg-white/20 rounded text-xs font-medium">
              {nextTask.department}
            </span>
          )}
        </div>
        <motion.button
          className="flex-shrink-0 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onComplete(nextTask)}
        >
          <CheckCircle size={28} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default WhatToDoNow;
