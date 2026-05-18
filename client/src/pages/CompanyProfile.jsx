import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building as BuildingIcon } from 'lucide-react';
import api from '../services/api';

const CompanyProfile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: ''
  });
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/companies/me');
        const data = response.data;
        if (data && data.status) {
           setStatus(data.status);
        }
        setFormData({
          name: data.name || user?.name || '',
          location: data.location || '',
          description: data.description || ''
        });
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      setError('');
      
      await api.put('/companies/me', formData);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) return <div className="page-wrapper container flex items-center justify-center">Loading...</div>;

  return (
    <div className="page-wrapper container animate-fade-in">
      <div className="card glass" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
              <BuildingIcon size={32} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ margin: 0 }}>Company Profile</h2>
              <p className="text-muted" style={{ margin: 0 }}>Update details about your organization</p>
            </div>
          </div>
          <span className={`badge ${status === 'approved' ? 'badge-success' : status === 'rejected' ? 'badge-danger' : 'badge-primary'}`}
                style={status === 'rejected' ? { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)' } : {}}>
            {status.toUpperCase()}
          </span>
        </div>

        {message && <div className="badge badge-success" style={{ display: 'block', textAlign: 'center', marginBottom: '1rem' }}>{message}</div>}
        {error && <div className="badge badge-primary" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)', display: 'block', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Company Name</label>
            <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Location</label>
            <input type="text" name="location" className="form-input" value={formData.location} onChange={handleChange} placeholder="e.g. San Francisco, CA" />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Description</label>
            <textarea name="description" className="form-input" value={formData.description} onChange={handleChange} placeholder="Briefly describe what your company does" rows="4"></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Save Profile</button>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;
