import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole;
  login: (username: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  setUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('visitor');

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedRole = localStorage.getItem('userRole') as UserRole;
    
    if (savedUser && savedRole) {
      setCurrentUser(JSON.parse(savedUser));
      setUserRole(savedRole);
    }
  }, []);

  const login = async (username: string, password: string, role: UserRole): Promise<boolean> => {
    if (role === 'superuser') {
      if (username === 'User2966' && password === 'Admin@2966') {
        const superUser: User = {
          id: 'super-1',
          fullName: 'Super Administrator',
          username: 'User2966',
          password: 'Admin@2966',
          phoneNumber: '',
          aadharNumber: '',
          role: 'superuser',
          createdAt: new Date().toISOString()
        };
        setCurrentUser(superUser);
        setUserRole('superuser');
        localStorage.setItem('currentUser', JSON.stringify(superUser));
        localStorage.setItem('userRole', 'superuser');
        return true;
      }
    } else if (role === 'admin') {
      const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');
      const user = users.find((u: User) => u.username === username && u.password === password);
      if (user) {
        setCurrentUser(user);
        setUserRole('admin');
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('userRole', 'admin');
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setUserRole('visitor');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userRole,
      login,
      logout,
      setUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};