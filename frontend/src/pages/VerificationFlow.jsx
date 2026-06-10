import React, { useState, useEffect } from 'react';
import DocumentUpload from '../components/DocumentUpload';
import SelfieCapture from '../components/SelfieCapture';

const VerificationFlow = () => {
  const [step, setStep] = useState(1);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [selfieUrl, setSelfieUrl] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);

  const handleDocumentUploaded = (url) => {
    setDocumentUrl(url);
    setStep(2);
  };

  const handleSelfieCaptured = (url) => {
    setSelfieUrl(url);
    setStep(3); // Proceed to AI verification (Phase 3)
  };

  useEffect(() => {
    if (step === 3 && documentUrl && selfieUrl) {
      triggerVerification();
    }
  }, [step]);

  const triggerVerification = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentUrl, selfieUrl })
      });
      const data = await res.json();
      if (res.ok) {
        setVerificationResult(data.record);
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('Network error during verification');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', marginTop: '48px' }}>
      {/* Progress Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '50%', left: 0, width: step === 1 ? '0%' : step === 2 ? '50%' : '100%', height: '2px', background: 'var(--primary-color)', zIndex: 0, transition: 'width var(--transition-med)' }} />
        
        {[1, 2, 3].map((num) => (
          <div key={num} style={{
            width: '32px', height: '32px', borderRadius: '50%', 
            background: step >= num ? 'var(--primary-color)' : 'var(--surface-color)',
            color: step >= num ? 'var(--bg-color)' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600, zIndex: 1, border: `2px solid ${step >= num ? 'var(--primary-color)' : 'rgba(255,255,255,0.2)'}`,
            boxShadow: step >= num ? '0 0 10px var(--primary-glow)' : 'none'
          }}>
            {num}
          </div>
        ))}
      </div>

      {/* Steps Content */}
      {step === 1 && (
        <DocumentUpload onUploadComplete={handleDocumentUploaded} />
      )}

      {step === 2 && (
        <SelfieCapture onCaptureComplete={handleSelfieCaptured} />
      )}

      {step === 3 && (
        <div className="glass-panel animate-fade-in" style={{ padding: '32px', textAlign: 'center' }}>
          {isVerifying ? (
            <>
              <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>⚙️</div>
              <h2 style={{ marginBottom: '16px' }}>Processing via Gemini AI...</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Extracting document data and analyzing facial biometrics. Please wait.</p>
            </>
          ) : error ? (
            <>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
              <h2 style={{ marginBottom: '16px', color: 'var(--danger-color)' }}>Verification Error</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
              <button className="btn btn-outline" onClick={() => setStep(1)} style={{ marginTop: '24px' }}>Try Again</button>
            </>
          ) : verificationResult ? (
            <>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                {verificationResult.status === 'Approved' ? '✅' : verificationResult.status === 'Rejected' ? '❌' : '⚠️'}
              </div>
              <h2 style={{ marginBottom: '16px', color: verificationResult.status === 'Approved' ? 'var(--success-color)' : verificationResult.status === 'Rejected' ? 'var(--danger-color)' : 'var(--primary-color)' }}>
                Status: {verificationResult.status}
              </h2>
              
              <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: 'var(--border-radius-md)', marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Extracted Data</h3>
                <p><strong>Name:</strong> {verificationResult.extractedData?.name || 'N/A'}</p>
                <p><strong>DOB:</strong> {verificationResult.extractedData?.dob || 'N/A'}</p>
                <p><strong>ID Number:</strong> {verificationResult.extractedData?.idNumber || 'N/A'}</p>
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <p><strong>Facial Match Score:</strong> <span style={{ color: verificationResult.matchScore > 80 ? 'var(--success-color)' : 'var(--danger-color)' }}>{verificationResult.matchScore}%</span></p>
                  {verificationResult.featuresMatched !== undefined && (
                    <p><strong>Features Matched:</strong> {verificationResult.featuresMatched} / 8</p>
                  )}
                </div>
                {verificationResult.reasoning && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <p><strong>AI Analysis:</strong></p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginTop: '8px' }}>{verificationResult.reasoning}</p>
                  </div>
                )}
              </div>
              
              <div style={{ marginTop: '32px' }}>
                <button className="btn btn-primary" onClick={() => window.location.href = '/'}>Return Home</button>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

// Add a quick keyframe for the spinner in global CSS or here (we can assume index.css has it, or inline it if possible, but inline keyframes don't work in style prop. We will just add it to index.css if needed, or rely on emoji spinning via class)
export default VerificationFlow;
