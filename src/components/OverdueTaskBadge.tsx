import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface OverdueTaskBadgeProps {
  dueDate: string;
}

const OverdueTaskBadge: React.FC<OverdueTaskBadgeProps> = ({ dueDate }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  if (due >= today) return null;

  const daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <motion.span
      className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium"
      animate={{ x: [0, -2, 2, -2, 0] }}
      transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 3 }}
    >
      <AlertTriangle size={12} />
      {daysOverdue === 1 ? '1 day overdue' : `${daysOverdue} days overdue`}
    </motion.span>
  );
};

export default OverdueTaskBadge;
