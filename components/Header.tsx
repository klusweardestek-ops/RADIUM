import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Music, UserCircle, ShieldCheck } from 'lucide-react';

const Header: React.FC = () => {
  const { profile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-black/30 backdrop-blur-md border-b border-brand-blue/20 sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-3xl font-orbitron font-bold text-white tracking-widest hover:text-brand-blue-light transition-colors duration-300" style={{ textShadow: '0 0 10px #00bfff' }}>
          RADIUM
        </Link>
        <div className="flex items-center space-x-4">
          {profile ? (
            <>
              <span className="text-gray-300 hidden sm:inline">Welcome, {profile.username}</span>
              {isAdmin && (
                <NavLink to="/admin" icon={<ShieldCheck size={20} />} label="Admin" />
              )}
              <NavLink to="/dashboard" icon={<Music size={20} />} label="Dashboard" />
              <NavLink to="/profile" icon={<UserCircle size={20} />} label="Profile" />
              <button onClick={handleLogout} className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors duration-300 p-2 rounded-md hover:bg-white/10">
                <LogOut size={20} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-semibold text-white hover:text-brand-blue-light transition-colors duration-300">Login</Link>
              <Link to="/register" className="font-semibold bg-brand-blue text-black px-4 py-2 rounded-md hover:bg-brand-blue-light hover:shadow-glow-blue transition-all duration-300">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center space-x-2 text-white hover:text-brand-blue-light transition-colors duration-300 p-2 rounded-md hover:bg-white/10">
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </Link>
);


export default Header;
