import React, { useState, useEffect } from 'react';
import { X, Save, UserCheck } from 'lucide-react';

export default function EditStaffModal({ officer, token, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [pen, setPen] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (officer) {
      setName(officer.name || '');
      setPen(officer.pen || '');
      setDepartment(officer.department || 'Land Revenue');
    }
  }, [officer]);

  if (!officer) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/staff/officers/${officer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, pen, department })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update details.');

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
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '28px', background: '#1e293b', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={22} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
              Edit Officer Details
            </h3>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px' }}><X size={18} /></button>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.2)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Officer Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="glass-input" style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Permanent Employee No. (PEN)</label>
            <input type="text" value={pen} onChange={(e) => setPen(e.target.value)} required className="glass-input" style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Department / Branch</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="glass-input" style={{ width: '100%' }}>
              <option value="Land Revenue">Land Revenue</option>
              <option value="General Administration">General Administration</option>
              <option value="Election">Election</option>
              <option value="Disaster Management">Disaster Management</option>
              <option value="Revenue Recovery">Revenue Recovery</option>
              <option value="Land Acquisition">Land Acquisition</option>
              <option value="Survey & Land Records">Survey & Land Records</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
