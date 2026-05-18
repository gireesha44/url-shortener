import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUrlAnalytics, getUrlHourlyAnalytics } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area 
} from 'recharts';
import Navbar from '../components/Navbar/Navbar';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MousePointer2, Smartphone, Globe, 
  Clock, Activity, Calendar, Share2, ExternalLink 
} from 'lucide-react';
import { cn } from '../utils/cn';

const Analytics = () => {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getUrlAnalytics(shortCode),
      getUrlHourlyAnalytics(shortCode)
    ])
      .then(([resAnalytics, resHourly]) => {
        setData(resAnalytics.data.data);
        setHourlyData(resHourly.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [shortCode]);

  if (loading) return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col items-center justify-center font-sans">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary mb-4" />
      <p className="text-text font-black animate-pulse uppercase tracking-[0.2em] text-xs">Loading Analytics...</p>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col items-center justify-center font-sans p-8 text-center">
      <h2 className="text-3xl font-black mb-3 text-text">Data Unavailable</h2>
      <p className="text-muted font-bold max-w-md mb-8 leading-relaxed">The stats for this link could not be found. It might have been deleted.</p>
      <Link to="/" className="btn-primary h-12 px-8 text-sm">Return to Dashboard</Link>
    </div>
  );

  const formattedHourlyData = Array.from({ length: 24 }, (_, hour) => {
    const match = hourlyData.find(item => item._id === hour);
    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      clicks: match ? match.count : 0
    };
  });

  return (
    <div className="min-h-screen bg-[#F7FAFC] font-sans text-text selection:bg-primary/30 pb-20">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-black text-muted hover:text-primary transition-colors uppercase tracking-[0.2em]">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Links
            </Link>
            <div>
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-5xl font-black tracking-tight text-text">/{shortCode}</h1>
                <div className="badge-pink border-2">Live Stats</div>
              </div>
              <p className="text-muted text-lg font-bold max-w-3xl truncate flex items-center gap-2">
                <span className="text-text/40 font-black uppercase text-[10px] tracking-widest">Routing To:</span>
                <span className="text-text/80">{data.originalUrl}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="btn-secondary h-12 px-6 text-sm">
              <Share2 className="h-4 w-4" /> Export Stats
            </button>
            <a 
              href={`http://localhost:5001/${shortCode}`} 
              target="_blank" 
              rel="noreferrer" 
              className="btn-primary h-12 px-6 text-sm"
            >
              Visit Link <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-10">
          {[
            { icon: MousePointer2, label: 'Total Clicks', val: data.totalClicks, color: 'text-primary', bg: 'bg-primary/10' },
            { icon: Smartphone, label: 'Device Types', val: data.deviceBreakdown.length, color: 'text-text', bg: 'bg-secondary' },
            { icon: Globe, label: 'Top Browsers', val: data.browserBreakdown.length, color: 'text-green-700', bg: 'bg-green-accent/30' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border-2 border-border rounded-2xl p-8 shadow-sm hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={cn("p-3 rounded-xl border-2 border-white shadow-sm", stat.bg, stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">All Time</div>
              </div>
              <div className="text-4xl font-black text-text mb-1">{stat.val}</div>
              <div className="text-xs font-black text-muted uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white border-2 border-border rounded-3xl p-8 shadow-sm"
          >
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text/80">Clicks Over Time</h3>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-primary shadow-sm" />
                <span className="text-[10px] font-black text-muted uppercase tracking-widest">Inbound Clicks</span>
              </div>
            </div>

            <div className="h-[340px] w-full">
              {data.clicksOverTime.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-muted font-bold text-sm italic">
                  Waiting for data...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.clicksOverTime}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFB7C5" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#FFB7C5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
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
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#FFB7C5" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorCount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border-2 border-border rounded-3xl p-8 shadow-sm"
            >
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text/80 mb-8 flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-primary" /> Devices
              </h3>
              <div className="space-y-6">
                {(!data.deviceBreakdown || data.deviceBreakdown.length === 0) ? (
                  <p className="text-xs text-muted font-bold italic">Insufficient telemetry clusters</p>
                ) : data.deviceBreakdown.map((d, i) => (
                  <div key={d._id} className="space-y-3">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span className="text-text">{d._id}</span>
                      <span className="text-primary">{((d.count / data.totalClicks) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-3 w-full bg-secondary rounded-full overflow-hidden border border-border shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(d.count / data.totalClicks) * 100}%` }}
                        className={cn("h-full rounded-full shadow-sm", i === 0 ? "bg-primary" : "bg-primary-soft")}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border-2 border-border rounded-3xl p-8 shadow-sm"
            >
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text/80 mb-8 flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" /> Browsers
              </h3>
              <div className="space-y-5">
                {(!data.browserBreakdown || data.browserBreakdown.length === 0) ? (
                  <p className="text-xs text-muted font-bold italic">Waiting for inbound data...</p>
                ) : data.browserBreakdown.map((b, i) => (
                  <div key={b._id} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-primary shadow-sm group-hover:scale-150 transition-transform" />
                      <span className="text-xs font-black text-text/70 uppercase tracking-widest group-hover:text-primary transition-colors">{b._id}</span>
                    </div>
                    <span className="text-xs font-black text-text">{b.count}</span>
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
              <div className="space-y-5">
                {(!data.referrerBreakdown || data.referrerBreakdown.length === 0) ? (
                  <p className="text-xs text-muted font-bold italic">No sources detected yet</p>
                ) : data.referrerBreakdown.map((r, i) => (
                  <div key={r._id} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-text/70 truncate max-w-[150px]">{r._id.replace('http://', '').replace('https://', '')}</span>
                      <span className="text-xs font-black text-primary">{r.count}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(r.count / (data.totalClicks || 1)) * 100}%` }}
                        className="h-full bg-primary-soft shadow-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border-2 border-border rounded-3xl p-8 shadow-sm mt-8"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text/80">Hourly Click Distribution</h3>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-[#7C3AED] shadow-sm" />
              <span className="text-[10px] font-black text-muted uppercase tracking-widest">Clicks By Hour</span>
            </div>
          </div>

          <div className="h-[280px] w-full">
            {formattedHourlyData.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-muted font-bold text-sm italic">
                Waiting for data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedHourlyData}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="hour" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#4A5568', fontWeight: 800 }} 
                    dy={10}
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
                  <Bar 
                    dataKey="clicks" 
                    fill="#7C3AED" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10 bg-white border-2 border-border rounded-3xl overflow-hidden shadow-sm"
        >
          <div className="bg-secondary border-b-2 border-border px-8 py-5 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text/80 flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" /> Recent Activity
            </h3>
            <div className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Latest 10 Clicks</div>
          </div>
          
          <div className="overflow-x-auto">
            {(!data.recentClicks || data.recentClicks.length === 0) ? (
              <div className="py-24 text-center text-muted font-bold italic text-sm">Synchronizing with edge ingestion clusters...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-border bg-white text-[10px] font-black text-muted uppercase tracking-[0.25em]">
                    <th className="px-8 py-5">Time</th>
                    <th className="px-8 py-5">Device</th>
                    <th className="px-8 py-5">Browser</th>
                    <th className="px-8 py-5">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-border/30">
                  {data.recentClicks.map((click) => (
                    <tr key={click._id} className="hover:bg-primary-soft/10 transition-colors group">
                      <td className="px-8 py-5 text-xs font-black text-text/60 group-hover:text-text transition-colors">
                        {new Date(click.clickedAt).toISOString().replace('T', ' ').split('.')[0]}
                      </td>
                      <td className="px-8 py-5">
                        <span className="inline-flex items-center rounded-lg bg-secondary border-2 border-border px-3 py-1.5 text-[10px] font-black uppercase tracking-tighter text-primary">
                          {click.device}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-xs font-black text-text">{click.browser}</td>
                      <td className="px-8 py-5 text-xs font-bold text-muted truncate max-w-[240px] italic">{click.referrer || 'Direct-Ingestion'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Analytics;