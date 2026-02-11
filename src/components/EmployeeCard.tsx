import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash2, Archive, RotateCcw, User, Calendar, Building, MapPin, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import type { Employee } from '../stores/employeeStore';

interface EmployeeCardProps {
  employee: Employee;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onArchive: (employee: Employee) => void;
  onRestore: (employee: Employee) => void;
  showArchived?: boolean;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  showArchived = false,
}) => {
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
    <motion.div
      className={`card hover:shadow-medium transition-all cursor-pointer ${
        employee.status === 'archived' ? 'opacity-60 bg-neutral-50' : ''
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onView(employee)}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-200 flex-shrink-0">
          <div className="w-full h-full flex items-center justify-center">
            <User size={32} className="text-neutral-400" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-lg truncate">{employee.fullName}</h3>
              <p className="text-neutral-600 text-sm">{employee.position}</p>
              <p className="text-neutral-500 text-xs">{employee.department}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(employee.priority)}`}>
                {employee.priority}
              </span>
              <span className="text-lg" title={`${employee.workArrangement} work`}>
                {getWorkArrangementIcon(employee.workArrangement)}
              </span>
            </div>
          </div>

          {/* Key Information */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Calendar size={14} />
              <span>Started {format(new Date(employee.startDate), 'MMM d, yyyy')}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <User size={14} />
              <span>Reports to {employee.supervisor.name}</span>
            </div>

            {employee.workArrangementDetails.location && (
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <MapPin size={14} />
                <span className="truncate">{employee.workArrangementDetails.location}</span>
              </div>
            )}
          </div>

          {/* Onboarding Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Onboarding Progress</span>
              <span>{overallProgress}%</span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getProgressColor(overallProgress)}`}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>{employee.onboardingProgress.tasksCompleted}/{employee.onboardingProgress.totalTasks} tasks</span>
              <span className="capitalize">{employee.onboardingProgress.currentPhase}</span>
            </div>
          </div>

          {/* Tags */}
          {employee.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {employee.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
              {employee.tags.length > 3 && (
                <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs">
                  +{employee.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Contact Info */}
          <div className="flex items-center gap-4 text-xs text-neutral-500 mb-3">
            <div className="flex items-center gap-1">
              <Mail size={12} />
              <span className="truncate">{employee.contact.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone size={12} />
              <span>{employee.contact.phone}</span>
            </div>
          </div>

          {/* Status */}
          {employee.status === 'archived' && (
            <div className="text-xs text-neutral-500 mb-2">
              Archived • Last modified by {employee.lastModifiedBy}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(employee);
            }}
            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
            title="View Details"
          >
            <Eye size={16} />
          </button>

          {employee.status !== 'archived' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(employee);
                }}
                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                title="Edit Employee"
              >
                <Edit size={16} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(employee);
                }}
                className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg"
                title="Archive Employee"
              >
                <Archive size={16} />
              </button>
            </>
          )}

          {employee.status === 'archived' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRestore(employee);
              }}
              className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg"
              title="Restore Employee"
            >
              <RotateCcw size={16} />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(employee);
            }}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
            title="Delete Employee"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeCard;