import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar glass-card">
      <div className="nav-brand">
        <Link to="/" className="brand-link">
          <Home className="brand-icon" />
          <span className="brand-text text-gradient">Nivas-AI</span>
        </Link>
      </div>
      
      <div className="nav-links">
        {location.pathname !== '/dashboard' && (
          <Link to="/properties" className="nav-item">Properties</Link>
        )}
        {user ? (
          <>
            <Link to="/dashboard" className="nav-item">Dashboard</Link>
            <div className="user-profile">
              <button onClick={handleLogout} className="btn-secondary icon-btn">
                <LogOut size={18} /> Logout
              </button>
            </div>
          </>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn-secondary">Log In</Link>
            <Link to="/register" className="btn-primary">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
