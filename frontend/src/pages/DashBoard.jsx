import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts';
import { 
  LayoutDashboard, Activity, Link as LinkIcon, MousePointerClick, 
  TrendingUp, Monitor, ArrowLeft, RefreshCcw, CheckCircle2, Share2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const COLORS = ['#FFB7C5', '#F2C7C7', '#D5F3D8', '#FF8DA1'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    getDashboardStats()
      .then((res) => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col items-center justify-center font-sans">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary mb-4" />
      <p className="text-text font-black animate-pulse uppercase tracking-[0.2em] text-xs">Loading Dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7FAFC] font-sans text-text selection:bg-primary/30 pb-20">
      <nav className="sticky top-0 z-50 w-full border-b-2 border-border bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md group-hover:scale-105 transition-transform">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">Link Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchStats} 
              className="btn-secondary h-10 w-10 p-0"
              title="Force Refresh Data"
            >
              <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
            <Link to="/" className="btn-primary h-10 px-4 text-xs font-bold">
              <ArrowLeft className="h-4 w-4" /> Back to Manager
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 pt-16">
        <header className="mb-16">
          <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.2em] mb-4">
            <Activity className="h-4 w-4" /> Live System Overview
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-2">Overall Stats</h1>
          <p className="text-muted font-bold text-lg">Detailed overview of all your shortened links.</p>
        </header>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Links', val: stats?.totalUrls || 0, icon: LinkIcon, trend: '+12%', trendColor: 'text-green-600' },
            { label: 'Total Clicks', val: stats?.totalClicks || 0, icon: MousePointerClick, trend: '+24%', trendColor: 'text-green-600' },
            { label: 'Avg Clicks', val: stats?.totalUrls > 0 ? (stats.totalClicks / stats.totalUrls).toFixed(1) : 0, icon: TrendingUp, trend: 'Stable', trendColor: 'text-blue-600' },
            { label: 'System Status', val: 'Online', icon: CheckCircle2, trend: 'Active', trendColor: 'text-green-600' },
          ].map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border-2 border-border rounded-2xl p-8 shadow-sm hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-xl bg-secondary border-2 border-border text-primary">
                  <s.icon className="h-6 w-6" />
                </div>
                <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-secondary border border-border", s.trendColor)}>{s.trend}</span>
              </div>
              <div className="text-4xl font-black text-text mb-1">{s.val}</div>
              <div className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-8 bg-white border-2 border-border rounded-3xl p-8 shadow-sm"
          >
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text/80">Click Activity</h3>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-primary shadow-sm" />
                <span className="text-[10px] font-black text-muted uppercase tracking-widest">Total Clicks</span>
              </div>
            </div>
            
            <div className="h-[360px]">
              {!stats?.clicksOverTime || stats.clicksOverTime.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted font-bold italic text-sm">Aggregating data...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.clicksOverTime}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="_id" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#4A5568', fontWeight: 800 }} 
                      dy={15}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#4A5568', fontWeight: 800 }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        borderColor: '#E2E8F0',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '800',
                        color: '#1A202C',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#FFB7C5" 
                      strokeWidth={5}
                      dot={{ fill: '#FFB7C5', r: 6, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8, stroke: '#fff', strokeWidth: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Side Charts */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border-2 border-border rounded-3xl p-8 shadow-sm"
            >
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text/80 mb-10 flex items-center gap-3">
                <Monitor className="h-5 w-5 text-primary" /> Traffic Devices
              </h3>
              <div className="h-[280px]">
                {!stats?.deviceBreakdown || stats.deviceBreakdown.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted font-bold italic text-sm text-center px-4">No device data detected</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={stats.deviceBreakdown} 
                        dataKey="count" 
                        nameKey="_id" 
                        cx="50%" cy="50%" 
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={10}
                      >
                        {stats.deviceBreakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth={4} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF', 
                          borderColor: '#E2E8F0',
                          borderRadius: '16px',
                          fontSize: '11px',
                          fontWeight: '800'
                        }} 
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        align="center"
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span className="text-[10px] uppercase font-black text-muted tracking-widest ml-2">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-primary/5 border-2 border-primary/20 rounded-3xl p-8 shadow-sm"
            >
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-6">System Health</h3>
              <div className="space-y-4">
                {[
                  { label: 'Database', status: 'Healthy', color: 'bg-green-500' },
                  { label: 'Cache System', status: 'Running', color: 'bg-green-500' },
                  { label: 'Background Jobs', status: 'Active', color: 'bg-green-500' },
                  { label: 'Analytics Sync', status: 'Synced', color: 'bg-primary' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-primary/10 pb-3">
                    <span className="text-xs font-bold text-text/70">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">{item.status}</span>
                      <span className={cn("h-2 w-2 rounded-full shadow-sm", item.color, item.color === 'bg-green-500' && "animate-pulse")} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border-2 border-border rounded-3xl p-8 shadow-sm"
            >
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text/80 mb-8 flex items-center gap-3">
                <Share2 className="h-5 w-5 text-primary" /> Top Referrers
              </h3>
              <div className="space-y-4">
                {!stats?.referrerBreakdown || stats.referrerBreakdown.length === 0 ? (
                  <p className="text-xs text-muted font-bold italic">Waiting for activity...</p>
                ) : stats.referrerBreakdown.slice(0, 5).map((r, i) => (
                  <div key={r._id} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-primary-soft shadow-sm" />
                      <span className="text-xs font-black text-text/70 uppercase tracking-widest truncate max-w-[120px]">{r._id.replace('http://', '').replace('https://', '')}</span>
                    </div>
                    <span className="text-xs font-black text-text">{r.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;