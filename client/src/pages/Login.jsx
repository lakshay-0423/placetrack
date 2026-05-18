import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const user = await login(email, password);
      const role = user.role;
      if (role === 'student') navigate('/student/dashboard');
      else if (role === 'company') navigate('/company/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <div className="page-wrapper container flex items-center justify-center">
      <div className="card glass animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-8">
          <LogIn size={40} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
          <h2>Welcome Back</h2>
          <p className="text-muted">Login to your account</p>
        </div>
        
        {error && <div className="badge badge-primary" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)', marginBottom: '1rem', display: 'block', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-muted">Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)' }}>Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
