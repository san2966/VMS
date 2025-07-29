import React, { useState, useEffect } from 'react';
import { Building, Users, Eye, Calendar, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    organizationCount: 0,
    employeeCount: 0,
    totalVisitors: 0,
    todayVisits: 0
  });

  const [chartData, setChartData] = useState([
    { day: 'Sun', visitors: 0 },
    { day: 'Mon', visitors: 0 },
    { day: 'Tue', visitors: 0 },
    { day: 'Wed', visitors: 0 },
    { day: 'Thu', visitors: 0 },
    { day: 'Fri', visitors: 0 },
    { day: 'Sat', visitors: 0 }
  ]);

  const getTodayVisitsByDay = (userOrganizations: string[]) => {
    const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    const todayVisitsData = [
      { day: 'Sun', visitors: 0 },
      { day: 'Mon', visitors: 0 },
      { day: 'Tue', visitors: 0 },
      { day: 'Wed', visitors: 0 },
      { day: 'Thu', visitors: 0 },
      { day: 'Fri', visitors: 0 },
      { day: 'Sat', visitors: 0 }
    ];

    // Get today's day of week (0 = Sunday, 1 = Monday, etc.)
    const todayDayOfWeek = today.getDay();

    // Count today's visits for user's organizations
    const todayVisitsCount = visitors.filter((visitor: any) => {
      return visitor.visitDate === todayString && 
             userOrganizations.includes(visitor.organizationId);
    }).length;

    // Set today's visit count on the correct day
    todayVisitsData[todayDayOfWeek].visitors = todayVisitsCount;

    return todayVisitsData;
  };

  useEffect(() => {
    const updateStats = () => {
      const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
      
      // Only show data for current admin user
      const userOrganizations = currentUser ? organizations.filter((org: any) => org.createdBy === currentUser.id) : [];
      const userOrgIds = userOrganizations.map((org: any) => org.id);
      
      // Only show employees from user's organizations
      const userEmployees = currentUser ? employees.filter((emp: any) => 
        userOrgIds.includes(emp.organizationId) && emp.createdBy === currentUser.id
      ) : [];
      
      // Only show visitors from user's organizations
      const userVisitors = currentUser ? visitors.filter((visitor: any) => 
        userOrgIds.includes(visitor.organizationId)
      ) : [];
      
      const today = new Date().toISOString().split('T')[0];
      const todayVisits = userVisitors.filter((v: any) => v.visitDate === today);

      setStats({
        organizationCount: userOrganizations.length,
        employeeCount: userEmployees.length,
        totalVisitors: userVisitors.length,
        todayVisits: todayVisits.length
      });

      // Update chart data with today's visit data
      const todayVisitsData = getTodayVisitsByDay(userOrgIds);
      setChartData(todayVisitsData);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds for real-time feel

    return () => clearInterval(interval);
  }, [currentUser]);

  const statCards = [
    {
      title: 'Organization Info',
      value: stats.organizationCount,
      icon: Building,
      gradient: 'from-blue-500 to-purple-600',
      bgGradient: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20'
    },
    {
      title: 'Employee Count',
      value: stats.employeeCount,
      icon: Users,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
    },
    {
      title: 'Total Visitors',
      value: stats.totalVisitors,
      icon: Eye,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
    },
    {
      title: 'Today Visits',
      value: stats.todayVisits,
      icon: Calendar,
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
    }
  ];

  return (
    <div className="space-y-8 p-2">
      <div className="text-center mb-8">
        <h1 className="heading-primary mb-4">
          Dashboard Overview
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`bg-gradient-to-br ${card.bgGradient} rounded-2xl p-6 card-hover border border-white/20 dark:border-gray-700/50`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {card.title}
                  </p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                </div>
                <div className={`w-16 h-16 bg-gradient-to-r ${card.gradient} rounded-2xl flex items-center justify-center shadow-medium`}>
                  <Icon className="text-white" size={28} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="card rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-soft">
            <TrendingUp className="text-white" size={24} />
          </div>
          <h2 className="heading-secondary">
            System Visitors by Day of Week
          </h2>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="day" 
                stroke="#6b7280"
                fontSize={12}
                fontWeight={500}
                label={{ value: 'Day of Week', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                fontWeight={500}
                label={{ value: 'System Visitors', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: 'none',
                  borderRadius: '16px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                formatter={(value) => [`${value} visitors`, 'System Visitors']}
                labelFormatter={(label) => `${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="visitors" 
                stroke="url(#colorGradient)"
                strokeWidth={3}
                fill="url(#areaGradient)"
                dot={{ fill: '#667eea', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#667eea', strokeWidth: 2, fill: '#ffffff' }}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#667eea" stopOpacity={0.8} />
                  <stop offset="50%" stopColor="#764ba2" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#764ba2" stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {stats.todayVisits === 0 && (
          <div className="text-center mt-6 p-4 glass rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No visitor data available. Chart will update in real-time when visitors register.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;