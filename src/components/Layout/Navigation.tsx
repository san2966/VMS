import React from 'react';
import { BarChart3, UserPlus, Settings, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { logout, userRole, currentUser } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, gradient: 'from-blue-500 to-purple-600' },
    { id: 'user-add', label: 'User Add', icon: UserPlus, gradient: 'from-green-500 to-emerald-600' },
    { id: 'settings', label: 'Settings', icon: Settings, gradient: 'from-orange-500 to-red-600' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 w-72 min-h-screen flex flex-col shadow-soft">
      <div className="p-6 flex-1">
        <div className="flex items-center gap-4 mb-8 p-4 card-hover">
          <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-soft">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">
              {userRole === 'superuser' ? 'Super User' : 'Admin'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentUser?.fullName}
            </p>
          </div>
        </div>
        
        <ul className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-smooth hover-lift ${
                    isActive
                      ? 'glass border border-white/20 dark:border-gray-700/50 shadow-soft'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className={`w-10 h-10 bg-gradient-to-r ${item.gradient} rounded-xl flex items-center justify-center shadow-soft ${
                    isActive ? 'shadow-medium' : ''
                  }`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className={`font-medium ${
                    isActive 
                      ? 'text-gradient' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-smooth hover-lift font-medium"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
            <LogOut size={16} className="text-white" />
          </div>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;