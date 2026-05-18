import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { unlockUrl } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldAlert, ArrowRight, Activity, Terminal } from 'lucide-react';

const PasswordGate = () => {
  const { shortCode } = useParams();
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
      setError(err.response?.data?.message || 'Access Denied: Invalid Security Key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 font-sans selection:bg-[#7C3AED]/30 text-white">
      <div className="fixed inset-0 pointer-events-none opacity-5 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] border-[40px] border-[#7C3AED] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] border-[1px] border-[#7C3AED] rotate-45" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[#1E293B] border border-[#334155] shadow-xl mb-6">
            <Lock className="h-10 w-10 text-[#7C3AED]" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-3">Link Locked</h1>
          <p className="text-slate-400 font-bold text-lg">The destination of <span className="text-[#7C3AED]">/{shortCode}</span> is secured.</p>
        </div>

        <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="flex items-center gap-3 rounded-2xl bg-red-950/50 p-5 text-sm font-black text-red-400 border border-red-900/50">
                  <ShieldAlert className="h-6 w-6" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-1">Decryption Password</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7C3AED] transition-colors">
                  <Terminal className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access code..."
                  className="w-full h-14 pl-14 pr-6 bg-[#0F172A] border-2 border-[#334155] rounded-2xl text-white font-bold placeholder:text-slate-600 focus:border-[#7C3AED] focus:ring-0 transition-all outline-none"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white h-14 text-base font-black flex items-center justify-center gap-3 rounded-2xl transition-all duration-200 active:scale-95 group shadow-lg shadow-[#7C3AED]/20"
            >
              {loading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-white/30 border-t-white" />
              ) : (
                <>Decrypt & Redirect <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pipeline Online</span>
          </div>
          <div className="h-4 w-[2px] bg-[#334155]" />
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Encrypted Bypass</div>
        </div>
      </motion.div>
    </div>
  );
};

export default PasswordGate;
