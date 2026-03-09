import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Trophy, Users, BookOpen, Calendar, Loader2, AlertCircle } from 'lucide-react';

interface SharedData {
  userName: string;
  company: string;
  startDate: string;
  taskProgress: number;
  tasksCompleted: number;
  totalTasks: number;
  missionsCompleted: number;
  totalMissions: number;
  peopleMetCount: number;
  journalEntries: number;
  recentTasks: { title: string; completed: boolean; dueDate: string }[];
  recentMissions: { title: string; progress: number }[];
}

const SharedJourney: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedData = async () => {
      if (!code) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        // For now, load from localStorage as a demo
        // In production, this would fetch from the database
        const storedData = localStorage.getItem(`shared-journey-${code}`);
        if (storedData) {
          setData(JSON.parse(storedData));
        } else {
          setError('This share link has expired or does not exist');
        }
      } catch (err) {
        setError('Failed to load shared journey');
      } finally {
        setLoading(false);
      }
    };

    loadSharedData();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Link Not Found</h1>
          <p className="text-neutral-600">{error || 'This share link is invalid'}</p>
        </div>
      </div>
    );
  }

  const daysPassed = Math.ceil(
    (new Date().getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <motion.header
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            🎯 Onboarding Progress
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            {data.userName}'s Journey
          </h1>
          <p className="text-neutral-600">
            Day {daysPassed} at {data.company}
          </p>
        </motion.header>

        {/* Progress Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            className="bg-white rounded-xl p-4 shadow-sm text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-3xl font-bold text-primary-500">{data.taskProgress}%</div>
            <div className="text-sm text-neutral-600">Tasks Done</div>
          </motion.div>
          
          <motion.div
            className="bg-white rounded-xl p-4 shadow-sm text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-3xl font-bold text-indigo-500">{data.missionsCompleted}</div>
            <div className="text-sm text-neutral-600">Missions</div>
          </motion.div>
          
          <motion.div
            className="bg-white rounded-xl p-4 shadow-sm text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-3xl font-bold text-emerald-500">{data.peopleMetCount}</div>
            <div className="text-sm text-neutral-600">People Met</div>
          </motion.div>
          
          <motion.div
            className="bg-white rounded-xl p-4 shadow-sm text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-3xl font-bold text-amber-500">{data.journalEntries}</div>
            <div className="text-sm text-neutral-600">Journal Entries</div>
          </motion.div>
        </div>

        {/* Task Progress */}
        <motion.section
          className="bg-white rounded-xl p-6 shadow-sm mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-primary-500" />
            Task Progress
          </h2>
          <div className="w-full bg-neutral-100 rounded-full h-3 mb-4">
            <div 
              className="bg-primary-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${data.taskProgress}%` }}
            />
          </div>
          <p className="text-sm text-neutral-600 mb-4">
            {data.tasksCompleted} of {data.totalTasks} tasks completed
          </p>
          
          <ul className="space-y-2">
            {data.recentTasks.map((task, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm">
                {task.completed ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <Circle size={16} className="text-neutral-300" />
                )}
                <span className={task.completed ? 'line-through text-neutral-400' : ''}>
                  {task.title}
                </span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Missions */}
        {data.recentMissions.length > 0 && (
          <motion.section
            className="bg-white rounded-xl p-6 shadow-sm mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-indigo-500" />
              Active Missions
            </h2>
            <ul className="space-y-3">
              {data.recentMissions.map((mission, idx) => (
                <li key={idx}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-sm">{mission.title}</span>
                    <span className="text-sm text-neutral-500">{Math.round(mission.progress)}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${mission.progress}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        {/* Footer */}
        <motion.footer
          className="text-center text-sm text-neutral-500 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>Shared via OnboardMe • {new Date().toLocaleDateString()}</p>
        </motion.footer>
      </div>
    </div>
  );
};

export default SharedJourney;
