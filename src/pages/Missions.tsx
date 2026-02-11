import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Plus, Tag, Calendar, Trash2, Edit, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useMissionStore from '../stores/missionStore';
import MissionForm from '../components/MissionForm';
import DeleteMissionDialog from '../components/DeleteMissionDialog';
import { format, parseISO } from 'date-fns';
import EditScreen from '../components/EditScreen';

const Missions: React.FC = () => {
  const navigate = useNavigate();
  const { missions, addMission, updateMission, deleteMission } = useMissionStore();
  const [isAddingMission, setIsAddingMission] = useState(false);
  const [editingMission, setEditingMission] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    missionId: string | null;
    missionTitle: string;
  }>({
    isOpen: false,
    missionId: null,
    missionTitle: ''
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleMissionClick = (mission: Mission) => {
    navigate('/gallery', { 
      state: { 
        fromMission: true,
        missionId: mission.id,
        preselectedTags: mission.requirements.map(req => req.tag)
      }
    });
  };

  const handleAddMission = (mission: Parameters<typeof addMission>[0]) => {
    try {
      addMission(mission);
      setIsAddingMission(false);
      setHasUnsavedChanges(false);
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateMission = (mission: Parameters<typeof updateMission>[1]) => {
    if (!editingMission) return;

    try {
      updateMission(editingMission, mission);
      setEditingMission(null);
      setHasUnsavedChanges(false);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, missionId: string, missionTitle: string) => {
    e.stopPropagation();
    setDeleteDialog({
      isOpen: true,
      missionId,
      missionTitle
    });
  };

  const handleEditClick = (e: React.MouseEvent, missionId: string) => {
    e.stopPropagation();
    setEditingMission(missionId);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Onboarding Missions</h1>
        <p className="text-neutral-700">
          Complete special missions to enhance your onboarding experience and earn rewards.
        </p>
      </header>

      <motion.div 
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <button 
          className="btn-primary flex items-center justify-center gap-2 max-w-xs"
          onClick={() => setIsAddingMission(true)}
        >
          <Plus size={20} />
          Create New Mission
        </button>
      </motion.div>

      <EditScreen
        isOpen={isAddingMission}
        onClose={() => setIsAddingMission(false)}
        title="Create New Mission"
        hasUnsavedChanges={hasUnsavedChanges}
      >
        <MissionForm
          onSubmit={handleAddMission}
          onCancel={() => setIsAddingMission(false)}
        />
      </EditScreen>

      <EditScreen
        isOpen={!!editingMission}
        onClose={() => setEditingMission(null)}
        title="Edit Mission"
        hasUnsavedChanges={hasUnsavedChanges}
      >
        {editingMission && (
          <MissionForm
            initialValues={missions.find(m => m.id === editingMission)}
            onSubmit={handleUpdateMission}
            onCancel={() => setEditingMission(null)}
          />
        )}
      </EditScreen>

      <DeleteMissionDialog
        isOpen={deleteDialog.isOpen}
        missionTitle={deleteDialog.missionTitle}
        onClose={() => setDeleteDialog({ isOpen: false, missionId: null, missionTitle: '' })}
        onConfirm={() => {
          if (deleteDialog.missionId) {
            deleteMission(deleteDialog.missionId);
            setDeleteDialog({ isOpen: false, missionId: null, missionTitle: '' });
          }
        }}
      />

      <div className="space-y-4">
        {missions.map((mission) => (
          <motion.div
            key={mission.id}
            className={`card overflow-hidden cursor-pointer transition-all group ${
              mission.completed 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg' 
                : 'hover:shadow-medium'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: mission.completed ? [1, 1.02, 1] : 1
            }}
            transition={{ 
              duration: 0.3,
              scale: { duration: 0.6, ease: "easeInOut" }
            }}
            onClick={() => handleMissionClick(mission)}
            style={{
              boxShadow: mission.completed 
                ? '0 8px 25px rgba(34, 197, 94, 0.15), 0 0 0 1px rgba(34, 197, 94, 0.1)' 
                : undefined
            }}
          >
            <div className="flex items-start gap-4">
              <motion.div 
                className={`p-3 rounded-lg ${
                  mission.completed 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-indigo-100 text-indigo-600'
                }`}
                animate={mission.completed ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                } : {}}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <Trophy size={24} />
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <motion.h3 
                      className={`text-xl font-bold flex items-center gap-2 ${
                        mission.completed ? 'text-green-700' : ''
                      }`}
                      initial={false}
                      animate={mission.completed ? {
                        color: '#15803d'
                      } : {}}
                    >
                      {mission.completed && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                          className="text-2xl"
                        >
                          🎉
                        </motion.span>
                      )}
                      {mission.title}
                      {mission.completed && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                          className="text-lg"
                        >
                          ✅
                        </motion.span>
                      )}
                    </motion.h3>
                    <p className={`mt-1 ${
                      mission.completed ? 'text-green-600' : 'text-neutral-600'
                    }`}>
                      {mission.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleEditClick(e, mission.id)}
                      className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, mission.id, mission.title)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={mission.completed ? 'text-green-700 font-medium' : ''}>
                        Progress
                      </span>
                      <span className={mission.completed ? 'text-green-700 font-bold' : ''}>
                        {Math.round(mission.progress)}%
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${
                          mission.completed 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                            : 'bg-indigo-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${mission.progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {mission.requirements.map((req, index) => (
                      <div key={index} className={`flex items-center gap-2 text-sm ${
                        mission.completed ? 'text-green-700' : 'text-neutral-600'
                      }`}>
                        <Tag size={16} className="text-neutral-500" />
                        <span className="font-medium">{req.tag}:</span>
                        <span>
                          {req.current} / {req.count} items
                        </span>
                      </div>
                    ))}
                  </div>

                  {mission.deadline && (
                    <div className={`flex items-center gap-2 text-sm ${
                      mission.completed ? 'text-green-600' : 'text-neutral-600'
                    }`}>
                      <Calendar size={16} />
                      <span>Due by {format(parseISO(mission.deadline), 'PPP')}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy size={16} className={mission.completed ? 'text-green-500' : 'text-yellow-500'} />
                      <span className={`font-medium ${
                        mission.completed ? 'text-green-700' : ''
                      }`}>
                        Reward: {typeof mission.reward.value === 'number' 
                          ? `${mission.reward.value} points` 
                          : mission.reward.value}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                      mission.completed ? 'text-green-600' : 'text-primary-600'
                    }`}>
                      <span className="text-sm">
                        {mission.completed ? 'View Details' : 'Add to Gallery'}
                      </span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Celebration animation overlay for completed missions */}
            {mission.completed && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 0.1, 0],
                  background: [
                    'radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0) 0%, rgba(34, 197, 94, 0) 100%)',
                    'radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0) 70%)',
                    'radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0) 0%, rgba(34, 197, 94, 0) 100%)'
                  ]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut"
                }}
              />
            )}
          </motion.div>
        ))}

        {missions.length === 0 && (
          <div className="text-center py-10">
            <Trophy size={40} className="mx-auto mb-4 text-neutral-400" />
            <p className="text-neutral-600">No missions available. Create your first mission!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Missions;