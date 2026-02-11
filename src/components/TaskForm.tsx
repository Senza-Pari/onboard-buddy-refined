import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import TagInput from './TagInput';
import useTagStore from '../stores/tagStore';
import type { Task } from '../stores/taskStore';

interface TaskFormProps {
  initialValues?: Partial<Task>;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  userOnboardingStartDate: string;
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  userOnboardingStartDate,
}) => {
  const { tags, addTag } = useTagStore();
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    tags: [],
    notes: '',
    startDate: userOnboardingStartDate,
    ...initialValues
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate || !formData.tags?.length) return;

    onSubmit({
      ...formData,
      startDate: userOnboardingStartDate,
      completed: false,
    } as Omit<Task, 'id' | 'createdAt'>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Title
        </label>
        <input
          type="text"
          required
          className="input-field"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter task title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Description
        </label>
        <textarea
          className="input-field"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the task"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Tags
        </label>
        <TagInput
          selectedTags={formData.tags || []}
          availableTags={tags.map(tag => tag.name)}
          onTagsChange={(tags) => setFormData({ ...formData, tags })}
          onAddNewTag={(name) => addTag({ name, color: '#3B82F6', description: '' })}
          helperText="Add at least one tag to categorize your task"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Due Date
          </label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="date"
              required
              className="input-field pl-10"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              min={userOnboardingStartDate}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Priority
          </label>
          <select
            className="input-field"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          className="input-field"
          rows={2}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add any additional notes"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!formData.title || !formData.dueDate || !formData.tags?.length}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
        >
          {initialValues ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;