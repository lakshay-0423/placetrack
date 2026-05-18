import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Building2, UserCircle, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="page-wrapper container flex" style={{ flexDirection: 'column', justifyContent: 'center' }}>
      <div className="text-center animate-fade-in" style={{ padding: '4rem 0' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>Shape Your Future with PlaceTrack</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          The intelligent campus placement system bridging the gap between ambitious students, top-tier companies, and seamless administration.
        </p>
        
        <div className="flex justify-center gap-4">
          <Link to="/signup" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Get Started <ArrowRight size={20} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            Login to Account
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 animate-fade-in" style={{ animationDelay: '0.2s', marginTop: '2rem' }}>
        <div className="card glass text-center">
          <UserCircle size={48} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>For Students</h3>
          <p style={{ color: 'var(--text-muted)' }}>Create your profile, browse job opportunities, and track your applications in real-time.</p>
        </div>
        
        <div className="card glass text-center">
          <Building2 size={48} color="var(--secondary)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>For Companies</h3>
          <p style={{ color: 'var(--text-muted)' }}>Post job openings, review applicants, and hire the best talent from our campus.</p>
        </div>
        
        <div className="card glass text-center">
          <Briefcase size={48} color="#F59E0B" style={{ margin: '0 auto 1rem auto' }} />
          <h3>For Administration</h3>
          <p style={{ color: 'var(--text-muted)' }}>Manage users, approve companies, and oversee the entire placement process efficiently.</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
