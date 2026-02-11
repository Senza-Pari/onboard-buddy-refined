import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar, Link2 } from 'lucide-react';
import TagInput from './TagInput';
import useGalleryStore from '../stores/galleryStore';
import type { Mission, MissionRequirement } from '../stores/missionStore';

interface MissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mission: Omit<Mission, 'id' | 'progress' | 'completed' | 'createdAt' | 'updatedAt'>) => void;
  initialValues?: Partial<Mission>;
}

const MissionFormModal: React.FC<MissionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}) => {
  const { tags: availableTags, addTag } = useGalleryStore();
  const [errors, setErrors] = useState<string[]>([]);
  
  const defaultRequirement = { tag: '', count: 1, current: 0 };
  const initialRequirements = Array.isArray(initialValues?.requirements) 
    ? initialValues.requirements 
    : [defaultRequirement];

  const [formData, setFormData] = useState<Partial<Mission>>({
    title: '',
    description: '',
    requirements: initialRequirements,
    deadline: '',
    link: '',
    reward: {
      type: 'points',
      value: 100
    },
    ...initialValues,
  });

  const handleAddRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [
        ...(Array.isArray(prev.requirements) ? prev.requirements : []),
        { tag: '', count: 1, current: 0 }
      ]
    }));
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: (Array.isArray(prev.requirements) ? prev.requirements : [])
        .filter((_, i) => i !== index)
    }));
  };

  const handleRequirementChange = (index: number, updates: Partial<MissionRequirement>) => {
    setFormData(prev => ({
      ...prev,
      requirements: (Array.isArray(prev.requirements) ? prev.requirements : [])
        .map((req, i) => i === index ? { ...req, ...updates } : req)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const processedData = { ...formData };
    if (processedData.link) {
      if (!processedData.link.startsWith('http://') && !processedData.link.startsWith('https://')) {
        processedData.link = `https://${processedData.link}`;
      }
    }

    try {
      onSubmit(processedData as Omit<Mission, 'id' | 'progress' | 'completed' | 'createdAt' | 'updatedAt'>);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        requirements: [defaultRequirement],
        deadline: '',
        link: '',
        reward: {
          type: 'points',
          value: 100
        }
      });
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        setErrors(error.message.split(', '));
      }
    }
  };

  const requirements = Array.isArray(formData.requirements) ? formData.requirements : [defaultRequirement];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {initialValues ? 'Edit Mission' : 'Add New Mission'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.length > 0 && (
              <motion.div
                className="bg-red-50 text-red-700 p-4 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h4 className="font-medium mb-2">Please fix the following errors:</h4>
                <ul className="list-disc list-inside text-sm">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Mission Title
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="Enter mission title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Describe the mission objectives"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Link (Optional)
              </label>
              <div className="relative">
                <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="Enter URL (https:// will be added if missing)"
                  value={formData.link || ''}
                  onChange={(e) => {
                    let value = e.target.value.trim();
                    setFormData({ ...formData, link: value });
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Tag Requirements
                </label>
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Requirement
                </button>
              </div>

              <div className="space-y-4">
                {requirements.map((req, index) => (
                  <div key={index} className="bg-neutral-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-sm font-medium text-neutral-700">
                        Requirement #{index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(index)}
                        className="text-neutral-500 hover:text-neutral-700"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <TagInput
                      selectedTags={req.tag ? [req.tag] : []}
                      availableTags={availableTags}
                      onTagsChange={tags => handleRequirementChange(index, { tag: tags[0] || '' })}
                      onAddNewTag={addTag}
                      showCount={true}
                      itemCount={req.count}
                      helperText="Tags must be applied to gallery entries"
                      className="mb-3"
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={req.count}
                        onChange={e => handleRequirementChange(index, { count: parseInt(e.target.value) })}
                        className="input-field w-24"
                      />
                      <span className="text-sm text-neutral-600">items needed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Deadline (Optional)
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="date"
                  value={formData.deadline || ''}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Reward
              </label>
              <div className="flex gap-3">
                <select
                  value={formData.reward?.type}
                  onChange={e => setFormData({
                    ...formData,
                    reward: { ...formData.reward!, type: e.target.value as 'points' | 'badge' | 'achievement' }
                  })}
                  className="input-field w-1/3"
                >
                  <option value="points">Points</option>
                  <option value="badge">Badge</option>
                  <option value="achievement">Achievement</option>
                </select>
                <input
                  type={formData.reward?.type === 'points' ? 'number' : 'text'}
                  value={formData.reward?.value}
                  onChange={e => setFormData({
                    ...formData,
                    reward: { ...formData.reward!, value: e.target.value }
                  })}
                  className="input-field flex-1"
                  placeholder={formData.reward?.type === 'points' ? 'Enter points' : 'Enter reward name'}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                {initialValues ? 'Update Mission' : 'Create Mission'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MissionFormModal;