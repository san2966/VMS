import React, { useState, useEffect } from 'react';
import { Plus, Trash2, List, Users } from 'lucide-react';
import { User } from '../../types';
import EmployeeList from './EmployeeList';

const SuperUserAdd: React.FC = () => {
  const [currentView, setCurrentView] = useState<'default' | 'employee-list'>('default');
  const [showAddForm, setShowAddForm] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phoneNumber: '',
    aadharNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    setUsers(savedUsers);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setIsLoading(true);

    try {
      const newUser: User = {
        id: Date.now().toString(),
        fullName: formData.fullName,
        username: formData.username,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        aadharNumber: formData.aadharNumber,
        role: 'admin',
        createdAt: new Date().toISOString()
      };

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));

      // Reset form
      setFormData({
        fullName: '',
        username: '',
        phoneNumber: '',
        aadharNumber: '',
        password: '',
        confirmPassword: ''
      });
      setShowAddForm(false);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'notification-success';
      notification.textContent = 'User created successfully!';
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } catch (error) {
      alert('Failed to create user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This will delete all associated data.')) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
      
      // Remove user's organizations and employees
      const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      
      const filteredOrganizations = organizations.filter((org: any) => org.createdBy !== userId);
      const filteredEmployees = employees.filter((emp: any) => emp.createdBy !== userId);
      
      localStorage.setItem('organizations', JSON.stringify(filteredOrganizations));
      localStorage.setItem('employees', JSON.stringify(filteredEmployees));
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'notification-success';
      notification.textContent = 'User and associated data deleted successfully!';
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    }
  };

  const getUserStats = (userId: string) => {
    const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
    
    // Get organizations created by this specific admin user
    const userOrganizations = organizations.filter((org: any) => org.createdBy === userId);
    const userOrgIds = userOrganizations.map((org: any) => org.id);
    
    // Get employees created by this admin user in their organizations
    const userEmployees = employees.filter((emp: any) => 
      emp.createdBy === userId && userOrgIds.includes(emp.organizationId)
    );
    
    // Get visitors who visited this admin user's organizations
    const userVisitors = visitors.filter((visitor: any) => 
      userOrgIds.includes(visitor.organizationId)
    );
    
    return {
      organizations: userOrganizations.length,
      employees: userEmployees.length,
      visitors: userVisitors.length
    };
  };

  const handleEmployeeUpdate = () => {
    // This function will be called when employees are updated
    // It can be used to refresh any dependent data
  };

  if (currentView === 'employee-list') {
    const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
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
            All Employees Management
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
          Manage admin users and their access
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => setCurrentView('employee-list')}
          className="card-hover p-6 text-center border border-gray-200/50 dark:border-gray-700/50 rounded-2xl group"
        >
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-medium group-hover:shadow-large transition-smooth">
            <List size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Manage All Employees
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            View, edit, and delete all employee records
          </p>
        </button>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="card-hover p-6 text-center border border-gray-200/50 dark:border-gray-700/50 rounded-2xl group"
        >
          <div className="w-16 h-16 gradient-success rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-medium group-hover:shadow-large transition-smooth">
            <Plus size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Add Admin User
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create new admin user accounts
          </p>
        </button>
      </div>

      {/* Add User Section */}
      <div className="card rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-secondary">
            Add New Admin User
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={20} />
            {showAddForm ? 'Hide Form' : 'Add User'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setFormData(prev => ({ ...prev, phoneNumber: value }));
                    }
                  }}
                  className="form-input"
                  maxLength={10}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Aadhar Number *
                </label>
                <input
                  type="text"
                  value={formData.aadharNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 12) {
                      setFormData(prev => ({ ...prev, aadharNumber: value }));
                    }
                  }}
                  className="form-input"
                  maxLength={12}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save User'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Users List */}
      <div className="card rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="heading-secondary mb-6">
          Admin Users List ({users.length})
        </h2>

        {users.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="text-white" size={48} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Admin Users Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Add admin users to see them listed here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 text-gray-900 dark:text-white font-semibold">Name</th>
                  <th className="text-left py-4 text-gray-900 dark:text-white font-semibold">Username</th>
                  <th className="text-left py-4 text-gray-900 dark:text-white font-semibold">Phone</th>
                  <th className="text-left py-4 text-gray-900 dark:text-white font-semibold">Organizations</th>
                  <th className="text-left py-4 text-gray-900 dark:text-white font-semibold">Employees</th>
                  <th className="text-left py-4 text-gray-900 dark:text-white font-semibold">Visitors</th>
                  <th className="text-left py-4 text-gray-900 dark:text-white font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const stats = getUserStats(user.id);
                  return (
                    <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-smooth">
                      <td className="py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{user.fullName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Added: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-400 font-medium">{user.username}</td>
                      <td className="py-4 text-gray-600 dark:text-gray-400">{user.phoneNumber}</td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                          {stats.organizations}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                          {stats.employees}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium">
                          {stats.visitors}
                        </span>
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-smooth hover-scale"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperUserAdd;