import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Employee {
  id: string;
  fullName: string;
  startDate: string;
  position: string;
  department: string;
  workArrangement: 'remote' | 'onsite' | 'hybrid';
  workArrangementDetails: {
    location?: string;
    schedule?: string;
    equipment?: string[];
    remoteTools?: string[];
    officeAccess?: boolean;
    hybridSchedule?: {
      inOffice: string[];
      remote: string[];
    };
  };
  supervisor: {
    id?: string;
    name: string;
    email: string;
    department: string;
  };
  contact: {
    email: string;
    phone: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  onboardingProgress: {
    tasksCompleted: number;
    totalTasks: number;
    missionsCompleted: number;
    totalMissions: number;
    currentPhase: 'pre-boarding' | 'first-day' | 'first-week' | 'first-month' | 'completed';
  };
  status: 'active' | 'inactive' | 'archived';
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

export interface AuditLog {
  id: string;
  employeeId: string;
  action: 'created' | 'updated' | 'deleted' | 'archived' | 'restored';
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  performedBy: string;
  timestamp: string;
  reason?: string;
}

interface EmployeeState {
  employees: Employee[];
  auditLogs: AuditLog[];
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy'>, performedBy: string) => string;
  updateEmployee: (id: string, updates: Partial<Employee>, performedBy: string, reason?: string) => void;
  deleteEmployee: (id: string, performedBy: string, reason?: string, archive?: boolean) => void;
  restoreEmployee: (id: string, performedBy: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getEmployeesByDepartment: (department: string) => Employee[];
  getEmployeesBySupervisor: (supervisorId: string) => Employee[];
  getAuditLogs: (employeeId?: string) => AuditLog[];
  searchEmployees: (query: string) => Employee[];
  validateEmployee: (employee: Partial<Employee>) => string[];
}

const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set, get) => ({
      employees: [],
      auditLogs: [],

      validateEmployee: (employee) => {
        const errors: string[] = [];

        if (!employee.fullName?.trim()) {
          errors.push('Full name is required');
        }

        if (!employee.startDate) {
          errors.push('Start date is required');
        } else {
          const startDate = new Date(employee.startDate);
          const today = new Date();
          if (startDate < new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())) {
            errors.push('Start date cannot be more than 1 year in the past');
          }
        }

        if (!employee.position?.trim()) {
          errors.push('Position/role is required');
        }

        if (!employee.department?.trim()) {
          errors.push('Department is required');
        }

        if (!employee.workArrangement) {
          errors.push('Work arrangement is required');
        }

        if (!employee.supervisor?.name?.trim()) {
          errors.push('Supervisor name is required');
        }

        if (!employee.supervisor?.email?.trim()) {
          errors.push('Supervisor email is required');
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(employee.supervisor.email)) {
            errors.push('Supervisor email must be valid');
          }
        }

        if (!employee.contact?.email?.trim()) {
          errors.push('Employee email is required');
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(employee.contact.email)) {
            errors.push('Employee email must be valid');
          }
        }

        if (!employee.contact?.phone?.trim()) {
          errors.push('Phone number is required');
        }

        return errors;
      },

      addEmployee: (employeeData, performedBy) => {
        const errors = get().validateEmployee(employeeData);
        if (errors.length > 0) {
          throw new Error(errors.join(', '));
        }

        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        const newEmployee: Employee = {
          ...employeeData,
          id,
          createdAt: now,
          updatedAt: now,
          createdBy: performedBy,
          lastModifiedBy: performedBy,
          status: 'active',
          onboardingProgress: {
            tasksCompleted: 0,
            totalTasks: 0,
            missionsCompleted: 0,
            totalMissions: 0,
            currentPhase: 'pre-boarding',
            ...employeeData.onboardingProgress,
          },
          workArrangementDetails: {
            ...employeeData.workArrangementDetails,
          },
          tags: employeeData.tags || [],
          notes: employeeData.notes || '',
        };

        // Create audit log
        const auditLog: AuditLog = {
          id: crypto.randomUUID(),
          employeeId: id,
          action: 'created',
          changes: [
            {
              field: 'employee',
              oldValue: null,
              newValue: newEmployee,
            },
          ],
          performedBy,
          timestamp: now,
        };

        set((state) => ({
          employees: [...state.employees, newEmployee],
          auditLogs: [...state.auditLogs, auditLog],
        }));

        return id;
      },

      updateEmployee: (id, updates, performedBy, reason) => {
        const employee = get().employees.find((emp) => emp.id === id);
        if (!employee) {
          throw new Error('Employee not found');
        }

        const updatedEmployee = { ...employee, ...updates };
        const errors = get().validateEmployee(updatedEmployee);
        if (errors.length > 0) {
          throw new Error(errors.join(', '));
        }

        const now = new Date().toISOString();
        const changes: AuditLog['changes'] = [];

        // Track changes
        Object.keys(updates).forEach((key) => {
          const oldValue = (employee as any)[key];
          const newValue = (updates as any)[key];
          if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changes.push({
              field: key,
              oldValue,
              newValue,
            });
          }
        });

        const finalEmployee: Employee = {
          ...updatedEmployee,
          updatedAt: now,
          lastModifiedBy: performedBy,
        };

        // Create audit log
        const auditLog: AuditLog = {
          id: crypto.randomUUID(),
          employeeId: id,
          action: 'updated',
          changes,
          performedBy,
          timestamp: now,
          reason,
        };

        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === id ? finalEmployee : emp
          ),
          auditLogs: [...state.auditLogs, auditLog],
        }));
      },

      deleteEmployee: (id, performedBy, reason, archive = true) => {
        const employee = get().employees.find((emp) => emp.id === id);
        if (!employee) {
          throw new Error('Employee not found');
        }

        const now = new Date().toISOString();
        const action = archive ? 'archived' : 'deleted';

        // Create audit log
        const auditLog: AuditLog = {
          id: crypto.randomUUID(),
          employeeId: id,
          action,
          changes: [
            {
              field: 'status',
              oldValue: employee.status,
              newValue: archive ? 'archived' : 'deleted',
            },
          ],
          performedBy,
          timestamp: now,
          reason,
        };

        if (archive) {
          // Archive the employee
          set((state) => ({
            employees: state.employees.map((emp) =>
              emp.id === id
                ? {
                    ...emp,
                    status: 'archived',
                    updatedAt: now,
                    lastModifiedBy: performedBy,
                  }
                : emp
            ),
            auditLogs: [...state.auditLogs, auditLog],
          }));
        } else {
          // Permanently delete
          set((state) => ({
            employees: state.employees.filter((emp) => emp.id !== id),
            auditLogs: [...state.auditLogs, auditLog],
          }));
        }
      },

      restoreEmployee: (id, performedBy) => {
        const employee = get().employees.find((emp) => emp.id === id);
        if (!employee || employee.status !== 'archived') {
          throw new Error('Employee not found or not archived');
        }

        const now = new Date().toISOString();

        // Create audit log
        const auditLog: AuditLog = {
          id: crypto.randomUUID(),
          employeeId: id,
          action: 'restored',
          changes: [
            {
              field: 'status',
              oldValue: 'archived',
              newValue: 'active',
            },
          ],
          performedBy,
          timestamp: now,
        };

        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === id
              ? {
                  ...emp,
                  status: 'active',
                  updatedAt: now,
                  lastModifiedBy: performedBy,
                }
              : emp
          ),
          auditLogs: [...state.auditLogs, auditLog],
        }));
      },

      getEmployeeById: (id) => {
        return get().employees.find((emp) => emp.id === id);
      },

      getEmployeesByDepartment: (department) => {
        return get().employees.filter(
          (emp) => emp.department === department && emp.status !== 'archived'
        );
      },

      getEmployeesBySupervisor: (supervisorId) => {
        return get().employees.filter(
          (emp) => emp.supervisor.id === supervisorId && emp.status !== 'archived'
        );
      },

      getAuditLogs: (employeeId) => {
        const logs = get().auditLogs;
        return employeeId
          ? logs.filter((log) => log.employeeId === employeeId)
          : logs;
      },

      searchEmployees: (query) => {
        const searchTerm = query.toLowerCase();
        return get().employees.filter(
          (emp) =>
            emp.status !== 'archived' &&
            (emp.fullName.toLowerCase().includes(searchTerm) ||
              emp.position.toLowerCase().includes(searchTerm) ||
              emp.department.toLowerCase().includes(searchTerm) ||
              emp.contact.email.toLowerCase().includes(searchTerm) ||
              emp.supervisor.name.toLowerCase().includes(searchTerm))
        );
      },
    }),
    {
      name: 'employee-management',
      version: 1,
    }
  )
);

export default useEmployeeStore;