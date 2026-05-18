import React, { useState, useEffect, useCallback } from 'react';
import { Briefcase, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import api from '../../services/api';
import socket from '../../services/socket';

const AvailableJobs = ({ appliedJobIds, handleApply, onTotalJobsChange }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const limit = 10;

  const fetchJobs = useCallback(async () => {
    try {
      setIsTransitioning(true);
      const res = await api.get(`/jobs?page=${page}&limit=${limit}`);
      setJobs(res.data.data || []);
      setTotalPages(res.data.pages || 1);
      if (onTotalJobsChange) onTotalJobsChange(res.data.total || 0);
    } catch (error) {
      console.error("Error fetching jobs", error);
    } finally {
      setLoading(false);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [page]);

  useEffect(() => {
    fetchJobs();

    const handleJobUpdate = () => {
      fetchJobs();
    };

    socket.on('job_updated', handleJobUpdate);
    return () => {
      socket.off('job_updated', handleJobUpdate);
    };
  }, [fetchJobs]);

  return (
    <div className="card glass">
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Briefcase size={24} color="var(--primary)" />
        Available Jobs
      </h2>
      
      {loading && jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading jobs...</div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '300px', opacity: isTransitioning ? 0 : 1, transition: 'opacity 0.3s ease' }}>
            {jobs.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '2rem 0' }}>No jobs available right now.</p>
            ) : (
              jobs.map(job => (
                <div key={job._id} style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{job.title}</h3>
                      <p className="text-muted" style={{ margin: '0.25rem 0' }}>{job.company?.name || 'Unknown Company'}</p>
                      <p style={{ fontSize: '0.9rem', margin: 0 }}>Salary: ${job.salary}</p>
                      <div className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        <strong>Passing Year:</strong> {job.passingYear || 'Any'}
                      </div>
                    </div>
                    {appliedJobIds.has(String(job._id)) ? (
                      <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Check size={14} /> Applied
                      </span>
                    ) : (
                      <button className="btn btn-primary" onClick={() => handleApply(job._id)} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2rem', gap: '1rem' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }}
                onClick={() => {
                   if(page > 1) {
                      setIsTransitioning(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setTimeout(() => setPage(p => p - 1), 300);
                   }
                }}
                disabled={page === 1}
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-muted">Page {page} of {totalPages}</span>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }}
                onClick={() => {
                   if(page < totalPages) {
                      setIsTransitioning(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setTimeout(() => setPage(p => p + 1), 300);
                   }
                }}
                disabled={page === totalPages}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AvailableJobs;
