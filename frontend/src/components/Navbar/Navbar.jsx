import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, BarChart3, Link as LinkIcon, User, LayoutDashboard } from 'lucide-react';
import { cn } from '../../utils/cn';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group transition-all">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/10 group-hover:scale-105 transition-transform">
            <LinkIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-text">NexLink</span>
        </Link>

        <div className="flex items-center gap-6">
          {user && (
            <div className="hidden items-center gap-2.5 rounded-lg border border-border bg-secondary px-3 py-1.5 sm:flex">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white border border-border text-primary shadow-sm">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-bold text-text/80">{user.name}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 sm:gap-2">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-muted hover:text-primary hover:bg-primary-soft/30 transition-all active:scale-95"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </Link>
            
            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-all active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
