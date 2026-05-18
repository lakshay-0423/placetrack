import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    rollNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await signup(formData);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    }
  };

  return (
    <div className="page-wrapper container flex items-center justify-center">
      <div className="card glass animate-fade-in" style={{ width: '100%', maxWidth: '500px', margin: '2rem 0' }}>
        <div className="text-center mb-8">
          <UserPlus size={40} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
          <h2>Create an Account</h2>
          <p className="text-muted">Join PlaceTrack today</p>
        </div>
        
        {error && <div className="badge badge-primary" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)', marginBottom: '1rem', display: 'block', textAlign: 'center' }}>{error}</div>}
        {success && <div className="badge badge-success" style={{ marginBottom: '1rem', display: 'block', textAlign: 'center' }}>{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              name="name"
              className="form-input" 
              required 
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              name="email"
              className="form-input" 
              required 
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              name="password"
              className="form-input" 
              required 
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <select name="role" className="form-input" value={formData.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="company">Company</option>
            </select>
          </div>
          {formData.role === 'student' && (
            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input 
                type="text" 
                name="rollNumber"
                className="form-input" 
                required 
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="Ex: 21BCE0001"
              />
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign Up</button>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-muted">Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
