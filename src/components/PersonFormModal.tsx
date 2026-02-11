import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Plus } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface PersonFormData {
  name: string;
  role: string;
  department: string;
  description: string;
  meetingDate: string;
  meetingTime: string;
  topics: string[];
  priority: 'high' | 'medium' | 'low';
  photoUrl?: string;
}

interface PersonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (person: PersonFormData) => void;
  initialValues?: Partial<PersonFormData>;
}

const PersonFormModal: React.FC<PersonFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}) => {
  const [formData, setFormData] = useState<PersonFormData>({
    name: '',
    role: '',
    department: '',
    description: '',
    meetingDate: '',
    meetingTime: '',
    topics: [],
    priority: 'medium',
    photoUrl: '',
    ...initialValues
  });
  const [newTopic, setNewTopic] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
    
    // Reset form
    setFormData({
      name: '',
      role: '',
      department: '',
      description: '',
      meetingDate: '',
      meetingTime: '',
      topics: [],
      priority: 'medium',
      photoUrl: '',
    });
    setErrors({});
    onClose();
  };

  const handleAddTopic = () => {
    if (newTopic.trim() && !formData.topics.includes(newTopic.trim())) {
      setFormData({
        ...formData,
        topics: [...formData.topics, newTopic.trim()]
      });
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (index: number) => {
    setFormData({
      ...formData,
      topics: formData.topics.filter((_, i) => i !== index)
    });
  };

  const handleImageUpload = (file: File, croppedBlob?: Blob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        photoUrl: reader.result as string
      });
    };
    reader.readAsDataURL(croppedBlob || file);
  };

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
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {initialValues ? 'Edit Contact' : 'Add New Contact'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className={`input-field ${errors.name ? 'border-red-300' : ''}`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Role/Title *
                  </label>
                  <input
                    type="text"
                    required
                    className={`input-field ${errors.role ? 'border-red-300' : ''}`}
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g., Senior Developer, HR Manager"
                  />
                  {errors.role && (
                    <p className="text-sm text-red-600 mt-1">{errors.role}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    className={`input-field ${errors.department ? 'border-red-300' : ''}`}
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., Engineering, Human Resources"
                  />
                  {errors.department && (
                    <p className="text-sm text-red-600 mt-1">{errors.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Priority Level
                  </label>
                  <select
                    className="input-field"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Profile Photo (Optional)
                </label>
                <ImageUpload
                  onUpload={handleImageUpload}
                  aspectRatio={1}
                  enableCropping
                  currentImageUrl={formData.photoUrl}
                  className="h-48"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Description *
              </label>
              <textarea
                required
                className={`input-field ${errors.description ? 'border-red-300' : ''}`}
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of their role and how they'll help with onboarding"
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Meeting Date (Optional)
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="date"
                    className="input-field pl-10"
                    value={formData.meetingDate}
                    onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Meeting Time (Optional)
                </label>
                <input
                  type="time"
                  className="input-field"
                  value={formData.meetingTime}
                  onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Discussion Topics (Optional)
              </label>
              <div className="space-y-3">
                {formData.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm"
                      >
                        {topic}
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(index)}
                          className="text-neutral-500 hover:text-neutral-700"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="Add a discussion topic"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic())}
                  />
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    disabled={!newTopic.trim()}
                    className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                  </button>
                </div>
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
                {initialValues ? 'Update Contact' : 'Add Contact'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PersonFormModal;