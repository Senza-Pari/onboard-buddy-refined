import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  FileText, 
  Image, 
  Calendar, 
  ChevronRight,
  Bell,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useTaskStore from '../stores/taskStore';
import useAuthStore from '../stores/authStore';
import useMissionStore from '../stores/missionStore';
import useNotificationStore from '../stores/notificationStore';
import NotificationCenter from '../components/NotificationCenter';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tasks } = useTaskStore();
  const { user } = useAuthStore();
  const { missions } = useMissionStore();
  const { unreadCount } = useNotificationStore();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // Calculate task completion percentage with proper fallback
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate mission completion percentage with proper fallback
  const missionProgress = missions.length > 0
    ? Math.round(missions.reduce((acc, mission) => acc + mission.progress, 0) / missions.length)
    : 0;

  // Calculate days elapsed
  const startDate = user?.startDate ? new Date(user.startDate) : new Date();
  const today = new Date();
  const daysPassed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = 14; // Onboarding period

  // Get upcoming tasks
  const upcomingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const upcomingMeetings = [
    { id: 1, name: 'Sarah Johnson', role: 'Team Lead', date: '2025-04-14', time: '10:00 AM' },
    { id: 2, name: 'Michael Chen', role: 'Product Manager', date: '2025-04-16', time: '2:00 PM' },
  ];

  const recentNotes = [
    { id: 1, title: 'Product roadmap', date: '2025-04-11' },
    { id: 2, title: 'Team structure', date: '2025-04-10' },
  ];

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    tap: { scale: 0.98 },
    hover: { scale: 1.02 },
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="relative">
            <motion.button 
              className="p-3 rounded-full bg-neutral-100 hover:bg-neutral-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsNotificationOpen(true)}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </motion.button>
            <AnimatePresence>
              {isNotificationOpen && (
                <NotificationCenter 
                  isOpen={isNotificationOpen} 
                  onClose={() => setIsNotificationOpen(false)} 
                />
              )}
            </AnimatePresence>
          </div>
        </div>
        <p className="text-neutral-700">Welcome back! Here's your onboarding progress.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div 
          className="bg-gradient-to-r from-primary-400 to-primary-500 rounded-xl p-6 text-white shadow-medium cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.2 }}
          onClick={() => navigate('/tasks')}
        >
          <h2 className="text-xl font-bold mb-2">Task Progress</h2>
          <div className="w-full bg-white/30 rounded-full h-2.5 mb-4">
            <div 
              className="bg-white h-2.5 rounded-full" 
              style={{ width: `${taskProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm">
            <span>{taskProgress}% Complete</span>
            <span>Day {daysPassed} of {totalDays}</span>
          </div>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-xl p-6 text-white shadow-medium cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.2 }}
          onClick={() => navigate('/missions')}
        >
          <h2 className="text-xl font-bold mb-2">Mission Progress</h2>
          <div className="w-full bg-white/30 rounded-full h-2.5 mb-4">
            <div 
              className="bg-white h-2.5 rounded-full" 
              style={{ width: `${missionProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm">
            <span>{missionProgress}% Complete</span>
            <span>{missions.filter(m => m.completed).length} of {missions.length} Completed</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.section
          className="card"
          variants={cardVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          onClick={() => navigate('/tasks')}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <CheckSquare size={20} className="mr-2 text-primary-500" />
              Upcoming Tasks
            </h2>
            <ChevronRight size={20} className="text-neutral-400" />
          </div>
          
          <ul className="space-y-3">
            {upcomingTasks.map(task => (
              <motion.li 
                key={task.id} 
                className="p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{task.title}</span>
                  <span className="tag tag-neutral tag-small">
                    {task.category}
                  </span>
                </div>
                <div className="text-sm text-neutral-600 mt-1 flex items-center">
                  <Calendar size={14} className="mr-1" />
                  Due: {task.dueDate}
                </div>
              </motion.li>
            ))}
            {upcomingTasks.length === 0 && (
              <li className="text-center py-4 text-neutral-500">
                No upcoming tasks
              </li>
            )}
          </ul>
        </motion.section>

        <motion.section
          className="card"
          variants={cardVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          onClick={() => navigate('/missions')}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Trophy size={20} className="mr-2 text-indigo-500" />
              Active Missions
            </h2>
            <ChevronRight size={20} className="text-neutral-400" />
          </div>
          
          <ul className="space-y-3">
            {missions.filter(m => !m.completed).map(mission => (
              <motion.li 
                key={mission.id} 
                className="p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{mission.title}</span>
                  <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                    {Math.round(mission.progress)}%
                  </span>
                </div>
                <div className="text-sm text-neutral-600 mt-1">
                  {mission.description}
                </div>
              </motion.li>
            ))}
            {missions.filter(m => !m.completed).length === 0 && (
              <li className="text-center py-4 text-neutral-500">
                No active missions
              </li>
            )}
          </ul>
        </motion.section>

        <motion.section
          className="card"
          variants={cardVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          onClick={() => navigate('/people')}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Users size={20} className="mr-2 text-primary-500" />
              Upcoming Meet & Greets
            </h2>
            <ChevronRight size={20} className="text-neutral-400" />
          </div>
          
          <ul className="space-y-3">
            {upcomingMeetings.map(meeting => (
              <motion.li 
                key={meeting.id} 
                className="p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="font-medium">{meeting.name}</div>
                <div className="text-sm text-neutral-600">{meeting.role}</div>
                <div className="text-sm text-neutral-600 mt-1 flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {meeting.date} at {meeting.time}
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        <motion.section
          className="card"
          variants={cardVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          onClick={() => navigate('/gallery')}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <FileText size={20} className="mr-2 text-primary-500" />
              Recent Notes
            </h2>
            <ChevronRight size={20} className="text-neutral-400" />
          </div>
          
          <ul className="space-y-3">
            {recentNotes.map(note => (
              <motion.li 
                key={note.id} 
                className="p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="font-medium">{note.title}</div>
                <div className="text-sm text-neutral-600 mt-1">
                  Created on {note.date}
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.section>
      </div>

      <motion.section 
        className="mt-8 card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-4">Daily Tip</h2>
        <blockquote className="italic text-neutral-700 border-l-4 border-primary-400 pl-4 py-2">
          "Take time to introduce yourself to colleagues outside your immediate team. Building a broad network early on can be incredibly valuable for your success."
        </blockquote>
      </motion.section>
    </div>
  );
};

export default Dashboard;