import React, { useState, useEffect } from 'react';
import { Menu, X, User, Shield, Sparkles, Building } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onRoleSelect: (role: 'admin' | 'superuser') => void;
}

const Header: React.FC<HeaderProps> = ({ onRoleSelect }) => {
  const { userRole, logout, currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');

  useEffect(() => {
    // Load ALL organizations from all admin users for visitor selection
    const savedOrganizations = JSON.parse(localStorage.getItem('organizations') || '[]');
    setOrganizations(savedOrganizations);
    
    // Load previously selected organization
    const savedSelection = localStorage.getItem('selectedOrganization');
    if (savedSelection && savedOrganizations.find((org: any) => org.id === savedSelection)) {
      setSelectedOrganization(savedSelection);
    } else if (savedOrganizations.length > 0) {
      // Don't auto-select - require explicit selection
      setSelectedOrganization('');
      localStorage.removeItem('selectedOrganization');
    } else {
      // Clear selection if no organizations available
      setSelectedOrganization('');
      localStorage.removeItem('selectedOrganization');
    }
  }, []);

  const handleOrganizationChange = (orgId: string) => {
    setSelectedOrganization(orgId);
    localStorage.setItem('selectedOrganization', orgId);
    
    // Store the selected organization's creator info for visitor registration
    const selectedOrg = organizations.find(org => org.id === orgId);
    if (selectedOrg) {
      localStorage.setItem('selectedOrgCreator', selectedOrg.createdBy);
    }
  };

  const getSelectedOrganizationName = () => {
    const org = organizations.find(o => o.id === selectedOrganization);
    return org?.name || 'Select Organization';
  };

  const getSelectedOrganizationCreator = () => {
    const org = organizations.find(o => o.id === selectedOrganization);
    if (org) {
      // Get admin user info
      const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
      const creator = adminUsers.find((user: any) => user.id === org.createdBy);
      return creator?.fullName || 'Unknown Admin';
    }
    return '';
  };

  if (userRole !== 'visitor') return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
              <Sparkles className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-gradient">
              Visitor Management System
            </h1>
          </div>

          {/* Organization Selection */}
          {userRole === 'visitor' && !currentUser && (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 text-white/80">
                <Building size={20} />
                <span className="text-sm font-medium">Organization:</span>
              </div>
              <select
                value={selectedOrganization}
                onChange={(e) => handleOrganizationChange(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-smooth min-w-[200px] appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="" disabled className="text-gray-900">
                  {organizations.length === 0 ? 'NA - No Organizations Available' : 'Select Organization'}
                </option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id} className="text-gray-900">
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 rounded-xl glass hover:bg-white/20 dark:hover:bg-gray-700/50 transition-smooth hover-scale"
            >
              {isMenuOpen ? <X size={24} className="text-gray-700 dark:text-gray-300" /> : <Menu size={24} className="text-gray-700 dark:text-gray-300" />}
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 glass rounded-2xl shadow-large border border-white/20 dark:border-gray-700/50 py-2 transform transition-smooth">
                {/* Mobile Organization Selection */}
                {userRole === 'visitor' && !currentUser && (
                  <div className="md:hidden px-4 py-3 border-b border-white/20 dark:border-gray-700/50">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                      <Building size={16} />
                      <span className="text-sm font-medium">Select Organization:</span>
                    </div>
                    <select
                      value={selectedOrganization}
                      onChange={(e) => handleOrganizationChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23374151' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="" disabled>
                        {organizations.length === 0 ? 'NA - No Organizations Available' : 'Select Organization'}
                      </option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={() => {
                    onRoleSelect('admin');
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-6 py-3 text-left flex items-center gap-3 hover:bg-white/20 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 transition-smooth rounded-xl mx-2 my-1 cursor-pointer transform hover:scale-105 hover:shadow-lg active:scale-95 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:rotate-3 group-hover:shadow-md">
                    <User size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="font-medium transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">Admin Login</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-300">Manage organization</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onRoleSelect('superuser');
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-6 py-3 text-left flex items-center gap-3 hover:bg-white/20 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 transition-smooth rounded-xl mx-2 my-1 cursor-pointer transform hover:scale-105 hover:shadow-lg active:scale-95 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:rotate-3 group-hover:shadow-md">
                    <Shield size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="font-medium transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">Super User Login</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-300">System administration</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Organization Banner */}
      {selectedOrganization && userRole === 'visitor' && !currentUser && organizations.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center gap-2 text-white/90">
                <Building size={16} />
                <span className="text-sm font-medium">
                  Currently selected: <span className="font-bold">{getSelectedOrganizationName()}</span>
                  {getSelectedOrganizationCreator() && (
                    <span className="text-white/70 ml-2">
                      (Managed by: {getSelectedOrganizationCreator()})
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;