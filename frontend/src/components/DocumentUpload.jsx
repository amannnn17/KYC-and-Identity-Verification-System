import React, { useCallback, useState } from 'react';

const DocumentUpload = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload/document', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        onUploadComplete(data.documentUrl);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error(error);
      alert('Network error during upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '32px', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '16px' }}>Upload Government ID</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Please upload a clear picture of your ID (Passport, Driver's License, or National ID).
      </p>
      
      {!preview ? (
        <div 
          style={{ 
            border: '2px dashed rgba(102, 252, 241, 0.4)', 
            borderRadius: 'var(--border-radius-lg)', 
            padding: '48px', 
            cursor: 'pointer',
            transition: 'background var(--transition-fast)'
          }}
          onClick={() => document.getElementById('id-upload').click()}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(102, 252, 241, 0.05)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <input 
            type="file" 
            id="id-upload" 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handleFileChange} 
          />
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📷</div>
          <p style={{ color: 'var(--primary-color)', fontWeight: 500 }}>Click to browse files</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img 
            src={preview} 
            alt="ID Preview" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '300px', 
              borderRadius: 'var(--border-radius-md)', 
              marginBottom: '24px',
              border: '1px solid rgba(255,255,255,0.1)'
            }} 
          />
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn btn-outline" onClick={() => setPreview(null)} disabled={isUploading}>
              Retake
            </button>
            <button className="btn btn-primary" onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Confirm Upload'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
