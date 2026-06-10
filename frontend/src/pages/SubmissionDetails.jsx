import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const SubmissionDetails = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/submissions/${id}`);
      const data = await res.json();
      if (res.ok) {
        setSubmission(data.submission);
      } else {
        setError(data.error || 'Failed to fetch submission');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/submissions/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setSubmission(data.submission);
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      alert('Network error while updating status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '48px' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: '48px', color: 'var(--danger-color)' }}>Error: {error}</div>;
  if (!submission) return <div style={{ textAlign: 'center', marginTop: '48px' }}>Submission not found</div>;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'var(--success-color)';
      case 'Rejected': return 'var(--danger-color)';
      case 'Flagged': return 'var(--primary-color)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', marginTop: '48px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/admin" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>← Back to Dashboard</Link>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2>Review Submission</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ 
            color: getStatusColor(submission.status),
            background: `${getStatusColor(submission.status)}20`,
            padding: '8px 16px',
            borderRadius: 'var(--border-radius-md)',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}>
            Status: {submission.status}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn"
              style={{ background: 'var(--success-color)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', opacity: updating ? 0.7 : 1 }}
              onClick={() => handleStatusUpdate('Approved')}
              disabled={updating || submission.status === 'Approved'}
            >
              Approve
            </button>
            <button 
              className="btn"
              style={{ background: 'var(--danger-color)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', opacity: updating ? 0.7 : 1 }}
              onClick={() => handleStatusUpdate('Rejected')}
              disabled={updating || submission.status === 'Rejected'}
            >
              Reject
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Images Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>ID Document</h3>
            <img 
              src={`http://localhost:5000${submission.documentUrl}`} 
              alt="ID Document" 
              style={{ width: '100%', borderRadius: 'var(--border-radius-sm)', objectFit: 'contain', maxHeight: '300px', background: '#000' }} 
            />
          </div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Live Selfie</h3>
            <img 
              src={`http://localhost:5000${submission.selfieUrl}`} 
              alt="Selfie" 
              style={{ width: '100%', borderRadius: 'var(--border-radius-sm)', objectFit: 'contain', maxHeight: '300px', background: '#000' }} 
            />
          </div>
        </div>

        {/* Data Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Extracted Data</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Full Name</label>
                <div style={{ fontSize: '1.1rem' }}>{submission.extractedData?.name || 'N/A'}</div>
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Date of Birth</label>
                <div style={{ fontSize: '1.1rem' }}>{submission.extractedData?.dob || 'N/A'}</div>
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>ID Number</label>
                <div style={{ fontSize: '1.1rem' }}>{submission.extractedData?.idNumber || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>AI Analysis</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Match Score</label>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getStatusColor(submission.status) }}>
                  {submission.matchScore !== undefined ? `${submission.matchScore}%` : 'N/A'}
                </div>
              </div>
              {submission.featuresMatched !== undefined && (
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Features Matched</label>
                  <div style={{ fontSize: '1.1rem' }}>{submission.featuresMatched} / 8</div>
                </div>
              )}
              {submission.reasoning && (
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Detailed Reasoning</label>
                  <div style={{ fontSize: '0.95rem', lineHeight: 1.5, background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '4px' }}>
                    {submission.reasoning}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetails;
