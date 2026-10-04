import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Shield, Eye, Lock, User, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '36px', background: 'rgba(30, 41, 59, 0.85)', backdropFilter: 'blur(20px)' }}>
        
        {/* Emblem & Title */}
        <div style={{ textAlignment: 'center', textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, #0284c7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto 16px auto', boxShadow: '0 8px 24px rgba(2, 132, 199, 0.4)' }}>
            <Building2 size={36} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Kottayam Revenue
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Staff Strength & Management Portal
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.2)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Enter username" className="glass-input" style={{ width: '100%', paddingLeft: '42px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter password" className="glass-input" style={{ width: '100%', paddingLeft: '42px' }} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px', marginTop: '6px' }}>
            {loading ? 'Authenticating...' : 'Log In to Portal'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Demo Quick Logins */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600 }}>
            Demo Logins (Click to autofill):
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button type="button" onClick={() => handleQuickLogin('admin', 'admin123')} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px', background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
              <Shield size={14} /> Admin Login
            </button>
            <button type="button" onClick={() => handleQuickLogin('viewer', 'viewer123')} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
              <Eye size={14} /> Viewer Login
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
