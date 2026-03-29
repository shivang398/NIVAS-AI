import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ShieldCheck } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TENANT' // Default
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/dashboard';
  const autoApply = location.state?.autoApply;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.role
    );
    
    if (res.success) {
      navigate(from, { state: { autoApply } });
    } else {
      setError(res.message);
    }
    
    setIsLoading(false);
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <h2 className="text-gradient">Create Account</h2>
          <p>Join Nivas to seamlessly rent or list properties.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input 
                type="text" 
                name="name"
                className="input-field with-icon" 
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                name="email"
                className="input-field with-icon" 
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input 
                type="password" 
                name="password"
                className="input-field with-icon" 
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">I am a...</label>
            <div className="input-wrapper">
              <ShieldCheck className="input-icon" size={18} />
              <select 
                name="role" 
                className="input-field with-icon" 
                value={formData.role} 
                onChange={handleChange}
              >
                <option value="TENANT">Tenant (Looking to rent)</option>
                <option value="OWNER">Owner (Listing properties)</option>
                <option value="POLICE">Police (Developer / Admin)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" state={{ from, autoApply }} className="auth-link">Log in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
