import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Users, Building, Activity, Briefcase, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [stats, setStats] = useState({ students: 0, companies: 0, placementsSecured: 0 });
  const [loading, setLoading] = useState(true);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({ isOpen: false, type: null, id: null });

  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'dashboard') {
        const [companiesRes, statsRes] = await Promise.all([
          api.get('/admin/companies/pending'),
          api.get('/admin/dashboard')
        ]);
        setPendingCompanies(companiesRes.data || []);
        setStats(statsRes.data || { students: 0, companies: 0, placementsSecured: 0 });
      } else if (activeTab === 'students') {
        const res = await api.get('/students');
        setStudents(res.data.data || []);
      } else if (activeTab === 'companies') {
        const res = await api.get('/companies');
        setCompanies(res.data || []);
      } else if (activeTab === 'jobs') {
        const res = await api.get('/jobs');
        setJobs(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleApprove = async (companyId) => {
    try {
      await api.put(`/admin/companies/${companyId}/approve`);
      fetchData();
    } catch (error) { showToast(error.response?.data?.message || 'Failed to approve', 'error'); }
  };

  const handleReject = async (companyId) => {
    try {
      await api.put(`/admin/companies/${companyId}/reject`);
      fetchData();
    } catch (error) { showToast(error.response?.data?.message || 'Failed to reject', 'error'); }
  };

  const handleDeleteStudent = (id) => {
    setConfirmDeleteModal({ isOpen: true, type: 'student', id });
  };

  const handleDeleteCompany = (id) => {
    setConfirmDeleteModal({ isOpen: true, type: 'company', id });
  };

  const handleDeleteJob = (id) => {
    setConfirmDeleteModal({ isOpen: true, type: 'job', id });
  };

  const confirmDeleteAction = async () => {
    const { type, id } = confirmDeleteModal;
    setConfirmDeleteModal({ isOpen: false, type: null, id: null });
    
    try {
      if (type === 'student') await api.delete(`/students/${id}`);
      else if (type === 'company') await api.delete(`/companies/${id}`);
      else if (type === 'job') await api.delete(`/jobs/${id}`);
      
      fetchData();
    } catch(e) {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="page-wrapper container animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Administrator Console</h1>
          <p className="text-muted">Logged in as {user?.name}</p>
        </div>
        <div className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)' }}>
          Super Admin
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {['dashboard', 'students', 'companies', 'jobs'].map(tab => (
          <button 
            key={tab}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab)}
            style={{ textTransform: 'capitalize' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
         <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-3 mb-8">
                <div className="card glass text-center">
                  <Users size={32} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
                  <h3>{stats.students || 0}</h3>
                  <p className="text-muted">Total Students</p>
                </div>
                <div className="card glass text-center">
                  <Building size={32} color="#F59E0B" style={{ margin: '0 auto 1rem auto' }} />
                  <h3>{stats.companies || 0}</h3>
                  <p className="text-muted">Registered Companies</p>
                </div>
                <div className="card glass text-center">
                  <Activity size={32} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
                  <h3>{stats.placementsSecured || 0}</h3>
                  <p className="text-muted">Placements Secured</p>
                </div>
              </div>

              <div className="card glass" style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📊 Reports & Analytics
                </h2>
                <p className="text-muted" style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  Server-rendered analytics pages powered by PostgreSQL via Prisma
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { emoji: '📊', label: 'Analytics Dashboard', path: '/admin/reports' },
                    { emoji: '🏆', label: 'Student Leaderboard', path: '/admin/leaderboard' },
                    { emoji: '🏢', label: 'Company Hiring History', path: '/admin/company-history' },
                    { emoji: '📈', label: 'Company Analytics', path: '/admin/company-analytics' },
                  ].map(link => (
                    <a
                      key={link.path}
                      href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${link.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.85rem 1rem', textDecoration: 'none',
                        justifyContent: 'center', fontSize: '0.9rem',
                        transition: 'all 0.25s ease',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{link.emoji}</span>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="card glass">
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={24} color="var(--primary)" />
                  Pending Approvals
                </h2>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '1rem' }}>Company Name</th>
                        <th style={{ padding: '1rem' }}>Registration Date</th>
                        <th style={{ padding: '1rem' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingCompanies.length === 0 ? (
                        <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center' }}>No pending companies.</td></tr>
                      ) : pendingCompanies.map(company => (
                        <tr key={company._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '1rem' }}>{company.name}</td>
                          <td style={{ padding: '1rem' }}>{new Date(company.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '1rem' }}>
                            <div className="flex gap-4">
                              <button className="btn btn-secondary" style={{ padding: '0.5rem', color: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => handleApprove(company._id)}>Approve</button>
                              <button className="btn btn-secondary" style={{ padding: '0.5rem', color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => handleReject(company._id)}>Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'students' && (
            <div className="card glass">
               <h2>Manage Students</h2>
               <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                     <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '1rem' }}>Name</th>
                        <th style={{ padding: '1rem' }}>Roll No.</th>
                        <th style={{ padding: '1rem' }}>Email</th>
                        <th style={{ padding: '1rem' }}>CGPA</th>
                        <th style={{ padding: '1rem' }}>Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {students.length === 0 ? <tr><td colSpan="5">No students found.</td></tr> : students.map(s => (
                        <tr key={s._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                           <td style={{ padding: '1rem' }}>{s.name}</td>
                           <td style={{ padding: '1rem' }}>{s.rollNumber || 'N/A'}</td>
                           <td style={{ padding: '1rem' }}>{s.email}</td>
                           <td style={{ padding: '1rem' }}>{s.cgpa || 'N/A'}</td>
                           <td style={{ padding: '1rem' }}>
                              <button className="btn btn-secondary" onClick={() => handleDeleteStudent(s._id)}><Trash2 size={16} color="var(--error)"/></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="card glass">
               <h2>Manage Companies</h2>
               <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                     <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '1rem' }}>Name</th>
                        <th style={{ padding: '1rem' }}>Status</th>
                        <th style={{ padding: '1rem' }}>Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {companies.length === 0 ? <tr><td colSpan="3">No companies found.</td></tr> : companies.map(c => (
                        <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                           <td style={{ padding: '1rem' }}>{c.name}</td>
                           <td style={{ padding: '1rem' }}>{c.status}</td>
                           <td style={{ padding: '1rem' }}>
                              <button className="btn btn-secondary" onClick={() => handleDeleteCompany(c._id)}><Trash2 size={16} color="var(--error)"/></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="card glass">
               <h2>Manage Jobs</h2>
               <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                     <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '1rem' }}>Title</th>
                        <th style={{ padding: '1rem' }}>Company</th>
                        <th style={{ padding: '1rem' }}>Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {jobs.length === 0 ? <tr><td colSpan="3">No jobs found.</td></tr> : jobs.map(j => (
                        <tr key={j._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                           <td style={{ padding: '1rem' }}>{j.title}</td>
                           <td style={{ padding: '1rem' }}>{j.company?.name || 'Unknown'}</td>
                           <td style={{ padding: '1rem' }}>
                              <button className="btn btn-secondary" onClick={() => handleDeleteJob(j._id)}><Trash2 size={16} color="var(--error)"/></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          )}
        </>
      )}

      {confirmDeleteModal.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card glass animate-fade-in" style={{ width: '400px', maxWidth: '90%' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--error)' }}>Confirm Deletion</h2>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>
              Are you sure you want to delete this {confirmDeleteModal.type}? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDeleteModal({ isOpen: false, type: null, id: null })}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ background: 'var(--error)' }} onClick={confirmDeleteAction}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
