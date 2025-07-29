export interface User {
  id: string;
  fullName: string;
  username: string;
  password: string;
  phoneNumber: string;
  aadharNumber: string;
  role: 'admin' | 'superuser';
  profilePhoto?: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  address: string;
  logo?: string;
  type: 'government' | 'private';
  governmentType?: 'state' | 'central';
  ministryName?: string;
  createdBy: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  designation: string;
  department: string;
  location: string;
  phoneNumber: string;
  image?: string;
  organizationId: string;
  createdBy: string;
  createdAt: string;
}

export interface Visitor {
  id: string;
  fullName: string;
  mobileNumber: string;
  aadharNumber: string;
  numberOfVisitors: number;
  teamMemberNames?: string;
  photo?: string;
  department: string;
  officerName: string;
  purposeToMeet: string;
  description?: string;
  organizationId: string;
  visitDate: string;
  visitTime: string;
  qrCode?: string;
}

export interface DashboardStats {
  organizationCount: number;
  employeeCount: number;
  totalVisitors: number;
  todayVisits: number;
}

export interface SystemInfo {
  cpuUsage: number;
  ramUsage: number;
  storageUsage: number;
}

export type Theme = 'light' | 'dark' | 'auto';

export type UserRole = 'visitor' | 'admin' | 'superuser';