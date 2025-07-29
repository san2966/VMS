import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DatabaseProvider, useDatabase } from './contexts/DatabaseContext';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import LoginForm from './components/Auth/LoginForm';
import VisitorMain from './components/Visitor/VisitorMain';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import SuperUserDashboard from './components/Dashboard/SuperUserDashboard';
import AdminUserAdd from './components/UserAdd/AdminUserAdd';
import SuperUserAdd from './components/UserAdd/SuperUserAdd';
import Settings from './components/Settings/Settings';
import { UserRole } from './types';

// Connection Status Component
const ConnectionStatus: React.FC = () => {
  const { isSupabaseConnected, connectionStatus } = useDatabase();
  
  if (connectionStatus === 'connecting') {
    return (
      <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
        🔄 Connecting to database...
      </div>
    );
  }
  
  if (!isSupabaseConnected) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
        ⚠️ Offline Mode - Using local storage
      </div>
    );
  }
  
  return null;
};

const AppContent: React.FC = () => {
  const { currentUser, userRole, setUserRole } = useAuth();
  const [loginRole, setLoginRole] = useState<UserRole>('visitor');
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleRoleSelect = (role: 'admin' | 'superuser') => {
    setLoginRole(role);
    setUserRole(role);
  };

  const handleBackToMain = () => {
    setUserRole('visitor');
    setLoginRole('visitor');
  };

  // Show login form for admin/superuser
  if ((userRole === 'admin' || userRole === 'superuser') && !currentUser) {
    return <LoginForm role={loginRole} onBack={handleBackToMain} />;
  }

  // Show visitor interface
  if (userRole === 'visitor') {
    return (
      <>
        <ConnectionStatus />
        <Header onRoleSelect={handleRoleSelect} />
        <VisitorMain />
      </>
    );
  }

  // Show admin/superuser dashboard
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <ConnectionStatus />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-8">
        {activeTab === 'dashboard' && (
          userRole === 'superuser' ? <SuperUserDashboard /> : <AdminDashboard />
        )}
        {activeTab === 'user-add' && (
          userRole === 'superuser' ? <SuperUserAdd /> : <AdminUserAdd />
        )}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <DatabaseProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
};

export default App;