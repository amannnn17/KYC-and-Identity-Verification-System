import React, { useState } from 'react';
import DocumentUpload from '../components/DocumentUpload';
import SelfieCapture from '../components/SelfieCapture';

const VerificationFlow = () => {
  const [step, setStep] = useState(1);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [selfieUrl, setSelfieUrl] = useState(null);

  const handleDocumentUploaded = (url) => {
    setDocumentUrl(url);
    setStep(2);
  };

  const handleSelfieCaptured = (url) => {
    setSelfieUrl(url);
    setStep(3); // Proceed to AI verification (Phase 3)
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
          <h2 style={{ marginBottom: '16px' }}>Ready for AI Verification</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Document and Selfie captured successfully. Proceeding to AI Processing...
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: 'var(--border-radius-sm)' }}>
            <div><strong>Document URL:</strong> {documentUrl}</div>
            <div><strong>Selfie URL:</strong> {selfieUrl}</div>
          </div>
          <p style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>(Phase 3 AI Integration will hook in here)</p>
        </div>
      )}
    </div>
  );
};

export default VerificationFlow;
