import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { unlockUrl } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldAlert, ArrowRight, Activity, Terminal } from 'lucide-react';

const UnlockPage = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await unlockUrl(shortCode, password);
      if (res.data.success) {
        window.location.href = res.data.data.originalUrl;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Security authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col items-center justify-center p-6 font-sans selection:bg-primary/30">
      {/* Background Architectural Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] border-[40px] border-text rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] border-[1px] border-text rotate-45" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white border-2 border-border shadow-sm mb-6">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-text tracking-tight mb-3">Locked Link</h1>
          <p className="text-muted font-bold text-lg">The link <span className="text-primary">/{shortCode}</span> is password protected.</p>
        </div>

        <div className="bg-white border-2 border-border rounded-3xl p-8 shadow-xl">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-5 text-sm font-black text-red-600 border-2 border-red-100">
                  <ShieldAlert className="h-6 w-6" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted/80 ml-1">Enter Password</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                  <Terminal className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Type password here..."
                  className="w-full h-14 pl-14 pr-6 bg-secondary border-2 border-border rounded-2xl text-text font-bold placeholder:text-muted/50 focus:border-primary focus:ring-0 transition-all outline-none"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full btn-primary h-14 text-base font-black flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-white/30 border-t-white" />
              ) : (
                <>Unlock Link <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">System Active</span>
          </div>
          <div className="h-4 w-[2px] bg-border" />
          <div className="text-[10px] font-black uppercase tracking-widest text-muted">Secure Connection</div>
        </div>
      </motion.div>
    </div>
  );
};

export default UnlockPage;
