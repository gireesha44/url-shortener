import { useState } from 'react';
import { Send, Hash, Calendar, AlertCircle, CheckCircle2, TrendingUp, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const URLForm = ({ onSubmit, loading, error, success }) => {
  const [form, setForm] = useState({ originalUrl: '', customCode: '', expiresAt: '', tags: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagsArray = (form.tags || '').split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    onSubmit({ ...form, tags: tagsArray });
    setForm({ originalUrl: '', customCode: '', expiresAt: '', tags: '', password: '' });
  };

  return (
    <div className="glass-card shadow-lg bg-white">
      <div className="border-b-2 border-border bg-primary-soft/20 px-6 py-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-text/80">Create New Link</h2>
      </div>
      
      <div className="p-8">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm font-bold text-red-600 border-2 border-red-100">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="flex items-center gap-3 rounded-lg bg-green-accent/30 p-4 text-sm font-bold text-green-700 border-2 border-green-accent">
                <CheckCircle2 className="h-5 w-5" />
                {success}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/80 ml-1">Website Link (Destination)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                  <Send className="h-5 w-5" />
                </div>
                <input
                  className="input-field w-full pl-12"
                  type="url"
                  placeholder="https://example.com/very-long-production-link"
                  value={form.originalUrl}
                  onChange={(e) => setForm({ ...form, originalUrl: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <button 
              className="btn-primary min-w-[180px] h-[54px] text-base" 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-3 border-white/30 border-t-white" />
              ) : (
                <>Create Link <Send className="h-5 w-5" /></>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/80 ml-1">Short Name (Optional)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                  <Hash className="h-5 w-5" />
                </div>
                <input
                  className="input-field w-full pl-12"
                  type="text"
                  placeholder="custom-code"
                  value={form.customCode}
                  onChange={(e) => setForm({ ...form, customCode: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/80 ml-1">Link Tags</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <input
                  className="input-field w-full pl-12"
                  type="text"
                  placeholder="social, dev"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/80 ml-1">Password (Optional)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  className="input-field w-full pl-12"
                  type="password"
                  placeholder="Optional lock"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/80 ml-1">Expires On (Optional)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                  <Calendar className="h-5 w-5" />
                </div>
                <input
                  className="input-field w-full pl-12"
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default URLForm;
