import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/submissions');
      const data = await res.json();
      if (res.ok) {
        setSubmissions(data.submissions);
      } else {
        setError(data.error || 'Failed to fetch submissions');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'var(--success-color)';
      case 'Rejected': return 'var(--danger-color)';
      case 'Flagged': return 'var(--primary-color)';
      default: return 'var(--text-secondary)';
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '48px' }}>Loading submissions...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: '48px', color: 'var(--danger-color)' }}>Error: {error}</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', marginTop: '48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Admin Dashboard</h2>
        <div style={{ color: 'var(--text-secondary)' }}>Total Submissions: {submissions.length}</div>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '16px', color: 'var(--text-secondary)' }}>Date</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)' }}>Name</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)' }}>Match Score</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <tr key={sub._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '16px' }}>{new Date(sub.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '16px' }}>{sub.extractedData?.name || 'N/A'}</td>
                <td style={{ padding: '16px' }}>
                  {sub.matchScore !== undefined ? `${sub.matchScore}%` : 'Pending'}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    color: getStatusColor(sub.status),
                    background: `${getStatusColor(sub.status)}20`,
                    padding: '4px 8px',
                    borderRadius: 'var(--border-radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    {sub.status}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <Link to={`/admin/submissions/${sub._id}`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
