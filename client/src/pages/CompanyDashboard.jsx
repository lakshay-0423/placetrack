import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, FilePlus, BarChart, Settings, X, FileText } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import socket from '../services/socket';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showJobForm, setShowJobForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', salary: '', minCGPA: '', eligibleBranches: '', passingYear: '', requiredSkills: '' });
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [editJob, setEditJob] = useState(null);
  
  const [viewingApplicantsJobId, setViewingApplicantsJobId] = useState(null);
  const [applicants, setApplicants] = useState([]);

  const fetchData = async () => {
    try {
      const [profileRes, jobsRes] = await Promise.all([
        api.get('/companies/me'),
        api.get('/jobs')
      ]);
      setProfile(profileRes.data);
      setJobs(jobsRes.data.data || []);
    } catch (error) {
      console.error("Error fetching company data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleJobUpdate = () => {
      fetchData();
    };

    socket.on('job_updated', handleJobUpdate);
    return () => {
      socket.off('job_updated', handleJobUpdate);
    };
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs', {
        ...newJob,
        salary: Number(newJob.salary),
        minCGPA: Number(newJob.minCGPA),
        passingYear: Number(newJob.passingYear),
        eligibleBranches: newJob.eligibleBranches.split(',').map(b => b.trim()).filter(Boolean),
        requiredSkills: newJob.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
      });
      setShowJobForm(false);
      setNewJob({ title: '', salary: '', minCGPA: '', eligibleBranches: '', passingYear: '', requiredSkills: '' });
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to post job', 'error');
    }
  };

  const handleUpdateJobSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/jobs/${editJob._id}`, {
        ...editJob,
        salary: Number(editJob.salary),
        minCGPA: Number(editJob.minCGPA),
        passingYear: Number(editJob.passingYear),
        eligibleBranches: typeof editJob.eligibleBranches === 'string' ? editJob.eligibleBranches.split(',').map(b => b.trim()).filter(Boolean) : editJob.eligibleBranches,
        requiredSkills: typeof editJob.requiredSkills === 'string' ? editJob.requiredSkills.split(',').map(s => s.trim()).filter(Boolean) : editJob.requiredSkills
      });
      setShowEditForm(false);
      setEditJob(null);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update job', 'error');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if(!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete job', 'error');
    }
  };

  const handleViewApplicants = async (jobId) => {
    try {
      const res = await api.get(`/jobs/${jobId}/rank`);
      setApplicants(res.data || []);
      setViewingApplicantsJobId(jobId);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch applicants', 'error');
    }
  };

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      await api.put(`/api/applications/${applicationId}/status`, { status });
      handleViewApplicants(viewingApplicantsJobId); // Refresh applicants
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  if (loading) return <div className="page-wrapper container flex items-center justify-center">Loading...</div>;

  const isApproved = profile?.status === 'approved';

  return (
    <div className="page-wrapper container animate-fade-in" style={{ position: 'relative' }}>
      {!isApproved && (
        <div style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
          Your company profile is currently <strong>{profile?.status || 'pending'}</strong>. You cannot post jobs until an admin approves your account.
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: '2rem' }}>{user?.name}</h1>
          <p className="text-muted">Company Portal</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowJobForm(true)}
          disabled={!isApproved}
          style={{ opacity: !isApproved ? 0.5 : 1, cursor: !isApproved ? 'not-allowed' : 'pointer' }}
        >
          <FilePlus size={18} />
          Post New Job
        </button>
      </div>

      <div className="grid grid-cols-3 mb-8">
        <div className="card glass text-center">
          <FilePlus size={32} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>{jobs.length}</h3>
          <p className="text-muted">Active Job Posts</p>
        </div>
        <div className="card glass text-center">
          <Users size={32} color="#F59E0B" style={{ margin: '0 auto 1rem auto' }} />
          <h3>{profile?.stats?.totalApplicants || 0}</h3>
          <p className="text-muted">Total Applicants</p>
        </div>
        <div className="card glass text-center">
          <BarChart size={32} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>{profile?.stats?.shortlistedCandidates || 0}</h3>
          <p className="text-muted">Shortlisted Candidates</p>
        </div>
      </div>

      <div className="card glass">
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={24} color="var(--primary)" />
          Manage Job Postings
        </h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Job Title</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Posted Date</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Salary</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '1rem', textAlign: 'center' }} className="text-muted">
                    No jobs posted yet.
                  </td>
                </tr>
              ) : jobs.map(job => (
                <tr key={job._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>{job.title}</td>
                  <td style={{ padding: '1rem' }}>{new Date(job.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>${job.salary}</td>
                  <td style={{ padding: '1rem' }}>
                    <div className="flex" style={{ gap: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                        onClick={() => handleViewApplicants(job._id)}
                      >
                        Applicants
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: '#F59E0B', borderColor: '#F59E0B' }}
                        onClick={() => {
                          setEditJob({ ...job, eligibleBranches: (job.eligibleBranches || []).join(', '), requiredSkills: (job.requiredSkills || []).join(', ') });
                          setShowEditForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: 'var(--error)', borderColor: 'var(--error)' }}
                        onClick={() => handleDeleteJob(job._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showJobForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card glass" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Post a New Job</h2>
              <button onClick={() => setShowJobForm(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handlePostJob} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required placeholder="Job Title" className="form-input" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
              <input required type="number" placeholder="Salary" className="form-input" value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} />
              <input required type="number" step="0.1" placeholder="Minimum CGPA" className="form-input" value={newJob.minCGPA} onChange={e => setNewJob({...newJob, minCGPA: e.target.value})} />
              <input required placeholder="Eligible Branches (comma separated, e.g., CSE, IT)" className="form-input" value={newJob.eligibleBranches} onChange={e => setNewJob({...newJob, eligibleBranches: e.target.value})} />
              <input required type="number" placeholder="Passing Year" className="form-input" value={newJob.passingYear} onChange={e => setNewJob({...newJob, passingYear: e.target.value})} />
              <input placeholder="Required Skills (comma separated, e.g., React, Node.js, Python)" className="form-input" value={newJob.requiredSkills} onChange={e => setNewJob({...newJob, requiredSkills: e.target.value})} />
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Submit Job</button>
            </form>
          </div>
        </div>
      )}

      {showEditForm && editJob && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card glass" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Edit Job</h2>
              <button onClick={() => setShowEditForm(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateJobSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required placeholder="Job Title" className="form-input" value={editJob.title} onChange={e => setEditJob({...editJob, title: e.target.value})} />
              <input required type="number" placeholder="Salary" className="form-input" value={editJob.salary} onChange={e => setEditJob({...editJob, salary: e.target.value})} />
              <input required type="number" step="0.1" placeholder="Minimum CGPA" className="form-input" value={editJob.minCGPA} onChange={e => setEditJob({...editJob, minCGPA: e.target.value})} />
              <input required placeholder="Eligible Branches (comma separated)" className="form-input" value={editJob.eligibleBranches} onChange={e => setEditJob({...editJob, eligibleBranches: e.target.value})} />
              <input required type="number" placeholder="Passing Year" className="form-input" value={editJob.passingYear} onChange={e => setEditJob({...editJob, passingYear: e.target.value})} />
              <input placeholder="Required Skills (comma separated, e.g., React, Node.js)" className="form-input" value={editJob.requiredSkills} onChange={e => setEditJob({...editJob, requiredSkills: e.target.value})} />
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', background: '#F59E0B' }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {viewingApplicantsJobId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div className="card glass" style={{ width: '100%', maxWidth: '900px', maxHeight: '80vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Applicants Ranked by Score</h2>
              <button onClick={() => setViewingApplicantsJobId(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
                <X size={24} />
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem' }}>Rank</th>
                  <th style={{ padding: '1rem' }}>Roll No.</th>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>CGPA</th>
                  <th style={{ padding: '1rem' }}>Score</th>
                  <th style={{ padding: '1rem' }}>Resume</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: '1rem', textAlign: 'center' }}>No applicants yet.</td></tr>
                ) : applicants.map((app, idx) => (
                  <tr key={app.applicationId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>{idx + 1}</td>
                    <td style={{ padding: '1rem' }}>{app.student.rollNumber || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>{app.student.name}</td>
                    <td style={{ padding: '1rem' }}>{app.student.cgpa || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>{app.score}</td>
                    <td style={{ padding: '1rem' }}>
                      {app.resume?.url || app.student.resume?.url ? (
                        <a 
                          href={app.resume?.url || app.student.resume?.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}
                        >
                          <FileText size={14} /> View PDF
                        </a>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>No Resume</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${app.status === 'Pending' ? 'badge-primary' : app.status === 'Accepted' ? 'badge-success' : 'badge-danger'}`} style={{ backgroundColor: app.status === 'Rejected' ? 'rgba(239, 68, 68, 0.2)' : '', color: app.status === 'Rejected' ? 'var(--error)' : '' }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div className="flex gap-4">
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--success)', borderColor: 'var(--success)' }}
                          onClick={() => handleUpdateStatus(app.applicationId, 'Accepted')}
                          disabled={app.status !== 'Pending'}
                        >
                          Accept
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--error)', borderColor: 'var(--error)' }}
                          onClick={() => handleUpdateStatus(app.applicationId, 'Rejected')}
                          disabled={app.status !== 'Pending'}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
