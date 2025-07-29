import React, { useState, useEffect } from 'react';
import { Plus, Building, Users, List } from 'lucide-react';
import AddOrganization from './AddOrganization';
import AddEmployee from './AddEmployee';
import EmployeeList from './EmployeeList';
import { Organization } from '../../types';

import { useAuth } from '../../contexts/AuthContext';

const AdminUserAdd: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState<'default' | 'add-org' | 'add-employee' | 'employee-list'>('default');
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = () => {
    const savedOrganizations = JSON.parse(localStorage.getItem('organizations') || '[]');
    // Only show organizations created by current admin user
    const userOrganizations = currentUser ? savedOrganizations.filter((org: any) => org.createdBy === currentUser.id) : [];
    setOrganizations(userOrganizations);
  };

  const handleEmployeeUpdate = () => {
    // This function will be called when employees are updated
    // It can be used to refresh any dependent data
  };

  const hasOrganization = organizations.length > 0;

  if (currentView === 'add-org') {
    return (
      <AddOrganization
        onBack={() => setCurrentView('default')}
        onComplete={() => {
          setCurrentView('default');
          loadOrganizations();
        }}
      />
    );
  }

  if (currentView === 'add-employee') {
    return (
      <AddEmployee
        onBack={() => setCurrentView('default')}
        onComplete={() => setCurrentView('default')}
        organizations={organizations}
      />
    );
  }

  if (currentView === 'employee-list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView('default')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-smooth"
          >
            ← Back
          </button>
          <h1 className="heading-secondary">
            Employee Management
          </h1>
        </div>
        <EmployeeList organizations={organizations} onEmployeeUpdate={handleEmployeeUpdate} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="heading-primary mb-4">
          User Management
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Manage organizations and employees
        </p>
      </div>

      {!hasOrganization ? (
        <div className="text-center py-16">
          <div className="w-32 h-32 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-large float">
            <Building className="text-white" size={64} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            No Organization Found
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Get started by adding your organization details. This will be the foundation for managing employees and visitors.
          </p>
          <button
            onClick={() => setCurrentView('add-org')}
            className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-3"
          >
            <Plus size={24} />
            Add Organization
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Organization Info */}
          <div className="card rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="heading-secondary mb-6">
              Organization Information
            </h2>
            {organizations.map(org => (
              <div key={org.id} className="flex items-center gap-6 p-6 glass rounded-2xl border border-white/20 dark:border-gray-700/50">
                {org.logo ? (
                  <img src={org.logo} alt="Logo" className="w-20 h-20 object-cover rounded-2xl shadow-soft" />
                ) : (
                  <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center shadow-soft">
                    <Building className="text-white" size={32} />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {org.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{org.address}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full font-medium capitalize">
                      {org.type}
                    </span>
                    {org.governmentType && (
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full font-medium capitalize">
                        {org.governmentType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-3 gap-6">
            <button
              onClick={() => setCurrentView('add-employee')}
              className="card-hover p-8 text-center border border-gray-200/50 dark:border-gray-700/50 rounded-2xl group"
            >
              <div className="w-16 h-16 gradient-success rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-medium group-hover:shadow-large transition-smooth">
                <Users size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Add Employee
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add new employees to your organization
              </p>
            </button>

            <button
              onClick={() => setCurrentView('employee-list')}
              className="card-hover p-8 text-center border border-gray-200/50 dark:border-gray-700/50 rounded-2xl group"
            >
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-medium group-hover:shadow-large transition-smooth">
                <List size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Manage Employees
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                View, edit, and delete employee records
              </p>
            </button>

            <button
              onClick={() => setCurrentView('add-org')}
              className="card-hover p-8 text-center border border-gray-200/50 dark:border-gray-700/50 rounded-2xl group"
            >
              <div className="w-16 h-16 gradient-warning rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-medium group-hover:shadow-large transition-smooth">
                <Building size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Add Organization
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add additional organizations
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserAdd;