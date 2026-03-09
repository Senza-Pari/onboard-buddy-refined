import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  Users, 
  BookOpen, 
  Calendar, 
  ChevronRight,
  Bell,
  Trophy,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../stores/authStore';
import useMissionStore from '../stores/missionStore';
import { useTaskData, useGalleryData } from '../hooks/useAppData';
import useNotificationStore from '../stores/notificationStore';
import NotificationCenter from '../components/NotificationCenter';
import usePeopleStore from '../stores/peopleStore';
import WhatToDoNow from '../components/WhatToDoNow';
import MilestoneCelebration from '../components/MilestoneCelebration';
import ShareJourneyButton from '../components/ShareJourneyButton';
import useFeatureStore from '../stores/featureStore';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, toggleTaskCompletion } = useTaskData();
  const { user } = useAuthStore();
  const { missions } = useMissionStore();
  const { unreadCount } = useNotificationStore();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { isEnabled } = useFeatureStore();

  const handleTaskComplete = useCallback((task: { id: number }) => {
    toggleTaskCompletion(task.id);
  }, [toggleTaskCompletion]);

  const handleMilestoneDismiss = useCallback(() => {
    // Milestone dismissed - no action needed
  }, []);
  
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

  // Real data from stores
  const { people } = usePeopleStore();
  const { items: journalItems } = useGalleryData();

  const upcomingMeetings = people
    .filter(p => p.meetingDate && new Date(p.meetingDate) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime())
    .slice(0, 3);

  const recentJournalEntries = [...journalItems]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

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
          <div className="flex items-center gap-3">
            {isEnabled('shareJourney') && (
              <ShareJourneyButton
                userName={user?.name || 'New Hire'}
                company={user?.company || 'Company'}
                startDate={user?.startDate || new Date().toISOString().split('T')[0]}
                taskProgress={taskProgress}
                tasksCompleted={completedTasks}
                totalTasks={totalTasks}
                missionsCompleted={missions.filter(m => m.completed).length}
                totalMissions={missions.length}
                peopleMetCount={people.length}
                journalEntries={journalItems.length}
                recentTasks={upcomingTasks.slice(0, 5).map(t => ({
                  title: t.title,
                  completed: t.completed,
                  dueDate: t.dueDate
                }))}
                recentMissions={missions.filter(m => !m.completed).slice(0, 3).map(m => ({
                  title: m.title,
                  progress: m.progress
                }))}
              />
            )}
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
        </div>
        <p className="text-neutral-700">Welcome back! Here's your onboarding progress.</p>
      </header>

      {/* What To Do Now Card */}
      <WhatToDoNow tasks={tasks} onComplete={handleTaskComplete} />

      {/* Milestone Celebration */}
      <MilestoneCelebration 
        progress={taskProgress} 
        userName={user?.name?.split(' ')[0] || 'there'}
        onDismiss={handleMilestoneDismiss}
      />

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
                    {task.department}
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
            {upcomingMeetings.length > 0 ? upcomingMeetings.map(person => (
              <motion.li 
                key={person.id} 
                className="p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="font-medium">{person.name}</div>
                <div className="text-sm text-neutral-600">{person.role}</div>
                <div className="text-sm text-neutral-600 mt-1 flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {person.meetingDate}{person.meetingTime && ` at ${person.meetingTime}`}
                </div>
              </motion.li>
            )) : (
              <li className="text-center py-6">
                <Users size={24} className="mx-auto mb-2 text-neutral-400" />
                <p className="text-neutral-500 text-sm mb-2">No upcoming meetings</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate('/people'); }}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mx-auto"
                >
                  <Plus size={14} /> Add your first contact
                </button>
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
          onClick={() => navigate('/gallery')}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <BookOpen size={20} className="mr-2 text-primary-500" />
              Recent Journal Entries
            </h2>
            <ChevronRight size={20} className="text-neutral-400" />
          </div>
          
          <ul className="space-y-3">
            {recentJournalEntries.length > 0 ? recentJournalEntries.map(entry => (
              <motion.li 
                key={entry.id} 
                className="p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="font-medium">{entry.title}</div>
                <div className="text-sm text-neutral-600 mt-1">
                  {new Date(entry.date).toLocaleDateString()}
                </div>
              </motion.li>
            )) : (
              <li className="text-center py-6">
                <BookOpen size={24} className="mx-auto mb-2 text-neutral-400" />
                <p className="text-neutral-500 text-sm mb-2">No journal entries yet</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate('/gallery'); }}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mx-auto"
                >
                  <Plus size={14} /> Start your first journal entry
                </button>
              </li>
            )}
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