import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'student') return '/student/dashboard';
    if (user.role === 'company') return '/company/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <nav className="navbar glass">
      <div className="navbar-container container">
        <Link to="/" className="flex items-center gap-4" style={{ textDecoration: 'none' }}>
          <GraduationCap size={32} color="var(--primary)" />
          <h2 style={{ margin: 0, fontSize: '1.5rem', background: 'none', WebkitTextFillColor: 'initial', color: 'var(--text-main)' }}>
            PlaceTrack
          </h2>
        </Link>
        
        <div className="nav-links">
          {user ? (
            <>
              <Link to={getDashboardLink()} className="nav-link">Dashboard</Link>
              {user.role === 'student' && (
                <Link to="/student/profile" className="nav-link">Profile</Link>
              )}
              {user.role === 'company' && (
                <Link to="/company/profile" className="nav-link">Profile</Link>
              )}
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="btn btn-primary" style={{ textDecoration: 'none' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
