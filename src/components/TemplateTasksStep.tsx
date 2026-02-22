import React, { useState } from 'react';
import { Plus, Pencil, Trash2, ClipboardList } from 'lucide-react';
import useTemplateStore, { type TemplateTask } from '../stores/templateStore';
import TemplateTaskForm from './TemplateTaskForm';

interface TemplateTasksStepProps {
  templateId: string;
}

const priorityColors: Record<string, string> = {
  high: 'bg-destructive/10 text-destructive',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

const TemplateTasksStep: React.FC<TemplateTasksStepProps> = ({ templateId }) => {
  const { getTemplate, addTask, updateTask, deleteTask } = useTemplateStore();
  const template = getTemplate(templateId);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TemplateTask | null>(null);

  if (!template) return null;

  const handleAdd = (task: Omit<TemplateTask, 'id'>) => {
    addTask(templateId, task);
    setShowForm(false);
  };

  const handleUpdate = (task: Omit<TemplateTask, 'id'>) => {
    if (!editingTask) return;
    updateTask(templateId, editingTask.id, task);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Tasks</h2>
          <p className="text-muted-foreground">
            Define the tasks your new hire needs to complete during onboarding.
          </p>
        </div>
        {!showForm && !editingTask && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus size={18} />
            Add Task
          </button>
        )}
      </div>

      {showForm && (
        <TemplateTaskForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      {editingTask && (
        <TemplateTaskForm
          onSubmit={handleUpdate}
          onCancel={() => setEditingTask(null)}
          initialValues={editingTask}
        />
      )}

      {template.tasks.length > 0 ? (
        <div className="space-y-3">
          {template.tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/20 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-foreground truncate">{task.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{task.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="bg-muted px-2 py-0.5 rounded">{task.department}</span>
                  <span>{task.durationDays} business days</span>
                  {task.tags.length > 0 && (
                    <div className="flex gap-1">
                      {task.tags.map((tag) => (
                        <span key={tag} className="bg-primary/10 text-primary px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-3">
                <button
                  onClick={() => setEditingTask(task)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => deleteTask(templateId, task.id)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
          <ClipboardList size={40} className="mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-1">No tasks yet</h3>
          <p className="text-muted-foreground mb-4 text-sm">Add the tasks your new hire will need to complete.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Add Your First Task
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplateTasksStep;
