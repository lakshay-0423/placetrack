import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User as UserIcon, UploadCloud, FileText, Sparkles } from 'lucide-react';
import api from '../services/api';

const StudentProfile = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    branch: '',
    cgpa: '',
    passingYear: '',
    skills: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState(new Set());
  const [resumeUrl, setResumeUrl] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/students/me');
        const data = response.data;
        setFormData({
          name: data.name || user?.name || '',
          email: data.email || user?.email || '',
          branch: data.branch || '',
          cgpa: data.cgpa || '',
          passingYear: data.passingYear || '',
          skills: data.skills ? data.skills.join(', ') : ''
        });
        if (data.resume?.url) setResumeUrl(data.resume.url);
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
    // Remove highlight when user manually edits
    setAutoFilledFields(prev => {
      const next = new Set(prev);
      next.delete(e.target.name);
      return next;
    });
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

    const fd = new FormData();
    fd.append('resume', file);

    try {
      setUploading(true);
      const res = await api.post('/students/upload-resume', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.resume?.url) setResumeUrl(res.data.resume.url);


      const parsed = res.data.parsedData;
      
      if (parsed) {
        const filled = new Set();
        const updated = { ...formData };

        // Overwrite fields with parsed data (always fill, not just empty fields)
        if (parsed.name) { updated.name = parsed.name; filled.add('name'); }
        if (parsed.branch) { updated.branch = parsed.branch; filled.add('branch'); }
        if (parsed.cgpa) { updated.cgpa = parsed.cgpa; filled.add('cgpa'); }
        if (parsed.passingYear) { updated.passingYear = parsed.passingYear; filled.add('passingYear'); }
        if (parsed.skills && parsed.skills.length > 0) { updated.skills = parsed.skills.join(', '); filled.add('skills'); }

        setFormData(updated);
        setAutoFilledFields(filled);

        if (filled.size > 0) {
          showToast(`Auto-filled ${filled.size} field(s) from your resume. Review and save!`, "success", 5000);
        } else {
          showToast("Resume uploaded! Could not extract profile data automatically.", "info");
        }
      } else {
        showToast("Resume uploaded successfully!", "success");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to upload resume", "error");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      setError('');
      
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
      };

      await api.put('/students/me', payload);
      setMessage("Profile updated successfully!");
      setAutoFilledFields(new Set());
      showToast("Profile saved successfully!", "success");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    }
  };

  const fieldStyle = (fieldName) => ({
    ...(autoFilledFields.has(fieldName) ? {
      borderColor: 'var(--success)',
      boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.25)',
      transition: 'all 0.3s ease'
    } : {})
  });

  if (loading) return <div className="page-wrapper container flex items-center justify-center">Loading...</div>;

  return (
    <div className="page-wrapper container animate-fade-in">
      <div className="card glass" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
            <UserIcon size={32} color="var(--primary)" />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0 }}>My Profile</h2>
            <p className="text-muted" style={{ margin: 0 }}>Upload your resume to auto-fill your profile</p>
          </div>
        </div>

        {/* Resume Upload Section */}
        <div style={{
          background: 'rgba(79, 70, 229, 0.08)',
          border: '1px dashed rgba(79, 70, 229, 0.4)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={20} color="#818CF8" />
            <div>
              <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>Smart Resume Parser</p>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>
                {resumeUrl ? 'Resume uploaded • ' : ''}Upload a PDF to auto-fill fields below
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {resumeUrl && (
              <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FileText size={14} /> View
              </a>
            )}
            <label className="btn btn-primary" style={{ cursor: uploading ? 'not-allowed' : 'pointer', padding: '0.5rem 1rem', fontSize: '0.85rem', margin: 0 }}>
              <UploadCloud size={16} />
              {uploading ? 'Parsing...' : 'Upload Resume'}
              <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleResumeUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        {autoFilledFields.size > 0 && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            color: '#34D399'
          }}>
            ✨ Fields highlighted in green were auto-filled from your resume. Review and click Save.
          </div>
        )}

        {message && <div className="badge badge-success" style={{ display: 'block', textAlign: 'center', marginBottom: '1rem' }}>{message}</div>}
        {error && <div className="badge badge-primary" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)', display: 'block', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Full Name</label>
            <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required style={fieldStyle('name')} />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-input" value={formData.email} disabled style={{ opacity: 0.7 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Branch/Degree</label>
              <input type="text" name="branch" className="form-input" value={formData.branch} onChange={handleChange} placeholder="e.g. Computer Science" required style={fieldStyle('branch')} />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">CGPA</label>
              <input type="number" step="0.01" min="0" max="10" name="cgpa" className="form-input" value={formData.cgpa} onChange={handleChange} placeholder="e.g. 8.5" required style={fieldStyle('cgpa')} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Passing Year</label>
              <input type="number" name="passingYear" className="form-input" value={formData.passingYear} onChange={handleChange} placeholder="e.g. 2024" required style={fieldStyle('passingYear')} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Skills (comma separated)</label>
            <input type="text" name="skills" className="form-input" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, Python" style={fieldStyle('skills')} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Save Profile</button>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;

