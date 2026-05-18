import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, FileText, CheckCircle, Clock, UploadCloud, Check } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import socket from '../services/socket';
import AvailableJobs from '../components/dashboard/AvailableJobs';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);

  const [profile, setProfile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  const fetchData = async () => {
    try {
      const [appsRes, profileRes] = await Promise.all([
        api.get('/api/applications'),
        api.get('/students/me')
      ]);
      setApplications(appsRes.data.data || []);
      setProfile(profileRes.data || null);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleAppUpdate = () => {
      fetchData();
    };

    socket.on('application_updated', handleAppUpdate);
    return () => {
      socket.off('application_updated', handleAppUpdate);
    };
  }, []);

  const handleApply = async (jobId) => {
    if (!profile?.resume?.url) {
      showToast("Please upload your resume before applying", "warning");
      return;
    }

    // Optimistic UI update for instant feedback
    setApplications(prev => [...prev, { job: { _id: jobId }, status: 'Pending' }]);
    
    try {
      await api.post(`/api/applications/${jobId}`);
      // Refresh applications list after applying
      fetchData();
    } catch (error) {
      fetchData(); // Revert on failure
      showToast(error.response?.data?.message || 'Failed to apply', 'error');
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showToast("Only PDF files are allowed", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be less than 5MB", "error");
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setUploadingResume(true);
      await api.post('/students/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchData(); 
      showToast("Resume uploaded successfully!", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to upload resume", "error");
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) return <div className="page-wrapper container flex items-center justify-center">Loading...</div>;

  const appliedJobIds = new Set(applications.map(app => String(app.job?._id)));
  const offersReceived = applications.filter(app => app.status === 'Accepted').length;

  return (
    <div className="page-wrapper container animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Welcome, {user?.name}</h1>
          <p className="text-muted">Student Dashboard</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="card glass" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem' }} className="text-muted">Resume Status</p>
              {profile?.resume?.url ? (
                <a href={profile.resume.url} target="_blank" rel="noreferrer" style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontWeight: 'bold' }}>
                  <Check size={16} /> Uploaded
                </a>
              ) : (
                <span style={{ color: 'var(--error)', fontSize: '0.875rem' }}>Missing (Required)</span>
              )}
            </div>
            <label className="btn btn-secondary" style={{ cursor: uploadingResume ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <UploadCloud size={16} />
              {uploadingResume ? 'Uploading...' : (profile?.resume?.url ? 'Replace' : 'Upload PDF')}
              <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleResumeUpload} disabled={uploadingResume} />
            </label>
          </div>
          <div className="badge badge-success">Active Status</div>
        </div>
      </div>

      <div className="grid grid-cols-3 mb-8">
        <div className="card glass text-center">
          <Briefcase size={32} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>{totalJobs}</h3>
          <p className="text-muted">Available Jobs</p>
        </div>
        <div className="card glass text-center">
          <FileText size={32} color="#F59E0B" style={{ margin: '0 auto 1rem auto' }} />
          <h3>{applications.length}</h3>
          <p className="text-muted">Applications Sent</p>
        </div>
        <div className="card glass text-center">
          <CheckCircle size={32} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>{offersReceived}</h3>
          <p className="text-muted">Offers Received</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md-grid-cols-2" style={{ gap: '2rem' }}>
        <AvailableJobs 
          appliedJobIds={appliedJobIds} 
          handleApply={handleApply} 
          onTotalJobsChange={setTotalJobs} 
        />

        <div className="card glass">
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={24} color="#F59E0B" />
            Recent Applications
          </h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Company</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Role</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center' }} className="text-muted">No applications yet.</td></tr>
                ) : applications.map(app => (
                  <tr key={app._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>{app.job?.company?.name || 'Unknown Company'}</td>
                    <td style={{ padding: '1rem' }}>{app.job?.title || 'Unknown Role'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${app.status === 'Pending' ? 'badge-primary' : app.status === 'Accepted' ? 'badge-success' : 'badge-danger'}`} style={{ backgroundColor: app.status === 'Rejected' ? 'rgba(239, 68, 68, 0.2)' : '', color: app.status === 'Rejected' ? 'var(--error)' : '' }}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
