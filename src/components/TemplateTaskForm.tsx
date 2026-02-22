import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { TemplateTask } from '../stores/templateStore';

interface TemplateTaskFormProps {
  onSubmit: (task: Omit<TemplateTask, 'id'>) => void;
  onCancel: () => void;
  initialValues?: TemplateTask;
}

const TemplateTaskForm: React.FC<TemplateTaskFormProps> = ({ onSubmit, onCancel, initialValues }) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [department, setDepartment] = useState<TemplateTask['department']>(initialValues?.department || 'HR');
  const [priority, setPriority] = useState<TemplateTask['priority']>(initialValues?.priority || 'medium');
  const [tags, setTags] = useState(initialValues?.tags?.join(', ') || '');
  const [durationDays, setDurationDays] = useState(initialValues?.durationDays || 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      department,
      priority,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      durationDays,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-muted/50 border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground">{initialValues ? 'Edit Task' : 'Add Task'}</h4>
        <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            placeholder="e.g. Set up VPN access"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none"
            rows={2}
            placeholder="Brief description of what needs to be done"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value as TemplateTask['department'])}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
          >
            <option value="HR">HR</option>
            <option value="IT">IT</option>
            <option value="Manager">Manager</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TemplateTask['priority'])}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            placeholder="admin, hr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Duration (business days)</label>
          <input
            type="number"
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            min={1}
            max={30}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-muted">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
          {initialValues ? 'Update Task' : 'Add Task'}
        </button>
      </div>
    </form>
  );
};

export default TemplateTaskForm;
