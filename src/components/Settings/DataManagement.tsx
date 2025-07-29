import React, { useState } from 'react';
import { Download, Trash2, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DataManagement: React.FC = () => {
  const { userRole, currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('');

  const exportData = () => {
    const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
    const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
    const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    
    let filteredData = visitors;

    // Filter data based on user role
    if (userRole === 'admin' && currentUser) {
      // Admin can only export visitors from their own organizations
      const userOrganizations = organizations.filter((org: any) => org.createdBy === currentUser.id);
      const userOrgIds = userOrganizations.map((org: any) => org.id);
      filteredData = visitors.filter((visitor: any) => userOrgIds.includes(visitor.organizationId));
    } else if (userRole === 'superuser') {
      // Super user can apply additional filters
      if (selectedUser || selectedOrganization) {
        filteredData = visitors.filter((visitor: any) => {
          let matches = true;
          
          if (selectedOrganization) {
            matches = matches && visitor.organizationId === selectedOrganization;
          }
          
          if (selectedUser) {
            // Filter by visitors registered under specific admin user's organizations
            const org = organizations.find((o: any) => o.id === visitor.organizationId);
            matches = matches && org?.createdBy === selectedUser;
          }
          
          return matches;
        });
      }
    }

    // Convert to CSV format
    const headers = [
      'Date', 'Time', 'Visitor Name', 'Phone Number', 'Aadhar Number',
      'Number of Visitors', 'Team Member Names', 'Department Name',
      'Officer/Employee Name', 'Purpose To Meet', 'Description', 'Organization',
      'Registered Under Admin'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredData.map((visitor: any) => {
        const org = organizations.find((o: any) => o.id === visitor.organizationId);
        const adminUser = adminUsers.find((u: any) => u.id === org?.createdBy);
        return [
          visitor.visitDate || '',
          visitor.visitTime || '',
          visitor.fullName || '',
          visitor.mobileNumber || '',
          visitor.aadharNumber || '',
          visitor.numberOfVisitors || '',
          visitor.teamMemberNames || '',
          visitor.department || '',
          visitor.officerName || '',
          visitor.purposeToMeet || '',
          visitor.description || '',
          org?.name || 'Unknown Organization',
          adminUser?.fullName || 'Unknown Admin'
        ].join(',');
      })
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitor-data-${userRole}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert(`Data exported successfully! (${filteredData.length} records)`);
  };

  const deleteAllData = () => {
    if (userRole === 'admin' && currentUser) {
      // Admin can only delete data they created
      if (confirm('Are you sure you want to delete all your data (organizations, employees, and visitors)? This action cannot be undone.')) {
        const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
        const employees = JSON.parse(localStorage.getItem('employees') || '[]');
        const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
        
        // Get user's organizations and their IDs
        const userOrgIds = organizations
          .filter((org: any) => org.createdBy === currentUser.id)
          .map((org: any) => org.id);
        
        // Remove only data created by or belonging to this admin user
        const remainingOrganizations = organizations.filter((org: any) => org.createdBy !== currentUser.id);
        const remainingEmployees = employees.filter((emp: any) => 
          emp.createdBy !== currentUser.id && !userOrgIds.includes(emp.organizationId)
        );
        const remainingVisitors = visitors.filter((visitor: any) => !userOrgIds.includes(visitor.organizationId));
        
        localStorage.setItem('organizations', JSON.stringify(remainingOrganizations));
        localStorage.setItem('employees', JSON.stringify(remainingEmployees));
        localStorage.setItem('visitors', JSON.stringify(remainingVisitors));
        
        // Clear selected organization if it belonged to this user
        const selectedOrg = localStorage.getItem('selectedOrganization');
        if (selectedOrg && userOrgIds.includes(selectedOrg)) {
          localStorage.removeItem('selectedOrganization');
        }
        
        alert('Your data has been deleted successfully!');
      }
    } else if (userRole === 'superuser') {
      // Super user can delete ALL system data
      if (confirm('Are you sure you want to delete ALL system data? This action cannot be undone and will affect all admin users.')) {
        localStorage.removeItem('organizations');
        localStorage.removeItem('employees');
        localStorage.removeItem('visitors');
        localStorage.removeItem('adminUsers');
        localStorage.removeItem('selectedOrganization');
        
        alert('All system data has been deleted successfully!');
      }
    }
  };

  const adminUsers = userRole === 'superuser' ? JSON.parse(localStorage.getItem('adminUsers') || '[]') : [];
  const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
  
  // Show organizations based on user role
  const availableOrganizations = (() => {
    if (userRole === 'admin' && currentUser) {
      // Admin can only see organizations they created
      return organizations.filter((org: any) => org.createdBy === currentUser.id);
    } else if (userRole === 'superuser') {
      // Super user can see all organizations
      return organizations;
    }
    return [];
  })();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Data Management
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {userRole === 'admin' 
            ? 'Export and manage your organization data'
            : 'Export visitor data and manage system data'
          }
        </p>
      </div>

      {/* Export Data Section */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Export Visitor Data
        </h3>
        
        {userRole === 'superuser' && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Admin User
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">All Admin Users</option>
                {adminUsers.map((user: any) => (
                  <option key={user.id} value={user.id}>{user.fullName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Organization
              </label>
              <select
                value={selectedOrganization}
                onChange={(e) => setSelectedOrganization(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">All Organizations</option>
                {organizations.map((org: any) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {userRole === 'admin' && availableOrganizations.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Organizations:
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableOrganizations.map((org: any) => (
                <span key={org.id} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                  {org.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={exportData}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all inline-flex items-center gap-2"
        >
          <Download size={20} />
          Export to CSV
        </button>
      </div>

      {/* Delete Data Section */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-4">
          Danger Zone
        </h3>
        <p className="text-red-700 dark:text-red-300 mb-4">
          {userRole === 'admin' 
            ? 'This will permanently delete all your organizations, employees, and visitor data. This action cannot be undone.'
            : 'This will permanently delete ALL system data including all admin users, organizations, employees, and visitors. This action cannot be undone.'
          }
        </p>
        <button
          onClick={deleteAllData}
          className="bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors inline-flex items-center gap-2"
        >
          <Trash2 size={20} />
          {userRole === 'admin' ? 'Delete My Data' : 'Delete All System Data'}
        </button>
      </div>
    </div>
  );
};

export default DataManagement;