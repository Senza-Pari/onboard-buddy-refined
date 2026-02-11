import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle, Circle, Search, X, Edit2, Trash2 } from 'lucide-react';
import useTaskStore from '../stores/taskStore';
import useAuthStore from '../stores/authStore';
import TaskForm from '../components/TaskForm';
import EditScreen from '../components/EditScreen';

const TaskList: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompletion } = useTaskStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Default to current date if user.startDate is not available
  const userOnboardingStartDate = user?.startDate || new Date().toISOString().split('T')[0];

  // Get unique tags from all tasks with defensive check
  const availableTags = Array.from(new Set(tasks.flatMap(task => task.tags || [])));

  const filteredTasks = tasks.filter(task => {
    if (!showCompleted && task.completed) return false;
    if (selectedTag && (!task.tags || !task.tags.includes(selectedTag))) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term) ||
        (task.tags && task.tags.some(tag => tag.toLowerCase().includes(term))) ||
        (task.notes && task.notes.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const handleSubmit = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      const taskToEdit = tasks.find(t => t.id === parseInt(editingTask));
      if (taskToEdit) {
        updateTask(taskToEdit.id, taskData);
      }
      setEditingTask(null);
    } else {
      addTask(taskData);
      setIsAddingTask(false);
    }
    setHasUnsavedChanges(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Onboarding Tasks</h1>
        <p className="text-neutral-700">
          Track and manage your onboarding checklist.
        </p>
      </header>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
          <input 
            type="text"
            placeholder="Search tasks..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3">
          <select 
            className="input-field px-3 py-2 appearance-none cursor-pointer"
            value={selectedTag || ''}
            onChange={(e) => setSelectedTag(e.target.value || null)}
          >
            <option value="">All Tags</option>
            {availableTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
            onClick={() => setShowCompleted(!showCompleted)}
          >
            {showCompleted ? (
              <>
                <CheckCircle size={18} />
                <span className="hidden sm:inline">Hide Completed</span>
              </>
            ) : (
              <>
                <Circle size={18} />
                <span className="hidden sm:inline">Show Completed</span>
              </>
            )}
          </button>
        </div>
      </div>

      <motion.div 
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <button 
          className="btn-primary flex items-center justify-center gap-2 max-w-xs"
          onClick={() => setIsAddingTask(true)}
        >
          <Plus size={20} />
          Add New Task
        </button>
      </motion.div>

      <EditScreen
        isOpen={isAddingTask}
        onClose={() => setIsAddingTask(false)}
        title="Add New Task"
        hasUnsavedChanges={hasUnsavedChanges}
      >
        <TaskForm
          onSubmit={handleSubmit}
          onCancel={() => setIsAddingTask(false)}
          userOnboardingStartDate={userOnboardingStartDate}
        />
      </EditScreen>

      <EditScreen
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
        hasUnsavedChanges={hasUnsavedChanges}
      >
        {editingTask && (
          <TaskForm
            initialValues={tasks.find(t => t.id === parseInt(editingTask))}
            onSubmit={handleSubmit}
            onCancel={() => setEditingTask(null)}
            userOnboardingStartDate={userOnboardingStartDate}
          />
        )}
      </EditScreen>

      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <motion.div 
            key={task.id}
            className={`card border-l-4 ${
              task.completed 
                ? 'border-l-green-500 bg-green-50' 
                : 'border-l-neutral-400'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3">
              <button 
                onClick={() => toggleTaskCompletion(task.id)}
                className="mt-1 flex-shrink-0"
              >
                {task.completed ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : (
                  <Circle size={20} className="text-neutral-400 hover:text-neutral-600" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-neutral-500' : ''}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-1">
                      {(task.tags || []).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button 
                      onClick={() => setEditingTask(task.id.toString())}
                      className="p-1 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-neutral-600 mt-1">
                  Due: {task.dueDate}
                </p>
                
                <p className={`mt-2 text-sm ${task.completed ? 'text-neutral-500' : 'text-neutral-700'}`}>
                  {task.description}
                </p>

                {task.notes && (
                  <div className="mt-3 p-3 bg-neutral-100 rounded-lg">
                    <p className="text-sm text-neutral-600">{task.notes}</p>
                  </div>
                )}

                {task.link && (
                  <a
                    href={task.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm text-primary-600 hover:text-primary-700"
                  >
                    View Resource →
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-10">
            <p className="text-neutral-500">No tasks match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;