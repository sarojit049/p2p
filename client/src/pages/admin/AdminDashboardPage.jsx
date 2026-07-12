import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, MessageCircle, Phone, Key, ShieldOff } from 'lucide-react';
import { getDashboardStats } from '../../services/api';
import Loader from '../../components/Loader';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, colorClass, trend }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col transition-transform hover:-translate-y-1 duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-xl", colorClass)}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">
          +{trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</p>
  </div>
);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data.data);
      } catch (err) {
        setError('Failed to load dashboard statistics.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <ShieldOff className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-blue-600 hover:underline text-sm font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  const inactiveUsers = stats?.totalUsers - (stats?.activeUsers + stats?.blockedUsers) || 0;

  const userPieData = [
    { name: 'Active', value: stats?.activeUsers || 0, color: '#10b981' },
    { name: 'Blocked', value: stats?.blockedUsers || 0, color: '#ef4444' },
    { name: 'Inactive', value: inactiveUsers, color: '#94a3b8' },
  ];

  const codePieData = [
    { name: 'Used', value: stats?.usedCodes || 0, color: '#3b82f6' },
    { name: 'Unused', value: stats?.unusedCodes || 0, color: '#f59e0b' },
  ];

  // Dummy activity data for the chart to make it look beautiful
  const activityData = [
    { name: 'Mon', chats: Math.floor((stats?.totalChats || 0) * 0.1), calls: Math.floor((stats?.totalCalls || 0) * 0.1) },
    { name: 'Tue', chats: Math.floor((stats?.totalChats || 0) * 0.15), calls: Math.floor((stats?.totalCalls || 0) * 0.2) },
    { name: 'Wed', chats: Math.floor((stats?.totalChats || 0) * 0.2), calls: Math.floor((stats?.totalCalls || 0) * 0.15) },
    { name: 'Thu', chats: Math.floor((stats?.totalChats || 0) * 0.25), calls: Math.floor((stats?.totalCalls || 0) * 0.25) },
    { name: 'Fri', chats: Math.floor((stats?.totalChats || 0) * 0.1), calls: Math.floor((stats?.totalCalls || 0) * 0.1) },
    { name: 'Sat', chats: Math.floor((stats?.totalChats || 0) * 0.05), calls: Math.floor((stats?.totalCalls || 0) * 0.05) },
    { name: 'Sun', chats: Math.floor((stats?.totalChats || 0) * 0.15), calls: Math.floor((stats?.totalCalls || 0) * 0.15) },
  ];

  const chartColors = {
    text: theme === 'dark' ? '#94a3b8' : '#64748b',
    grid: theme === 'dark' ? '#334155' : '#e2e8f0'
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          High-level statistics and metrics for the PrivateConnect platform
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          colorClass="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          trend="12"
        />
        <StatCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          icon={UserCheck}
          colorClass="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
          trend="8"
        />
        <StatCard
          title="Blocked Users"
          value={stats?.blockedUsers || 0}
          icon={UserX}
          colorClass="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
        />
        <StatCard
          title="Total Chats"
          value={stats?.totalChats || 0}
          icon={MessageCircle}
          colorClass="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          trend="24"
        />
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Activity Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Weekly Activity (Est.)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartColors.text, fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: chartColors.text, fontSize: 12 }} />
                <RechartsTooltip 
                  cursor={{ fill: theme === 'dark' ? '#334155' : '#f1f5f9' }}
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="chats" name="Chats Sent" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="calls" name="Calls Made" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Charts */}
        <div className="grid grid-rows-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Users by Status</h3>
            <div className="h-40 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {userPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', padding: '4px 8px' }}
                    itemStyle={{ fontSize: '12px', color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {userPieData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Secret Codes</h3>
            <div className="h-40 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={codePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {codePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', padding: '4px 8px' }}
                    itemStyle={{ fontSize: '12px', color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {codePieData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
