import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { TemplateMission } from '../stores/templateStore';

interface TemplateMissionFormProps {
  onSubmit: (mission: Omit<TemplateMission, 'id'>) => void;
  onCancel: () => void;
  initialValues?: TemplateMission;
}

const TemplateMissionForm: React.FC<TemplateMissionFormProps> = ({ onSubmit, onCancel, initialValues }) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [requirements, setRequirements] = useState<{ tag: string; count: number }[]>(
    initialValues?.requirements || [{ tag: '', count: 1 }]
  );
  const [rewardType, setRewardType] = useState<'points' | 'badge' | 'achievement'>(
    initialValues?.reward?.type || 'badge'
  );
  const [rewardValue, setRewardValue] = useState<string>(
    String(initialValues?.reward?.value || '')
  );

  const addRequirement = () => setRequirements([...requirements, { tag: '', count: 1 }]);
  const removeRequirement = (index: number) => setRequirements(requirements.filter((_, i) => i !== index));
  const updateRequirement = (index: number, field: 'tag' | 'count', value: string | number) => {
    setRequirements(requirements.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || requirements.some((r) => !r.tag.trim())) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      requirements: requirements.map((r) => ({ tag: r.tag.trim(), count: r.count })),
      reward: { type: rewardType, value: rewardType === 'points' ? Number(rewardValue) || 0 : rewardValue },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-muted/50 border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground">{initialValues ? 'Edit Mission' : 'Add Mission'}</h4>
        <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            placeholder="e.g. Security Training"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none"
            rows={2}
            placeholder="What the new hire needs to accomplish"
          />
        </div>

        {/* Tag Requirements */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tag Requirements *
            <span className="text-muted-foreground font-normal ml-1">(Journal entries with these tags will count toward completion)</span>
          </label>
          <div className="space-y-2">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={req.tag}
                  onChange={(e) => updateRequirement(index, 'tag', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  placeholder="Tag name"
                  required
                />
                <input
                  type="number"
                  value={req.count}
                  onChange={(e) => updateRequirement(index, 'count', Number(e.target.value))}
                  min={1}
                  className="w-20 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm text-center"
                  title="Required count"
                />
                {requirements.length > 1 && (
                  <button type="button" onClick={() => removeRequirement(index)} className="text-destructive hover:text-destructive/80 p-1">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRequirement}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium"
            >
              <Plus size={14} /> Add requirement
            </button>
          </div>
        </div>

        {/* Reward */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Reward Type</label>
            <select
              value={rewardType}
              onChange={(e) => setRewardType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
            >
              <option value="badge">Badge</option>
              <option value="points">Points</option>
              <option value="achievement">Achievement</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Reward Value</label>
            <input
              type={rewardType === 'points' ? 'number' : 'text'}
              value={rewardValue}
              onChange={(e) => setRewardValue(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              placeholder={rewardType === 'points' ? '100' : 'Badge name'}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-muted">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
          {initialValues ? 'Update Mission' : 'Add Mission'}
        </button>
      </div>
    </form>
  );
};

export default TemplateMissionForm;
