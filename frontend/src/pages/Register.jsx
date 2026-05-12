import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link as LinkIcon, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Zap, Database, BarChart3, User } from 'lucide-react';
import { cn } from '../utils/cn';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      const res = await registerUser(form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ['bg-red-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['Vulnerable', 'Standard', 'Encrypted'];

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
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
            Scalable Link Architecture
          </div>
          <h1 className="text-6xl font-black leading-[1.05] mb-8 text-text">
            Join the <br />
            <span className="text-primary">Link Stack.</span>
          </h1>
          <p className="text-muted text-xl font-bold leading-relaxed mb-12">
            Build enterprise-grade redirect pipelines with native Redis integration 
            and automated click-stream analysis.
          </p>

          <div className="space-y-8">
            {[
              { icon: Zap, label: 'Turbo Redirects', desc: 'Sub-5ms execution via distributed edge clusters' },
              { icon: BarChart3, label: 'Atomic Analytics', desc: 'Real-time ingestion processed by BullMQ workers' },
              { icon: ShieldCheck, label: 'Secured Pipeline', desc: 'End-to-end encryption and JWT session tokens' },
            ].map((feature, i) => (
              <div key={i} className="flex gap-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary border-2 border-border shadow-sm">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div className="flex flex-col gap-1.5 justify-center">
                  <span className="text-base font-black text-text uppercase tracking-wide">{feature.label}</span>
                  <span className="text-sm font-bold text-muted leading-relaxed">{feature.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 p-8 rounded-3xl bg-secondary border-2 border-border shadow-sm">
          <div className="flex items-center gap-3 mb-6 text-xs font-black text-primary uppercase tracking-[0.25em]">
            <Database className="h-4 w-4" /> Pipeline Architecture
          </div>
          <div className="flex items-center gap-4 text-sm font-black text-text/70">
            <span className="px-3 py-2 rounded-xl bg-white border-2 border-border">Client</span>
            <ArrowRight className="h-4 w-4 text-primary" />
            <span className="px-3 py-2 rounded-xl bg-primary text-white border-2 border-primary">Redis Cache</span>
            <ArrowRight className="h-4 w-4 text-primary" />
            <span className="px-3 py-2 rounded-xl bg-white border-2 border-border">MongoDB</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 relative bg-[#F7FAFC]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[480px] space-y-10"
        >
          <div className="text-center md:text-left space-y-3">
            <h2 className="text-4xl font-black tracking-tight text-text">Initialize Node</h2>
            <p className="text-muted font-bold text-lg">Provision your enterprise account credentials.</p>
          </div>

          <div className="bg-white border-2 border-border rounded-3xl p-10 space-y-6 shadow-2xl shadow-black/5">
            {error && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border-2 border-red-100">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted/80 ml-1">Engineering Lead Name</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    className="input-field w-full h-14 pl-12 text-base"
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted/80 ml-1">Corporate Email</label>
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
                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted/80 ml-1">Security Keyphrase</label>
                <div className="relative group">
                  <input
                    className="input-field w-full h-14 pr-14 text-base"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Min 6 characters"
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
                
                {form.password.length > 0 && (
                  <div className="pt-2 px-1 space-y-2">
                    <div className="flex gap-2">
                      {[1, 2, 3].map((i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "h-1.5 flex-1 rounded-full transition-all duration-500",
                            i <= strength ? strengthColors[strength - 1] : "bg-border"
                          )} 
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-muted">Security Tier:</span>
                      <span className={cn(strength > 0 ? strengthColors[strength - 1].replace('bg-', 'text-') : "text-muted")}>
                        {strengthLabels[strength - 1] || '---'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button 
                className="btn-primary w-full h-14 mt-4 text-lg" 
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                ) : (
                  <>Create Node <ArrowRight className="h-5 w-5" /></>
                )}
              </button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-border"></div></div>
              <div className="relative flex justify-center text-[11px] uppercase font-black tracking-[0.25em]"><span className="bg-white px-6 text-muted">Cluster Access</span></div>
            </div>

            <Link 
              to="/login" 
              className="btn-secondary w-full h-14 text-base"
            >
              Sign in to NexLink
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
