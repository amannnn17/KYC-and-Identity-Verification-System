import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="layout-wrapper">
      <header className="glass-panel" style={{ borderRadius: 0, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="logo" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>
            KYC<span style={{ color: 'var(--text-primary)' }}>Verify</span>
          </div>
          <nav style={{ display: 'flex', gap: '24px' }}>
            <Link to="/" style={{ fontWeight: 500 }}>Home</Link>
            <Link to="#" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Admin Dashboard</Link>
          </nav>
        </div>
      </header>
      
      <main className="container" style={{ marginTop: '48px', paddingBottom: '64px' }}>
        <Outlet />
      </main>
      
      <footer style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', marginTop: 'auto' }}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} KYC Verify System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
