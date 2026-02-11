import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Search, Archive, RotateCcw } from 'lucide-react';
import EmployeeFormModal from '../components/EmployeeFormModal';
import EmployeeCard from '../components/EmployeeCard';
import EmployeeDetailsModal from '../components/EmployeeDetailsModal';
import EmployeeDeleteDialog from '../components/EmployeeDeleteDialog';
import useEmployeeStore, { type Employee } from '../stores/employeeStore';
import useAuthStore from '../stores/authStore';

const TemplateBuilder: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    restoreEmployee,
    searchEmployees,
  } = useEmployeeStore();

  const [currentStep] = useState(2); // Start at People step
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    employee: Employee | null;
  }>({ isOpen: false, employee: null });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [showArchived, setShowArchived] = useState(false);

  const templateType = (type as 'remote' | 'onsite' | 'hybrid') || 'remote';
  
  const steps = [
    { id: 0, name: 'Tasks', completed: true },
    { id: 1, name: 'Missions', completed: true },
    { id: 2, name: 'People', completed: false },
  ];

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    // Status filter
    if (showArchived && employee.status !== 'archived') return false;
    if (!showArchived && employee.status === 'archived') return false;

    // Search filter
    if (searchTerm) {
      const searchResults = searchEmployees(searchTerm);
      if (!searchResults.find(emp => emp.id === employee.id)) return false;
    }

    // Department filter
    if (selectedDepartment && employee.department !== selectedDepartment) return false;

    return true;
  });

  const departments = Array.from(new Set(employees.map(emp => emp.department))).filter(Boolean);

  const handleAddEmployee = (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy'>) => {
    try {
      addEmployee(employeeData, user?.name || 'Unknown User');
      setIsAddingEmployee(false);
    } catch (error) {
      console.error('Error adding employee:', error);
      alert(error instanceof Error ? error.message : 'Failed to add employee');
    }
  };

  const handleUpdateEmployee = (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy'>) => {
    if (!editingEmployee) return;
    
    try {
      updateEmployee(editingEmployee.id, employeeData, user?.name || 'Unknown User', 'Employee information updated');
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error updating employee:', error);
      alert(error instanceof Error ? error.message : 'Failed to update employee');
    }
  };

  const handleDeleteEmployee = (employee: Employee, archive: boolean, reason: string) => {
    try {
      deleteEmployee(employee.id, user?.name || 'Unknown User', reason, archive);
      setDeleteDialog({ isOpen: false, employee: null });
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete employee');
    }
  };

  const handleRestoreEmployee = (employee: Employee) => {
    try {
      restoreEmployee(employee.id, user?.name || 'Unknown User');
    } catch (error) {
      console.error('Error restoring employee:', error);
      alert(error instanceof Error ? error.message : 'Failed to restore employee');
    }
  };

  const getTemplateTitle = () => {
    switch (templateType) {
      case 'remote': return 'Remote Hire Template';
      case 'onsite': return 'Onsite Hire Template';
      case 'hybrid': return 'Hybrid Hire Template';
      default: return 'Custom Template Builder';
    }
  };

  const getTemplateDescription = () => {
    switch (templateType) {
      case 'remote': return 'Customize your onboarding workflow for remote employees with digital-first processes.';
      case 'onsite': return 'Customize your onboarding workflow for onsite employees with in-person processes.';
      case 'hybrid': return 'Customize your onboarding workflow for hybrid employees with flexible arrangements.';
      default: return 'Build your custom onboarding workflow from scratch with complete flexibility.';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/templates"
          className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Templates
        </Link>

        <h1 className="text-3xl font-bold mb-2">{getTemplateTitle()}</h1>
        <p className="text-neutral-700">{getTemplateDescription()}</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id === currentStep
                      ? 'bg-primary-500 text-white'
                      : step.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {step.id + 1}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    step.id === currentStep ? 'text-primary-600' : 'text-neutral-600'
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    step.completed ? 'bg-green-500' : 'bg-neutral-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Continue Button - Fixed at top */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium"
        >
          Continue to Dashboard
        </button>
      </div>

      {/* People Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Key People & Meetings</h2>
            <p className="text-neutral-600">
              Add the core team members or any person your new hire should get to know during onboarding.
              These could include their manager, mentor, HR representative, or IT support contact.
            </p>
          </div>
          <button
            onClick={() => setIsAddingEmployee(true)}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Contact
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search employees..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input-field px-3 py-2 sm:w-48"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showArchived
                ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {showArchived ? <RotateCcw size={16} /> : <Archive size={16} />}
            {showArchived ? 'Show Active' : 'Show Archived'}
          </button>
        </div>

        {/* Employee Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Users size={16} />
            <span>
              {showArchived ? 'Archived' : 'Active'} Employees ({filteredEmployees.length})
            </span>
          </div>

          {filteredEmployees.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredEmployees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onView={setViewingEmployee}
                  onEdit={setEditingEmployee}
                  onDelete={(emp) => setDeleteDialog({ isOpen: true, employee: emp })}
                  onArchive={(emp) => setDeleteDialog({ isOpen: true, employee: emp })}
                  onRestore={handleRestoreEmployee}
                  showArchived={showArchived}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                {showArchived ? 'No Archived Employees' : 'No Employees Added Yet'}
              </h3>
              <p className="text-neutral-600 mb-4">
                {showArchived 
                  ? 'There are no archived employees to display.'
                  : 'Start building your team by adding key people for the onboarding process.'
                }
              </p>
              {!showArchived && (
                <button
                  onClick={() => setIsAddingEmployee(true)}
                  className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Add Your First Contact
                </button>
              )}
            </div>
          )}
        </div>

        {/* Finish Setup Button */}
        <div className="flex justify-end pt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary-500 text-white px-8 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium text-lg"
          >
            Finish Setup
          </button>
        </div>
      </div>

      {/* Modals */}
      <EmployeeFormModal
        isOpen={isAddingEmployee}
        onClose={() => setIsAddingEmployee(false)}
        onSubmit={handleAddEmployee}
        templateType={templateType}
      />

      <EmployeeFormModal
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        onSubmit={handleUpdateEmployee}
        initialValues={editingEmployee || undefined}
        templateType={templateType}
      />

      <EmployeeDetailsModal
        isOpen={!!viewingEmployee}
        onClose={() => setViewingEmployee(null)}
        employee={viewingEmployee}
      />

      <EmployeeDeleteDialog
        isOpen={deleteDialog.isOpen}
        employee={deleteDialog.employee}
        onClose={() => setDeleteDialog({ isOpen: false, employee: null })}
        onConfirm={handleDeleteEmployee}
      />
    </div>
  );
};

export default TemplateBuilder;