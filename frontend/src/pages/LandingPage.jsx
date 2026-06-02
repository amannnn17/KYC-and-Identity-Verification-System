import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '64px' }}>
      <div style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '24px', lineHeight: 1.1 }}>
          Secure, Automated <br />
          <span style={{ color: 'var(--primary-color)', textShadow: '0 0 20px var(--primary-glow)' }}>Identity Verification</span>
        </h1>
        
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.6 }}>
          Fast-track your onboarding process with state-of-the-art AI. Verify government IDs and confirm user liveness in seconds.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '64px' }}>
          <button className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
            Start Verification
          </button>
          <button className="btn btn-outline" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
            Learn More
          </button>
        </div>
      </div>
      
      {/* Feature grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', width: '100%', marginTop: '32px' }}>
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'left', transition: 'transform var(--transition-med)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(102, 252, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '24px' }}>📄</span>
          </div>
          <h3 style={{ marginBottom: '16px', fontSize: '1.3rem' }}>Document Analysis</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Automated OCR extraction from government-issued ID cards with high accuracy using Gemini Vision AI.
          </p>
        </div>
        
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'left', transition: 'transform var(--transition-med)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(102, 252, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '24px' }}>👤</span>
          </div>
          <h3 style={{ marginBottom: '16px', fontSize: '1.3rem' }}>Liveness Detection</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Secure selfie capture that compares live facial biometrics to the photo present on the uploaded document.
          </p>
        </div>
        
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'left', transition: 'transform var(--transition-med)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(102, 252, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '24px' }}>⚡</span>
          </div>
          <h3 style={{ marginBottom: '16px', fontSize: '1.3rem' }}>Instant Results</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Real-time verification results reducing manual review time by up to 90% and improving onboarding speed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
