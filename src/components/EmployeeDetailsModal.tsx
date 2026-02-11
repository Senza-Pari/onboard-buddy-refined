import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, Building, MapPin, Phone, Users, Clock, Tag, FileText } from 'lucide-react';
import { format } from 'date-fns';
import type { Employee } from '../stores/employeeStore';

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  if (!isOpen || !employee) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getWorkArrangementIcon = (arrangement: string) => {
    switch (arrangement) {
      case 'remote': return '🏠';
      case 'onsite': return '🏢';
      case 'hybrid': return '🔄';
      default: return '💼';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const overallProgress = employee.onboardingProgress.totalTasks > 0 
    ? Math.round((employee.onboardingProgress.tasksCompleted / employee.onboardingProgress.totalTasks) * 100)
    : 0;

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
              <h2 className="text-xl font-bold">Employee Details</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Header Section */}
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-neutral-200 flex-shrink-0">
                <div className="w-full h-full flex items-center justify-center">
                  <User size={48} className="text-neutral-400" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{employee.fullName}</h3>
                    <p className="text-lg text-neutral-700 mb-1">{employee.position}</p>
                    <p className="text-neutral-600">{employee.department}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(employee.priority)}`}>
                      {employee.priority} priority
                    </span>
                    <span className="text-2xl" title={`${employee.workArrangement} work`}>
                      {getWorkArrangementIcon(employee.workArrangement)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      employee.status === 'active' ? 'bg-green-100 text-green-700' :
                      employee.status === 'archived' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {employee.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-neutral-500" />
                    <span>Started {format(new Date(employee.startDate), 'MMMM d, yyyy')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-neutral-500" />
                    <span>Created {format(new Date(employee.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Onboarding Progress */}
            <section>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building size={20} className="text-primary-500" />
                Onboarding Progress
              </h4>
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Overall Progress</span>
                  <span>{overallProgress}%</span>
                </div>
                <div className="h-3 bg-neutral-200 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full transition-all duration-300 ${getProgressColor(overallProgress)}`}
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-600">
                      {employee.onboardingProgress.tasksCompleted}
                    </div>
                    <div className="text-xs text-neutral-600">Tasks Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-neutral-600">
                      {employee.onboardingProgress.totalTasks}
                    </div>
                    <div className="text-xs text-neutral-600">Total Tasks</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {employee.onboardingProgress.missionsCompleted}
                    </div>
                    <div className="text-xs text-neutral-600">Missions Done</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-neutral-600">
                      {employee.onboardingProgress.totalMissions}
                    </div>
                    <div className="text-xs text-neutral-600">Total Missions</div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    employee.onboardingProgress.currentPhase === 'completed' ? 'bg-green-100 text-green-700' :
                    employee.onboardingProgress.currentPhase === 'first-month' ? 'bg-blue-100 text-blue-700' :
                    employee.onboardingProgress.currentPhase === 'first-week' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-neutral-100 text-neutral-700'
                  }`}>
                    Current Phase: {employee.onboardingProgress.currentPhase.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </section>

            {/* Work Arrangement */}
            <section>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-primary-500" />
                Work Arrangement - {employee.workArrangement.charAt(0).toUpperCase() + employee.workArrangement.slice(1)}
              </h4>
              <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                {employee.workArrangementDetails.location && (
                  <div>
                    <span className="font-medium text-sm">Location:</span>
                    <span className="ml-2 text-sm">{employee.workArrangementDetails.location}</span>
                  </div>
                )}
                
                {employee.workArrangementDetails.schedule && (
                  <div>
                    <span className="font-medium text-sm">Schedule:</span>
                    <span className="ml-2 text-sm">{employee.workArrangementDetails.schedule}</span>
                  </div>
                )}

                {employee.workArrangement === 'hybrid' && employee.workArrangementDetails.hybridSchedule && (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-sm">In Office:</span>
                        <div className="mt-1">
                          {employee.workArrangementDetails.hybridSchedule.inOffice?.map((day, index) => (
                            <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs mr-1 mb-1">
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-sm">Remote:</span>
                        <div className="mt-1">
                          {employee.workArrangementDetails.hybridSchedule.remote?.map((day, index) => (
                            <span key={index} className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs mr-1 mb-1">
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {employee.workArrangementDetails.equipment && employee.workArrangementDetails.equipment.length > 0 && (
                  <div>
                    <span className="font-medium text-sm">Equipment:</span>
                    <div className="mt-1">
                      {employee.workArrangementDetails.equipment.map((item, index) => (
                        <span key={index} className="inline-block px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs mr-1 mb-1">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {employee.workArrangementDetails.remoteTools && employee.workArrangementDetails.remoteTools.length > 0 && (
                  <div>
                    <span className="font-medium text-sm">Remote Tools:</span>
                    <div className="mt-1">
                      {employee.workArrangementDetails.remoteTools.map((tool, index) => (
                        <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs mr-1 mb-1">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Supervisor Information */}
            <section>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users size={20} className="text-primary-500" />
                Supervisor Information
              </h4>
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium text-sm">Name:</span>
                    <p className="text-sm mt-1">{employee.supervisor.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Email:</span>
                    <p className="text-sm mt-1">
                      <a href={`mailto:${employee.supervisor.email}`} className="text-primary-600 hover:text-primary-700">
                        {employee.supervisor.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Department:</span>
                    <p className="text-sm mt-1">{employee.supervisor.department}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Phone size={20} className="text-primary-500" />
                Contact Information
              </h4>
              <div className="bg-neutral-50 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-sm">Email:</span>
                    <p className="text-sm mt-1">
                      <a href={`mailto:${employee.contact.email}`} className="text-primary-600 hover:text-primary-700">
                        {employee.contact.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Phone:</span>
                    <p className="text-sm mt-1">
                      <a href={`tel:${employee.contact.phone}`} className="text-primary-600 hover:text-primary-700">
                        {employee.contact.phone}
                      </a>
                    </p>
                  </div>
                </div>

                {employee.contact.emergencyContact && (
                  <div>
                    <span className="font-medium text-sm">Emergency Contact:</span>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-xs text-neutral-600">Name:</span>
                        <p className="text-sm">{employee.contact.emergencyContact.name}</p>
                      </div>
                      <div>
                        <span className="text-xs text-neutral-600">Phone:</span>
                        <p className="text-sm">
                          <a href={`tel:${employee.contact.emergencyContact.phone}`} className="text-primary-600 hover:text-primary-700">
                            {employee.contact.emergencyContact.phone}
                          </a>
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-neutral-600">Relationship:</span>
                        <p className="text-sm">{employee.contact.emergencyContact.relationship}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Tags and Notes */}
            <section>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Tag size={20} className="text-primary-500" />
                Additional Information
              </h4>
              <div className="space-y-4">
                {employee.tags.length > 0 && (
                  <div>
                    <span className="font-medium text-sm">Tags:</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {employee.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {employee.notes && (
                  <div>
                    <span className="font-medium text-sm">Notes:</span>
                    <div className="mt-2 bg-neutral-50 rounded-lg p-3">
                      <p className="text-sm text-neutral-700 whitespace-pre-wrap">{employee.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Audit Information */}
            <section>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText size={20} className="text-primary-500" />
                Record Information
              </h4>
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Created:</span>
                    <p className="mt-1">{format(new Date(employee.createdAt), 'MMMM d, yyyy \'at\' h:mm a')}</p>
                    <p className="text-neutral-600">by {employee.createdBy}</p>
                  </div>
                  <div>
                    <span className="font-medium">Last Modified:</span>
                    <p className="mt-1">{format(new Date(employee.updatedAt), 'MMMM d, yyyy \'at\' h:mm a')}</p>
                    <p className="text-neutral-600">by {employee.lastModifiedBy}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmployeeDetailsModal;