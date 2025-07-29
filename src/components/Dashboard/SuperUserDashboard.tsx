import React, { useState, useEffect } from 'react';
import { Building, Users, Eye, Calendar, Cpu, HardDrive, MemoryStick, TrendingUp, Activity } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const SuperUserDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    organizationCount: 0,
    employeeCount: 0,
    totalVisitors: 0,
    todayVisits: 0,
    adminUsers: 0
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

  const [systemInfo, setSystemInfo] = useState({
    cpuUsage: 45,
    ramUsage: 62,
    storageUsage: 38
  });

  const getWeeklyVisitorData = () => {
    const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
    
    const weeklyData = [
      { day: 'Sun', visitors: 0 },
      { day: 'Mon', visitors: 0 },
      { day: 'Tue', visitors: 0 },
      { day: 'Wed', visitors: 0 },
      { day: 'Thu', visitors: 0 },
      { day: 'Fri', visitors: 0 },
      { day: 'Sat', visitors: 0 }
    ];

    visitors.forEach((visitor: any) => {
      if (visitor.visitDate) {
        const visitDate = new Date(visitor.visitDate);
        const dayOfWeek = visitDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Check if visit is within current week
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        if (visitDate >= weekStart && visitDate <= weekEnd) {
          weeklyData[dayOfWeek].visitors += 1;
        }
      }
    });

    return weeklyData;
  };

  useEffect(() => {
    const updateStats = () => {
      const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
      const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
      
      const today = new Date().toISOString().split('T')[0];
      const todayVisits = visitors.filter((v: any) => v.visitDate === today);

      setStats({
        organizationCount: organizations.length,
        employeeCount: employees.length,
        totalVisitors: visitors.length,
        todayVisits: todayVisits.length,
        adminUsers: adminUsers.length
      });

      // Update chart data with actual visitor data
      const weeklyData = getWeeklyVisitorData();
      setChartData(weeklyData);

      // Simulate system info updates
      setSystemInfo({
        cpuUsage: Math.floor(Math.random() * 30) + 30,
        ramUsage: Math.floor(Math.random() * 40) + 40,
        storageUsage: Math.floor(Math.random() * 20) + 30
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Admin Users',
      value: stats.adminUsers,
      icon: Users,
      gradient: 'from-indigo-500 to-purple-600',
      bgGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
      clickable: true
    },
    {
      title: 'Total Organizations',
      value: stats.organizationCount,
      icon: Building,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      clickable: true
    },
    {
      title: 'Total Employees',
      value: stats.employeeCount,
      icon: Users,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      clickable: true
    },
    {
      title: 'System Visitors',
      value: stats.totalVisitors,
      icon: Eye,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
      clickable: true
    }
  ];

  const systemMetrics = [
    {
      title: 'CPU Usage',
      value: systemInfo.cpuUsage,
      icon: Cpu,
      color: systemInfo.cpuUsage > 80 ? '#EF4444' : systemInfo.cpuUsage > 60 ? '#F59E0B' : '#10B981',
      gradient: systemInfo.cpuUsage > 80 ? 'from-red-500 to-red-600' : systemInfo.cpuUsage > 60 ? 'from-yellow-500 to-orange-600' : 'from-green-500 to-emerald-600'
    },
    {
      title: 'RAM Usage',
      value: systemInfo.ramUsage,
      icon: MemoryStick,
      color: systemInfo.ramUsage > 80 ? '#EF4444' : systemInfo.ramUsage > 60 ? '#F59E0B' : '#10B981',
      gradient: systemInfo.ramUsage > 80 ? 'from-red-500 to-red-600' : systemInfo.ramUsage > 60 ? 'from-yellow-500 to-orange-600' : 'from-green-500 to-emerald-600'
    },
    {
      title: 'Storage Usage',
      value: systemInfo.storageUsage,
      icon: HardDrive,
      color: systemInfo.storageUsage > 80 ? '#EF4444' : systemInfo.storageUsage > 60 ? '#F59E0B' : '#10B981',
      gradient: systemInfo.storageUsage > 80 ? 'from-red-500 to-red-600' : systemInfo.storageUsage > 60 ? 'from-yellow-500 to-orange-600' : 'from-green-500 to-emerald-600'
    }
  ];

  const handleStatClick = (statTitle: string) => {
    // Show modal or navigate to detailed view
    alert(`Showing system-wide details for ${statTitle}`);
  };

  return (
    <div className="space-y-8 p-2">
      <div className="text-center mb-8">
        <h1 className="heading-primary mb-4">
          Super User Dashboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          System overview and comprehensive analytics across all admin users
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              onClick={() => card.clickable && handleStatClick(card.title)}
              className={`bg-gradient-to-br ${card.bgGradient} rounded-2xl p-6 card-hover border border-white/20 dark:border-gray-700/50 ${
                card.clickable ? 'cursor-pointer' : ''
              }`}
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

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Visitor Trends Chart */}
        <div className="card rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-soft">
              <TrendingUp className="text-white" size={24} />
            </div>
            <h2 className="heading-secondary">
              System-wide Visitor Trends
            </h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="day" 
                  stroke="#6b7280"
                  fontSize={12}
                  fontWeight={500}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  fontWeight={500}
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
                />
                <Line 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="url(#colorGradient)"
                  strokeWidth={4}
                  dot={{ fill: '#667eea', strokeWidth: 3, r: 6 }}
                  activeDot={{ r: 8, stroke: '#667eea', strokeWidth: 2, fill: '#ffffff' }}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
          {stats.totalVisitors === 0 && (
            <div className="text-center mt-6 p-4 glass rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No visitor data available. Chart will update when visitors register.
              </p>
            </div>
          )}
        </div>

        {/* System Metrics */}
        <div className="card rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-soft">
              <Activity className="text-white" size={24} />
            </div>
            <h2 className="heading-secondary">
              System Performance
            </h2>
          </div>
          <div className="space-y-8">
            {systemMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.title} className="glass p-6 rounded-2xl border border-white/20 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${metric.gradient} rounded-xl flex items-center justify-center shadow-soft`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {metric.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {metric.value}% Used
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metric.value}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${metric.value}%`,
                        background: `linear-gradient(90deg, ${metric.color}, ${metric.color}dd)`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperUserDashboard;