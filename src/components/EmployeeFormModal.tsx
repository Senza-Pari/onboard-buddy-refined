import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Building, MapPin, Phone, Mail, Users, AlertCircle } from 'lucide-react';
import ImageUpload from './ImageUpload';
import type { Employee } from '../stores/employeeStore';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy'>) => void;
  initialValues?: Partial<Employee>;
  templateType: 'remote' | 'onsite' | 'hybrid';
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  templateType,
}) => {
  const [formData, setFormData] = useState<Partial<Employee>>({
    fullName: '',
    startDate: '',
    position: '',
    department: '',
    workArrangement: templateType,
    workArrangementDetails: {
      location: '',
      schedule: '',
      equipment: [],
      remoteTools: [],
      officeAccess: templateType !== 'remote',
      hybridSchedule: templateType === 'hybrid' ? {
        inOffice: ['Monday', 'Tuesday'],
        remote: ['Wednesday', 'Thursday', 'Friday']
      } : undefined,
    },
    supervisor: {
      name: '',
      email: '',
      department: '',
    },
    contact: {
      email: '',
      phone: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: '',
      },
    },
    priority: 'medium',
    tags: [],
    notes: '',
    ...initialValues,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');
  const [newEquipment, setNewEquipment] = useState('');
  const [newTool, setNewTool] = useState('');

  const departments = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
  const relationships = ['Spouse', 'Parent', 'Sibling', 'Friend', 'Other'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName?.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.position?.trim()) newErrors.position = 'Position is required';
    if (!formData.department?.trim()) newErrors.department = 'Department is required';
    if (!formData.supervisor?.name?.trim()) newErrors.supervisorName = 'Supervisor name is required';
    if (!formData.supervisor?.email?.trim()) newErrors.supervisorEmail = 'Supervisor email is required';
    if (!formData.contact?.email?.trim()) newErrors.contactEmail = 'Employee email is required';
    if (!formData.contact?.phone?.trim()) newErrors.contactPhone = 'Phone number is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.supervisor?.email && !emailRegex.test(formData.supervisor.email)) {
      newErrors.supervisorEmail = 'Invalid email format';
    }
    if (formData.contact?.email && !emailRegex.test(formData.contact.email)) {
      newErrors.contactEmail = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSubmit(formData as Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy'>);
    onClose();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((_, i) => i !== index) || []
    });
  };

  const handleAddEquipment = () => {
    if (newEquipment.trim() && !formData.workArrangementDetails?.equipment?.includes(newEquipment.trim())) {
      setFormData({
        ...formData,
        workArrangementDetails: {
          ...formData.workArrangementDetails,
          equipment: [...(formData.workArrangementDetails?.equipment || []), newEquipment.trim()]
        }
      });
      setNewEquipment('');
    }
  };

  const handleAddTool = () => {
    if (newTool.trim() && !formData.workArrangementDetails?.remoteTools?.includes(newTool.trim())) {
      setFormData({
        ...formData,
        workArrangementDetails: {
          ...formData.workArrangementDetails,
          remoteTools: [...(formData.workArrangementDetails?.remoteTools || []), newTool.trim()]
        }
      });
      setNewTool('');
    }
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
          className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {initialValues ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information */}
            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User size={20} className="text-primary-500" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className={`input-field ${errors.fullName ? 'border-red-300' : ''}`}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                  />
                  {errors.fullName && <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Start Date *
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="date"
                      className={`input-field pl-10 ${errors.startDate ? 'border-red-300' : ''}`}
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  {errors.startDate && <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Position/Role *
                  </label>
                  <input
                    type="text"
                    className={`input-field ${errors.position ? 'border-red-300' : ''}`}
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Software Engineer"
                  />
                  {errors.position && <p className="text-sm text-red-600 mt-1">{errors.position}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Department *
                  </label>
                  <select
                    className={`input-field ${errors.department ? 'border-red-300' : ''}`}
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && <p className="text-sm text-red-600 mt-1">{errors.department}</p>}
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
            </section>

            {/* Work Arrangement */}
            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building size={20} className="text-primary-500" />
                Work Arrangement - {templateType.charAt(0).toUpperCase() + templateType.slice(1)}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      {templateType === 'remote' ? 'Remote Location' : 'Office Location'}
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="text"
                        className="input-field pl-10"
                        value={formData.workArrangementDetails?.location}
                        onChange={(e) => setFormData({
                          ...formData,
                          workArrangementDetails: {
                            ...formData.workArrangementDetails,
                            location: e.target.value
                          }
                        })}
                        placeholder={templateType === 'remote' ? 'Home office, City, State' : 'Office address'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Work Schedule
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.workArrangementDetails?.schedule}
                      onChange={(e) => setFormData({
                        ...formData,
                        workArrangementDetails: {
                          ...formData.workArrangementDetails,
                          schedule: e.target.value
                        }
                      })}
                      placeholder="9:00 AM - 5:00 PM EST"
                    />
                  </div>
                </div>

                {templateType === 'hybrid' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Hybrid Schedule
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-neutral-600 mb-1">In Office Days</label>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.workArrangementDetails?.hybridSchedule?.inOffice?.join(', ')}
                          onChange={(e) => setFormData({
                            ...formData,
                            workArrangementDetails: {
                              ...formData.workArrangementDetails,
                              hybridSchedule: {
                                ...formData.workArrangementDetails?.hybridSchedule,
                                inOffice: e.target.value.split(',').map(day => day.trim()).filter(Boolean)
                              }
                            }
                          })}
                          placeholder="Monday, Tuesday, Wednesday"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-600 mb-1">Remote Days</label>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.workArrangementDetails?.hybridSchedule?.remote?.join(', ')}
                          onChange={(e) => setFormData({
                            ...formData,
                            workArrangementDetails: {
                              ...formData.workArrangementDetails,
                              hybridSchedule: {
                                ...formData.workArrangementDetails?.hybridSchedule,
                                remote: e.target.value.split(',').map(day => day.trim()).filter(Boolean)
                              }
                            }
                          })}
                          placeholder="Thursday, Friday"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Required Equipment
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {formData.workArrangementDetails?.equipment?.map((item, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">
                          {item}
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              workArrangementDetails: {
                                ...formData.workArrangementDetails,
                                equipment: formData.workArrangementDetails?.equipment?.filter((_, i) => i !== index)
                              }
                            })}
                            className="text-neutral-500 hover:text-neutral-700"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="input-field flex-1"
                        placeholder="Add equipment (laptop, monitor, etc.)"
                        value={newEquipment}
                        onChange={(e) => setNewEquipment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEquipment())}
                      />
                      <button
                        type="button"
                        onClick={handleAddEquipment}
                        className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {(templateType === 'remote' || templateType === 'hybrid') && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Remote Tools & Software
                    </label>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {formData.workArrangementDetails?.remoteTools?.map((tool, index) => (
                          <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {tool}
                            <button
                              type="button"
                              onClick={() => setFormData({
                                ...formData,
                                workArrangementDetails: {
                                  ...formData.workArrangementDetails,
                                  remoteTools: formData.workArrangementDetails?.remoteTools?.filter((_, i) => i !== index)
                                }
                              })}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="input-field flex-1"
                          placeholder="Add remote tool (Slack, Zoom, etc.)"
                          value={newTool}
                          onChange={(e) => setNewTool(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTool())}
                        />
                        <button
                          type="button"
                          onClick={handleAddTool}
                          className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Supervisor Information */}
            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users size={20} className="text-primary-500" />
                Supervisor Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Supervisor Name *
                  </label>
                  <input
                    type="text"
                    className={`input-field ${errors.supervisorName ? 'border-red-300' : ''}`}
                    value={formData.supervisor?.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      supervisor: { ...formData.supervisor!, name: e.target.value }
                    })}
                    placeholder="Jane Smith"
                  />
                  {errors.supervisorName && <p className="text-sm text-red-600 mt-1">{errors.supervisorName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Supervisor Email *
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="email"
                      className={`input-field pl-10 ${errors.supervisorEmail ? 'border-red-300' : ''}`}
                      value={formData.supervisor?.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        supervisor: { ...formData.supervisor!, email: e.target.value }
                      })}
                      placeholder="jane.smith@company.com"
                    />
                  </div>
                  {errors.supervisorEmail && <p className="text-sm text-red-600 mt-1">{errors.supervisorEmail}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Supervisor Department
                  </label>
                  <select
                    className="input-field"
                    value={formData.supervisor?.department}
                    onChange={(e) => setFormData({
                      ...formData,
                      supervisor: { ...formData.supervisor!, department: e.target.value }
                    })}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Phone size={20} className="text-primary-500" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Employee Email *
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="email"
                        className={`input-field pl-10 ${errors.contactEmail ? 'border-red-300' : ''}`}
                        value={formData.contact?.email}
                        onChange={(e) => setFormData({
                          ...formData,
                          contact: { ...formData.contact!, email: e.target.value }
                        })}
                        placeholder="john.doe@company.com"
                      />
                    </div>
                    {errors.contactEmail && <p className="text-sm text-red-600 mt-1">{errors.contactEmail}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="tel"
                        className={`input-field pl-10 ${errors.contactPhone ? 'border-red-300' : ''}`}
                        value={formData.contact?.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          contact: { ...formData.contact!, phone: e.target.value }
                        })}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    {errors.contactPhone && <p className="text-sm text-red-600 mt-1">{errors.contactPhone}</p>}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-neutral-700 mb-3">Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.contact?.emergencyContact?.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          contact: {
                            ...formData.contact!,
                            emergencyContact: {
                              ...formData.contact?.emergencyContact!,
                              name: e.target.value
                            }
                          }
                        })}
                        placeholder="Emergency contact name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        className="input-field"
                        value={formData.contact?.emergencyContact?.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          contact: {
                            ...formData.contact!,
                            emergencyContact: {
                              ...formData.contact?.emergencyContact!,
                              phone: e.target.value
                            }
                          }
                        })}
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Relationship
                      </label>
                      <select
                        className="input-field"
                        value={formData.contact?.emergencyContact?.relationship}
                        onChange={(e) => setFormData({
                          ...formData,
                          contact: {
                            ...formData.contact!,
                            emergencyContact: {
                              ...formData.contact?.emergencyContact!,
                              relationship: e.target.value
                            }
                          }
                        })}
                      >
                        <option value="">Select relationship</option>
                        {relationships.map(rel => (
                          <option key={rel} value={rel}>{rel}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Tags and Notes */}
            <section>
              <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Tags
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {formData.tags?.map((tag, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(index)}
                            className="text-primary-500 hover:text-primary-700"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="input-field flex-1"
                        placeholder="Add a tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about the employee..."
                  />
                </div>
              </div>
            </section>

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
                {initialValues ? 'Update Employee' : 'Add Employee'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmployeeFormModal;