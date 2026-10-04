import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, FileSpreadsheet, User, Building2 } from 'lucide-react';

export default function Navbar({ onOpenUpload }) {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '14px 28px', marginBottom: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg, #0284c7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)' }}>
            <Building2 size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                Kottayam Revenue Staff Portal
              </h1>
              <span className="badge badge-category" style={{ fontSize: '11px' }}>Govt of Kerala</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              District Revenue Administration & Cadre Management System
            </p>
          </div>
        </div>

        {/* User Info & Actions */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isAdmin && (
              <button onClick={onOpenUpload} className="btn-secondary" style={{ fontSize: '13px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                <FileSpreadsheet size={16} /> Import Excel Data
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(15, 23, 42, 0.6)', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isAdmin ? 'rgba(244, 63, 94, 0.2)' : 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isAdmin ? '#f43f5e' : '#38bdf8' }}>
                <User size={18} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{user.name}</div>
                <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className={isAdmin ? 'badge badge-admin' : 'badge badge-viewer'} style={{ fontSize: '10px', padding: '1px 6px' }}>
                    {isAdmin ? 'ADMIN (Full Edit Access)' : 'VIEWER (Read Only)'}
                  </span>
                </div>
              </div>
            </div>

            <button onClick={logout} className="btn-secondary" title="Logout" style={{ color: '#f43f5e' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
