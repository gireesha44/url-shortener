import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link as LinkIcon, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Zap, Database, BarChart3 } from 'lucide-react';
import { cn } from '../utils/cn';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginUser(form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col md:flex-row font-sans text-text selection:bg-primary/30">
      {/* Left Panel - Branding & Engineering context */}
      <div className="hidden md:flex flex-1 flex-col justify-between p-16 bg-white border-r-2 border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#FFB7C505_0%,transparent_50%)]" />
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/20">
              <LinkIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight text-text">NexLink</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border-2 border-primary/20 text-xs font-black text-primary uppercase tracking-widest mb-8">
            <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
            Enterprise Infrastructure
          </div>
          <h1 className="text-6xl font-black leading-[1.05] mb-8 text-text">
            Control your <br />
            <span className="text-primary">Link Assets.</span>
          </h1>
          <p className="text-muted text-xl font-bold leading-relaxed mb-12">
            Professional-grade URL pipeline featuring Redis caching, 
            BullMQ workers, and real-time click stream ingestion.
          </p>

          <div className="grid grid-cols-2 gap-8">
            {[
              { icon: Zap, label: 'Turbo Cache', desc: 'Sub-5ms edge latency' },
              { icon: BarChart3, label: 'Analytics', desc: 'Real-time click streams' },
              { icon: Database, label: 'Distributed', desc: 'Redis Cluster nodes' },
              { icon: ShieldCheck, label: 'Encrypted', desc: 'Enterprise-grade TLS' },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-primary font-black">
                  <feature.icon className="h-5 w-5" />
                  <span className="text-sm uppercase tracking-wider">{feature.label}</span>
                </div>
                <span className="text-xs font-bold text-muted leading-tight">{feature.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 pt-12 border-t-2 border-border">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-10 rounded-full border-4 border-white bg-secondary shadow-sm" />
            ))}
          </div>
          <span className="text-sm text-muted font-bold italic">2,400+ engineers shortening links today</span>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 relative bg-[#F7FAFC]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[480px] space-y-10"
        >
          <div className="text-center md:text-left space-y-3">
            <h2 className="text-4xl font-black tracking-tight text-text">Sign in</h2>
            <p className="text-muted font-bold text-lg">Access your infrastructure dashboard.</p>
          </div>

          <div className="bg-white border-2 border-border rounded-3xl p-10 space-y-8 shadow-2xl shadow-black/5">
            {error && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border-2 border-red-100">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted/80 ml-1">Work Email</label>
                <input
                  className="input-field w-full h-14 text-base"
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-muted/80">Security Token</label>
                  <a href="#" className="text-[10px] font-black text-primary hover:text-primary/70 uppercase tracking-widest">Forgot?</a>
                </div>
                <div className="relative group">
                  <input
                    className="input-field w-full h-14 pr-14 text-base"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button 
                className="btn-primary w-full h-14 mt-4 text-lg" 
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                ) : (
                  <>Authorize Session <ArrowRight className="h-5 w-5" /></>
                )}
              </button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-border"></div></div>
              <div className="relative flex justify-center text-[11px] uppercase font-black tracking-[0.25em]"><span className="bg-white px-6 text-muted">Node Provisioning</span></div>
            </div>

            <Link 
              to="/register" 
              className="btn-secondary w-full h-14 text-base"
            >
              Initialize new account
            </Link>
          </div>

          <p className="text-center text-xs font-bold text-muted leading-relaxed">
            Authorized access only. By continuing, you agree to our <br className="hidden sm:block" />
            <a href="#" className="text-text hover:text-primary transition-colors">Terms of Service</a> and <a href="#" className="text-text hover:text-primary transition-colors">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
