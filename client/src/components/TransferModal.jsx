import React, { useState } from 'react';
import { X, ArrowRightLeft, Building } from 'lucide-react';

export default function TransferModal({ officer, offices, token, onClose, onSuccess }) {
  const [newOfficeId, setNewOfficeId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!officer) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newOfficeId) {
      setError('Please select a destination office.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/staff/officers/${officer.id}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          new_office_id: parseInt(newOfficeId),
          remarks
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transfer failed.');

      onSuccess(data.message);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '520px', padding: '28px', background: '#1e293b', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ArrowRightLeft size={22} style={{ color: 'var(--amber)' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
              Process Officer Transfer
            </h3>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px' }}><X size={18} /></button>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.2)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>{officer.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            PEN: <span style={{ color: 'var(--primary)' }}>{officer.pen}</span> | Designation: <span style={{ color: '#10b981' }}>{officer.desig_title}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Current Office: <span style={{ color: '#f59e0b', fontWeight: 600 }}>{officer.office_name}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              New Office under Kottayam Revenue
            </label>
            <select value={newOfficeId} onChange={(e) => setNewOfficeId(e.target.value)} required className="glass-input" style={{ width: '100%' }}>
              <option value="">-- Select Destination Office --</option>
              {offices.filter(o => o.id !== officer.office_id).map(o => (
                <option key={o.id} value={o.id}>{o.name} ({o.category})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Transfer Order / Official Remarks (Optional)
            </label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. Govt Order No. REV-2026/KT-401 General Transfer" className="glass-input" style={{ width: '100%', height: '80px', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <ArrowRightLeft size={16} /> {loading ? 'Transferring...' : 'Execute Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
