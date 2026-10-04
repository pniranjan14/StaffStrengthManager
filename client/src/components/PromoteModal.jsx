import React, { useState } from 'react';
import { X, Award } from 'lucide-react';

export default function PromoteModal({ officer, designations, offices, token, onClose, onSuccess }) {
  const [newDesignationId, setNewDesignationId] = useState('');
  const [newOfficeId, setNewOfficeId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!officer) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newDesignationId) {
      setError('Please select a new designation.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/staff/officers/${officer.id}/promote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          new_designation_id: parseInt(newDesignationId),
          new_office_id: newOfficeId ? parseInt(newOfficeId) : undefined,
          remarks
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Promotion failed.');

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
            <Award size={22} style={{ color: 'var(--emerald)' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
              Process Promotion
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
            PEN: <span style={{ color: 'var(--primary)' }}>{officer.pen}</span> | Office: <span style={{ color: '#f59e0b' }}>{officer.office_name}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Current Rank/Designation: <span style={{ color: '#10b981', fontWeight: 600 }}>{officer.desig_title}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Promoted Designation / Cadre
            </label>
            <select value={newDesignationId} onChange={(e) => setNewDesignationId(e.target.value)} required className="glass-input" style={{ width: '100%' }}>
              <option value="">-- Select New Designation --</option>
              {designations.filter(d => d.id !== officer.designation_id).map(d => (
                <option key={d.id} value={d.id}>{d.full_title} ({d.category})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Assign to Different Office upon Promotion (Optional)
            </label>
            <select value={newOfficeId} onChange={(e) => setNewOfficeId(e.target.value)} className="glass-input" style={{ width: '100%' }}>
              <option value="">-- Keep Current Office ({officer.office_name}) --</option>
              {offices.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Promotion Order / Remarks
            </label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. Promotion Order No. PRO-2026/04 Cadre Advancement" className="glass-input" style={{ width: '100%', height: '70px', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <Award size={16} /> {loading ? 'Promoting...' : 'Confirm Promotion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
