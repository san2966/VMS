import React, { useState, useEffect } from 'react';
import { Edit, Trash2, User, MapPin, Phone, Building } from 'lucide-react';
import { Employee, Organization } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import EmployeeEditModal from './EmployeeEditModal';

interface EmployeeListProps {
  organizations: Organization[];
  onEmployeeUpdate: () => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ organizations, onEmployeeUpdate }) => {
  const { currentUser, userRole } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, [currentUser, userRole]);

  const loadEmployees = () => {
    const savedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
    
    // Filter employees to only show those created by current admin user
    let filteredEmployees = savedEmployees;
    
    if (currentUser) {
      if (userRole === 'admin') {
        // Admin can only see employees they created in their organizations
        const userOrganizations = organizations.filter(org => org.createdBy === currentUser.id);
        const userOrgIds = userOrganizations.map(org => org.id);
        filteredEmployees = savedEmployees.filter((emp: Employee) => 
          userOrgIds.includes(emp.organizationId) && emp.createdBy === currentUser.id
        );
      } else if (userRole === 'superuser') {
        // Super user can see all employees
        filteredEmployees = savedEmployees;
      }
    }
    
    setEmployees(filteredEmployees);
  };

  const handleEdit = (employee: Employee) => {
    // Check if user has permission to edit this employee
    if (userRole === 'admin' && currentUser) {
      const userOrganizations = organizations.filter(org => org.createdBy === currentUser.id);
      const userOrgIds = userOrganizations.map(org => org.id);
      
      if (!userOrgIds.includes(employee.organizationId)) {
        alert('You can only edit employees from your own organizations.');
        return;
      }
    }
    
    setEditingEmployee(employee);
    setShowEditModal(true);
  };

  const handleDelete = (employeeId: string) => {
    const employeeToDelete = employees.find(emp => emp.id === employeeId);
    
    // Check if user has permission to delete this employee
    if (userRole === 'admin' && currentUser && employeeToDelete) {
      const userOrganizations = organizations.filter(org => org.createdBy === currentUser.id);
      const userOrgIds = userOrganizations.map(org => org.id);
      
      if (!userOrgIds.includes(employeeToDelete.organizationId)) {
        alert('You can only delete employees from your own organizations.');
        return;
      }
    }
    
    if (confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      const savedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      const updatedEmployees = savedEmployees.filter((emp: Employee) => emp.id !== employeeId);
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      
      loadEmployees();
      onEmployeeUpdate();
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'notification-success';
      notification.textContent = 'Employee deleted successfully!';
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    }
  };

  const handleSaveEmployee = (updatedEmployee: Employee) => {
    // Check if user has permission to save this employee
    if (userRole === 'admin' && currentUser) {
      const userOrganizations = organizations.filter(org => org.createdBy === currentUser.id);
      const userOrgIds = userOrganizations.map(org => org.id);
      
      if (!userOrgIds.includes(updatedEmployee.organizationId)) {
        alert('You can only edit employees from your own organizations.');
        return;
      }
    }
    
    const savedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
    const updatedEmployees = savedEmployees.map((emp: Employee) => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    );
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    
    loadEmployees();
    onEmployeeUpdate();
    setShowEditModal(false);
    setEditingEmployee(null);
    
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'notification-success';
    notification.textContent = 'Employee updated successfully!';
    document.body.appendChild(notification);
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  const getOrganizationName = (organizationId: string) => {
    const org = organizations.find(o => o.id === organizationId);
    return org?.name || 'Unknown Organization';
  };

  const canManageEmployee = (employee: Employee) => {
    if (userRole === 'superuser') return true;
    if (userRole === 'admin' && currentUser) {
      const userOrganizations = organizations.filter(org => org.createdBy === currentUser.id);
      const userOrgIds = userOrganizations.map(org => org.id);
      return userOrgIds.includes(employee.organizationId);
    }
    return false;
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="text-white" size={48} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Employees Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {userRole === 'admin' 
            ? 'Add employees to your organizations to see them listed here.'
            : 'No employees have been added to the system yet.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="heading-secondary">
          {userRole === 'admin' ? 'My Employees' : 'All Employees'} ({employees.length})
        </h2>
      </div>

      <div className="grid gap-6">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="card-hover p-6 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl"
          >
            <div className="flex items-start gap-6">
              {/* Employee Photo */}
              <div className="flex-shrink-0">
                {employee.image ? (
                  <img
                    src={employee.image}
                    alt={employee.name}
                    className="w-20 h-20 rounded-2xl object-cover shadow-soft"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-soft">
                    <User className="text-white" size={32} />
                  </div>
                )}
              </div>

              {/* Employee Details */}
              <div className="flex-1 min-w-0">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {employee.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">
                      {employee.designation}
                    </p>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                      <Building size={16} />
                      <span className="text-sm">{employee.department}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin size={16} />
                      <span className="text-sm">{employee.location}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                      <Phone size={16} />
                      <span className="text-sm">{employee.phoneNumber}</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Organization:</span> {getOrganizationName(employee.organizationId)}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Added: {new Date(employee.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {canManageEmployee(employee) ? (
                  <>
                    <button
                      onClick={() => handleEdit(employee)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-smooth hover-scale text-sm font-medium"
                    >
                      <Edit size={16} />
                      Modify
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-smooth hover-scale text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </>
                ) : (
                  <div className="text-xs text-gray-400 dark:text-gray-500 text-center px-4 py-2">
                    {userRole === 'admin' ? 'Not your employee' : 'View only'}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingEmployee && (
        <EmployeeEditModal
          employee={editingEmployee}
          organizations={organizations}
          onSave={handleSaveEmployee}
          onClose={() => {
            setShowEditModal(false);
            setEditingEmployee(null);
          }}
        />
      )}
    </div>
  );
};

export default EmployeeList;