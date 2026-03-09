import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, Circle, Search, Edit2, Trash2, ChevronRight, X, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { type Task } from '../stores/taskStore';
import useAuthStore from '../stores/authStore';
import useDemoTourStore from '../stores/demoTourStore';
import { TOUR_STEPS } from '../data/demoTourSteps';
import { useTaskData, useGalleryData } from '../hooks/useAppData';
import TaskForm from '../components/TaskForm';
import EditScreen from '../components/EditScreen';
import TaskCelebration from '../components/TaskCelebration';
import OverdueTaskBadge from '../components/OverdueTaskBadge';
import { addBusinessDays } from 'date-fns';

const TaskList: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompletion } = useTaskData();
  const { addItem: addJournalEntry } = useGalleryData();
  const { user } = useAuthStore();
  const { isActive: isTourActive, currentStep } = useDemoTourStore();
  const firstIncompleteRef = useRef<HTMLDivElement>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [promptTaskId, setPromptTaskId] = useState<number | null>(null);
  const [promptNote, setPromptNote] = useState('');
  const [isSuggestingTasks, setIsSuggestingTasks] = useState(false);
  const promptRef = useRef<HTMLInputElement>(null);

  const isTourOnTasks = isTourActive && TOUR_STEPS[currentStep]?.route === '/tasks';

  useEffect(() => {
    if (isTourOnTasks && firstIncompleteRef.current) {
      const timeout = setTimeout(() => {
        firstIncompleteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isTourOnTasks]);

  // Default to current date if user.startDate is not available
  const userOnboardingStartDate = user?.startDate || new Date().toISOString().split('T')[0];

  // Get unique tags from all tasks with defensive check
  const availableTags = Array.from(new Set(tasks.flatMap(task => task.tags || [])));

  const filteredTasks = tasks
    .filter(task => {
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
    })
    .sort((a, b) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const aDate = a.dueDate ? new Date(a.dueDate) : null;
      const bDate = b.dueDate ? new Date(b.dueDate) : null;
      const aOverdue = aDate && aDate < today && !a.completed;
      const bOverdue = bDate && bDate < today && !b.completed;

      // Overdue incomplete tasks float to the very top
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      // Incomplete tasks above completed
      if (a.completed !== b.completed) return a.completed ? 1 : -1;

      // Among incomplete: soonest due date first
      if (!a.completed && !b.completed && aDate && bDate) {
        return aDate.getTime() - bDate.getTime();
      }
      return 0;
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

  const handleQuickAdd = () => {
    if (!quickAddTitle.trim()) return;
    const dueDate = addBusinessDays(new Date(), 5).toISOString().split('T')[0];
    addTask({
      title: quickAddTitle.trim(),
      tags: [],
      department: 'HR',
      priority: 'medium',
      description: '',
      dueDate,
      startDate: userOnboardingStartDate,
      completed: false,
    } as Omit<Task, 'id' | 'createdAt'>);
    setQuickAddTitle('');
  };

  const handleTaskComplete = (task: Task) => {
    if (!task.completed) {
      setShowCelebration(true);
      setPromptTaskId(task.id);
      setPromptNote('');
    }
    toggleTaskCompletion(task.id);
  };

  const handlePromptSubmit = () => {
    if (!promptNote.trim() || promptTaskId === null) {
      setPromptTaskId(null);
      return;
    }
    const task = tasks.find(t => t.id === promptTaskId);
    if (task) {
      addJournalEntry({
        type: 'note',
        title: task.title,
        content: promptNote.trim(),
        description: '',
        date: new Date().toISOString().split('T')[0],
        tags: task.tags || [],
        permissions: { public: false, editable: true, allowComments: true },
      });
    }
    setPromptTaskId(null);
    setPromptNote('');
  };

  useEffect(() => {
    if (promptTaskId !== null && promptRef.current) {
      promptRef.current.focus();
    }
  }, [promptTaskId]);

  const handleSuggestTasks = async () => {
    setIsSuggestingTasks(true);
    try {
      const SUGGEST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/suggest-tasks`;
      const response = await fetch(SUGGEST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          role: user?.name?.includes('Engineer') ? 'Software Engineer' : 'New Employee',
          company: user?.company || 'the company',
          existingTaskTitles: tasks.map(t => t.title),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate suggestions');
      }

      const { tasks: suggestedTasks } = await response.json();
      
      // Add suggested tasks to the store
      suggestedTasks.forEach((taskData: any) => {
        const dueDate = addBusinessDays(new Date(userOnboardingStartDate), taskData.daysFromStart)
          .toISOString().split('T')[0];
        
        addTask({
          title: taskData.title,
          description: taskData.description,
          tags: taskData.tags || [],
          department: taskData.department || 'HR',
          priority: taskData.priority || 'medium',
          dueDate,
          startDate: userOnboardingStartDate,
          completed: false,
        });
      });

    } catch (error) {
      console.error('Error suggesting tasks:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate task suggestions');
    } finally {
      setIsSuggestingTasks(false);
    }
  };

  useEffect(() => {
    if (promptTaskId !== null) {
      const timer = setTimeout(() => setPromptTaskId(null), 15000);
      return () => clearTimeout(timer);
    }
  }, [promptTaskId]);

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Onboarding Tasks</h1>
        <p className="text-neutral-700">
          Track and manage your onboarding checklist.
        </p>
      </header>

      {/* Quick-add bar */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Quick add a task... (press Enter)"
            className="input-field flex-1"
            value={quickAddTitle}
            onChange={(e) => setQuickAddTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
          />
          <button
            onClick={handleQuickAdd}
            disabled={!quickAddTitle.trim()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

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
        className="mb-6 flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <button 
          className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-initial"
          onClick={() => setIsAddingTask(true)}
        >
          <Plus size={20} />
          Add Detailed Task
        </button>
        
        <button 
          className="btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-initial"
          onClick={handleSuggestTasks}
          disabled={isSuggestingTasks}
        >
          {isSuggestingTasks ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Sparkles size={20} />
          )}
          {isSuggestingTasks ? 'Generating...' : 'Suggest Tasks for Me'}
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
        {filteredTasks.map((task, index) => {
          const isFirstIncomplete = isTourOnTasks && !task.completed && index === filteredTasks.findIndex(t => !t.completed);
          return (
          <React.Fragment key={task.id}>
          <motion.div 
            ref={isFirstIncomplete ? firstIncompleteRef : undefined}
            className={`card border-l-4 ${
              task.completed 
                ? 'border-l-green-500 bg-green-50' 
                : 'border-l-neutral-400'
            } ${isFirstIncomplete ? 'tour-glow' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3">
              <div className="relative mt-1 flex-shrink-0">
                {isFirstIncomplete && (
                  <motion.div
                    className="absolute -left-7 top-1/2 -translate-y-1/2"
                    animate={{ x: [0, 6, 0] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ChevronRight size={18} className="text-blue-500" />
                  </motion.div>
                )}
                <button 
                  onClick={() => handleTaskComplete(task)}
                >
                  {task.completed ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <Circle size={20} className={`${isFirstIncomplete ? 'text-blue-500 tour-glow' : 'text-neutral-400'} hover:text-neutral-600`} />
                  )}
                </button>
              </div>
              
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

          {/* Post-completion prompt */}
          {promptTaskId === task.id && task.completed && (
            <motion.div
              className="ml-8 p-3 bg-primary-50 border border-primary-200 rounded-lg flex items-center gap-2"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <BookOpen size={16} className="text-primary-500 flex-shrink-0" />
              <input
                ref={promptRef}
                type="text"
                placeholder="How did it go? Add a quick note to your journal..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-700 placeholder-neutral-400"
                value={promptNote}
                onChange={(e) => setPromptNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePromptSubmit();
                  if (e.key === 'Escape') setPromptTaskId(null);
                }}
              />
              <button
                onClick={() => setPromptTaskId(null)}
                className="text-neutral-400 hover:text-neutral-600 flex-shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
          </React.Fragment>
          );
        })}
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-10">
            <p className="text-neutral-500">No tasks match your filters.</p>
          </div>
        )}
      </div>
      <TaskCelebration show={showCelebration} onDone={() => setShowCelebration(false)} />
    </div>
  );
};

export default TaskList;